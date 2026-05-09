// normalization/normalizeBiasAnalysis.ts
// Maps raw analysis_reports DB row → BiasAnalysisReport schema

import type { BiasAnalysisReport, BiasQuestion, BiasCategory, Recommendation, LegalRisk, ReportMeta, BiasVerdictClass } from '../types/report-schemas';

function getSeverityClass(score: number): 'severe' | 'high' | 'mild' | 'clean' {
  if (score >= 70) return 'severe';
  if (score >= 40) return 'high';
  if (score >= 20) return 'mild';
  return 'clean';
}

function getVerdictLabel(score: number): string {
  if (score >= 70) return 'Severely Biased';
  if (score >= 40) return 'Biased';
  if (score >= 20) return 'Mild Bias';
  return 'Clean';
}

function getVerdictClass(score: number): BiasVerdictClass {
  if (score >= 70) return 'vb-severe';
  if (score >= 40) return 'vb-high';
  if (score >= 20) return 'vb-mild';
  return 'vb-clean';
}

function getVerdictHeadline(score: number, flaggedCount: number, total: number): string {
  if (score >= 70) return '⚠ Severely Biased — Immediate Action Required';
  if (score >= 40) return '⚠ Biased — Action Required';
  if (score >= 20) return '⚠ Mild Bias — Review Recommended';
  return '✓ All Clear — No Significant Bias Detected';
}

function getLegalRiskLevel(score: number): { level: string; color: string; label: string } {
  if (score >= 60) return { level: 'High', color: '#fca5a5', label: 'HIGH' };
  if (score >= 30) return { level: 'Medium', color: '#fcd34d', label: 'MEDIUM' };
  return { level: 'Low', color: '#86efac', label: 'LOW' };
}

function getFillClass(score: number): BiasCategory['fillClass'] {
  if (score >= 70) return 'bf-critical';
  if (score >= 50) return 'bf-high';
  if (score >= 30) return 'bf-moderate';
  return 'bf-low';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
}

export function normalizeBiasAnalysis(rawData: any, meta: ReportMeta): BiasAnalysisReport {
  const cats = rawData.categories ?? {};
  const score = Number(rawData.bias_score ?? cats.overall_bias_score ?? 0);

  // ── Extract flat questions ─────────────────────────────
  let rawQuestions: any[] = [];
  if (Array.isArray(cats.questions) && cats.questions.length > 0) {
    rawQuestions = cats.questions;
  } else if (Array.isArray(cats.section_analysis)) {
    cats.section_analysis.forEach((s: any) => {
      if (Array.isArray(s.issues_found)) rawQuestions.push(...s.issues_found);
    });
  } else if (Array.isArray(rawData.flagged_phrases)) {
    rawQuestions = rawData.flagged_phrases;
  }

  const questions: BiasQuestion[] = rawQuestions.map((q: any, idx: number) => {
    const qScore = Number(q.bias_score ?? q.score ?? 0);
    const sevClass = getSeverityClass(qScore);
    const biasTypes: string[] = (q.bias_types ?? q.bias_categories ?? [q.category ?? q.bias_type]).filter(Boolean);

    return {
      index: idx + 1,
      original: q.original ?? q.phrase ?? q.original_question ?? 'Question text unavailable',
      score: qScore,
      severityClass: sevClass,
      biasTypes,
      explanation: q.detailed_explanation ?? q.explanation ?? q.reasoning ?? 'Bias detected in this content.',
      hasRewrite: !!(q.improved_question ?? q.rewrite ?? q.rewritten),
      rewrite: q.improved_question ?? q.rewrite ?? q.rewritten ?? '',
      hasLaw: !!(q.legal_risk ?? q.law),
      lawViolation: q.legal_risk ?? q.law ?? '',
      isClean: sevClass === 'clean',
      psychologicalImpact: q.psychological_impact ?? undefined,
      rewriteRationale: q.rewrite_rationale ?? undefined,
    };
  });

  const flaggedCount = questions.filter(q => !q.isClean).length;
  const totalQuestions = questions.length;
  const biasedCount = questions.filter(q => q.score >= 30).length;
  const cleanCount = totalQuestions - biasedCount;
  const fairnessScore = Number(cats.hiring_health_report?.inclusive_score ?? Math.max(0, 100 - score));
  const legal = getLegalRiskLevel(score);

  // ── Bias categories ────────────────────────────────────
  const catBreakdown = cats.category_breakdown ?? {};
  const totalIssues = Math.max(1, Object.values(catBreakdown).reduce((s: any, v: any) => s + v, 0) as number);

  const biasCategories: BiasCategory[] = Object.keys(catBreakdown).length > 0
    ? Object.entries(catBreakdown).map(([label, count]) => ({
        label,
        count: Number(count),
        percent: Math.round((Number(count) / totalIssues) * 100),
        fillClass: getFillClass((Number(count) / totalIssues) * 100),
      }))
    : Array.from(
        new Set(questions.flatMap(q => q.biasTypes))
      ).slice(0, 6).map(label => {
        const cnt = questions.filter(q => q.biasTypes.includes(label)).length;
        return {
          label,
          count: cnt,
          percent: Math.round((cnt / Math.max(1, flaggedCount)) * 100),
          fillClass: getFillClass((cnt / Math.max(1, flaggedCount)) * 100),
        };
      });

  // ── Recommendations ────────────────────────────────────
  const recBase: Recommendation[] = [
    { index: 1, title: 'Replace flagged questions with bias-free rewrites', description: 'Use the suggested rewrites above before your next interview round. Each rewrite has been verified to be legally compliant and competency-focused.' },
    { index: 2, title: 'Audit all role descriptions for coded language', description: '"Young", "energetic", "rockstar", and "dynamic" all signal bias. Replace with competency-focused language describing measurable behaviours.' },
    { index: 3, title: 'Implement structured interview kits', description: 'Use Rifair AI\'s Interview Kit Generator to create pre-verified, bias-free question sets tailored to your role. Standardised kits reduce ad-hoc bias by over 70%.' },
  ];
  if (score >= 60) {
    recBase.push({ index: 4, title: 'Consult with an employment law specialist', description: 'Given the severity of bias detected and the legal risk level identified, a professional legal review of your hiring processes is strongly recommended.' });
  }

  // ── Legal risks ────────────────────────────────────────
  const legalRisks: LegalRisk[] = [];
  const allCategories = questions.flatMap(q => q.biasTypes.map(t => t.toLowerCase()));
  if (allCategories.some(t => t.includes('gender') || t.includes('family') || t.includes('maternity'))) {
    legalRisks.push({ law: 'Maternity Benefits Act 1961', description: 'Family planning and gender-related questions may constitute direct discrimination against women candidates.' });
  }
  if (allCategories.some(t => t.includes('age') || t.includes('experience'))) {
    legalRisks.push({ law: 'Equal Remuneration Act 1976', description: 'Age-coded language may constitute indirect age discrimination.' });
  }
  legalRisks.push({ law: 'Article 15, Constitution of India', description: 'Questions that indirectly filter candidates based on protected characteristics.' });

  return {
    reportType: 'bias_analysis',
    meta,
    overallBiasScore: score,
    verdictLabel: getVerdictLabel(score),
    totalQuestions,
    flaggedCount,
    legalRiskLevel: legal.level,
    legalRiskColor: legal.color,
    verdictClass: getVerdictClass(score),
    verdictHeadline: getVerdictHeadline(score, flaggedCount, totalQuestions),
    verdictDescription: flaggedCount > 0
      ? `${flaggedCount} of ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''} contain bias that may violate employment law. Do not use these questions before revision.`
      : 'No significant bias detected across all questions. Your interview set is well-structured and fair.',
    biasedCount,
    biasedPercent: `${Math.round((biasedCount / Math.max(1, totalQuestions)) * 100)}%`,
    cleanCount,
    fairnessScore: `${fairnessScore}%`,
    legalRiskLabel: legal.label,
    overallSummary: cats.overall_summary ?? cats.summary ?? `Analysis of ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''} complete. ${biasedCount} issue${biasedCount !== 1 ? 's' : ''} identified requiring attention.`,
    biasCategories,
    questions,
    recommendations: recBase,
    legalRisks,
    showLegalBox: score >= 40,
  };
}
