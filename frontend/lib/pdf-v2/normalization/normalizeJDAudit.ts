// normalizeJDAudit.ts — Maps analysis_reports (jd type) → JDAuditReport

import type { JDAuditReport, JDSection, JDIssue, FunnelStep, Recommendation, LegalRisk, ReportMeta } from '../types/report-schemas';

function deriveJobTitle(rawData: any): string {
  const cats = rawData.categories ?? {};
  return cats.job_title ?? cats.role ?? rawData.role ?? rawData.input_text?.split('\n')[0]?.substring(0, 60) ?? 'Job Description';
}

function deriveTalentPoolReach(biasScore: number): number {
  // Lower bias = higher reach. Score 0 → ~80%, Score 100 → ~15%
  return Math.max(15, Math.round(80 - (biasScore * 0.65)));
}

function deriveImprovedReach(currentReach: number): number {
  return Math.min(85, currentReach + Math.round(35 + Math.random() * 10));
}

function buildFunnelSteps(sections: JDSection[], biasScore: number, impact?: any): FunnelStep[] {
  const reach = impact?.final_reach_percent ?? deriveTalentPoolReach(biasScore);
  return [
    { label: 'Available talent', percent: 100, fillClass: 'ff-full', isBold: false },
    { label: 'After title bias', percent: impact?.after_title_bias ?? Math.min(100, reach + 45), fillClass: 'ff-amber', isBold: false },
    { label: 'After requirements', percent: impact?.after_requirements ?? Math.min(100, reach + 25), fillClass: 'ff-orange', isBold: false },
    { label: 'After culture section', percent: impact?.after_culture_section ?? Math.min(100, reach + 12), fillClass: 'ff-red', isBold: false },
    { label: 'After coded language', percent: reach, fillClass: 'ff-red', isBold: true },
  ];
}

function normalizeSections(cats: any): JDSection[] {
  if (!cats.section_analysis || !Array.isArray(cats.section_analysis)) {
    // Build a single "Overall Analysis" section from flat data
    const issues: JDIssue[] = (cats.flagged_phrases ?? cats.issues ?? []).map((issue: any) => ({
      severity: issue.severity?.toLowerCase() === 'high' || issue.bias_score > 60 ? 'critical' : issue.severity?.toLowerCase() === 'low' ? 'low' : 'moderate',
      phrase: issue.phrase ?? issue.original ?? issue.text ?? 'Flagged phrase',
      explanation: issue.explanation ?? 'Bias detected in this language.',
      fix: issue.improved_question ?? issue.rewrite ?? issue.fix ?? 'Consider rephrasing to focus on competencies.',
    }));
    return issues.length > 0 ? [{ name: 'Overall Analysis', score: 60, scoreClass: 'high', scoreLabel: 'Bias Detected', isClean: false, issues }] : [];
  }

  return cats.section_analysis.map((s: any) => {
    const sScore = Number(s.bias_score ?? s.score ?? 30);
    const issues: JDIssue[] = (s.issues_found ?? s.issues ?? []).map((issue: any) => ({
      severity: (issue.severity ?? 'moderate').toLowerCase() === 'high' || (issue.bias_score ?? 0) > 60 ? 'critical' : (issue.severity ?? '').toLowerCase() === 'low' ? 'low' : 'moderate',
      phrase: issue.phrase ?? issue.original ?? issue.text ?? issue.term ?? 'Flagged phrase',
      explanation: issue.explanation ?? issue.reasoning ?? 'This language may deter qualified candidates.',
      fix: issue.improved_version ?? issue.fix ?? issue.rewrite ?? 'Rephrase to focus on job-relevant competencies.',
    }));
    const scoreClass = sScore >= 60 ? 'high' : sScore >= 30 ? 'medium' : 'low';
    return {
      name: s.section ?? s.name ?? 'Section',
      score: sScore,
      scoreClass,
      scoreLabel: sScore >= 60 ? 'High Bias' : sScore >= 30 ? 'Moderate Bias' : 'Clean',
      isClean: sScore < 20,
      cleanMessage: sScore < 20 ? (s.clean_message ?? 'No significant bias detected in this section.') : undefined,
      issues,
    };
  });
}

function analyzeGenderLanguage(text: string): { masculineCount: number; feminineCount: number; masculinePercent: number; femininePercent: number; balance: string; masculineWords: string } {
  const masculineTerms = ['aggressive', 'dominant', 'lead', 'drive', 'competitive', 'strong', 'champion', 'rockstar', 'hustle', 'ninja', 'guru', 'wizard', 'force', 'tackle', 'ambitious', 'determined', 'decision', 'independent'];
  const feminineTerms = ['collaborate', 'support', 'nurture', 'communicate', 'flexible', 'empath', 'community', 'harmony', 'trust', 'relationship'];
  const lowerText = (text ?? '').toLowerCase();
  const mWords = masculineTerms.filter(t => lowerText.includes(t));
  const fWords = feminineTerms.filter(t => lowerText.includes(t));
  const total = Math.max(1, mWords.length + fWords.length);
  const mPct = Math.round((mWords.length / total) * 100);
  const balance = mPct >= 60 ? 'Masculine-skewed' : mPct <= 40 ? 'Feminine-skewed' : 'Balanced';
  return {
    masculineCount: mWords.length,
    feminineCount: fWords.length,
    masculinePercent: mPct,
    femininePercent: 100 - mPct,
    balance,
    masculineWords: mWords.join(', ') || 'None detected',
  };
}

export function normalizeJDAudit(rawData: any, meta: ReportMeta): JDAuditReport {
  const cats = rawData.categories ?? {};
  const biasScore = Number(rawData.bias_score ?? cats.overall_bias_score ?? 0);
  const jobTitle = deriveJobTitle(rawData);
  const talentPoolReach = Number(cats.talent_pool_impact?.final_reach_percent ?? deriveTalentPoolReach(biasScore));
  const improvedReach = Number(cats.talent_pool_impact?.after_rifair_rewrite ?? deriveImprovedReach(talentPoolReach));
  const sections = normalizeSections(cats);
  const gender = analyzeGenderLanguage(rawData.input_text ?? cats.original_jd ?? '');
  const extraDays = Math.round(biasScore * 0.45);

  const recommendations: Recommendation[] = [
    { index: 1, title: 'Reduce inflated experience requirements', description: 'Overstated year requirements are the highest-impact change. Reducing to realistic levels immediately expands your talent pool.' },
    { index: 2, title: 'Remove gender-coded and age-coded language', description: 'Words like "rockstar", "ninja", "young", and "hustle" deter diverse candidates. Replace with competency-focused, neutral language.' },
    { index: 3, title: 'Remove institution preferences from requirements', description: 'No research supports institution name as a predictor of job performance. Focus on demonstrated skills and outcomes instead.' },
  ];

  const legalRisks: LegalRisk[] = [];
  if (biasScore >= 40) {
    legalRisks.push({ law: 'Equal Remuneration Act 1976', description: 'Age-coded and gender-coded language may constitute indirect discrimination in recruitment.' });
    legalRisks.push({ law: 'Article 15, Constitution of India', description: 'Institution or background preferences may constitute indirect socioeconomic discrimination.' });
  }

  return {
    reportType: 'jd_audit',
    meta,
    jobTitle,
    talentPoolReach,
    talentPoolVerdict: talentPoolReach < 40 ? 'Severely Restricted' : talentPoolReach < 60 ? 'Restricted' : 'Moderate Reach',
    inclusivityScore: Number(cats.overall_inclusivity_score ?? (100 - biasScore)),
    biasScore,
    legalRiskLevel: biasScore >= 60 ? 'High' : biasScore >= 30 ? 'Medium' : 'Low',
    extraDaysToHire: cats.business_impact?.estimated_extra_days ?? extraDays,
    vacancyCost: cats.business_impact?.estimated_cost_of_bias_inr 
      ? `₹${(cats.business_impact.estimated_cost_of_bias_inr / 100000).toFixed(1)}L` 
      : `₹${(extraDays * 0.08).toFixed(1)}L`,
    roiMultiplier: cats.business_impact?.rifair_roi ?? (biasScore >= 50 ? '120x' : '45x'),
    improvedReach,
    funnelSteps: buildFunnelSteps(sections, biasScore, cats.talent_pool_impact),
    sections,
    masculineCount: gender.masculineCount,
    feminineCount: gender.feminineCount,
    masculinePercent: gender.masculinePercent,
    femininePercent: gender.femininePercent,
    genderBalance: gender.balance,
    masculineWords: gender.masculineWords,
    recommendations,
    legalRisks,
    showLegalBox: biasScore >= 30,
    hasRewrittenJD: !!(cats.rewritten_jd),
    rewrittenJD: cats.rewritten_jd ?? undefined,
  };
}
