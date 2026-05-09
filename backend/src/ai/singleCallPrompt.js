// backend/src/ai/singleCallPrompt.js

function getDistribution(experience) {
  const exp = (experience || "").toLowerCase();
  const yearsMatch = exp.match(/\d+/);
  const years = parseInt(yearsMatch ? yearsMatch[0] : "3", 10);

  if (exp.includes('fresher') || years === 0) {
    return '- Behavioral: 2\n- Technical: 5\n- Situational: 2\n- Leadership: 1';
  }
  if (years <= 2) {
    return '- Behavioral: 3\n- Technical: 4\n- Situational: 2\n- Leadership: 1';
  }
  if (years <= 5) {
    return '- Behavioral: 4\n- Technical: 3\n- Situational: 2\n- Leadership: 1';
  }
  if (years <= 8) {
    return '- Behavioral: 3\n- Technical: 3\n- Situational: 2\n- Leadership: 2';
  }
  return '- Behavioral: 2\n- Technical: 2\n- Situational: 2\n- Leadership: 4';
}

function buildSingleCallKitPrompt(params) {
  const { role, experience, companyType, constraints } = params;

  return `
You are simultaneously:
1. An expert organizational psychologist who deeply 
   understands the "${role}" profession
2. A talent acquisition specialist who has hired 
   hundreds of ${role}s
3. An industry analyst who knows exactly what 
   "${companyType}" companies need

Your task is a single, complete operation:

STEP 1 — Internally analyze the role (do not output this):
- What does a ${role} actually do day-to-day?
- What tools and technologies do they use?
- What separates good from great at ${experience} level?
- What does ${companyType} specifically need from this role?

STEP 2 — Generate 10 premium interview questions 
using that analysis.

INPUTS:
Role: ${role}
Experience: ${experience}
Company Type: ${companyType}
Constraints: ${constraints || "Inclusive, bias-free hiring"}

QUESTION RULES (non-negotiable):
1. Every question must be IMPOSSIBLE to reuse 
   for a different role — must contain role-specific
   tools, situations, or domain knowledge
2. Reference real tools used in ${role} 
   (e.g. for a data analyst: SQL, Tableau, GA4 — 
   NOT generic "data tools")
3. No two questions can start the same way
4. No banned phrases:
   - "Explain your specific methodology regarding"
   - "Give a recent example." as a suffix
   - "Specifically in the context of being a ${role}"
5. Behavioral questions must reference real ${role} 
   situations — not generic workplace situations
6. Questions must match ${experience} experience level:
   - Junior (0-2yr): fundamentals + learning ability
   - Mid (2-5yr): ownership + independent execution  
   - Senior (5-8yr): leadership + architecture
   - Lead (8yr+): org impact + strategy
7. Situational questions must be plausible at 
   ${companyType}
8. Zero bias — no age, gender, family, religion, 
   caste, region, appearance questions
9. Generate EXACTLY 10 questions
10. Every question minimum 40 words — be specific

DISTRIBUTION based on ${experience}:
${getDistribution(experience)}

GOOD QUESTION EXAMPLES (study this pattern):
For "Data Analyst" at "Series B Startup" (2-3 years):
"You notice your weekly active users metric has 
dropped 18% over two weeks, but revenue is flat. 
Walk me through how you would investigate this 
discrepancy using SQL and your analytics stack, 
and what hypotheses you would test first."

For "Frontend Engineer" at "MNC" (Senior):
"Your team's React application has a Lighthouse 
performance score of 52 on mobile. The product 
manager wants it above 80 in two weeks. Walk me 
through your audit process, what you would fix 
first, and how you would measure success."

For "Marketing Analyst" at "AI Startup" (2-3 years):
"You've run an A/B test on your paid acquisition 
campaign for 3 weeks and results show 12% higher 
CTR for variant B but 8% lower conversion rate. 
How do you interpret this and what do you recommend 
to the growth team?"

BAD QUESTION EXAMPLES (never do this):
"Explain your specific methodology regarding: 
Technical decision-making in ${role} environments. 
Give a recent example."
→ BANNED: uses template structure, not role-specific

"Tell me about a time you handled a challenge at work."
→ BANNED: works for any role, not specific to ${role}

RETURN ONLY VALID JSON — NO MARKDOWN:
{
  "kit_title": "${role} Interview Kit — <level> | ${companyType}",
  "role": "${role}",
  "experience_level": "<Fresher|Junior|Mid-Level|Senior|Lead>",
  "company_type": "${companyType}",
  "estimated_duration_minutes": 45,
  "kit_summary": "<2 sentences specific to THIS role+level+company>",
  "role_intelligence": {
    "key_skills": ["<real skill 1>", "<real skill 2>", "<real skill 3>"],
    "day_to_day": "<what they actually do>",
    "what_separates_good_from_great": "<specific insight>"
  },
  "questions": [
    {
      "id": 1,
      "question": "<specific, role-relevant question>",
      "type": "behavioral|technical|situational|leadership",
      "competency": "<specific competency>",
      "why_this_question": "<why this for ${role} specifically>",
      "strong_answer_includes": [
        "<specific thing>",
        "<another specific thing>",
        "<another>"
      ],
      "red_flags": "<what weak answer reveals>",
      "follow_up_1": "<drill deeper>",
      "follow_up_2": "<edge case or challenge>",
      "time_minutes": <5|8|10>,
      "difficulty": "foundation|intermediate|advanced",
      "bias_score": 0,
      "bias_verified": true
    }
  ],
  "scorecard": {
    "competencies": [
      {
        "name": "<competency>",
        "weight_percent": <number>,
        "question_ids": [<ids>]
      }
    ]
  },
  "interviewer_guide": {
    "opening": "<how to open>",
    "pacing": "<how to pace>",
    "closing": "<how to close>"
  }
}

SELF-CHECK BEFORE OUTPUTTING:
□ All 10 questions generated?
□ No question starts the same way as another?
□ No banned phrases used?
□ Every question specific to ${role}?
□ Scorecard weights sum to 100?
□ Valid JSON — no trailing commas?
`;
}

module.exports = {
  buildSingleCallKitPrompt
};
