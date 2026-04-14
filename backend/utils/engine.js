const BIAS_LEXICON = {
  gender: ["aggressive", "dominant", "assertive", "ninja", "rockstar", "bro culture", "male-dominated", "alpha", "competitive personality", "family plans", "start a family", "maternity", "paternity", "girl", "guys", "chairman", "manpower", "female", "male", "gender", "family", "marriage"],
  age: ["young", "energetic", "recent graduate", "freshers", "digital native", "junior mindset", "overqualified", "too experienced", "early career", "young team", "mature", "seasoned", "old school", "experience", "enough"],
  cultural: ["fit into culture", "culture fit", "bro culture", "fast-paced environment", "work hard play hard", "native speaker", "perfect English", "local candidates only", "background", "upbringing", "traditional values"],
  work_life: ["late nights", "weekends", "24/7 availability", "dedicate your life", "no work-life balance", "always available", "high pressure environment", "long hours", "overtime expected", "manage family", "personal life", "can you adjust", "flexible enough"],
  socioeconomic: ["top-tier colleges", "elite universities", "IIT only", "premium background", "well-spoken", "polished personality", "pedigree", "wealthy", "privileged", "low salary", "salary expectations", "current salary", "salary at beginning"],
  health: ["health conditions", "medical issues", "physically fit", "mentally strong", "no disabilities", "stress tolerance limit", "sick days", "handicap", "illness"],
  harassment: ["sex", "sexy", "sexual", "vulgar", "dating", "romantic relation", "hookup", "intimate relation", "handsome", "gorgeous", "physical appearance"]
};

// LAYER 2: SOFT PATTERN LAYER (REGEX)
const SOFT_PATTERNS = {
  cultural: /(fit into culture|culture fit|blend in|our kind of people|like us|traditional values)/gi,
  work_life: /(late nights|weekends|24\/7 availability|flexible hours|personal commitments|family obligations|outside of work|manage family)/gi,
  socioeconomic: /(low salary|salary expectations|current salary|salary at beginning|adjust with the low|can you adjust)/gi,
  tone: /(punishment|penalty|consequences|must|strictly|mandatory|do you think you can really|given your background|how would you manage despite|can you adjust|flexible enough)/gi
};

const CATEGORY_TEMPLATES = {
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

const SPECIFIC_REWRITES = {
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

function preprocessText(text) {
  if (!text) return [];
  const normalized = text.replace(/\s+/g, ' ').trim();
  const lines = normalized.split(/(?<=[?.!])\s+|\n+/).filter(line => line.trim().length > 0);
  const cleanedSentences = lines.map(line => line.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").trim()).filter(line => line.length > 3);
  return cleanedSentences;
}

// LAYER 1: HARD LEXICON LAYER
function extractRuleMatches(text) {
  const matches = [];
  const lowercaseText = text.toLowerCase();
  
  const SPECIFIC_SEVERITIES = {
    "female": 9, "male": 9, "family": 8, "manage family": 8, "young": 8,
    "experience": 6, "enough": 6, "ninja": 7, "rockstar": 7,
    "low salary": 8, "can you adjust": 8,
    "sex": 10, "sexy": 10, "sexual": 10, "vulgar": 10, "hookup": 10
  };

  for (const [category, words] of Object.entries(BIAS_LEXICON)) {
    for (const word of words) {
      if (lowercaseText.includes(word.toLowerCase())) {
        const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.tone;
        matches.push({
          layer: "hard",
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
  return matches;
}

// LAYER 2: SOFT PATTERN LAYER
function extractSoftPatterns(text) {
  const matches = [];
  for (const [category, pattern] of Object.entries(SOFT_PATTERNS)) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.tone;
      matches.push({
        layer: "soft",
        category,
        word: match[0],
        severity: 6,
        explanation: `Pattern detected: "${match[0]}" indicates potential ${category} bias.`,
        impact: template.impact,
        rewriteTemplate: template.rewrite
      });
    }
    pattern.lastIndex = 0; // reset for next use
  }
  return matches;
}

function aggregateSignals(sentences, matches) {
  const aggregated = {};

  // Initialize with neutral state for all sentences
  sentences.forEach(s => {
    aggregated[s] = {
      question: s,
      bias_score: 0,
      bias_type: [],
      issue: "",
      explanation: "No clear linguistic evidence of bias found.",
      impact: "Minimal impact on candidate fairness.",
      rewrite: s,
      layers: []
    };
  });

  // Layer in the matches
  matches.forEach(m => {
    sentences.forEach(s => {
      // Find which specific keyword matched
      const matchedKeyword = m.word;
      
      if (s.toLowerCase().includes(matchedKeyword.toLowerCase())) {
        const current = aggregated[s];
        // Upgrade score if this match is more severe
        if (m.severity > current.bias_score) {
          current.bias_score = m.severity;
          current.issue = matchedKeyword; // CRITICAL: Must be the exact word for highlighter
          current.explanation = m.explanation || `Detected '${matchedKeyword}' associated with ${m.category} bias.`;
          current.impact = m.impact || `May inadvertently discourage candidates related to ${m.category}.`;
          
          // BETTER FALLBACK REWRITES (Context-aware generic alternatives)
          const fallbackRewrites = {
            gender: "How would you describe your collaborative working style in a fast-paced environment?",
            age: "How does your professional experience prepare you for the specific challenges of this role?",
            cultural: "How do your professional values and approach align with our team's mission?",
            work_life: "How do you manage your productivity during peak project cycles?",
            socioeconomic: "Can you share an example of a complex problem you solved using your technical skills?",
            health: "What specific support or environment helps you perform at your best?",
            tone: "How do you handle challenging professional environments with tight deadlines?"
          };

          current.rewrite = SPECIFIC_REWRITES[matchedKeyword.toLowerCase()] || 
                            fallbackRewrites[m.category] || 
                            CATEGORY_TEMPLATES[m.category]?.rewrite || 
                            s;
        }
        
        if (!current.bias_type.includes(m.category)) {
          current.bias_type.push(m.category);
        }
        
        const layerType = m.layer;
        if (!current.layers.includes(layerType)) {
          current.layers.push(layerType);
        }
      }
    });
  });

  return Object.values(aggregated);
}

function calculateFinalScore(questions) {
  if (!questions || questions.length === 0) {
    return { score: 0, risk_level: "low" };
  }

  const EXPLICIT_BIAS_KEYWORDS = ["young", "old", "age", "woman", "man", "gender", "pregnant", "family", "children", "background", "accent"];
  const FIXED_PROTECTED_ATTRIBUTES = ["age", "gender", "family", "ethnicity", "race", "religion"];

  const scoredQuestions = questions.map(q => {
    let qScore = q.bias_score || 0;
    const metadata = q.metadata || {};
    
    // 1. WEIGHTED SCORING MODEL
    // If AI provided broken/missing components, we estimate them from base score
    const semantic = metadata.semantic_score || qScore;
    const keyword = metadata.keyword_score || qScore;
    const structural = metadata.structural_score || qScore;
    
    let weightedScore = (0.5 * semantic) + (0.3 * keyword) + (0.2 * structural);
    
    // 2. EXPLICIT BIAS BOOST
    const text = (q.question || "").toLowerCase();
    const hasExplicitKeyword = EXPLICIT_BIAS_KEYWORDS.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(text);
    });
    if (hasExplicitKeyword) {
      weightedScore += 35;
    }
    
    // 3. HARD TRIGGER RULES
    const hasProtectedAttribute = FIXED_PROTECTED_ATTRIBUTES.some(attr => {
      const regex = new RegExp(`\\b${attr}\\b`, 'i');
      return regex.test(text) || (Array.isArray(q.bias_type) && q.bias_type.includes(attr));
    });
    if (hasProtectedAttribute) {
      weightedScore = Math.max(weightedScore, 75);
    }
    
    // 4. MULTI-BIAS AMPLIFICATION
    if (Array.isArray(q.bias_type) && q.bias_type.length > 1) {
      weightedScore += 15;
    }
    
    // 5. NORMALIZATION
    q.bias_score = Math.min(100, Math.round(weightedScore));
    return q.bias_score;
  });

  // Calculate overall score as the max of any single question + weighted average of the rest
  // This ensures that one HORRIBLE question makes the whole report high risk
  const maxQScore = Math.max(...scoredQuestions);
  const avgQScore = scoredQuestions.reduce((a, b) => a + b, 0) / scoredQuestions.length;
  
  // Overall bias is sensitive: max score has 70% weight, average has 30%
  let finalOverallScore = (0.7 * maxQScore) + (0.3 * avgQScore);
  
  finalOverallScore = Math.min(100, Math.round(finalOverallScore));

  let riskLevel = "low";
  if (finalOverallScore >= 60) riskLevel = "high";
  else if (finalOverallScore >= 30) riskLevel = "medium";

  return { score: finalOverallScore, risk_level: riskLevel };
}

function formatOutput(aiOutput) {
  const { score, risk_level } = calculateFinalScore(aiOutput.questions);

  return {
    overall_bias_score: score,
    risk_level,
    summary: aiOutput.summary || "Analysis complete.",
    questions: aiOutput.questions.map(q => ({
      original: q.question,
      bias_score: q.bias_score,
      bias_type: q.bias_type || [],
      explanation: q.explanation || "No bias detected.",
      improved_question: q.rewrite || q.question,
      improved_score: q.improved_score || 0
    })),
    is_fallback: aiOutput.is_fallback || false
  };
}

module.exports = {
  preprocessText,
  extractRuleMatches,
  extractSoftPatterns,
  aggregateSignals,
  calculateFinalScore,
  formatOutput
};
