// ═══════════════════════════════════════════════════════════════════════════════
// INDIA BIAS PIPELINE — 3-Layer Orchestrator
// Combines keyword, structural, and semantic engines into a single result.
// ═══════════════════════════════════════════════════════════════════════════════

const { INDIA_BIAS_DICTIONARY, INDIA_REWRITE_TEMPLATES } = require("./indiaKeywords");
const { runIndiaStructuralAnalysis } = require("./indiaStructuralPatterns");
const { buildIndiaSemanticPrompt } = require("./indiaSemanticPrompt");

// ─────────────────────────────────────
// LAYER 1 — KEYWORD ENGINE
// ─────────────────────────────────────
function runIndiaKeywordEngine(question) {
  const questionLower = question.toLowerCase();
  const flags = [];
  let maxScore = 0;
  const categoriesFound = new Set();

  for (const [biasType, config] of Object.entries(INDIA_BIAS_DICTIONARY)) {
    for (const term of config.terms) {
      if (questionLower.includes(term.toLowerCase())) {
        const score = config.weight;
        flags.push({
          term,
          bias_type: biasType,
          category: config.category,
          score,
          severity: config.severity,
        });
        maxScore = Math.max(maxScore, score);
        categoriesFound.add(config.category);
      }
    }
  }

  // Score floor — critical terms push minimum score up
  const criticalFlags = flags.filter(f => f.severity === "critical");
  if (criticalFlags.length > 0) {
    maxScore = Math.max(maxScore, 75);
  }

  return {
    flags,
    max_score: maxScore,
    categories: Array.from(categoriesFound),
    has_critical: criticalFlags.length > 0,
  };
}

// ─────────────────────────────────────
// LAYER 2 — STRUCTURAL ENGINE
// ─────────────────────────────────────
function runIndiaStructuralEngine(question) {
  const matches = runIndiaStructuralAnalysis(question);
  const maxScore = matches.reduce((max, m) => Math.max(max, m.score), 0);
  const categories = [...new Set(matches.map(m => m.category))];

  return {
    matches,
    max_score: maxScore,
    categories,
  };
}

// ─────────────────────────────────────
// LAYER 3 — SEMANTIC AI ENGINE
// Uses the existing AI providers from aiService.js
// ─────────────────────────────────────
async function runIndiaSemanticEngine(question, keywordFlags, structuralFlags, aiCallFn) {
  try {
    const prompt = buildIndiaSemanticPrompt(question, keywordFlags, structuralFlags);

    // aiCallFn should accept a prompt string and return parsed JSON
    const result = await aiCallFn(prompt);

    // Validate the response shape
    if (result && typeof result.semantic_score === "number") {
      return result;
    }

    // Try to extract from results array if wrapped
    if (result && result.results && result.results[0]) {
      return result.results[0];
    }

    return null;
  } catch (e) {
    console.warn(`[INDIA-SEMANTIC] Engine failed: ${e.message}`);
    return null; // fallback to rule-based only
  }
}

// ─────────────────────────────────────
// SCORE AGGREGATOR
// ─────────────────────────────────────
function aggregateIndiaResults(question, keyword, structural, semantic) {
  // Use max of the layers as the base score, rather than a dampening average.
  // This ensures a 95 severity keyword isn't pulled down to 38 if other layers miss.
  const kScore = keyword.max_score || 0;
  const stScore = structural.max_score || 0;
  const semScore = semantic ? (semantic.semantic_score || 0) : 0;

  let rawScore = Math.max(kScore, stScore, semScore);

  // Bonus for consensus (if multiple layers detect bias)
  let layersFired = 0;
  if (kScore > 20) layersFired++;
  if (stScore > 20) layersFired++;
  if (semScore > 20) layersFired++;

  if (layersFired > 1) {
    rawScore += (layersFired - 1) * 5; 
  }

  // Score floors — never underscore obvious bias
  if (keyword.has_critical) {
    rawScore = Math.max(rawScore, 75);
  }
  if (structural.max_score >= 80) {
    rawScore = Math.max(rawScore, 65);
  }

  const finalScore = Math.min(100, Math.round(rawScore));

  // Merge categories from all layers
  const allCategories = [...new Set([
    ...keyword.categories,
    ...structural.categories,
    ...(semantic && semantic.detected_categories ? semantic.detected_categories : []),
  ])];

  // Get best rewrite
  const rewritten = getBestRewrite(question, allCategories, semantic);

  // Build explanation
  const explanation = buildExplanation(keyword.flags, structural.matches, semantic, allCategories);

  // Determine verdict
  let verdict;
  if (finalScore >= 80) verdict = "SEVERELY_BIASED";
  else if (finalScore >= 60) verdict = "BIASED";
  else if (finalScore >= 35) verdict = "MILD_BIAS";
  else verdict = "NEUTRAL";

  // Detection method
  let confidence;
  if (layersFired === 3) confidence = "high";
  else if (layersFired === 2) confidence = "medium";
  else confidence = "low";

  return {
    india_bias_score: finalScore,
    verdict,
    categories: allCategories,
    explanation,
    rewritten,
    indian_law_violation: semantic ? (semantic.indian_law_violation || null) : null,
    detection_method: semantic ? "ai_powered" : (keyword.max_score > 0 || structural.max_score > 0 ? "rule_based" : "clean"),
    keyword_flags: keyword.flags,
    structural_matches: structural.matches,
    confidence,
  };
}

// ─────────────────────────────────────
// HELPER: Best Rewrite
// ─────────────────────────────────────
function getBestRewrite(question, categories, semantic) {
  // Prefer semantic rewrite (most contextual)
  if (semantic && semantic.rewritten) {
    return semantic.rewritten;
  }

  // Fall back to template rewrite
  for (const category of categories) {
    if (INDIA_REWRITE_TEMPLATES[category]) {
      return INDIA_REWRITE_TEMPLATES[category].replacement;
    }
  }

  return "Please rephrase this question to focus on job-relevant skills and experience only.";
}

// ─────────────────────────────────────
// HELPER: Build Explanation
// ─────────────────────────────────────
function buildExplanation(keywordFlags, structuralMatches, semantic, categories) {
  const parts = [];

  if (keywordFlags && keywordFlags.length > 0) {
    const top = keywordFlags[0];
    parts.push(
      `Contains bias indicator '${top.term}' (${top.category.replace(/_/g, " ")}).`
    );
  }

  if (structuralMatches && structuralMatches.length > 0) {
    const top = structuralMatches[0];
    parts.push(top.reason);
  }

  if (semantic && semantic.reasoning) {
    parts.push(semantic.reasoning);
  }

  return parts.length > 0
    ? parts.join(" ")
    : "This question contains India-specific bias patterns.";
}

// ─────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────
/**
 * Analyze a single question through the full India bias pipeline.
 * @param {string} question - The question to analyze
 * @param {Function|null} aiCallFn - Optional async function to call AI. 
 *   Receives a prompt string, returns parsed JSON object.
 *   If null, only rule-based layers (1 + 2) are used.
 * @returns {Object} India bias analysis result
 */
async function analyzeIndiaQuestion(question, aiCallFn = null) {
  // Layer 1 — Keywords
  const keywordResult = runIndiaKeywordEngine(question);

  // Layer 2 — Structural patterns
  const structuralResult = runIndiaStructuralEngine(question);

  // Layer 3 — Semantic AI (only if we have an AI function and if bias was detected)
  let semanticResult = null;
  const needsSemantic = (
    keywordResult.max_score > 0 ||
    structuralResult.matches.length > 0
  );

  if (aiCallFn && needsSemantic) {
    semanticResult = await runIndiaSemanticEngine(
      question,
      keywordResult.flags,
      structuralResult.matches,
      aiCallFn
    );
  }

  // Aggregate all three layers
  return aggregateIndiaResults(question, keywordResult, structuralResult, semanticResult);
}

/**
 * Rule-based only analysis (no AI call). Fast path for testing or fallback.
 * @param {string} question
 * @returns {Object}
 */
function analyzeIndiaQuestionSync(question) {
  const keywordResult = runIndiaKeywordEngine(question);
  const structuralResult = runIndiaStructuralEngine(question);
  return aggregateIndiaResults(question, keywordResult, structuralResult, null);
}

module.exports = {
  analyzeIndiaQuestion,
  analyzeIndiaQuestionSync,
  runIndiaKeywordEngine,
  runIndiaStructuralEngine,
};
