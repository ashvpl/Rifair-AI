const { preprocess, highlightBiasKeywords } = require("../services/preprocess");
const { analyzeDeterministally } = require("../services/deterministicEngine");
const { batchAnalyzeOptimized } = require("../services/aiService");

const pipelineCache = new Map();

async function runUnifiedPipeline(text) {
  const crypto = require("crypto");
  const cacheKey = crypto.createHash('md5').update(text.trim()).digest('hex');
  
  if (pipelineCache.has(cacheKey)) {
    console.log(`-> [PIPELINE] Cache hit for hash: ${cacheKey}`);
    return pipelineCache.get(cacheKey);
  }

  console.log("-> [PIPELINE] Starting deep analysis...");

  // STEP 1: Parse input into individual questions
  const processedList = preprocess(text);

  if (processedList.length === 0) {
    return {
      questions: [],
      overall_bias_score: 0,
      risk_level: "low",
      summary: "No processable questions found.",
      ai_used: false,
    };
  }

  // STEP 2: Base layer deterministic scoring
  const baseResults = processedList.map(processed => {
      const baseResult = analyzeDeterministally(processed.original_text);
      return {
          processed,
          baseResult
      };
  });

  // STEP 3: API Engine with Circuit Breaker (Batch processing)
  let semanticResults = [];
  let aiSuccess = false;

  const questionsTextList = baseResults.map(r => r.processed.original_text);
  
  // Create chunks of 5
  // Batch up to 5 at once as per user prompt
  let combinedSemantics = [];
  try {
      for (let i = 0; i < questionsTextList.length; i += 5) {
          const chunk = questionsTextList.slice(i, i + 5);
          const aiResponse = await batchAnalyzeOptimized(chunk);
          if (aiResponse && aiResponse.results) {
              combinedSemantics.push(...aiResponse.results);
          } else {
             throw new Error("Invalid format returned from AI.");
          }
      }
      if (combinedSemantics.length === questionsTextList.length) {
         semanticResults = combinedSemantics;
         aiSuccess = true;
      }
  } catch (err) {
      console.warn(`[PIPELINE] AI Layer failed: ${err.message}. Switching to pure Rules Fallback.`);
      aiSuccess = false;
  }

  // STEP 4: Scoring Formula & Aggregation
  const finalQuestions = baseResults.map((item, idx) => {
    const orig = item.processed.original_text;
    const base = item.baseResult;
    
    let semanticScore = 0;
    let semanticCats = [];
    let semanticExp = null;
    let semanticRewrite = null;
    let detectionMethod = "fallback";

    if (aiSuccess && semanticResults[idx]) {
       const sr = semanticResults[idx];
       semanticScore = Number(sr.semantic_score) || 0;
       semanticCats = Array.isArray(sr.bias_categories) ? sr.bias_categories : [];
       semanticExp = sr.reasoning;
       semanticRewrite = sr.rewritten;
       detectionMethod = "full";
    }

    // finalScore = (keywordScore * 0.40) + (structuralScore * 0.30) + (semanticScore * 0.30)
    let kScore = base.keywordScore || 0;
    let stScore = base.structuralScore || 0;

    let calcdScore;
    if (aiSuccess) {
        calcdScore = (kScore * 0.40) + (stScore * 0.30) + (semanticScore * 0.30);
    } else {
        // Degrade gracefully - use Tier-1+2 weighting
        calcdScore = Math.min(100, (kScore * 0.50) + (stScore * 0.50));
    }

    // CRITICAL: always enforce the Tier-0 floor (stored in base.bias_score)
    const finalScore = Math.max(0, Math.min(100, Math.round(Math.max(calcdScore, base.bias_score))));

    // Merge categories
    const finalBiasTypes = Array.from(new Set([
      ...base.bias_types,
      ...semanticCats
    ]));

    const highlighted = highlightBiasKeywords(orig, base.signals);
    
    // UI Format
    return {
      original: orig,
      bias_score: finalScore,
      bias_level: finalScore >= 55 ? "HIGH" : finalScore >= 25 ? "MEDIUM" : "LOW",
      bias_types: finalBiasTypes,
      explanation: semanticExp || base.explanation, // prioritize AI reasoning
      improved_question: semanticRewrite || base.improved_question,
      improved_score: 5,
      highlighted,
      source: aiSuccess ? "hybrid_ai" : "deterministic_engine",
      detectionMethod,
      flags: finalBiasTypes.map(t => ({ category: t, severity: finalScore > 70 ? "high" : finalScore > 40 ? "medium" : "low" }))
    };
  });

  const validResults = finalQuestions;

  const biasedCount = validResults.filter(r => r.bias_score > 20).length;
  const rawAvg = validResults.reduce((sum, r) => sum + r.bias_score, 0) / (validResults.length || 1);

  // Rule 13: If 3+ questions are biased → overall minimum is 75
  let overallBiasScore = Math.round(rawAvg);
  if (biasedCount >= 3) {
    overallBiasScore = Math.max(overallBiasScore, 75);
  }
  // Also never let overall score be lower than the max of any individual question
  const maxQuestionScore = validResults.reduce((max, r) => Math.max(max, r.bias_score), 0);
  overallBiasScore = Math.max(overallBiasScore, maxQuestionScore);
  
  overallBiasScore = Math.min(100, overallBiasScore);

  // FIX: Re-evaluate per-question verdicts to be consistent with overall score
  const overallSevere = overallBiasScore >= 60;
  const consistentQuestions = validResults.map(q => {
    let verdict = q.bias_level;
    if (overallSevere && q.bias_score > 15 && verdict === "LOW") {
      verdict = "MEDIUM";
    }
    return { ...q, bias_level: verdict };
  });

  const result = {
    questions: consistentQuestions,
    overall_bias_score: overallBiasScore,
    risk_level: overallBiasScore >= 60 ? "high" : overallBiasScore > 20 ? "medium" : "low",
    category_breakdown: buildCategoryBreakdown(consistentQuestions),
    summary:
      biasedCount === 0
        ? "No significant bias detected across analysis."
        : `Found ${biasedCount} of ${consistentQuestions.length} question(s) with potential bias.`,
    ai_used: aiSuccess,
  };

  pipelineCache.set(cacheKey, result);
  return result;
}

function buildCategoryBreakdown(results) {
  const breakdown = {};
  results.forEach(r => {
    (r.bias_types || []).forEach(type => {
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
  });
  return breakdown;
}

module.exports = { runUnifiedPipeline };
