import { runBiasPipeline } from "./engine";
import { AnalysisResponse, QuestionAnalysis } from "./engine/types";

export type { QuestionAnalysis, AnalysisResponse };

export async function analyzeQuestionsWithAI(text: string): Promise<AnalysisResponse> {
  return await runBiasPipeline(text);
}
