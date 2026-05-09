// ReportQualityChecker.ts — Pre-PDF validation to prevent empty/broken renders

import type { AnyReport, ReportTypeName } from '../types/report-schemas';

export interface QualityResult {
  canRender: boolean;
  blockers: string[];
  warnings: string[];
}

export function checkReportQuality(type: ReportTypeName, report: AnyReport): QualityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const r = report as any;

  // Global checks
  if (!r.meta?.generatedDate) warnings.push('Missing generated date — will use fallback');
  if (!r.meta?.userName) warnings.push('Missing user name — will use fallback');

  // Check for "undefined" string values (common serialization bug)
  const json = JSON.stringify(r);
  const undefinedCount = (json.match(/"undefined"/g) ?? []).length;
  if (undefinedCount > 3) warnings.push(`${undefinedCount} "undefined" string values found in report data`);

  switch (type) {
    case 'bias_analysis': {
      if ((r.totalQuestions ?? 0) === 0) blockers.push('No questions found in bias analysis data');
      if (!r.overallBiasScore && r.overallBiasScore !== 0) blockers.push('Missing overall bias score');
      if (!Array.isArray(r.biasCategories) || r.biasCategories.length === 0) warnings.push('No bias categories — chart will be empty');
      if (!Array.isArray(r.recommendations) || r.recommendations.length === 0) blockers.push('No recommendations generated');
      break;
    }
    case 'jd_audit': {
      if (!r.jobTitle || r.jobTitle === 'Job Description') blockers.push('Job title could not be determined');
      if (!Array.isArray(r.sections) || r.sections.length === 0) warnings.push('No section analysis — limited report content');
      if (!Array.isArray(r.funnelSteps) || r.funnelSteps.length === 0) warnings.push('Funnel visualization data missing');
      break;
    }
    case 'interview_kit': {
      if (!Array.isArray(r.questions) || r.questions.length === 0) blockers.push('No interview questions found — cannot render kit');
      if (!r.role || r.role === 'Role') blockers.push('Role not specified in kit data');
      break;
    }
    case 'candidate_evaluation': {
      if (!r.candidateName || r.candidateName === 'Candidate') blockers.push('Candidate name is missing');
      if (r.overallScore === 0 && !r.competencies?.length) blockers.push('No evaluation data found — score and competencies both empty');
      if (!r.verdictHeadline) blockers.push('Hiring verdict could not be determined');
      break;
    }
    case 'compliance_audit': {
      if (!r.kitTitle) warnings.push('Kit title missing from audit data');
      break;
    }
  }

  return {
    canRender: blockers.length === 0,
    blockers,
    warnings,
  };
}
