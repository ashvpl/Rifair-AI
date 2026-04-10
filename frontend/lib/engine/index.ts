import { preprocessText } from "./preprocess";
import { extractRuleMatches } from "./ruleBased";
import { aggregateSignals } from "./aggregator";
import { validateWithAI } from "./aiValidator";
import { formatOutput } from "./formatter";

/**
 * Main AI Bias Detection Pipeline
 * 1. Preprocess
 * 2. Rule base extract
 * 3. Aggregation (for hints)
 * 4. AI Validation (strict JSON)
 * 5. Scoring & Formatting
 */
export async function runBiasPipeline(text: string) {
  // 1. Preprocess
  const sentences = preprocessText(text);
  
  // 2. Rule-Based
  const matches = extractRuleMatches(text);
  
  // 3. Aggregate for Hints
  const aggregated = aggregateSignals(sentences, matches);
  
  // Create hints for the LLM
  const hints = aggregated.map(a => 
    `[${a.bias_type.join(',')}] "${a.issue}" -> ${a.explanation}`
  );

  let aiResult;
  let isFallback = false;

  try {
    // 4. AI Validation
    aiResult = await validateWithAI(text, hints);
  } catch (error) {
    console.warn("AI Validation failed, falling back to rule-based pure results", error);
    // Fallback logic
    isFallback = true;
    aiResult = {
      overall_bias_score: 1, // Will be recalculated by formatter anyway
      risk_level: "low" as const, // Will be recalculated
      summary: "Analysis completed via rule-based fallback due to AI timeout.",
      top_insights: ["Linguistic scan detected patterns matching known bias Language Intelligence."],
      questions: aggregated.length > 0 ? aggregated : sentences.map(s => ({
        question: s,
        bias_score: 1,
        bias_type: [],
        issue: "No strong bias detected",
        explanation: "No clear linguistic evidence of bias found.",
        impact: "Minimal impact on candidate fairness.",
        rewrite: s
      })),
      is_fallback: true
    };
  }

  // 5. Scoring & Formatting
  return formatOutput(aiResult);
}

export function runRealTimePipeline(text: string) {
  const sentences = preprocessText(text);
  const matches = extractRuleMatches(text);
  const aggregated = aggregateSignals(sentences, matches);

  const scores = aggregated.map(a => a.bias_score || 0);
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  
  // Real-time scoring simulation (using similar logic to backend calculateFinalScore)
  let finalScore = Math.min(100, Math.round(Math.pow(maxScore / 10, 1.1) * 100));

  // TONE AND STRUCTURE DETECTION (Real-time sync)
  const tonePatterns = /(punishment|penalty|consequences|must|strictly|mandatory)/i;
  const structurePatterns = /(do you think you can really|given your background|how would you manage despite)/i;
  
  if (tonePatterns.test(text) || structurePatterns.test(text)) {
    finalScore = Math.min(100, finalScore + 10);
  }

  let riskLevel: "low" | "medium" | "high" = "low";
  if (finalScore >= 75) riskLevel = "high";
  else if (finalScore >= 40) riskLevel = "medium";

  const fastResult = {
    overall_bias_score: finalScore,
    risk_level: riskLevel,
    summary: aggregated.length > 0 ? "Potential linguistic bias detected." : "No explicit bias patterns found.",
    top_insights: aggregated.length > 0 ? ["Linguistic patterns matched known bias Language Intelligence."] : [],
    questions: aggregated,
    is_fallback: true
  };

  return formatOutput(fastResult);
}
