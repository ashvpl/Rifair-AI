export interface BiasIssue {
  tag: string;
  score: number;
  explanation: string;
  rewrite?: string;
}

export interface BiasAnalysisData {
  id: string;
  created_at: string;
  original_text: string;
  score: number;
  issues: BiasIssue[];
  summary?: string;
}

export interface EvaluationScore {
  id: number;
  question: string;
  competency: string;
  score: number;
  notes: string;
}

export interface CandidateEvaluationData {
  id: string;
  created_at: string;
  candidateName?: string;
  role: string;
  experience_level?: string;
  company_type?: string;
  overall_score: number;
  recommendation: 'HIRE' | 'HOLD' | 'REJECT';
  summary: string;
  scores: EvaluationScore[];
  strengths?: Array<{ competency: string; observation: string }>;
  gaps?: Array<{ competency: string; observation: string; severity: string }>;
}

export interface InterviewKitData {
  id: string;
  created_at: string;
  role: string;
  experience?: string | number;
  company_type?: string;
  industry?: string;
  kit_title?: string;
  kit_summary?: string;
  questions: Array<{
    id: number;
    question: string;
    type: string;
    competency: string;
    estimatedTime?: string;
    whyAsked?: string;
    why_this_question?: string;
    strongAnswer?: string;
    strong_answer_includes?: string[];
    redFlags?: string;
    red_flags?: string;
  }>;
}

export interface KitAuditData {
  id?: string;
  created_at?: string;
  title?: string;
  score: number;
  issues: BiasIssue[];
  competency_gaps?: any[];
  redundancy_flags?: any[];
  suggested_additions?: any[];
  type_distribution?: Record<string, number>;
}
