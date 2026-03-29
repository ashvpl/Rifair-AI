import { AnalysisResponse, QuestionAnalysis } from "./types";

/**
 * Calculates a scaled score (0-100) using a power function.
 * This ensures that a single high-risk issue heavily penalizes the overall score,
 * rather than just averaging out with clean questions.
 */
export function calculateFinalScore(questions: QuestionAnalysis[]): { score: number; risk_level: "low" | "medium" | "high" } {
  if (questions.length === 0) return { score: 0, risk_level: "low" };

  // Convert AI 0-10 scores to 0-100 internally for calculation
  const scaledScores = questions.map(q => q.bias_score * 10);
  
  const maxScore = Math.max(...scaledScores);
  const biasedCount = scaledScores.filter(s => s > 20).length;
  const biasRatio = biasedCount / questions.length;

  // Accurate Mathematical Allocation:
  // (Intensity * Prevalence Factor)
  // Prevalence factor of 0.5 floor ensures a base risk is recognized,
  // but allows clean questions to dilute the impact of an isolated issue.
  const prevalenceFactor = 0.5 + (0.5 * biasRatio);
  let finalScore = maxScore * prevalenceFactor;

  // Critical Escalation: Only force high risk if score > 90 OR widespread
  if (maxScore >= 90) {
    finalScore = Math.max(finalScore, 75);
  } else if (biasRatio > 0.4 && maxScore >= 70) {
    finalScore = Math.max(finalScore, 80);
  }

  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  // Determine Risk Level Based on FINAL score 0-100
  let riskLevel: "low" | "medium" | "high" = "low";
  if (finalScore >= 75) {
    riskLevel = "high";
  } else if (finalScore >= 45) {
    riskLevel = "medium";
  }

  return { score: finalScore, risk_level: riskLevel };
}
