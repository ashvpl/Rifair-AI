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
  
  // Weights: We use a non-linear power function to heavily weight severe bias.
  // Formula: sum(score^p) / sum(max_score^(p-1) * 1) -> scaled back to 100
  // Simplification: We take the average of squared scores, then take the square root.
  // This heavily biases the outcome towards the maximum score.
  
  const power = 2; // Square
  let sumPowerScores = 0;
  let hasCriticalBias = false;

  for (const score of scaledScores) {
    sumPowerScores += Math.pow(score, power);
    if (score >= 70) {
      hasCriticalBias = true;
    }
  }

  const denominator = questions.length;
  let finalScore = Math.pow(sumPowerScores / denominator, 1 / power);

  // Confidence Boost / Penalty
  // If there's at least one critical bias, the score should not fall below a certain threshold (e.g. 60).
  if (hasCriticalBias && finalScore < 60) {
    finalScore = 60 + (finalScore * 0.4); // Scale the remaining up
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
