// normalizeInterviewKit.ts — Maps analysis_reports (kit type) → InterviewKitReport

import type { InterviewKitReport, KitQuestion, CompetencyWeight, ReportMeta } from '../types/report-schemas';

type QuestionType = 'Technical' | 'Behavioral' | 'Situational' | 'Cultural Fit';

const TYPE_STYLES: Record<QuestionType, { typeClass: string; typeColorBg: string; typeColorText: string; numberBg: string; headerBg: string; headerBorder: string; pillBg: string; pillColor: string }> = {
  'Technical':     { typeClass: 'technical',   typeColorBg: '#ecfdf5', typeColorText: '#065f46', numberBg: '#10b981', headerBg: '#f0fdf4', headerBorder: '#d1fae5', pillBg: '#ecfdf5', pillColor: '#065f46' },
  'Behavioral':    { typeClass: 'behavioral',  typeColorBg: '#ecfdf5', typeColorText: '#064e3b', numberBg: '#059669', headerBg: '#f0fdf4', headerBorder: '#d1fae5', pillBg: '#ecfdf5', pillColor: '#064e3b' },
  'Situational':   { typeClass: 'situational', typeColorBg: '#f0fdf4', typeColorText: '#166534', numberBg: '#047857', headerBg: '#f0fdf4', headerBorder: '#d1fae5', pillBg: '#f0fdf4', pillColor: '#166534' },
  'Cultural Fit':  { typeClass: 'cultural',    typeColorBg: '#ecfdf5', typeColorText: '#065f46', numberBg: '#059669', headerBg: '#f0fdf4', headerBorder: '#d1fae5', pillBg: '#ecfdf5', pillColor: '#065f46' },
};

function inferQuestionType(q: any): QuestionType {
  const raw = (q.type ?? q.question_type ?? q.category ?? '').toLowerCase();
  if (raw.includes('technical') || raw.includes('sql') || raw.includes('code')) return 'Technical';
  if (raw.includes('behavioral') || raw.includes('star') || raw.includes('tell me about')) return 'Behavioral';
  if (raw.includes('situational') || raw.includes('scenario') || raw.includes('how would')) return 'Situational';
  if (raw.includes('cultural') || raw.includes('culture') || raw.includes('value')) return 'Cultural Fit';
  // Infer from question text
  const text = (q.question ?? q.text ?? '').toLowerCase();
  if (text.startsWith('tell me about a time') || text.startsWith('describe a time') || text.startsWith('give me an example')) return 'Behavioral';
  if (text.includes('scenario') || text.includes('imagine') || text.includes('what would you')) return 'Situational';
  if (text.includes('team culture') || text.includes('work environment')) return 'Cultural Fit';
  return 'Technical';
}

function estimateDuration(questions: any[]): string {
  const total = questions.reduce((sum, q) => {
    const timing = q.timing ?? q.duration ?? q.time ?? '';
    const match = timing.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 8);
  }, 0) + 10; // +10 for opening/closing
  return `${total} minutes`;
}

export function normalizeInterviewKit(rawData: any, meta: ReportMeta): InterviewKitReport {
  const cats = rawData.categories ?? {};
  const kitData = cats.kit_data ?? cats ?? {};

  // Extract questions from multiple possible locations
  const rawQuestions: any[] = kitData.questions ?? cats.questions ?? rawData.questions ?? [];
  const role = kitData.role ?? kitData.job_title ?? rawData.role ?? 'Role';
  const experience = kitData.experience ?? kitData.experience_level ?? 'Mid-level';
  const companyType = kitData.company_type ?? kitData.industry ?? cats.industry ?? 'Company';
  const duration = kitData.duration ?? estimateDuration(rawQuestions);

  const questions: KitQuestion[] = rawQuestions.map((q: any, idx: number) => {
    const qType = inferQuestionType(q);
    const styles = TYPE_STYLES[qType];
    const tags: string[] = [qType, q.competency, q.difficulty ?? q.level].filter(Boolean);

    let rawStrongAnswer = q.strong_answer_includes ?? q.ideal_answer ?? q.strong_answer ?? q.what_to_look_for ?? q.scoring_guide ?? '';
    if (Array.isArray(rawStrongAnswer)) {
      rawStrongAnswer = rawStrongAnswer.join('\n• ');
      if (rawStrongAnswer.length > 0) rawStrongAnswer = '• ' + rawStrongAnswer;
    }
    rawStrongAnswer = String(rawStrongAnswer).trim();
    // Clean up accidental AI artifacts like lone brackets or whitespace
    const strongAnswer = rawStrongAnswer.replace(/^[ \(\{\[\n\r\t]+|[ \)\}\]\n\r\t]+$/g, '').trim();

    return {
      index: idx + 1,
      text: q.question ?? q.text ?? q.question_text ?? 'Question unavailable',
      type: qType,
      ...styles,
      timing: q.timing ?? q.duration ?? '8 min',
      competency: q.competency ?? q.skill ?? 'General',
      tags,
      strongAnswer,
      hasRedFlag: !!(q.red_flag ?? q.warning),
      redFlag: q.red_flag ?? q.warning ?? '',
    };
  });

  const behavioral = questions.filter(q => q.type === 'Behavioral').length;
  const technical = questions.filter(q => q.type === 'Technical').length;
  const situational = questions.filter(q => q.type === 'Situational').length;

  // Build competency weights from questions
  const competencyMap = new Map<string, number[]>();
  questions.forEach((q, i) => {
    const comp = q.competency;
    if (!competencyMap.has(comp)) competencyMap.set(comp, []);
    competencyMap.get(comp)!.push(i + 1);
  });

  const totalComps = Math.max(1, competencyMap.size);
  const baseWeight = Math.floor(100 / totalComps);
  const weights = Array.from(competencyMap.entries()).map(([name, indices], i) => ({
    name,
    weight: i === 0 ? 100 - baseWeight * (totalComps - 1) : baseWeight,
    questionRefs: indices.map(n => `Q${n}`).join(', '),
    weightNote: `Score ${indices.map(n => `Q${n}`).join(' + ')} · Weight ${i === 0 ? 100 - baseWeight * (totalComps - 1) : baseWeight}% of final score`,
  }));

  return {
    reportType: 'interview_kit',
    meta,
    role,
    experience,
    companyType,
    duration,
    biasScore: 0,
    biasVerdict: 'Bias Free ✓',
    behavioralCount: behavioral,
    technicalCount: technical,
    situationalCount: situational,
    kitSummary: kitData.summary ?? kitData.overview ?? `This kit assesses ${Array.from(competencyMap.keys()).slice(0, 3).join(', ')} through ${questions.length} structured, bias-verified questions calibrated for ${experience} professionals.`,
    questions,
    competencyWeights: weights,
  };
}
