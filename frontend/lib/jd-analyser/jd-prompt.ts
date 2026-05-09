export function buildJDAnalysisPrompt(
  jobDescription: string,
  companyType?: string,
  role?: string
): string {
  return `
You are the world's leading expert in inclusive job description writing and employment discrimination law.

You have reviewed 50,000+ job descriptions for Fortune 500 companies, Indian unicorns, and global MNCs. You know every bias pattern, coded phrase, and exclusionary requirement that deters qualified candidates from applying.

ANALYSE THIS JOB DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${companyType ? `Company type: ${companyType}` : ''}
${role ? `Role: ${role}` : ''}

YOUR ANALYSIS FRAMEWORK:

1. BIAS BY SECTION
   Analyse each section separately:
   - Job title
   - About the company
   - Responsibilities
   - Requirements / Qualifications
   - Nice to have
   - Culture / Team description
   - Perks / Benefits

2. CODED LANGUAGE DETECTION
   Identify phrases that signal bias without explicitly stating it:
   - "Rockstar / Ninja / Guru" → age/gender coded
   - "Fast-paced / High-energy" → age bias
   - "Recent graduate" → age discrimination
   - "Native speaker" → nationality bias
   - "Cultural fit" → exclusionary
   - "Aggressive growth targets" → gender coded
   - "Young team / Dynamic team" → age bias
   - "Strong work ethic" → can imply bias
   - "Overqualified" → age bias proxy
   - Degree requirements where not needed → socioeconomic
   - "Must have own vehicle" → socioeconomic
   - "Pleasing personality" → appearance/gender
   - Physical requirements not relevant to role

3. REQUIREMENT INFLATION CHECK
   Identify requirements that are:
   - Unnecessarily restrictive
   - Screening out qualified candidates
   - Years of experience exceeding job complexity
   - Degree requirements for practical roles
   - Technology stack requirements too narrow

4. GENDER LANGUAGE ANALYSIS
   - Masculine-coded words: competitive, dominant, champion, aggressive, strong, lead, drive
   - Feminine-coded words: support, nurture, collaborate, help, assist
   - Check overall gender balance of language

5. INCLUSIVITY SCORING
   Score the JD on:
   - Language inclusivity (0-100)
   - Requirement fairness (0-100)
   - Culture description neutrality (0-100)
   - Overall inclusivity (0-100)

CRITICAL RULES:
- Flag EVERY biased phrase — do not give benefit of doubt
- Rewrite must preserve the role's actual requirements — do not water down genuine needs
- Legal risk must cite specific applicable law
- Rewritten JD must be complete — not truncated
- Suggestions must be specific and actionable

RETURN ONLY VALID JSON — NO MARKDOWN:
{
  "overall_bias_score": <0-100, higher = more biased>,
  "overall_inclusivity_score": <0-100, higher = more inclusive>,
  "overall_verdict": "INCLUSIVE|MILD_BIAS|BIASED|SEVERELY_BIASED",
  "legal_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "<3 sentences: what this JD does well and what its main problems are>",
  
  "section_analysis": [
    {
      "section": "<Job Title|About Company|Responsibilities|Requirements|Nice to Have|Culture|Benefits>",
      "bias_score": <0-100>,
      "issues_found": [
        {
          "phrase": "<exact phrase from JD>",
          "bias_type": "<gender|age|socioeconomic|nationality|appearance|culture_coded|requirement_inflation>",
          "explanation": "<why this is biased and who it excludes>",
          "severity": "CRITICAL|HIGH|MODERATE|LOW",
          "fixed_phrase": "<replacement phrase or null if should be removed>"
        }
      ],
      "section_verdict": "<one sentence assessment of this section>"
    }
  ],
  
  "coded_language": [
    {
      "phrase": "<exact phrase>",
      "decoded_meaning": "<what this actually signals to candidates>",
      "who_it_deters": "<which candidate group avoids applying>",
      "replacement": "<neutral alternative>"
    }
  ],
  
  "requirement_inflation": [
    {
      "requirement": "<the inflated requirement>",
      "issue": "<why it's unnecessarily restrictive>",
      "suggestion": "<what to replace it with>"
    }
  ],
  
  "gender_language_analysis": {
    "masculine_coded_count": <number>,
    "feminine_coded_count": <number>,
    "balance": "MASCULINE_SKEWED|FEMININE_SKEWED|BALANCED",
    "flagged_words": ["<word>"],
    "recommendation": "<one sentence>"
  },
  
  "inclusivity_scores": {
    "language": <0-100>,
    "requirements": <0-100>,
    "culture_description": <0-100>,
    "overall": <0-100>
  },
  
  "legal_risks": [
    {
      "issue": "<what the legal risk is>",
      "applicable_law": "<specific law or regulation>",
      "severity": "HIGH|MEDIUM|LOW"
    }
  ],
  
  "top_3_fixes": [
    "<most impactful single change to make>",
    "<second most impactful>",
    "<third most impactful>"
  ],
  
  "rewritten_jd": "<complete rewritten job description — bias-free, inclusive, same requirements preserved>",
  
  "rewrite_changelog": [
    {
      "original": "<what was changed>",
      "replacement": "<what it became>",
      "reason": "<why>"
    }
  ],
  
  "positive_observations": [
    "<something the JD did well inclusivity-wise>"
  ]
}

SELF CHECK BEFORE RESPONDING:
- Every biased phrase flagged with exact quote?
- Rewritten JD is complete — not cut short?
- Legal risks cite specific laws not generic?
- Coded language decoded with who it deters?
- Valid JSON — no trailing commas?
`
}
