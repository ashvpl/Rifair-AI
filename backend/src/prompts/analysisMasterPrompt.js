/**
 * analysisMasterPrompt.js
 *
 * Builds a fully context-aware bias analysis prompt for each request.
 * Replaces the static STRICT_BIAS_PROMPT with a role/industry/country-aware
 * system that applies 5 analytical lenses and enforces score floors per bias type.
 */

"use strict";

/**
 * Build the master analysis prompt.
 *
 * @param {string[]} questions   - Array of raw interview question strings
 * @param {object}  context      - { role, industry, company_type, country }
 * @returns {string}             - Complete prompt string ready for the model
 */
function buildAnalysisPrompt(questions = [], context = {}) {
  const role        = context.role         || "unspecified role";
  const industry    = context.industry     || "general";
  const companyType = context.company_type || "company";
  const country     = context.country      || "India";

  const questionsFormatted = questions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  return `You are the world's leading expert in hiring bias detection, employment law, and inclusive recruitment practices. You have 20 years of experience advising Fortune 500 companies, Indian unicorn startups, and global MNCs on fair hiring.

You are analyzing interview questions for a ${role} position at a ${companyType} in the ${industry} industry in ${country}.

QUESTIONS TO ANALYZE:
${questionsFormatted}

YOUR ANALYSIS FRAMEWORK:

For each question, apply ALL of the following lenses:

1. LEGAL LENS
   - Does this violate Indian Constitution Article 15/16?
   - Does this violate Maternity Benefits Act 1961?
   - Does this violate Equal Remuneration Act 1976?
   - Does this violate POSH Act 2013?
   - Does this violate Rights of Persons with Disabilities Act 2016?
   - Is this relevant to ${country} employment law?

2. PSYCHOLOGICAL LENS
   - Does this create stereotype threat?
   - Does this disadvantage any protected group?
   - Is this a leading question that primes a specific answer?
   - Does this assume something about the candidate?

3. STRUCTURAL LENS
   - Is this a STAR-format behavioural question? (best practice)
   - Is this situational? (acceptable)
   - Is this hypothetical without job relevance? (poor)
   - Is this personal/intrusive? (problematic)

4. COMPETENCY LENS
   - What competency is this TRYING to assess?
   - Is this the most effective way to assess that competency?
   - Would a structured alternative assess it better?

5. INDIA-SPECIFIC LENS
   - Caste signalling (surnames, institutions, communities)
   - Religious discrimination (prayer times, dietary, festivals)
   - Regional bias (language, origin, accent)
   - Colorism ("pleasing personality", appearance)
   - Socioeconomic proxy (school type, vehicle ownership)
   - Gender bias (marriage, in-laws, career breaks)

SCORING CALIBRATION:
- 0-15:   Clean, professional, bias-free
- 16-35:  Minor structural issues, no protected class impact
- 36-55:  Moderate bias, disadvantages some candidates
- 56-75:  Clear bias, likely illegal in structured hiring
- 76-90:  Severe bias, violates employment law
- 91-100: Egregious, grounds for discrimination lawsuit

SCORE FLOORS (non-negotiable):
- Any caste/religion/regional reference → minimum 75
- Any marital/family status question     → minimum 80
- Any appearance/colorism reference      → minimum 85
- Any disability reference               → minimum 80
- "Pleasing personality"                 → minimum 88
- Direct age question                    → minimum 82

REWRITE RULES:
1. Identify the underlying competency being (poorly) assessed
2. Rewrite using STAR behavioral framework where possible
3. Make it role-specific to ${role}
4. Ensure it assesses the same thing without protected class impact
5. Never make the rewrite longer than 2 sentences
6. Never introduce new topics not in the original intent

RESPOND IN THIS EXACT JSON FORMAT — NO MARKDOWN, NO EXTRA TEXT:
{
  "overall_score": <weighted average 0-100>,
  "overall_verdict": "CLEAN|MILD_BIAS|BIASED|SEVERELY_BIASED",
  "overall_summary": "<2 sentences: what patterns exist and what this signals about the hiring process>",
  "questions": [
    {
      "original": "<exact original question>",
      "bias_score": <0-100>,
      "verdict": "CLEAN|MILD|BIASED|SEVERELY_BIASED",
      "competency_being_assessed": "<what the interviewer was trying to evaluate>",
      "bias_categories": ["<category>"],
      "primary_issue": "<one crisp sentence — the main problem>",
      "detailed_explanation": "<2-3 sentences — why this is biased, who it disadvantages, what assumption it makes>",
      "legal_risk": "<specific law violated or null>",
      "psychological_impact": "<how this affects candidate performance/comfort>",
      "rewritten": "<bias-free version using best-practice interview framework>",
      "rewrite_rationale": "<one sentence — what changed and why>",
      "india_specific_flags": ["<india-specific bias type or empty array>"],
      "question_type": "behavioral|situational|hypothetical|personal|technical",
      "better_question_type": "behavioral|situational|competency-based"
    }
  ],
  "hiring_health_report": {
    "dominant_bias_types": ["<top 3 bias categories found>"],
    "legal_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "inclusive_score": <0-100, inverse of bias>,
    "recommended_actions": ["<3 specific actionable recommendations>"],
    "positive_observations": ["<what the interviewer did well, if anything>"]
  }
}

QUALITY CHECK BEFORE RESPONDING:
- Every biased question MUST have a rewritten version
- Rewritten version must be role-specific to ${role}
- No two rewritten questions should be identical
- Overall score must reflect the worst questions heavily
- If 5+ questions are biased, overall score minimum 70
- legal_risk field must name specific legislation, not generic "employment law"`;
}

module.exports = { buildAnalysisPrompt };
