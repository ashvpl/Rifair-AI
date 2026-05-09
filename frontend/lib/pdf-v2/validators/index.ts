// validators/index.ts — Central validation + repair entry point

import { z } from 'zod';
import type { AnyReport, ReportTypeName } from '../types/report-schemas';

// ── Shared schemas ─────────────────────────────────────────────
const MetaSchema = z.object({
  reportId: z.string().min(1),
  generatedDate: z.string().min(1),
  generatedDateIso: z.string(),
  userName: z.string().default('Rifair AI User'),
  organizationName: z.string().default('Organisation'),
});

const RecommendationSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const LegalRiskSchema = z.object({
  law: z.string().min(1),
  description: z.string().min(1),
});

// ── Bias Analysis Schema ───────────────────────────────────────
const BiasQuestionSchema = z.object({
  index: z.number().int().min(1),
  original: z.string().min(1),
  score: z.number().min(0).max(100),
  severityClass: z.enum(['severe', 'high', 'mild', 'clean']),
  biasTypes: z.array(z.string()),
  explanation: z.string().min(1),
  hasRewrite: z.boolean(),
  rewrite: z.string(),
  hasLaw: z.boolean(),
  lawViolation: z.string(),
  isClean: z.boolean(),
  psychologicalImpact: z.string().optional(),
  rewriteRationale: z.string().optional(),
});

const BiasAnalysisSchema = z.object({
  reportType: z.literal('bias_analysis'),
  meta: MetaSchema,
  overallBiasScore: z.number().min(0).max(100),
  verdictLabel: z.string().min(1),
  totalQuestions: z.number().int().min(0),
  flaggedCount: z.number().int().min(0),
  legalRiskLevel: z.string().min(1),
  legalRiskColor: z.string().min(1),
  verdictClass: z.enum(['vb-clean', 'vb-mild', 'vb-high', 'vb-severe']),
  verdictHeadline: z.string().min(1),
  verdictDescription: z.string().min(1),
  biasedCount: z.number().int().min(0),
  biasedPercent: z.string().min(1),
  cleanCount: z.number().int().min(0),
  fairnessScore: z.string().min(1),
  legalRiskLabel: z.string().min(1),
  overallSummary: z.string().min(1),
  biasCategories: z.array(z.object({ label: z.string(), count: z.number(), percent: z.number(), fillClass: z.string() })),
  questions: z.array(BiasQuestionSchema),
  recommendations: z.array(RecommendationSchema).min(1),
  legalRisks: z.array(LegalRiskSchema),
  showLegalBox: z.boolean(),
});

// ── JD Audit Schema ────────────────────────────────────────────
const JDAuditSchema = z.object({
  reportType: z.literal('jd_audit'),
  meta: MetaSchema,
  jobTitle: z.string().min(1),
  talentPoolReach: z.number().min(0).max(100),
  talentPoolVerdict: z.string().min(1),
  inclusivityScore: z.number().min(0).max(100),
  biasScore: z.number().min(0).max(100),
  legalRiskLevel: z.string(),
  extraDaysToHire: z.number().min(0),
  vacancyCost: z.string(),
  roiMultiplier: z.string(),
  improvedReach: z.number().min(0).max(100),
  funnelSteps: z.array(z.object({ label: z.string(), percent: z.number(), fillClass: z.string(), isBold: z.boolean() })),
  sections: z.array(z.object({
    name: z.string(),
    score: z.number(),
    scoreClass: z.string(),
    scoreLabel: z.string(),
    isClean: z.boolean(),
    cleanMessage: z.string().optional(),
    issues: z.array(z.object({ severity: z.string(), phrase: z.string(), explanation: z.string(), fix: z.string() })),
  })),
  masculineCount: z.number(),
  feminineCount: z.number(),
  masculinePercent: z.number(),
  femininePercent: z.number(),
  genderBalance: z.string(),
  masculineWords: z.string(),
  recommendations: z.array(RecommendationSchema).min(1),
  legalRisks: z.array(LegalRiskSchema),
  showLegalBox: z.boolean(),
  hasRewrittenJD: z.boolean(),
  rewrittenJD: z.string().optional(),
});

// ── Interview Kit Schema ───────────────────────────────────────
const InterviewKitSchema = z.object({
  reportType: z.literal('interview_kit'),
  meta: MetaSchema,
  role: z.string().min(1),
  experience: z.string().min(1),
  companyType: z.string(),
  duration: z.string(),
  biasScore: z.number().min(0).max(100),
  biasVerdict: z.string(),
  behavioralCount: z.number().int().min(0),
  technicalCount: z.number().int().min(0),
  situationalCount: z.number().int().min(0),
  kitSummary: z.string().min(1),
  questions: z.array(z.object({
    index: z.number(),
    text: z.string().min(1),
    type: z.string(),
    typeClass: z.string(),
    typeColorBg: z.string(),
    typeColorText: z.string(),
    numberBg: z.string(),
    headerBg: z.string(),
    headerBorder: z.string(),
    pillBg: z.string(),
    pillColor: z.string(),
    timing: z.string(),
    competency: z.string(),
    tags: z.array(z.string()),
    strongAnswer: z.string(),
    hasRedFlag: z.boolean(),
    redFlag: z.string(),
  })).min(1),
  competencyWeights: z.array(z.object({ name: z.string(), weight: z.number(), questionRefs: z.string(), weightNote: z.string() })),
});

// ── Candidate Evaluation Schema ────────────────────────────────
const CandidateEvalSchema = z.object({
  reportType: z.literal('candidate_evaluation'),
  meta: MetaSchema,
  coverClass: z.enum(['cover-hire', 'cover-hold', 'cover-reject']),
  recommendationLabel: z.string().min(1),
  candidateName: z.string().min(1),
  role: z.string().min(1),
  companyContext: z.string(),
  overallScore: z.number().min(0).max(100),
  verdict: z.string().min(1),
  confidence: z.string(),
  questionsScored: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  avgScore: z.string(),
  interviewDate: z.string(),
  interviewerName: z.string(),
  verdictClass: z.string(),
  verdictHeadline: z.string(),
  verdictDescription: z.string(),
  summaryText: z.string(),
  competencies: z.array(z.object({
    name: z.string(), score: z.number(), percent: z.number(),
    scoreClass: z.string(), levelLabel: z.string(), assessment: z.string(),
  })),
  strengths: z.array(z.object({ title: z.string(), description: z.string() })),
  gaps: z.array(z.object({ title: z.string(), description: z.string(), severityClass: z.string().optional(), severityLabel: z.string().optional() })),
  questionScores: z.array(z.object({ index: z.number(), summary: z.string(), score: z.number(), scoreClass: z.string(), note: z.string() })),
  hasQuestionScores: z.boolean(),
  hasBiasCheck: z.boolean(),
  biasCheckMessage: z.string(),
  nextSteps: z.array(z.string()).min(1),
  reportId: z.string(),
});

// ── Validation result ──────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  repaired: AnyReport;
  errors: string[];
  warnings: string[];
}

// ── Auto-repair helpers ────────────────────────────────────────
function repairString(val: any, fallback: string): string {
  if (typeof val === 'string' && val.length > 0) return val;
  return fallback;
}

function repairNumber(val: any, fallback: number, min = 0, max = 100): number {
  const n = Number(val);
  if (!isNaN(n)) return Math.max(min, Math.min(max, n));
  return fallback;
}

function repairArray(val: any, fallback: any[] = []): any[] {
  return Array.isArray(val) ? val : fallback;
}

function repairMeta(meta: any): any {
  return {
    reportId: repairString(meta?.reportId, `RPT-${Date.now()}`),
    generatedDate: repairString(meta?.generatedDate, new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })),
    generatedDateIso: repairString(meta?.generatedDateIso, new Date().toISOString()),
    userName: repairString(meta?.userName, 'Rifair AI User'),
    organizationName: repairString(meta?.organizationName, 'Organisation'),
  };
}

// ── Main validate function ─────────────────────────────────────
export function validateReport(reportType: ReportTypeName, data: AnyReport): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let repaired: AnyReport = { ...data } as AnyReport;

  try {
    // Always repair meta first
    (repaired as any).meta = repairMeta((repaired as any).meta);

    switch (reportType) {
      case 'bias_analysis': {
        const r = repaired as any;
        r.overallBiasScore = repairNumber(r.overallBiasScore, 0);
        r.verdictLabel = repairString(r.verdictLabel, 'Analysis Complete');
        r.totalQuestions = repairNumber(r.totalQuestions, 0, 0, 1000);
        r.flaggedCount = repairNumber(r.flaggedCount, 0, 0, 1000);
        r.legalRiskLevel = repairString(r.legalRiskLevel, 'Low');
        r.legalRiskColor = repairString(r.legalRiskColor, '#86efac');
        r.verdictClass = repairString(r.verdictClass, 'vb-clean');
        r.verdictHeadline = repairString(r.verdictHeadline, 'Analysis Complete');
        r.verdictDescription = repairString(r.verdictDescription, 'Report generated.');
        r.biasedCount = repairNumber(r.biasedCount, 0, 0, 1000);
        r.biasedPercent = repairString(r.biasedPercent, '0%');
        r.cleanCount = repairNumber(r.cleanCount, 0, 0, 1000);
        r.fairnessScore = repairString(r.fairnessScore, '100%');
        r.legalRiskLabel = repairString(r.legalRiskLabel, 'LOW');
        r.overallSummary = repairString(r.overallSummary, 'Analysis complete.');
        r.biasCategories = repairArray(r.biasCategories);
        r.questions = repairArray(r.questions);
        r.recommendations = repairArray(r.recommendations, [{ index: 1, title: 'Review flagged content', description: 'Address the issues identified in this report.' }]);
        r.legalRisks = repairArray(r.legalRisks);
        r.showLegalBox = typeof r.showLegalBox === 'boolean' ? r.showLegalBox : r.overallBiasScore >= 40;
        const parsed = BiasAnalysisSchema.safeParse(r);
        if (!parsed.success) parsed.error.issues.forEach(e => warnings.push(`bias: ${e.path.join('.')}: ${e.message}`));
        break;
      }
      case 'jd_audit': {
        const r = repaired as any;
        r.jobTitle = repairString(r.jobTitle, 'Job Description');
        r.talentPoolReach = repairNumber(r.talentPoolReach, 50);
        r.biasScore = repairNumber(r.biasScore, 0);
        r.sections = repairArray(r.sections);
        r.funnelSteps = repairArray(r.funnelSteps);
        r.recommendations = repairArray(r.recommendations, [{ index: 1, title: 'Review flagged language', description: 'Address the specific issues identified in the section analysis.' }]);
        r.legalRisks = repairArray(r.legalRisks);
        r.masculineCount = repairNumber(r.masculineCount, 0, 0, 100);
        r.feminineCount = repairNumber(r.feminineCount, 0, 0, 100);
        r.masculinePercent = repairNumber(r.masculinePercent, 50);
        r.femininePercent = repairNumber(r.femininePercent, 50);
        r.genderBalance = repairString(r.genderBalance, 'Balanced');
        r.masculineWords = repairString(r.masculineWords, 'None detected');
        const parsed = JDAuditSchema.safeParse(r);
        if (!parsed.success) parsed.error.issues.forEach(e => warnings.push(`jd: ${e.path.join('.')}: ${e.message}`));
        break;
      }
      case 'interview_kit': {
        const r = repaired as any;
        r.role = repairString(r.role, 'Role');
        r.experience = repairString(r.experience, 'Mid-level');
        r.questions = repairArray(r.questions);
        r.competencyWeights = repairArray(r.competencyWeights);
        r.kitSummary = repairString(r.kitSummary, 'Interview kit generated by Rifair AI.');
        if (r.questions.length === 0) errors.push('interview_kit: no questions found');
        const parsed = InterviewKitSchema.safeParse(r);
        if (!parsed.success) parsed.error.issues.forEach(e => warnings.push(`kit: ${e.path.join('.')}: ${e.message}`));
        break;
      }
      case 'candidate_evaluation': {
        const r = repaired as any;
        r.candidateName = repairString(r.candidateName, 'Candidate');
        r.role = repairString(r.role, 'Role Not Specified');
        r.overallScore = repairNumber(r.overallScore, 0);
        r.competencies = repairArray(r.competencies);
        r.strengths = repairArray(r.strengths);
        r.gaps = repairArray(r.gaps);
        r.questionScores = repairArray(r.questionScores);
        r.nextSteps = repairArray(r.nextSteps, ['Review the evaluation with your hiring team.']);
        r.summaryText = repairString(r.summaryText, 'Evaluation complete.');
        r.verdictHeadline = repairString(r.verdictHeadline, 'Evaluation Complete');
        r.verdictDescription = repairString(r.verdictDescription, 'See details below.');
        const parsed = CandidateEvalSchema.safeParse(r);
        if (!parsed.success) parsed.error.issues.forEach(e => warnings.push(`eval: ${e.path.join('.')}: ${e.message}`));
        break;
      }
    }
  } catch (e: any) {
    errors.push(`Validation exception: ${e.message}`);
  }

  return {
    valid: errors.length === 0,
    repaired,
    errors,
    warnings,
  };
}
