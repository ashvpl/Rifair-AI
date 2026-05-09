/**
 * pipeline.js
 *
 * Unified analysis pipeline.
 *
 * Accepts optional `context` (role, industry, company_type, country) which is
 * forwarded to the master analysis prompt so AI output is role-specific.
 *
 * The output format is fully backward-compatible:
 *   - bias_score, bias_level, bias_types, explanation, improved_question, etc.
 *     remain unchanged so all frontend components continue to work.
 *
 * New additive fields on each question object:
 *   - verdict, competency_being_assessed, primary_issue, legal_risk,
 *     psychological_impact, india_specific_flags, question_type,
 *     better_question_type, rewrite_rationale
 *
 * Top-level additive fields on the result:
 *   - overall_verdict, overall_summary, hiring_health_report
 */

"use strict";

const { preprocess, highlightBiasKeywords } = require("../services/preprocess");
const { analyzeDeterministally }            = require("../services/deterministicEngine");
const { batchAnalyzeOptimized }             = require("../services/aiService");
const { analyzeIndiaQuestion }              = require("../services/india/indiaPipeline");

const { LRUCache } = require("lru-cache");

const pipelineCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

/**
 * Run the full unified analysis pipeline.
 *
 * @param {string} text     - Raw input text containing one or more questions
 * @param {string} mode     - "standard"|"india"|"full" (default: "full")
 * @param {object} context  - { role, industry, company_type, country }
 * @returns {object}        - Analysis result
 */
async function runUnifiedPipeline(text, mode = "full", context = {}) {
  const crypto   = require("crypto");
  const ctxKey   = JSON.stringify(context);
  const cacheKey = crypto
    .createHash("md5")
    .update(`${mode}:${ctxKey}:${text.trim()}`)
    .digest("hex");

  if (pipelineCache.has(cacheKey)) {
    console.log(`-> [PIPELINE] Cache hit for hash: ${cacheKey}`);
    return pipelineCache.get(cacheKey);
  }

  console.log("-> [PIPELINE] Starting deep analysis...");

  // STEP 1: Parse input into individual questions
  const processedList = preprocess(text);

  if (processedList.length === 0) {
    return {
      questions:          [],
      overall_bias_score: 0,
      risk_level:         "low",
      summary:            "No processable questions found.",
      ai_used:            false,
    };
  }

  // STEP 2: Base layer — deterministic scoring (keyword + structural)
  const baseResults = processedList.map((processed) => ({
    processed,
    baseResult: analyzeDeterministally(processed.original_text),
  }));

  // STEP 3: Master AI analysis with provider cascade
  // Skip if mode === 'deterministic' to avoid extra API calls
  let aiResponse      = null;
  let semanticResults = [];
  let aiSuccess       = false;
  let topLevelMeta    = {};  // overall_verdict, overall_summary, hiring_health_report

  if (mode !== 'deterministic') {
    const questionsTextList = baseResults.map((r) => r.processed.original_text);

    // Process in batches of 5
    let combinedSemantics = [];
    try {
      for (let i = 0; i < questionsTextList.length; i += 5) {
        const chunk = questionsTextList.slice(i, i + 5);
        const chunkContext = { ...context };
        aiResponse = await batchAnalyzeOptimized(chunk, chunkContext);

        if (aiResponse && aiResponse.results) {
          combinedSemantics.push(...aiResponse.results);
        } else {
          throw new Error("Invalid format returned from AI.");
        }
      }

      if (combinedSemantics.length === questionsTextList.length) {
        semanticResults = combinedSemantics;
        aiSuccess       = true;

        // Carry through top-level meta from last AI response
        topLevelMeta = {
          overall_verdict:      aiResponse.overall_verdict      || null,
          overall_summary:      aiResponse.overall_summary      || null,
          hiring_health_report: aiResponse.hiring_health_report || null,
        };
      }
    } catch (err) {
      console.warn(`[PIPELINE] AI layer failed: ${err.message}. Switching to deterministic fallback.`);
      aiSuccess = false;
    }
  } else {
    console.log('-> [PIPELINE] Deterministic-only mode — skipping AI layer');
  }

  // STEP 4: Scoring formula + aggregation
  const useIndia = mode === "india" || mode === "full";

  const finalQuestions = await Promise.all(
    baseResults.map(async (item, idx) => {
      const orig = item.processed.original_text;
      const base = item.baseResult;

      let semanticScore  = 0;
      let semanticCats   = [];
      let semanticExp    = null;
      let semanticRewrite = null;
      let masterFields   = {};
      let detectionMethod = "fallback";

      if (aiSuccess && semanticResults[idx]) {
        const sr       = semanticResults[idx];
        semanticScore  = Number(sr.semantic_score) || 0;
        semanticCats   = Array.isArray(sr.bias_categories) ? sr.bias_categories : [];
        semanticExp    = sr.reasoning;
        semanticRewrite = sr.rewritten;
        detectionMethod = "full";

        // Carry through rich master-prompt fields if present
        if (sr._master) {
          const m = sr._master;
          masterFields = {
            verdict:                  m.verdict                  || null,
            competency_being_assessed: m.competency_being_assessed || null,
            primary_issue:            m.primary_issue            || null,
            legal_risk:               m.legal_risk               || null,
            psychological_impact:     m.psychological_impact     || null,
            india_specific_flags:     m.india_specific_flags     || [],
            question_type:            m.question_type            || null,
            better_question_type:     m.better_question_type     || null,
            rewrite_rationale:        m.rewrite_rationale        || null,
            detailed_explanation:     m.detailed_explanation     || null,
          };
        }
      } else {
        // Fallback fields for deterministic engine
        if (base.bias_types && base.bias_types.length > 0) {
          const primaryType = base.bias_types[0];
          masterFields = {
            primary_issue: base.explanation ? base.explanation.split('.')[0] : "Biased language detected",
            competency_being_assessed: "General suitability",
            legal_risk: primaryType === "age" ? "Age Discrimination" : (primaryType === "gender" ? "Gender Discrimination" : null),
            rewrite_rationale: "Rephrased to focus on objective behavioral indicators rather than personal traits.",
          };
        }
      }

      // Composite score: keyword(40%) + structural(30%) + semantic(30%)
      const kScore  = base.keywordScore    || 0;
      const stScore = base.structuralScore || 0;

      let calcdScore;
      if (aiSuccess) {
        calcdScore = (kScore * 0.40) + (stScore * 0.30) + (semanticScore * 0.30);
      } else {
        calcdScore = Math.min(100, (kScore * 0.50) + (stScore * 0.50));
      }

      // Always enforce Tier-0 deterministic floor
      const finalScore = Math.max(
        0,
        Math.min(100, Math.round(Math.max(calcdScore, base.bias_score)))
      );

      // Merge bias categories
      const finalBiasTypes = Array.from(
        new Set([...base.bias_types, ...semanticCats])
      );

      const highlighted = highlightBiasKeywords(orig, base.signals);

      // ── India pipeline ─────────────────────────────────────────────────────
      let indiaAnalysis = null;
      if (useIndia) {
        try {
          indiaAnalysis = await analyzeIndiaQuestion(orig, null);
        } catch (e) {
          console.warn(`[PIPELINE] India analysis failed for Q${idx}: ${e.message}`);
        }
      }

      // Take the higher of global and India scores
      let effectiveScore = finalScore;
      if (indiaAnalysis && indiaAnalysis.india_bias_score > 0) {
        effectiveScore = Math.max(finalScore, indiaAnalysis.india_bias_score);
      }

      // Merge India categories
      const mergedBiasTypes = indiaAnalysis
        ? Array.from(new Set([...finalBiasTypes, ...indiaAnalysis.categories]))
        : finalBiasTypes;

      // Best rewrite: prefer India rewrite when India score dominates
      const bestRewrite =
        indiaAnalysis && indiaAnalysis.india_bias_score > finalScore
          ? indiaAnalysis.rewritten
          : semanticRewrite || base.improved_question;

      return {
        // ── Backward-compatible fields (frontend relies on these) ──
        original:          orig,
        bias_score:        effectiveScore,
        bias_level:        effectiveScore >= 55 ? "HIGH" : effectiveScore >= 25 ? "MEDIUM" : "LOW",
        bias_types:        mergedBiasTypes,
        explanation:       semanticExp || base.explanation,
        improved_question: bestRewrite,
        improved_score:    5,
        highlighted,
        source:            aiSuccess ? "hybrid_ai" : "deterministic_engine",
        detectionMethod,
        flags:             mergedBiasTypes.map((t) => ({
          category: t,
          severity: effectiveScore > 70 ? "high" : effectiveScore > 40 ? "medium" : "low",
        })),
        india_flags:    base.india_flags || [],
        india_analysis: indiaAnalysis,

        // ── New additive fields from master prompt ───────────────────
        ...masterFields,
      };
    })
  );

  // STEP 5: Overall scoring
  const biasedCount  = finalQuestions.filter((r) => r.bias_score > 20).length;
  const rawAvg       = finalQuestions.reduce((s, r) => s + r.bias_score, 0) /
                       (finalQuestions.length || 1);
  const maxQScore    = finalQuestions.reduce((m, r) => Math.max(m, r.bias_score), 0);

  let overallBiasScore = Math.round(rawAvg);
  if (biasedCount >= 3) overallBiasScore = Math.max(overallBiasScore, 75);
  overallBiasScore = Math.max(overallBiasScore, maxQScore);
  overallBiasScore = Math.min(100, overallBiasScore);

  // Consistency pass: don't let individual questions look cleaner than the whole
  const overallSevere    = overallBiasScore >= 60;
  const consistentQuestions = finalQuestions.map((q) => {
    if (overallSevere && q.bias_score > 15 && q.bias_level === "LOW") {
      return { ...q, bias_level: "MEDIUM" };
    }
    return q;
  });

  const result = {
    // ── Backward-compatible top-level fields ──
    questions:          consistentQuestions,
    overall_bias_score: overallBiasScore,
    risk_level:         overallBiasScore >= 60 ? "high" : overallBiasScore > 20 ? "medium" : "low",
    category_breakdown: buildCategoryBreakdown(consistentQuestions),
    summary:
      biasedCount === 0
        ? "No significant bias detected across analysis."
        : `Found ${biasedCount} of ${consistentQuestions.length} question(s) with potential bias.`,
    ai_used:            aiSuccess,

    // ── New additive fields from master prompt ──
    ...topLevelMeta,
  };

  pipelineCache.set(cacheKey, result);
  return result;
}

function buildCategoryBreakdown(results) {
  const breakdown = {};
  results.forEach((r) => {
    (r.bias_types || []).forEach((type) => {
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
  });
  return breakdown;
}

module.exports = { runUnifiedPipeline };
