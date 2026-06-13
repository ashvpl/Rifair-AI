export type DemoRole =
  | "frontend-developer"
  | "backend-developer"
  | "sales-executive-bdr"
  | "digital-marketing-executive"
  | "hr-recruiter"
  | "data-analyst";

export type DemoSeniority =
  | "junior"
  | "mid-level"
  | "senior";

export type DemoCompanyType =
  | "startup"
  | "smb"
  | "enterprise";

export type HiringFocus =
  | "technical-skills"
  | "problem-solving"
  | "communication"
  | "ownership"
  | "leadership"
  | "culture-add"
  | "execution"
  | "analytical-thinking"
  | "stakeholder-management";

export type BiasRiskLevel = "Low" | "Medium" | "High";

export interface DemoWorkflowInput {
  role: DemoRole;
  seniority: DemoSeniority;
  companyType: DemoCompanyType;
  hiringFocus: HiringFocus[];
  optionalContext?: string;
}

export interface DemoInterviewQuestion {
  question: string;
  competency: string;
  whyItMatters: string;
  strongAnswerSignals: string[];
  redFlags: string[];
  scoringGuidance: string;
  biasRisk: BiasRiskLevel;
}

export interface DemoScorecardCriterion {
  name: string;
  weight: number;
  description: string;
  positiveSignals: string[];
  concernSignals: string[];
  scoringGuidance: string;
}

export interface DemoBiasReviewItem {
  area: string;
  risk: BiasRiskLevel;
  issue: string;
  saferAlternative: string;
}

export interface DemoWorkflowOutput {
  metadata: {
    roleLabel: string;
    seniorityLabel: string;
    companyTypeLabel: string;
    previewNotice: string;
  };
  optimizedJD: {
    title: string;
    roleSummary: string;
    responsibilities: string[];
    requiredSkills: string[];
    niceToHaveSkills: string[];
    successMetrics: string[];
  };
  interviewKit: {
    structure: string[];
    questions: DemoInterviewQuestion[];
  };
  scorecard: {
    criteria: DemoScorecardCriterion[];
    totalWeight: number;
    recommendationScale: string[];
  };
  biasReview: {
    overallRisk: BiasRiskLevel;
    items: DemoBiasReviewItem[];
    generalGuidelines: string[];
  };
  evaluationGuide: {
    beforeInterview: string[];
    duringInterview: string[];
    afterInterview: string[];
    decisionGuidance: string[];
  };
  lockedFeatures: string[];
}
