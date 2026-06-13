export interface WorkflowBuilderInput {
  roleTitle: string;
  seniorityLevel: string;
  department: string;
  employmentType: string;
  companyContext: string;
  jobDescription?: string;
  mustHaveSkills: string[];
  niceHaveSkills: string[];
  interviewTypes: string[];
  evaluationFocus: string[];
}

export interface OptimizedJDOutput {
  headline: string;
  full_jd: string;
  sections: {
    about_company: string;
    what_youll_do: string[];
    must_have: string[];
    nice_to_have: string[];
    what_we_offer: string[];
    hiring_process: string;
    cta: string;
  };
  bias_verification: {
    bias_score: number;
    verified_clean: boolean;
    inclusive_language_used: string[];
    requirements_calibration: string;
  };
  conversion_insights: {
    estimated_talent_pool_reach: string;
    gender_balance: string;
    top_strength: string;
  };
}

export interface InterviewKitQuestion {
  id: number;
  question: string;
  type: string;
  competency: string;
  time_minutes: number;
  difficulty: string;
  expected_answer: string;
}

export interface InterviewKitOutput {
  kit_title: string;
  estimated_duration_minutes: number;
  kit_summary: string;
  questions: InterviewKitQuestion[];
}

export interface ScorecardCriterion {
  name: string;
  description: string;
  weight: number;
}

export interface ScorecardOutput {
  criteria: ScorecardCriterion[];
}

export interface BiasReviewIssue {
  severity: 'low' | 'medium' | 'high';
  category: string;
  text: string;
  suggestion: string;
}

export interface BiasReviewOutput {
  score: number;
  issues: BiasReviewIssue[];
}

export interface EvaluationGuideOutput {
  overview: string;
  do_list: string[];
  dont_list: string[];
}

export interface HiringWorkflowOutput {
  hiring_health_score: number;
  optimized_jd: OptimizedJDOutput;
  interview_kit: InterviewKitOutput;
  scorecard: ScorecardOutput;
  bias_review: BiasReviewOutput;
  evaluation_guide: EvaluationGuideOutput;
}

export interface HiringWorkflowRow {
  id: string;
  user_id: string;
  role_title: string;
  seniority_level: string;
  department: string;
  employment_type: string;
  company_context: string;
  job_description: string;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  interview_types: string[];
  evaluation_focus: string[];
  status: string;
  hiring_health_score: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowOutputRow {
  id: string;
  workflow_id: string;
  user_id: string;
  optimized_jd: OptimizedJDOutput;
  interview_kit: InterviewKitOutput;
  scorecard: ScorecardOutput;
  bias_review: BiasReviewOutput;
  evaluation_guide: EvaluationGuideOutput;
  created_at: string;
  updated_at: string;
}

export interface CandidateEvaluationRow {
  id: string;
  workflow_id: string;
  user_id: string;
  candidate_name: string;
  candidate_email: string | null;
  scores: { criterionName: string; score: number; notes: string }[];
  evidence_notes: Record<string, string>;
  recommendation: 'HIRE' | 'NO_HIRE' | 'STRONG_HIRE' | 'HOLD';
  final_summary: string | null;
  created_at: string;
}
