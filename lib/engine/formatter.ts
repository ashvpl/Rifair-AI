import { AnalysisResponse } from "./types";
import { calculateFinalScore } from "./scoring";

export function formatOutput(aiOutput: AnalysisResponse): {
  overall_bias_score: number;
  risk_level: "low" | "medium" | "high";
  summary: string;
  top_insights: string[];
  questions: any[];
  is_fallback: boolean;
} {
  // Use our new scoring logic on the validated output
  const { score, risk_level } = calculateFinalScore(aiOutput.questions);

  return {
    overall_bias_score: score,
    risk_level,
    summary: aiOutput.summary || "Analysis complete.",
    top_insights: aiOutput.top_insights || ["No high-risk keywords detected."],
    questions: aiOutput.questions.map(q => ({
      question: q.question,
      bias_score: q.bias_score, // original 0-10 score for the component
      bias_type: q.bias_type || [],
      issue: q.issue || "None",
      explanation: q.explanation || "",
      impact: q.impact || "",
      rewrite: q.rewrite || q.question
    })),
    is_fallback: aiOutput.is_fallback || false
  };
}
