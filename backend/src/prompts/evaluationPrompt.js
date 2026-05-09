// backend/src/prompts/evaluationPrompt.js
// Builds the structured AI evaluation prompt from interviewer scores + notes.

'use strict';

/**
 * @param {object} params
 * @param {string} params.role
 * @param {string} params.experience
 * @param {string} params.companyType
 * @param {string} [params.candidateName]
 * @param {Array<{id:number, question:string, competency:string, score:number, notes:string, weight_percent:number}>} params.questionScores
 * @param {string} params.kitSummary
 * @returns {string}
 */
function buildEvaluationPrompt({ role, experience, companyType, candidateName, questionScores, kitSummary }) {
  const candidate  = candidateName || 'The candidate';
  const avgScore   = questionScores.reduce((sum, q) => sum + q.score, 0) / questionScores.length;

  const scoresFormatted = questionScores.map(q => `
Question ${q.id}: ${q.question}
Competency : ${q.competency}
Score given: ${q.score}/5
Notes      : ${q.notes || 'No notes provided'}
Weight     : ${q.weight_percent}%
`).join('\n---\n');

  return `
You are a senior talent acquisition partner with 15 years of experience making hiring decisions
for ${role} positions at ${companyType} companies.

You are evaluating ${candidate} for the role of ${role}
(${experience} experience) at a ${companyType}.

INTERVIEW KIT CONTEXT:
${kitSummary}

INTERVIEWER SCORES AND NOTES:
${scoresFormatted}

AVERAGE SCORE: ${avgScore.toFixed(2)} / 5

YOUR TASK:
Analyse all scores and notes holistically to give a professional hiring recommendation.

SCORING INTERPRETATION (1–5 scale):
5 - Exceptional  : Far exceeded expectations; rare performance
4 - Strong       : Consistently met and often exceeded expectations
3 - Good         : Met expectations solidly
2 - Adequate     : Met basic expectations with notable gaps
1 - Poor         : Did not meet expectations

RECOMMENDATION THRESHOLDS:
HIRE  : Average ≥ 3.5 with no score below 2 on any critical competency
HOLD  : Average 2.5–3.4, OR strong in some areas but weak in key ones
REJECT: Average < 2.5, OR scored 1 on 2+ competencies

RETURN ONLY VALID JSON (no markdown fences):
{
  "overall_score": <0-100 integer, weighted by competency importance>,
  "recommendation": "HIRE|HOLD|REJECT",
  "confidence": "HIGH|MEDIUM|LOW",
  "confidence_reason": "<why you are more or less confident>",

  "summary": "<3-4 sentences: overall impression of this candidate for this role at this company type>",

  "hire_reasoning":   "<if HIRE: specific reasons why this candidate is right for ${role} at ${companyType}>",
  "reject_reasoning": "<if REJECT: specific gaps and why they matter for this role>",
  "hold_reasoning":   "<if HOLD: what is unclear and what additional assessment would clarify>",

  "strengths": [
    {
      "competency":   "<competency name>",
      "observation":  "<specific thing that stood out positively based on score and notes>"
    }
  ],

  "gaps": [
    {
      "competency":    "<competency name>",
      "observation":   "<specific gap observed>",
      "severity":      "CRITICAL|MODERATE|MINOR",
      "can_be_trained": true
    }
  ],

  "competency_breakdown": [
    {
      "competency":   "<name>",
      "score":        <1-5>,
      "weight_percent": <number>,
      "assessment":   "<one sentence assessment>"
    }
  ],

  "next_steps": {
    "if_hire":   ["<specific onboarding focus area>", "<another>"],
    "if_hold":   ["<specific follow-up interview topic or assessment>", "<another>"],
    "if_reject": ["<what profile to look for instead>", "<what to strengthen in the process>"]
  },

  "interview_quality_feedback": "<one sentence feedback to the interviewer on their scoring patterns>",

  "bias_check": {
    "potential_bias_detected": false,
    "bias_note": null
  }
}

CRITICAL OUTPUT RULES — FOLLOW EXACTLY:
- Your ENTIRE response must be the JSON object above and nothing else
- Do NOT write any text before the opening {
- Do NOT write any text after the closing }
- Do NOT wrap in markdown code fences (\`\`\`json or \`\`\`)
- Do NOT add explanations, summaries, or commentary
- Start your response with { and end with }
`.trim();
}

module.exports = { buildEvaluationPrompt };
