// ReportComposer.ts — Orchestrates the entire normalization → validation → context pipeline

import type { AnyReport, ReportTypeName } from '../types/report-schemas';
import { normalizeToSchema, routeTypeToReportType, UserProfile } from '../normalization/normalizeToSchema';
import { validateReport } from '../validators/index';

export interface ComposeResult {
  reportType: ReportTypeName;
  schema: AnyReport;
  templateName: string;
  warnings: string[];
  errors: string[];
  canRender: boolean;
}

const TEMPLATE_MAP: Record<ReportTypeName, string> = {
  bias_analysis:        'bias_analysis.hbs',
  jd_audit:             'jd_audit.hbs',
  interview_kit:        'interview_kit.hbs',
  candidate_evaluation: 'candidate_evaluation.hbs',
  compliance_audit:     'compliance_audit.hbs',
};

export async function composeReport(
  routeType: string,
  rawData: any,
  profile: UserProfile = {}
): Promise<ComposeResult> {
  // Step 1 — Map route type to report type
  const reportType = routeTypeToReportType(routeType);

  // Step 2 — Normalize raw data to typed schema
  const normalized = normalizeToSchema(reportType, rawData, profile);

  // Step 3 — Validate + auto-repair
  const { repaired, errors, warnings } = validateReport(reportType, normalized);

  // Step 4 — Quality check
  const canRender = errors.length === 0 && hasMinimumContent(reportType, repaired);

  return {
    reportType,
    schema: repaired,
    templateName: TEMPLATE_MAP[reportType],
    warnings,
    errors: canRender ? [] : [...errors, ...(hasMinimumContent(reportType, repaired) ? [] : ['Report has insufficient content to render'])],
    canRender,
  };
}

function hasMinimumContent(type: ReportTypeName, report: AnyReport): boolean {
  switch (type) {
    case 'bias_analysis': {
      const r = report as any;
      return (r.totalQuestions ?? 0) > 0 || (r.overallBiasScore ?? 0) > 0;
    }
    case 'jd_audit': {
      const r = report as any;
      // Allow 'Job Description' if it's the only title we have
      return !!(r.jobTitle);
    }
    case 'interview_kit': {
      const r = report as any;
      return Array.isArray(r.questions) && r.questions.length > 0;
    }
    case 'candidate_evaluation': {
      const r = report as any;
      // Allow 'Candidate' if it's the only name we have
      return !!(r.candidateName) && (r.overallScore ?? 0) > 0;
    }
    case 'compliance_audit':
      return true;
    default:
      return true;
  }
}
