'use strict';

/**
 * kitAuditPrompts.js
 *
 * Three prompt builders for the Kit Audit feature:
 *
 * 1. buildKitAuditBiasPrompt   — batch bias analysis for all uploaded questions
 * 2. buildKitStructuralPrompt  — structural analysis (competency gaps, redundancy, type balance)
 * 3. buildKitAuditRewritePrompt — targeted rewrite for a single biased question
 */

/**
 * buildKitAuditBiasPrompt
 *
 * Analyses a user's uploaded interview questions for bias in a single AI call.
 * Returns a JSON ARRAY parallel-indexed to the input questions.
 *
 * @param {string[]} questions  - Raw question strings from the user
 * @param {string}   [role=''] - Optional role context
 * @returns {string} Prompt string
 */
function buildKitAuditBiasPrompt(questions, role = '') {
  const roleCtx = role ? ` for a ${role} position` : '';

  return `You are an expert hiring compliance auditor${roleCtx}. Analyse the interview questions below for any form of bias, discrimination, or legal risk.

BIAS CATEGORIES (use exact strings):
- gender_bias: marital status, family planning, pregnancy, "aggressive", "rockstar"
- age_bias: "young", "fresh graduate", "energetic", "digital native", direct age questions
- caste_religion_bias: caste, surname cues, religion, prayer, dietary, festivals
- regional_bias: language accent, hometown, origin, state or city assumptions
- disability_bias: health, physical fitness unrelated to job requirements
- socioeconomic_bias: school prestige, salary history, vehicle ownership, class markers
- appearance_bias: "pleasing personality", height, weight, grooming
- culture_fit_coded: "ninja", "bro culture", "hustler", "always available"
- work_life_intrusion: "24/7", "nights and weekends", family commitments
- leading_question: telegraphs the expected answer, makes dissent uncomfortable
- inappropriate_content: sexual, harassing, threatening, profane language
- irrelevant_personal: no connection to job performance

SCORING (bias_score 0–100):
- 0–20:  Clean — professional, job-relevant, bias-free
- 21–50: Mild bias — could unintentionally deter some groups
- 51–75: Moderate — likely to exclude demographics, rewrite required
- 76–100: Severe — illegal or clearly inappropriate, remove immediately

SCORE FLOORS (non-negotiable):
- Any caste/religion reference → minimum 75
- Any marital/family status question → minimum 80
- Any appearance/colorism reference → minimum 85
- Any disability reference → minimum 80
- Sexual/profane/threatening content → exactly 100
- Direct age question → minimum 82

QUESTIONS TO AUDIT:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return ONLY a JSON array with exactly ${questions.length} objects in the same order as the questions:
[
  {
    "bias_score": <integer 0-100>,
    "tags": [<bias category strings from the list above>],
    "severity": "NONE" | "MILD" | "MODERATE" | "SEVERE",
    "oneLiner": "<max 12 words: the core issue, e.g. 'Implies family obligations affect job performance'>",
    "explanation": "<1-2 sentences: why this is biased and who it disadvantages. Write 'No bias detected.' if clean.>",
    "type": "behavioral" | "technical" | "situational" | "leadership",
    "competency": "<concise competency label, 2-4 words, e.g. 'Problem Solving'>"
  }
]

CRITICAL RULES:
- Return EXACTLY ${questions.length} objects — one per question in order
- tags must be [] if bias_score is 0-20
- If inappropriate_content: bias_score MUST be 100
- Do NOT return markdown fences
- Start response with [ and end with ]`;
}

/**
 * buildKitStructuralPrompt
 *
 * Analyses the structure of the uploaded kit in a single AI call.
 * Only called for paid users (starter+) with ≥3 questions.
 * Returns a single JSON object.
 *
 * @param {string[]} questions   - Raw question strings
 * @param {number[]} biasScores  - Parallel array of bias scores from the bias check
 * @param {string}   [role='']  - Optional role context
 * @returns {string} Prompt string
 */
function buildKitStructuralPrompt(questions, biasScores, role = '') {
  const roleCtx = role ? ` for a ${role} role` : '';
  const questionsWithScores = questions
    .map((q, i) => `${i + 1}. [Bias: ${biasScores[i] ?? 0}/100] ${q}`)
    .join('\n');

  return `You are a senior talent acquisition expert analysing the structural quality of an interview kit${roleCtx}.

Go beyond bias — evaluate WHAT the kit is testing, whether it's comprehensive, and where the gaps are.

QUESTIONS:
${questionsWithScores}

Return ONLY a JSON object with exactly these keys:
{
  "competencyGaps": [
    {
      "competency": "<competency name>",
      "severity": "high" | "medium" | "low",
      "reason": "<1 sentence: why this matters for the role>"
    }
  ],
  "redundancyFlags": [
    {
      "questionIndices": [<0-based indices>],
      "reason": "<1 sentence: what overlaps and why it wastes interview time>",
      "severity": "high" | "medium"
    }
  ],
  "typeDistribution": {
    "behavioral": <count>,
    "technical": <count>,
    "situational": <count>,
    "leadership": <count>
  },
  "typeBalanceScore": <integer 0-100, 100 = perfect balance for the role>,
  "suggestedAdditions": [
    {
      "competency": "<competency name>",
      "suggestedQuestion": "<a specific, ready-to-use fair question>",
      "type": "behavioral" | "technical" | "situational" | "leadership",
      "reason": "<1 sentence: why this gap matters>"
    }
  ],
  "overallStructureScore": <integer 0-100>,
  "recommendations": [
    "<1 actionable sentence>",
    "<1 actionable sentence>"
  ]
}

ANALYSIS RULES:
- competencyGaps: identify important competencies NOT tested by any question (max 5)
- redundancyFlags: flag pairs/groups testing the exact same thing (only real overlaps)
- suggestedAdditions: provide 2-3 high-quality replacement/addition questions (max 3)
- recommendations: 2 specific, actionable suggestions for improving the kit
- Do NOT return markdown fences. Start with { and end with }`;
}

/**
 * buildKitAuditRewritePrompt
 *
 * Generates a bias-free rewrite for a single flagged question.
 * Paid feature (starter+).
 *
 * @param {string}   question         - The original biased question
 * @param {object}   biasInfo         - { tags, oneLiner, explanation } from bias check
 * @param {string[]} previousRewrites - Previous rewrites to avoid (for "Try Another")
 * @param {string}   [role='']        - Optional role context
 * @returns {string} Prompt string
 */
function buildKitAuditRewritePrompt(question, biasInfo, previousRewrites = [], role = '') {
  const roleCtx = role ? ` for a ${role} role` : '';
  const avoidSection = previousRewrites.length > 0
    ? `\nPREVIOUS REWRITES TO AVOID (must be clearly different):\n${previousRewrites.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n`
    : '';

  return `You are a senior HR compliance expert. Rewrite the biased interview question below to be completely fair, legally compliant, and effective${roleCtx}.

ORIGINAL QUESTION:
"${question}"

BIAS ISSUES DETECTED:
- Categories: ${(biasInfo.tags || []).join(', ') || 'General bias'}
- Issue: ${biasInfo.oneLiner || biasInfo.explanation || 'Bias detected'}
${avoidSection}
REWRITE REQUIREMENTS:
1. Remove ALL bias — gender, age, caste, disability, culture-coded language, etc.
2. Preserve the underlying competency being assessed
3. Use STAR behavioral format where possible ("Tell me about a time...")
4. Keep it specific and job-relevant — not a generic question
5. Maximum 2 sentences
6. Do NOT introduce new topics not in the original intent

Return ONLY a JSON object:
{
  "rewrite": "<the bias-free question>",
  "competency": "<2-4 word competency label>",
  "type": "behavioral" | "technical" | "situational" | "leadership",
  "changeRationale": "<1 sentence: what changed and why>"
}

CRITICAL: Start with { and end with }. No markdown. No extra text.`;
}

module.exports = {
  buildKitAuditBiasPrompt,
  buildKitStructuralPrompt,
  buildKitAuditRewritePrompt,
};
