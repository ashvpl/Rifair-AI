// normalizeToSchema.ts — Central entry point for normalization
// Takes (reportType, rawDbRow, profile) and returns typed report schema

import type { AnyReport, ReportMeta, ReportTypeName } from '../types/report-schemas';
import { normalizeBiasAnalysis } from './normalizeBiasAnalysis';
import { normalizeJDAudit } from './normalizeJDAudit';
import { normalizeInterviewKit } from './normalizeInterviewKit';
import { normalizeCandidateEvaluation } from './normalizeCandidateEvaluation';
import { normalizeComplianceAudit } from './normalizeComplianceAudit';

export interface UserProfile {
  full_name?: string;
  organization_name?: string;
  company_name?: string;
}

function buildMeta(rawData: any, profile: UserProfile, reportType: string): ReportMeta {
  const now = rawData.created_at ? new Date(rawData.created_at) : new Date();
  const userName = profile.full_name ?? 'Rifair AI User';
  const organizationName = profile.organization_name ?? profile.company_name ?? userName;

  return {
    reportId: buildReportId(reportType, rawData.id),
    generatedDate: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    generatedDateIso: now.toISOString(),
    userName,
    organizationName,
  };
}

function buildReportId(type: string, id?: string): string {
  const prefix = { bias_analysis: 'RAF', jd_audit: 'JDA', interview_kit: 'IK', candidate_evaluation: 'CEV', compliance_audit: 'CAU' }[type] ?? 'RPT';
  const year = new Date().getFullYear();
  const suffix = id?.substring(0, 4).toUpperCase() ?? '0001';
  return `${prefix}-${year}-${suffix}`;
}

export function normalizeToSchema(
  reportType: ReportTypeName,
  rawData: any,
  profile: UserProfile = {}
): AnyReport {
  if (!rawData) throw new Error(`[normalizeToSchema] rawData is null for type: ${reportType}`);

  const meta = buildMeta(rawData, profile, reportType);

  switch (reportType) {
    case 'bias_analysis':     return normalizeBiasAnalysis(rawData, meta);
    case 'jd_audit':          return normalizeJDAudit(rawData, meta);
    case 'interview_kit':     return normalizeInterviewKit(rawData, meta);
    case 'candidate_evaluation': return normalizeCandidateEvaluation(rawData, meta);
    case 'compliance_audit':     return normalizeComplianceAudit(rawData, meta);
    default:
      throw new Error(`[normalizeToSchema] Unknown report type: ${reportType}`);
  }
}

// Map route `type` param → internal ReportTypeName
export function routeTypeToReportType(routeType: string): ReportTypeName {
  const map: Record<string, ReportTypeName> = {
    analysis:   'bias_analysis',
    jd:         'jd_audit',
    kit:        'interview_kit',
    evaluation: 'candidate_evaluation',
    audit:      'compliance_audit',
  };
  const result = map[routeType];
  if (!result) throw new Error(`Unknown route type: ${routeType}`);
  return result;
}
