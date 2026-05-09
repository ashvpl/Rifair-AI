'use strict';

/**
 * customEvalPrompts.js
 *
 * Two prompts for the custom evaluation flow:
 *
 * 1. batchDetectQuestionMeta  — single AI call to classify all user questions:
 *    type (behavioral/technical/situational/leadership) + competency label.
 *    Called once per session creation; results cached in custom_evaluations.questions.
 *
 * 2. buildCustomEvalPrompt    — evaluation prompt that mirrors evaluationPrompt.js
 *    but accepts custom (user-authored) questions instead of kit questions.
 */

/**
 * buildBatchMetaPrompt
 *
 * Returns a prompt that classifies an array of questions in one shot.
 * Output: JSON array parallel-indexed to input.
 *
 * @param {string[]} questions - raw question strings
 * @param {string}   role      - optional role context
 */
function buildBatchMetaPrompt(questions, role = '') {
  const roleCtx = role ? ` for a ${role} role` : '';
  return `You are an expert HR analyst. Classify each interview question below${roleCtx}.

For each question return:
- type: exactly one of "behavioral" | "technical" | "situational" | "leadership"
- competency: a concise label (2-4 words, e.g. "Communication", "Problem Solving", "Stakeholder Management")

Return ONLY a JSON array with one object per question in the same order:
[
  {"type": "behavioral", "competency": "Communication"},
  ...
]

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
}

/**
 * buildBiasCheckPrompt
 *
 * Single AI call to analyse ALL user-submitted questions for bias in one shot.
 * Replaces the static deterministic-only check with real AI reasoning from Groq.
 *
 * Output: JSON array parallel-indexed to input — one object per question.
 *
 * @param {string[]} questions - raw question strings
 * @param {string}   role      - optional role context
 */
function buildBiasCheckPrompt(questions, role = '') {
  const roleCtx = role ? ` for a ${role} position` : '';

  return `You are a world-class hiring bias expert${roleCtx}. Your job is to analyse interview questions for any form of bias, discrimination, or inappropriate content.

BIAS CATEGORIES TO DETECT:
- age_bias: questions implying age matters (young, fresh, digital native, energetic)
- gender_bias: gender assumptions, family planning, marital status questions
- cultural_bias: religion, origin, language, ethnicity-coded questions
- socioeconomic_bias: class markers, school prestige, salary history
- disability_bias: health, physical fitness unrelated to job
- inappropriate_content: sexual, harassing, profane, or threatening language
- culture_fit_coded: "rockstar", "ninja", "bro culture", "fast-paced" dog-whistles
- work_life_intrusion: "always available", "24/7", "nights and weekends"
- leading_questions: questions that telegraph the "right" answer
- irrelevant_personal: personal questions with no job relevance

SCORING (bias_score 0–100):
- 0–20: No bias — professional, job-relevant, fair
- 21–50: Mild bias — could unintentionally deter some groups
- 51–75: Moderate bias — likely to exclude certain demographics
- 76–100: Severe bias — illegal or clearly inappropriate; must be removed

QUESTIONS TO ANALYSE:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return ONLY a JSON array with exactly ${questions.length} objects in the same order as the questions:
[
  {
    "type": "behavioral" | "technical" | "situational" | "leadership",
    "competency": "<concise label, 2-4 words, e.g. Communication>",
    "bias_score": <integer 0-100>,
    "bias_types": ["<category_from_list_above>"],
    "severity": "NONE" | "MILD" | "MODERATE" | "SEVERE",
    "explanation": "<1-2 sentences: what bias exists and why it's a problem, or 'No bias detected' if clean>",
    "rewrite": "<improved version of the question, or null if no bias>"
  }
]

RULES:
- Return EXACTLY ${questions.length} objects — one per question, in order
- bias_types must be empty [] if bias_score is 0
- Be strict: err on the side of flagging rather than missing real bias
- If the question is sexual/harassing/profane: bias_score MUST be 100

CRITICAL OUTPUT RULES:
- Return ONLY the JSON array starting with [ and ending with ]
- No text before [ or after ]
- No markdown fences`;
}

/**
 * buildCustomEvalPrompt
 *
 * Mirrors buildEvaluationPrompt (evaluationPrompt.js) but accepts
 * questions authored by the user (with type/competency pre-classified).
 *
 * @param {Object} params
 * @param {string}   params.role
 * @param {string}   params.experience      - e.g. "mid-level", "senior"
 * @param {string}   params.companyType
 * @param {string}   [params.candidateName]
 * @param {Array}    params.questionScores  - [{text, competency, type, score, notes}]
 * @param {string}   [params.sessionTitle]
 */
function buildCustomEvalPrompt({
  role,
  experience,
  companyType,
  candidateName,
  questionScores,
  sessionTitle,
}) {
  const candidateLabel = candidateName || 'Candidate';
  const contextLabel   = sessionTitle  || `Custom Evaluation for ${role}`;

  const scoredLines = questionScores.map((qs, i) => {
    const label = ['', 'Poor', 'Adequate', 'Good', 'Strong', 'Exceptional'][qs.score] || qs.score;
    return [
      `Q${i + 1} [${qs.type?.toUpperCase() ?? 'BEHAVIORAL'}] — ${qs.competency}`,
      `Question: "${qs.text}"`,
      `Score: ${qs.score}/5 (${label})`,
      qs.notes ? `Notes: ${qs.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }).join('\n\n');

  return `You are an expert hiring manager. Evaluate ${candidateLabel} based on the interview scores below.

Context: ${contextLabel}
Role: ${role} | Experience: ${experience} | Company type: ${companyType}

━━━━━━━ INTERVIEW SCORES ━━━━━━━
${scoredLines}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return a single JSON object with exactly these keys:
{
  "overall_score": <integer 0-100>,
  "recommendation": "HIRE" | "HOLD" | "REJECT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "summary": "<2-3 sentence overall assessment>",
  "hire_reasoning":   "<if HIRE: 2-3 sentences>",
  "hold_reasoning":   "<if HOLD: 2-3 sentences>",
  "reject_reasoning": "<if REJECT: 2-3 sentences>",
  "strengths": [
    {"competency": "<name>", "observation": "<specific observation>"}
  ],
  "gaps": [
    {"competency": "<name>", "observation": "<specific observation>", "severity": "CRITICAL|MODERATE|MINOR", "can_be_trained": true|false}
  ],
  "competency_breakdown": [
    {"competency": "<name>", "score": <1-5>, "assessment": "<1 sentence>"}
  ],
  "next_steps": {
    "if_hire":   ["<step 1>", "<step 2>"],
    "if_hold":   ["<step 1>", "<step 2>"],
    "if_reject": ["<step 1>"]
  },
  "bias_check": {
    "potential_bias_detected": false,
    "bias_note": ""
  },
  "interview_quality_feedback": "<private 1-sentence note to the interviewer>"
}

Rules:
- overall_score must reflect actual evidence from scores, not be inflated
- Be calibrated: average score of 3/5 across all questions → overall_score ≈ 55-65
- HIRE only if majority of competencies scored 4+ AND no CRITICAL gaps

CRITICAL OUTPUT RULES — FOLLOW EXACTLY:
- Your ENTIRE response must be the JSON object above and nothing else
- Do NOT write any text before the opening {
- Do NOT write any text after the closing }
- Do NOT wrap in markdown code fences (\`\`\`json or \`\`\`)
- Do NOT add explanations, summaries, or commentary
- Start your response with { and end with }`;
}

module.exports = { buildBatchMetaPrompt, buildBiasCheckPrompt, buildCustomEvalPrompt };
