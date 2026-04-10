import { RuleMatch } from "./types";

export const BIAS_LANGUAGE_INTELLIGENCE = {
  gender: ["aggressive", "dominant", "assertive", "ninja", "rockstar", "bro culture", "male-dominated", "alpha", "competitive personality", "family plans", "start a family", "maternity", "paternity", "girl", "guys", "chairman", "manpower"],
  age: ["young", "energetic", "recent graduate", "freshers", "digital native", "junior mindset", "overqualified", "too experienced", "early career", "young team", "mature", "seasoned"],
  cultural: ["fit into culture", "culture fit", "bro culture", "fast-paced environment", "work hard play hard", "native speaker", "perfect English", "local candidates only", "background", "upbringing"],
  work_life: ["late nights", "weekends", "24/7 availability", "dedicate your life", "no work-life balance", "always available", "high pressure environment", "long hours", "overtime expected", "can you adjust", "flexible enough"],
  socioeconomic: ["top-tier colleges", "elite universities", "IIT only", "premium background", "well-spoken", "polished personality", "pedigree", "low salary", "salary expectations", "current salary", "salary at beginning"],
  health: ["health conditions", "medical issues", "physically fit", "mentally strong", "no disabilities", "stress tolerance limit", "sick days"],
  harassment: ["sex", "sexy", "sexual", "vulgar", "dating", "romantic relation", "hookup", "intimate relation", "handsome", "gorgeous", "physical appearance"]
};

export const CATEGORY_TEMPLATES: Record<string, { explanation: string, impact: string, rewrite: string }> = {
  gender: {
    explanation: "Contains gendered terminology or stereotypes that may exclude specific genders.",
    impact: "Creates a less inclusive environment and may discourage qualified candidates.",
    rewrite: "How would you describe your collaborative working style in high-pressure situations?"
  },
  age: {
    explanation: "Uses age-related descriptors that implicitly favor younger or older candidates.",
    impact: "Limits age diversity and may violate age discrimination guidelines.",
    rewrite: "How does your professional experience prepare you for the challenges of this role?"
  },
  cultural: {
    explanation: "Focuses on 'culture fit' or specific backgrounds which can lead to unconscious bias.",
    impact: "Reduces diversity of thought and may exclude candidates from different backgrounds.",
    rewrite: "How do your values and professional approach align with our team's mission?"
  },
  work_life: {
    explanation: "Sets expectations for extreme working hours that may exclude those with caregiving responsibilities.",
    impact: "Disproportionately affects parents and those with personal commitments.",
    rewrite: "What are your strategies for maintaining productivity during peak project periods?"
  },
  socioeconomic: {
    explanation: "Implicitly favors candidates from specific elite educational or economic backgrounds.",
    impact: "Creates barriers for talented individuals from diverse socioeconomic paths.",
    rewrite: "Can you share an example of a complex problem you've solved using your technical skills?"
  },
  health: {
    explanation: "Asks about physical or mental health status which is often legally protected and irrelevant.",
    impact: "May discriminate against individuals with disabilities or health conditions.",
    rewrite: "What specific support or environment helps you perform at your best?"
  },
  tone: {
    explanation: "Uses an exclusionary or overly aggressive tone that may be off-putting.",
    impact: "Can create a hostile first impression of the company culture.",
    rewrite: "How do you handle challenging professional environments?"
  },
  harassment: {
    explanation: "Contains directly inappropriate, sexually explicit, or harassing language.",
    impact: "Creates a hostile work environment and violates strict legal workplace harassment policies.",
    rewrite: "This question is highly inappropriate and violates workplace policies. It should be completely removed."
  }
};

const SPECIFIC_REWRITES: Record<string, string> = {
  "aggressive": "How do you lead a team through challenging projects with tight deadlines?",
  "dominant": "What is your approach to ensuring all voices are heard in a team?",
  "ninja": "How would you describe your technical expertise in this area?",
  "rockstar": "Can you provide an example of a project where you demonstrated exceptional skill?",
  "bro culture": "How do you contribute to a positive and inclusive team environment?",
  "male-dominated": "How do you approach collaborating across diverse teams?",
  "start a family": "What are your professional goals for the next few years?",
  "family": "How do you manage your professional responsibilities during high-demand periods?",
  "young": "How has your professional experience evolved to meet the demands of this role?",
  "background": "How would your unique perspective contribute to our team's success?",
  "culture fit": "What specific values do you look for in a team's mission?",
  "late nights": "How do you manage workload during intensive project cycles?",
  "weekends": "What is your approach to handling occasional high-stakes project demands?",
  "low salary": "What are your salary expectations for this role?",
  "salary expectations": "How does your experience align with the budget for this position?",
  "can you adjust": "Are you comfortable with the compensation structure for this level?"
};

export function extractRuleMatches(text: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const lowercaseText = text.toLowerCase();
  
  const SPECIFIC_SEVERITIES: Record<string, number> = {
    "female": 9, "male": 9, "family plans": 9, "start a family": 9, "maternity": 9,
    "young": 8, "energetic": 6, "recent graduate": 8, "freshers": 7,
    "aggressive": 8, "bro culture": 9, "male-dominated": 9,
    "no work-life balance": 8, "dedicate your life": 8,
    "low salary": 8, "can you adjust": 8,
    "sex": 10, "sexy": 10, "sexual": 10, "vulgar": 10, "hookup": 10
  };

  for (const [category, words] of Object.entries(BIAS_LANGUAGE_INTELLIGENCE)) {
    for (const word of words) {
      if (lowercaseText.includes(word.toLowerCase())) {
        const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.tone;
        matches.push({
          category,
          word,
          severity: SPECIFIC_SEVERITIES[word.toLowerCase()] || 7,
          explanation: template.explanation,
          impact: template.impact,
          rewriteTemplate: SPECIFIC_REWRITES[word.toLowerCase()] || template.rewrite
        });
      }
    }
  }

  // Tone evaluation (Basic RegEx/heuristics)
  if (!matches.some(m => m.category === 'cultural') && (lowercaseText.includes("fit") || lowercaseText.includes("culture"))) {
    matches.push({
      category: "cultural",
      word: "tone/culture",
      severity: 5,
      explanation: CATEGORY_TEMPLATES.cultural.explanation,
      impact: CATEGORY_TEMPLATES.cultural.impact,
      rewriteTemplate: SPECIFIC_REWRITES["culture fit"] || CATEGORY_TEMPLATES.cultural.rewrite
    });
  }

  // Advanced Tone and Structure heuristics
  const tonePatterns = /(punishment|penalty|consequences|must|strictly|mandatory|can you adjust|flexible enough)/gi;
  const structurePatterns = /(do you think you can really|given your background|how would you manage despite|adjust with the low)/gi;
  
  let match;
  while ((match = tonePatterns.exec(lowercaseText)) !== null) {
    if (!matches.some(m => m.word === match![0])) {
      matches.push({
        category: "tone",
        word: match[0],
        severity: 6,
        explanation: "Aggressive or pressuring tone detected.",
        impact: CATEGORY_TEMPLATES.tone.impact,
        rewriteTemplate: CATEGORY_TEMPLATES.tone.rewrite
      });
    }
  }

  while ((match = structurePatterns.exec(lowercaseText)) !== null) {
    if (!matches.some(m => m.word === match![0])) {
      matches.push({
        category: "tone",
        word: match[0],
        severity: 6,
        explanation: "Question structure implies doubt or negative assumptions.",
        impact: CATEGORY_TEMPLATES.tone.impact,
        rewriteTemplate: CATEGORY_TEMPLATES.tone.rewrite
      });
    }
  }

  return matches;
}
