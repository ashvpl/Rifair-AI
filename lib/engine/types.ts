export interface QuestionAnalysis {
  question: string;
  bias_score: number; // 0-10 internally, then scaled
  bias_type: string[];
  issue: string;
  explanation: string;
  impact: string;
  rewrite: string;
}

export interface AnalysisResponse {
  overall_bias_score: number;
  risk_level: "low" | "medium" | "high";
  summary: string;
  top_insights: string[];
  questions: QuestionAnalysis[];
  is_fallback?: boolean;
}

export interface RuleMatch {
  category: string;
  word: string;
  severity: number; // 0-10
  explanation: string;
  impact: string;
  rewriteTemplate: string;
}

export interface EngineContext {
  originalText: string;
  sentences: string[];
  ruleMatches: RuleMatch[];
  is_fallback?: boolean;
}
