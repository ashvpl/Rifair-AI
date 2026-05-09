// ─────────────────────────────────────────────────────────────
// Rifair AI — Strict Report Schema System
// Each report type has its own deterministic, typed schema.
// ─────────────────────────────────────────────────────────────

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecommendationVerdict = 'hire' | 'hold' | 'reject';
export type BiasVerdictClass = 'vb-clean' | 'vb-mild' | 'vb-high' | 'vb-severe';

// ── Shared primitives ──────────────────────────────────────────

export interface ReportMeta {
  reportId: string;
  generatedDate: string;        // formatted: "May 7, 2026"
  generatedDateIso: string;     // ISO for sorting
  userName: string;             // from profiles table
  organizationName: string;     // from profiles table (org > name fallback)
}

export interface BiasCategory {
  label: string;
  count: number;
  percent: number;              // 0–100
  fillClass: 'bf-critical' | 'bf-high' | 'bf-moderate' | 'bf-low';
}

export interface Recommendation {
  index: number;
  title: string;
  description: string;
}

export interface LegalRisk {
  law: string;
  description: string;
}

// ── 1. Bias Analysis Report ────────────────────────────────────

export interface BiasQuestion {
  index: number;
  original: string;
  score: number;                 // 0–100
  severityClass: 'severe' | 'high' | 'mild' | 'clean';
  biasTypes: string[];           // e.g. ["Gender bias", "Age bias"]
  explanation: string;
  hasRewrite: boolean;
  rewrite: string;
  hasLaw: boolean;
  lawViolation: string;
  isClean: boolean;
  psychologicalImpact?: string;
  rewriteRationale?: string;
}

export interface BiasAnalysisReport {
  reportType: 'bias_analysis';
  meta: ReportMeta;
  // Cover
  overallBiasScore: number;
  verdictLabel: string;          // "Severely Biased"
  totalQuestions: number;
  flaggedCount: number;
  legalRiskLevel: string;        // "High" | "Medium" | "Low"
  legalRiskColor: string;        // CSS color
  // Executive summary
  verdictClass: BiasVerdictClass;
  verdictHeadline: string;
  verdictDescription: string;
  biasedCount: number;
  biasedPercent: string;         // "71%"
  cleanCount: number;
  fairnessScore: string;         // "29%"
  legalRiskLabel: string;        // "HIGH" | "MEDIUM" | "LOW"
  overallSummary: string;
  biasCategories: BiasCategory[];
  // Questions
  questions: BiasQuestion[];
  // Recommendations
  recommendations: Recommendation[];
  legalRisks: LegalRisk[];
  showLegalBox: boolean;
}

// ── 2. JD Audit Report ────────────────────────────────────────

export interface JDIssue {
  severity: 'critical' | 'moderate' | 'low';
  phrase: string;
  explanation: string;
  fix: string;
}

export interface JDSection {
  name: string;
  score: number;
  scoreClass: 'high' | 'medium' | 'low';
  scoreLabel: string;
  isClean: boolean;
  cleanMessage?: string;
  issues: JDIssue[];
}

export interface FunnelStep {
  label: string;
  percent: number;
  fillClass: 'ff-full' | 'ff-amber' | 'ff-orange' | 'ff-red';
  isBold: boolean;
}

export interface JDAuditReport {
  reportType: 'jd_audit';
  meta: ReportMeta;
  // Cover
  jobTitle: string;
  talentPoolReach: number;        // e.g. 30
  talentPoolVerdict: string;      // "Severely Restricted"
  inclusivityScore: number;       // 0–100 (100 - biasScore)
  biasScore: number;
  legalRiskLevel: string;
  // Business impact
  extraDaysToHire: number;
  vacancyCost: string;            // "₹3.6L"
  roiMultiplier: string;          // "120x"
  improvedReach: number;          // reach after rewrite
  funnelSteps: FunnelStep[];
  // Section analysis
  sections: JDSection[];
  // Gender analysis
  masculineCount: number;
  feminineCount: number;
  masculinePercent: number;
  femininePercent: number;
  genderBalance: string;          // "Masculine-skewed" | "Balanced" | "Feminine-skewed"
  masculineWords: string;
  // Recommendations & legal
  recommendations: Recommendation[];
  legalRisks: LegalRisk[];
  showLegalBox: boolean;
  // Optional rewritten JD
  hasRewrittenJD: boolean;
  rewrittenJD?: string;
}

// ── 3. Interview Kit Report ────────────────────────────────────

export interface KitQuestion {
  index: number;
  text: string;
  type: 'Technical' | 'Behavioral' | 'Situational' | 'Cultural Fit';
  typeClass: string;              // CSS class
  typeColorBg: string;
  typeColorText: string;
  numberBg: string;
  headerBg: string;
  headerBorder: string;
  pillBg: string;
  pillColor: string;
  timing: string;                 // "10 min"
  competency: string;
  tags: string[];
  strongAnswer: string;
  hasRedFlag: boolean;
  redFlag: string;
}

export interface CompetencyWeight {
  name: string;
  weight: number;                 // 0–100
  questionRefs: string;           // "Q1, Q3, Q5"
  weightNote: string;
}

export interface InterviewKitReport {
  reportType: 'interview_kit';
  meta: ReportMeta;
  // Cover
  role: string;
  experience: string;             // "Mid-level (3-5yr)"
  companyType: string;
  duration: string;               // "55 minutes"
  biasScore: number;
  biasVerdict: string;
  // Overview
  behavioralCount: number;
  technicalCount: number;
  situationalCount: number;
  kitSummary: string;
  // Questions
  questions: KitQuestion[];
  // Evaluation scorecard
  competencyWeights: CompetencyWeight[];
}

// ── 4. Candidate Evaluation Report ────────────────────────────

export interface Competency {
  name: string;
  score: number;                  // 1–4
  percent: number;                // (score/4)*100
  scoreClass: 's1' | 's2' | 's3' | 's4';
  levelLabel: string;             // "Exceptional" | "Strong" | "Adequate" | "Needs Work"
  assessment: string;
}

export interface StrengthGap {
  title: string;
  description: string;
  severityClass?: 'sev-c' | 'sev-m' | 'sev-l';
  severityLabel?: string;
}

export interface QuestionScore {
  index: number;
  summary: string;
  score: number;                  // 1–4
  scoreClass: 'sc1' | 'sc2' | 'sc3' | 'sc4';
  note: string;
}

export interface CandidateEvaluationReport {
  reportType: 'candidate_evaluation';
  meta: ReportMeta;
  // Cover
  coverClass: 'cover-hire' | 'cover-hold' | 'cover-reject';
  recommendationLabel: string;    // "✓ Recommended to Hire"
  candidateName: string;
  role: string;
  companyContext: string;
  overallScore: number;
  verdict: string;                // "Strong Hire"
  confidence: string;
  questionsScored: number;
  totalQuestions: number;
  avgScore: string;
  interviewDate: string;
  interviewerName: string;
  // Page 2
  verdictClass: string;
  verdictHeadline: string;
  verdictDescription: string;
  summaryText: string;
  competencies: Competency[];
  // Page 3
  strengths: StrengthGap[];
  gaps: StrengthGap[];
  questionScores: QuestionScore[];
  hasQuestionScores: boolean;
  hasBiasCheck: boolean;
  biasCheckMessage: string;
  // Page 4
  nextSteps: string[];
  reportId: string;
}

// ── 5. Compliance Audit Report (kit_audits table) ─────────────

export interface AuditFinding {
  severity: 'critical' | 'moderate' | 'low';
  category: string;
  description: string;
  recommendation: string;
}

export interface AuditedQuestion {
  index: number;
  text: string;
  score: number;
  severity: string;
  severityClass: string;
  explanation: string;
  recommendation: string;
  competency: string;
}

export interface ComplianceAuditReport {
  reportType: 'compliance_audit';
  meta: ReportMeta;
  kitTitle: string;
  overallScore: number;           // 0–100
  complianceLevel: string;
  totalQuestions: number;
  flaggedCount: number;
  // Structural analysis
  hasStructuralAnalysis: boolean;
  competencyGaps: string[];
  redundancyFlags: string[];
  suggestedAdditions: string[];
  // Detailed audit
  auditedQuestions: AuditedQuestion[];
  findings: AuditFinding[];
  recommendations: Recommendation[];
}

// ── Union type ─────────────────────────────────────────────────

export type AnyReport =
  | BiasAnalysisReport
  | JDAuditReport
  | InterviewKitReport
  | CandidateEvaluationReport
  | ComplianceAuditReport;

export type ReportTypeName =
  | 'bias_analysis'
  | 'jd_audit'
  | 'interview_kit'
  | 'candidate_evaluation'
  | 'compliance_audit';
