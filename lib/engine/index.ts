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
    `[\${a.bias_type.join(',')}] "\${a.issue}" -> \${a.explanation}`
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
      top_insights: ["Linguistic scan detected patterns matching known bias lexicons."],
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

/**
 * Fast Rule-Based Only Pipeline for Real-Time Checking
 * Skips LLM for <150ms response times.
 */
export function runRealTimePipeline(text: string) {
  const sentences = preprocessText(text);
  const matches = extractRuleMatches(text);
  const aggregated = aggregateSignals(sentences, matches);

  // For real-time we don't scale or score as heavily, just provide quick signals
  const fastResult = {
    overall_bias_score: aggregated.reduce((sum, item) => sum + item.bias_score, 0) / (aggregated.length || 1),
    risk_level: aggregated.length > 0 ? "medium" as const : "low" as const,
    summary: aggregated.length > 0 ? "Potential signals detected." : "Looks good.",
    top_insights: [],
    questions: aggregated,
    is_fallback: true
  };

  return formatOutput(fastResult);
}
