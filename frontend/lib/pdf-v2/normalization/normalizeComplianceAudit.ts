// normalizeComplianceAudit.ts — Maps kit_audits → ComplianceAuditReport

import type { ComplianceAuditReport, AuditedQuestion, AuditFinding, ReportMeta } from '../types/report-schemas';

export function normalizeComplianceAudit(rawData: any, meta: ReportMeta): ComplianceAuditReport {
  const cats = rawData.categories ?? {};
  const isAiKit = cats.analysis_type === 'kit';
  
  // Extract questions and breakdown based on source type
  let questions: string[] = [];
  let breakdown: any[] = [];
  let title = rawData.title ?? rawData.kit_title ?? 'Interview Kit Audit';
  let overallScore = Number(rawData.overall_bias_score ?? rawData.bias_score ?? 0);

  if (isAiKit) {
    const kitData = cats.kit_data ?? {};
    const validation = cats.validation ?? {};
    title = kitData.kit_title ?? kitData.role ?? title;
    questions = (kitData.questions ?? []).map((q: any) => typeof q === 'string' ? q : (q.question ?? q.text));
    breakdown = validation.bias_breakdown ?? validation.breakdown ?? [];
    overallScore = Number(validation.overall_bias_score ?? validation.score ?? overallScore);
  } else {
    questions = rawData.original_questions ?? [];
    breakdown = rawData.bias_breakdown ?? [];
  }
  
  const auditedQuestions: AuditedQuestion[] = questions.map((text, idx) => {
    const b = breakdown[idx] ?? {};
    const score = Number(b.bias_score ?? b.score ?? 0);
    const severity = b.severity ?? (score > 70 ? 'SEVERE' : score > 40 ? 'MODERATE' : 'CLEAN');
    
    return {
      index: idx + 1,
      text,
      score,
      severity,
      severityClass: severity.toLowerCase(),
      explanation: b.explanation ?? b.oneLiner ?? (score < 10 ? 'No significant bias detected.' : 'Neutrality check recommended.'),
      recommendation: b.recommendation ?? (score > 30 ? 'Review phrasing for better inclusivity.' : 'Compliant.'),
      competency: b.competency ?? 'General',
    };
  });

  const findings: AuditFinding[] = auditedQuestions
    .filter(q => q.score > 30)
    .map(q => ({
      severity: q.severityClass === 'severe' ? 'critical' : q.severityClass === 'moderate' ? 'moderate' : 'low',
      category: q.competency,
      description: q.explanation,
      recommendation: q.recommendation,
    }));

  return {
    reportType: 'compliance_audit',
    meta,
    kitTitle: title,
    overallScore,
    complianceLevel: overallScore < 30 ? 'Compliant' : overallScore < 60 ? 'Partially Compliant' : 'Non-Compliant',
    totalQuestions: questions.length,
    flaggedCount: auditedQuestions.filter(q => q.score > 50).length,
    
    // Structural analysis
    hasStructuralAnalysis: !!(rawData.structural_analysis && Object.keys(rawData.structural_analysis).length > 0),
    competencyGaps: Array.isArray(rawData.competency_gaps) ? rawData.competency_gaps : [],
    redundancyFlags: Array.isArray(rawData.redundancy_flags) ? rawData.redundancy_flags : [],
    suggestedAdditions: Array.isArray(rawData.suggested_additions) ? rawData.suggested_additions : [],
    
    // Detailed audit
    auditedQuestions,
    findings,
    recommendations: [
      { index: 1, title: 'Address Critical Bias Flags', description: 'Priority should be given to questions with scores above 70.' },
      { index: 2, title: 'Fill Competency Gaps', description: 'The audit identified several areas where your kit lacks depth.' },
      { index: 3, title: 'Review Non-Compliant Language', description: 'Ensure all questions align with Indian employment laws.' },
    ],
  };
}
