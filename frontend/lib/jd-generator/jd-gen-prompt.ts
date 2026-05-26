// frontend/lib/jd-generator/jd-gen-prompt.ts

export function buildJDGeneratorPrompt(params: {
  role: string
  company: string
  location: string
  experience: string
  companyType: string
  industry: string
  teamSize?: string
  keySkills?: string
  workMode?: 'remote' | 'hybrid' | 'onsite'
  salaryRange?: string
  tone?: 'formal' | 'conversational' | 'startup'
}): string {

  const {
    role, company, location, experience,
    companyType, industry, teamSize,
    keySkills, workMode = 'hybrid',
    salaryRange, tone = 'conversational'
  } = params

  return `
You are the world's best talent acquisition specialist 
and inclusive hiring expert. You write job descriptions 
that attract the best talent, convert at the highest rate, 
and are completely free of bias.

Generate a complete, professional, bias-free job description for:

ROLE:         ${role}
COMPANY:      ${company}
LOCATION:     ${location}
EXPERIENCE:   ${experience}
COMPANY TYPE: ${companyType}
INDUSTRY:     ${industry}
WORK MODE:    ${workMode}
${teamSize    ? `TEAM SIZE:    ${teamSize}` : ''}
${keySkills   ? `KEY SKILLS:   ${keySkills}` : ''}
${salaryRange ? `SALARY RANGE: ${salaryRange}` : ''}
TONE:         ${tone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT MAKES A HIGH-CONVERTING JD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRUCTURE (follow exactly):
1. One-line headline that sells the role
2. About the company (3-4 sentences, authentic)
3. What you'll do (5-7 bullet responsibilities)
4. What we're looking for (requirements)
5. Nice to have (separate from must-have)
6. What we offer (benefits + culture)
7. Our hiring process (transparency builds trust)

CONVERSION RULES:
- Lead with impact: "You'll own X" beats "Responsible for X"
- Use second person "you" throughout
- Responsibilities: start each with a strong action verb
- Requirements: separate MUST-HAVE from NICE-TO-HAVE
  (most JDs combine them and lose 30% of qualified candidates)
- Never use "competitive salary" — state the range if provided
- End with a clear, welcoming call to action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BIAS PREVENTION RULES (non-negotiable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEVER use these words or phrases:
- Age-coded: "young", "energetic", "fresh", "dynamic team",
  "digital native", "recent graduate" (as requirement),
  "age no bar" (signals age discrimination)
- Gender-coded: "rockstar", "ninja", "guru", "bro culture",
  "aggressive", "dominant", "hustle", "manpower"
- Appearance: "presentable", "pleasing personality",
  "well-groomed", "smart looking"
- Exclusionary: "native speaker" (use "professional fluency"),
  "local candidates only" (unless legally required),
  "tier-1 college only", "IIT/IIM preferred"
- Overloaded: never require more years experience than
  the role genuinely needs (${experience} is the ceiling)
- Work pressure coded: "always available", "24/7",
  "no work-life balance", "work hard play hard"

ALWAYS use:
- Competency-based requirements (what they can DO)
- Inclusive culture language (focus on values, not personality)
- "Professional fluency in English" not "native speaker"
- "Ability to meet role requirements" not personal lifestyle assumptions
- Gender-neutral pronouns (they/their or "you")
- "We welcome applications from candidates of all backgrounds"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS CALIBRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For ${experience} experience level:
- Set must-have experience at MINIMUM viable, not maximum ideal
- Every requirement must be genuinely necessary for day-1 success
- Separate "must have" from "nice to have" — this is critical
- Avoid degree requirements unless the role legally requires one
- Focus requirements on demonstrated skills, not credentials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE GUIDANCE: ${tone.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${tone === 'startup'
  ? 'Direct, energetic, honest about stage. No corporate speak. Show the excitement of building.'
  : tone === 'formal'
  ? 'Professional, structured, precise. Appropriate for enterprise or regulated industries.'
  : 'Warm, human, clear. Reads like a person wrote it, not a committee.'}

The "full_jd" field must follow this EXACT structure.
Use this precise markdown format — no deviations:

---

# [Job Title] at [Company Name]

**📍 Location:** [Location] &nbsp;|&nbsp; **💼 Work Mode:** [Remote/Hybrid/Onsite] &nbsp;|&nbsp; **📅 Experience:** [X-Y years]

---

## About [Company Name]

[3-4 sentences. What the company does, its mission, 
its stage, and why this is an exciting time to join.
Be specific — name the product, the market, the traction.
Never use "dynamic", "innovative", or "industry-leading".]

---

## What You'll Do

- **[Area of ownership]:** [Specific responsibility starting 
  with an action verb — what they'll own, build, or drive]
- **[Area of ownership]:** [Specific responsibility]
- **[Area of ownership]:** [Specific responsibility]
- **[Area of ownership]:** [Specific responsibility]
- **[Area of ownership]:** [Specific responsibility]
- **[Area of ownership]:** [Specific responsibility]

---

## What We're Looking For

**Must have:**
- [Specific, measurable requirement with tool/skill named]
- [e.g. "3+ years building production APIs in Node.js or Python"]
- [e.g. "Strong SQL skills — able to write complex joins and window functions"]
- [e.g. "Experience working in Agile/Scrum environments"]
- [4-6 must-haves maximum — not a wishlist]

**Nice to have:**
- [Genuinely optional skill that would accelerate ramp-up]
- [Not a second must-have list in disguise]
- [2-4 items only]

---

## What We Offer

-  [Specific salary range or "₹X-Y LPA" — never "competitive salary"]
-  [Leave policy — specific days]
-  [Growth opportunity — specific not vague]
-  [Health benefits — specific]
-  [Work flexibility — specific arrangement]
- [1-2 more genuine, specific benefits]

---

## Our Hiring Process

1. [Step 1 — e.g. "Application review (3-5 business days)"]
2. [Step 2 — e.g. "30-minute intro call with hiring manager"]
3. [Step 3 — e.g. "Technical assessment (take-home, 2-3 hours)"]
4. [Step 4 — e.g. "Final interview with the team (2 rounds)"]
5. [Step 5 — e.g. "Offer within 48 hours of final round"]

---

## Apply Now

[Warm, specific, 2-sentence closing. 
Tell them exactly how to apply and 
what to include. Example:
"We'd love to hear from you. Send us your 
resume and a brief note on why this role 
excites you at careers@[company].com"]

*[Company Name] is an equal opportunity employer. 
We welcome applications from candidates of all 
backgrounds, experiences, and perspectives.*

---

#hiring #[RoleName] #[CompanyName] #[Location]jobs #JobOpportunity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURN ONLY VALID JSON — NO MARKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "headline": "<one-line role headline that sells>",
  
  "full_jd": "<complete formatted job description following the exact markdown structure above as a single string. You MUST use double newlines (\\\\n\\\\n) between all sections, paragraphs, and list items to ensure proper markdown rendering and a clean, spacious, LinkedIn-optimized format. Also include the hashtags at the very bottom.>",
  
  "sections": {
    "about_company": "<company description paragraph>",
    "what_youll_do": ["<responsibility 1>", "<responsibility 2>", ...],
    "must_have": ["<requirement 1>", ...],
    "nice_to_have": ["<nice to have 1>", ...],
    "what_we_offer": ["<benefit 1>", ...],
    "hiring_process": "<2-3 sentences on what to expect>",
    "cta": "<closing call to action>"
  },
  
  "bias_verification": {
    "bias_score": 0,
    "verified_clean": true,
    "inclusive_language_used": ["<example 1>", "<example 2>"],
    "requirements_calibration": "<note on how requirements were set>"
  },
  
  "conversion_insights": {
    "estimated_talent_pool_reach": "<e.g. 78% of available candidates>",
    "gender_balance": "balanced|slight_masculine|slight_feminine",
    "top_strength": "<what makes this JD high-converting>",
    "word_count": <number>
  },
  
  "meta": {
    "role": "${role}",
    "company": "${company}",
    "location": "${location}",
    "experience": "${experience}",
    "work_mode": "${workMode}",
    "generated_at": "<ISO timestamp>"
  }
}
`
}
