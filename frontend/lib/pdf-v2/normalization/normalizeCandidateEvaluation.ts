// normalizeCandidateEvaluation.ts — Maps candidate_evaluations/custom_evaluations → CandidateEvaluationReport

import type { CandidateEvaluationReport, Competency, StrengthGap, QuestionScore, ReportMeta } from '../types/report-schemas';

function getScoreClass(score: number): 'sc1' | 'sc2' | 'sc3' | 'sc4' {
  if (score >= 4) return 'sc4';
  if (score >= 3) return 'sc3';
  if (score >= 2) return 'sc2';
  return 'sc1';
}

function getCompBadgeClass(score: number): 's1' | 's2' | 's3' | 's4' {
  if (score >= 4) return 's4';
  if (score >= 3) return 's3';
  if (score >= 2) return 's2';
  return 's1';
}

function getLevelLabel(score: number): string {
  if (score >= 4) return 'Exceptional';
  if (score >= 3) return 'Strong';
  if (score >= 2) return 'Adequate';
  return 'Needs Work';
}

function deriveVerdict(score: number): { coverClass: 'cover-hire' | 'cover-hold' | 'cover-reject'; verdictClass: string; recommendationLabel: string; verdict: string; verdictHeadline: string; verdictDesc: string } {
  if (score >= 75) return {
    coverClass: 'cover-hire',
    verdictClass: 'vb-hire',
    recommendationLabel: '✓ Recommended to Hire',
    verdict: 'Strong Hire',
    verdictHeadline: '✓ Recommended to Hire — Strong candidate',
    verdictDesc: 'Scored strongly across core competencies. Minor trainable gaps identified.',
  };
  if (score >= 50) return {
    coverClass: 'cover-hold',
    verdictClass: 'vb-hold',
    recommendationLabel: '⚠ Hold — Further evaluation needed',
    verdict: 'Hold / Borderline',
    verdictHeadline: '⚠ Hold — Further evaluation recommended',
    verdictDesc: 'Mixed performance across competencies. Additional assessment recommended before deciding.',
  };
  return {
    coverClass: 'cover-reject',
    verdictClass: 'vb-reject',
    recommendationLabel: '✕ Not Recommended',
    verdict: 'Do Not Hire',
    verdictHeadline: '✕ Not Recommended — Significant gaps identified',
    verdictDesc: 'Critical competency gaps were identified. Not recommended for this role at this time.',
  };
}

function extractQuestionScores(evalData: any, rawData: any): QuestionScore[] {
  let rawScores: any[] = [];
  if (Array.isArray(evalData.question_scores)) rawScores = evalData.question_scores;
  else if (Array.isArray(rawData.evaluation_data)) rawScores = rawData.evaluation_data;
  else if (Array.isArray(rawData.questions)) rawScores = rawData.questions;
  else if (Array.isArray(evalData)) rawScores = evalData;

  return rawScores.map((q: any, idx: number) => {
    const score = Number(q.score ?? q.rating ?? 0);
    return {
      index: idx + 1,
      summary: q.question ?? q.text ?? q.summary ?? `Question ${idx + 1}`,
      score,
      scoreClass: getScoreClass(score),
      note: q.notes ?? q.note ?? q.feedback ?? q.interviewer_note ?? '',
    };
  });
}

function normalizeStrengths(evalData: any): StrengthGap[] {
  const raw = evalData.strengths ?? evalData.key_strengths ?? [];
  return raw.map((s: any) => {
    if (typeof s === 'string') return { title: 'Strength', description: s };
    return {
      title: s.title ?? s.competency ?? s.area ?? 'Strength',
      description: s.description ?? s.observation ?? s.detail ?? '',
    };
  });
}

function normalizeGaps(evalData: any): StrengthGap[] {
  const raw = evalData.gaps ?? evalData.development_areas ?? evalData.weaknesses ?? [];
  return raw.map((g: any) => {
    if (typeof g === 'string') return { title: 'Gap', description: g, severityClass: 'sev-m' as const, severityLabel: 'Moderate' };
    const sev = (g.severity ?? 'moderate').toUpperCase();
    return {
      title: g.title ?? g.competency ?? g.area ?? 'Gap',
      description: g.description ?? g.observation ?? g.detail ?? '',
      severityClass: sev === 'CRITICAL' ? 'sev-c' as const : sev === 'MINOR' ? 'sev-l' as const : 'sev-m' as const,
      severityLabel: sev === 'CRITICAL' ? 'Critical' : sev === 'MINOR' ? 'Minor' : 'Moderate',
    };
  });
}

export function normalizeCandidateEvaluation(rawData: any, meta: ReportMeta): CandidateEvaluationReport {
  const evalData = rawData.ai_evaluation ?? rawData.evaluation_data ?? rawData;
  const overallScore = Number(rawData.overall_score ?? evalData.overall_score ?? 0);
  const { coverClass, verdictClass, recommendationLabel, verdict, verdictHeadline, verdictDesc } = deriveVerdict(overallScore);

  const competencies: Competency[] = (evalData.competency_breakdown ?? []).map((c: any) => {
    const score = Number(c.score ?? 0);
    return {
      name: c.name ?? c.competency ?? 'Competency',
      score,
      percent: Math.round((score / 4) * 100),
      scoreClass: getCompBadgeClass(score),
      levelLabel: getLevelLabel(score),
      assessment: c.feedback ?? c.assessment ?? c.observation ?? '',
    };
  });

  const questionScores = extractQuestionScores(evalData, rawData);
  const avgScore = questionScores.length > 0
    ? (questionScores.reduce((s, q) => s + q.score, 0) / questionScores.length).toFixed(1)
    : '0.0';

  const rawNextSteps: any[] = evalData.next_steps ?? evalData.recommendations ?? [];
  const nextSteps: string[] = rawNextSteps.length > 0
    ? rawNextSteps.map((s: any) => typeof s === 'string' ? s : s.step ?? s.action ?? String(s))
    : overallScore >= 75
      ? ['Extend offer within 48 hours — strong candidates receive competing offers quickly.', 'Build a 30-60-90 day onboarding plan addressing identified skill gaps.', 'Schedule a check-in at 60 days to re-assess competency gaps.']
      : overallScore >= 50
        ? ['Conduct a second-round interview focused on identified competency gaps.', 'Consider a practical skills assessment to validate technical areas.', 'Make a decision within 5 business days to avoid losing the candidate.']
        : ['Document the interview feedback for internal records.', 'Communicate a respectful decision to the candidate within 3 business days.', 'Review what competencies were missing to refine the next search.'];

  const interviewDate = rawData.interview_date ?? rawData.created_at
    ? new Date(rawData.interview_date ?? rawData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : meta.generatedDate;

  return {
    reportType: 'candidate_evaluation',
    meta,
    coverClass,
    recommendationLabel,
    candidateName: rawData.candidate_name ?? rawData.name ?? evalData.candidate_name ?? evalData.name ?? 'Candidate',
    role: rawData.role ?? rawData.position ?? evalData.role ?? evalData.position ?? 'Role Not Specified',
    companyContext: rawData.company ?? rawData.company_type ?? evalData.company ?? '',
    overallScore,
    verdict,
    confidence: evalData.confidence ?? (overallScore >= 75 ? 'High' : overallScore >= 50 ? 'Medium' : 'Low'),
    questionsScored: questionScores.length,
    totalQuestions: Math.max(questionScores.length, 5),
    avgScore,
    interviewDate,
    interviewerName: meta.userName,
    verdictClass,
    verdictHeadline,
    verdictDescription: verdictDesc,
    summaryText: evalData.summary ?? evalData.overall_summary ?? 'Evaluation complete.',
    competencies,
    strengths: normalizeStrengths(evalData),
    gaps: normalizeGaps(evalData),
    questionScores,
    hasQuestionScores: questionScores.length > 0,
    hasBiasCheck: !!(evalData.bias_check_triggered),
    biasCheckMessage: evalData.bias_check_message ?? '',
    nextSteps,
    reportId: `CEV-${new Date().getFullYear()}-${rawData.id?.substring(0, 4) ?? '001'}`,
  };
}
