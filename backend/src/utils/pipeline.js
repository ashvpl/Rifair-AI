const { validateWithAI } = require("../services/aiService");

// --- CONSTANTS FROM ENGINE.JS ---
const BIAS_LANGUAGE_INTELLIGENCE = {
  gender: ["aggressive", "dominant", "assertive", "ninja", "rockstar", "bro culture", "male-dominated", "alpha", "competitive personality", "family plans", "start a family", "maternity", "paternity", "girl", "guys", "chairman", "manpower", "female", "male", "gender", "family", "marriage"],
  age: ["young", "energetic", "recent graduate", "freshers", "digital native", "junior mindset", "overqualified", "too experienced", "early career", "young team", "mature", "seasoned", "old school", "experience", "enough"],
  cultural: ["fit into culture", "culture fit", "bro culture", "fast-paced environment", "work hard play hard", "native speaker", "perfect English", "local candidates only", "background", "upbringing", "traditional values"],
  work_life: ["late nights", "weekends", "24/7 availability", "dedicate your life", "no work-life balance", "always available", "high pressure environment", "long hours", "overtime expected", "manage family", "personal life", "can you adjust", "flexible enough"],
  socioeconomic: ["top-tier colleges", "elite universities", "IIT only", "premium background", "well-spoken", "polished personality", "pedigree", "wealthy", "privileged", "low salary", "salary expectations", "current salary", "salary at beginning"],
  health: ["health conditions", "medical issues", "physically fit", "mentally strong", "no disabilities", "stress tolerance limit", "sick days", "handicap", "illness"],
  harassment: ["sex", "sexy", "sexual", "vulgar", "dating", "romantic relation", "hookup", "intimate relation", "handsome", "gorgeous", "physical appearance"]
};

const LANGUAGE_INTELLIGENCE_WEIGHTS = {
  gender: 8,
  age: 7,
  cultural: 7,
  health: 9,
  religion: 9,
  work_life: 6,
  socioeconomic: 5,
  harassment: 10
};

const PATTERN_SCORES = {
  suggestive: 20,
  assumptive: 40,
  intrusive: 60,
  discriminatory: 80
};

const TONE_SCORES = {
  "Neutral": 0,
  "Suggestive": 20,
  "Pressuring": 40,
  "Judgmental": 60,
  "Exclusionary": 80
};

const SOFT_PATTERNS = {
  cultural: /(fit into culture|culture fit|blend in|our kind of people|like us|traditional values)/gi,
  work_life: /(late nights|weekends|24\/7 availability|flexible hours|personal commitments|family obligations|outside of work|manage family)/gi,
  socioeconomic: /(low salary|salary expectations|current salary|salary at beginning|adjust with the low|can you adjust)/gi,
  tone: /(punishment|penalty|consequences|must|strictly|mandatory|do you think you can really|given your background|how would you manage despite|can you adjust|flexible enough)/gi,
  suggestive: /(do you think|given your background|how would you manage despite|can you adjust|flexible enough)/gi,
  assumptive: /(given your|since you are|as a|being a)/gi,
  intrusive: /(family|married|kids|health|religion|private|personal life)/gi,
  discriminatory: /(only|must be|no|strictly)/gi
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

const RULE_REPLACEMENTS = {
  "different cultural backgrounds": "diverse teams",
  "culture fit": "values alignment",
  "fit into culture": "align with our values",
  "long hours": "meeting project deadlines",
  "ninja": "expert",
  "rockstar": "top performer",
  "manpower": "workforce",
  "guys": "everyone"
};

/**
 * STEP 1: INPUT NORMALIZATION
 */
function normalizeInput(text) {
  if (!text) return [];
  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentences = normalized.split(/(?<=[?.!])\s+|\n+/).filter(s => s.trim().length > 3);
  return sentences.map(s => s.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").trim());
}

/**
 * STEP 2: RULE-BASED DETECTION (PRIMARY ENGINE)
 */
function detectRules(question) {
  const flags = [];
  const lower = question.toLowerCase();

  // Language Intelligence matches
  const foundCategories = new Set();
  for (const [category, words] of Object.entries(BIAS_LANGUAGE_INTELLIGENCE)) {
    for (const word of words) {
      if (lower.includes(word.toLowerCase())) {
        const weight = LANGUAGE_INTELLIGENCE_WEIGHTS[category] || 5;
        const isRepeated = foundCategories.has(category);
        const finalWeight = isRepeated ? weight * 1.2 : weight; // Boost rule: 20% amplification
        
        flags.push({
          word,
          category,
          weight: finalWeight,
          severity: (category === 'harassment' || category === 'socioeconomic') ? 'high' : 'medium',
          source: 'rule'
        });
        foundCategories.add(category);
      }
    }
  }

  // Pattern matches
  for (const [category, pattern] of Object.entries(SOFT_PATTERNS)) {
    const matches = lower.match(pattern);
    if (matches) {
      matches.forEach(m => {
        flags.push({
          word: m,
          category,
          patternType: ['suggestive', 'assumptive', 'intrusive', 'discriminatory'].includes(category) ? category : 'suggestive',
          source: 'pattern'
        });
      });
    }
  }

  return flags;
}

/**
 * STEP 5: INDEPENDENT SCORING SYSTEM (v1.0)
 */
function calculateIndependentScore(signals, aiUsed = false) {
  const { languageIntelligenceFlags, patterns, semanticAI, toneType } = signals;

  // 1. LANGUAGE INTELLIGENCE SCORE
  const totalLanguageIntelligenceWeight = languageIntelligenceFlags.reduce((sum, f) => sum + (f.weight || 0), 0);
  const languageIntelligenceScore = Math.min(100, (totalLanguageIntelligenceWeight / 50) * 100); // Normalized against a max threshold of 50

  // 2. PATTERN SCORE
  let highestPattern = 0;
  patterns.forEach(p => {
    const pScore = PATTERN_SCORES[p.patternType] || 0;
    if (pScore > highestPattern) highestPattern = pScore;
  });
  const patternScore = highestPattern;

  // 3. SEMANTIC SCORE
  let semanticScore = 0;
  if (aiUsed && semanticAI) {
    const biasProb = semanticAI.bias_probability || 0;
    const confidence = semanticAI.confidence || 0;
    semanticScore = biasProb * 100 * (confidence < 0.5 ? confidence * 0.5 : confidence);
  }

  // 4. TONE SCORE
  const toneScore = TONE_SCORES[toneType] || 0;

  // FINAL_SCORE CALCULATION
  let finalScore;
  if (aiUsed) {
    finalScore = (languageIntelligenceScore * 0.35) + (patternScore * 0.25) + (semanticScore * 0.30) + (toneScore * 0.10);
  } else {
    // FALLBACK MODE (Rule 3)
    finalScore = (languageIntelligenceScore * 0.6) + (patternScore * 0.4) + 10;
  }

  // OVERRIDE RULE 1: HIGH RISK
  if (patternScore >= 60 || (languageIntelligenceScore > 50 && toneScore > 40)) {
    finalScore = Math.max(finalScore, 75);
  }

  // OVERRIDE RULE 2: MULTI-CATEGORY BOOST
  const uniqueCategories = new Set(languageIntelligenceFlags.map(f => f.category));
  if (uniqueCategories.size >= 3) {
    finalScore += (uniqueCategories.size >= 5 ? 20 : 10);
  }

  // Final Normalization
  return Math.min(100, Math.max(0, Math.round(finalScore)));
}

/**
 * STEP 6: RISK CLASSIFICATION
 */
function getRiskLevel(score) {
  if (score > 70) return "HIGH";
  if (score > 30) return "MEDIUM";
  return "LOW";
}

/**
 * STEP 7: REWRITE ENGINE (MANDATORY)
 */
function getRuleBasedRewrite(question, flags) {
  let rewritten = question;
  for (const [bad, good] of Object.entries(RULE_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${bad}\\b`, "gi");
    rewritten = rewritten.replace(regex, good);
  }

  // If no specific replacement, use template
  if (rewritten === question && flags.length > 0) {
    const primaryCategory = flags[0].category;
    rewritten = CATEGORY_TEMPLATES[primaryCategory]?.rewrite || question;
  }
  return rewritten;
}

/**
 * STEP 8: HIGHLIGHT ENGINE
 */
function highlightText(text, flags) {
  let highlighted = text;
  const uniqueWords = Array.from(new Set(flags.map(f => f.word))).sort((a, b) => b.length - a.length);
  
  uniqueWords.forEach(word => {
    const regex = new RegExp(`(${word})`, "gi");
    highlighted = highlighted.replace(regex, '<span class="bias-highlight">$1</span>');
  });
  return highlighted;
}

/**
 * FINAL UNIFIED PIPELINE
 */
async function runUnifiedPipeline(text) {
  // STEP 1: Normalize
  const rawQuestions = normalizeInput(text);
  let processedQuestions = rawQuestions.map(q => ({
    original: q,
    languageIntelligenceFlags: [],
    patterns: [],
    semanticAI: null,
    rewrite: q,
    biasScore: 0
  }));

  // STEP 2 & 3: Run Rule-Based and (optional) AI Analysis
  let aiUsed = false;
  let aiResults = { questions: [] };
  
  try {
    const questionsWithInitialFlags = processedQuestions.map(pq => {
      const allRuleFlags = detectRules(pq.original);
      pq.languageIntelligenceFlags = allRuleFlags.filter(f => f.source === 'rule');
      pq.patterns = allRuleFlags.filter(f => f.source === 'pattern');
      return pq;
    });

    const hints = questionsWithInitialFlags.flatMap(pq => 
      pq.languageIntelligenceFlags.map(f => `[${f.category}] "${f.word}"`)
    );
    
    aiResults = await validateWithAI(text, hints);
    aiUsed = true;
  } catch (error) {
    console.warn("AI Analysis failed, falling back to rule-only mode.", error.message);
  }

  // STEP 4: Merge Engine & Question Scoring
  processedQuestions.forEach(pq => {
    if (aiUsed) {
      const aiMatch = aiResults.questions.find(aq => aq.question.toLowerCase().includes(pq.original.toLowerCase()));
      if (aiMatch) {
        pq.semanticAI = aiMatch;
        pq.rewrite = aiMatch.rewrite;
      }
    }

    // Calculate INDEPENDENT score for this question (Step 5)
    pq.biasScore = calculateIndependentScore({
      languageIntelligenceFlags: pq.languageIntelligenceFlags,
      patterns: pq.patterns,
      semanticAI: pq.semanticAI,
      toneType: pq.semanticAI?.tone_type || "Neutral"
    }, aiUsed);

    // Prepare unified flags for highlighting
    pq.flags = [
      ...pq.languageIntelligenceFlags,
      ...pq.patterns.map(p => ({
        word: p.word,
        category: p.category,
        severity: (p.category === 'harassment' || p.category === 'socioeconomic' || p.category === 'discriminatory') ? 'high' : 'medium',
        source: 'pattern'
      })),
      ...(pq.semanticAI ? pq.semanticAI.bias_type.map(cat => ({ 
        word: pq.original, 
        category: cat, 
        severity: pq.semanticAI.severity === 'high' ? 'high' : 'medium',
        source: 'ai' 
      })) : [])
    ];
    
    // STEP 7: Mandatory Rewrite (Fallback)
    if (pq.biasScore > 20 && pq.rewrite === pq.original) {
      pq.rewrite = getRuleBasedRewrite(pq.original, pq.languageIntelligenceFlags);
    }

    // STEP 8: Highlight Engine
    pq.highlighted = highlightText(pq.original, pq.flags);
  });

  // FINAL AGGREGATION
  const overallScore = processedQuestions.length > 0 
    ? Math.round(processedQuestions.reduce((sum, q) => sum + q.biasScore, 0) / processedQuestions.length)
    : 0;

  const riskLevel = getRiskLevel(overallScore);
  
  const categoryBreakdown = {};
  processedQuestions.flatMap(q => q.flags).forEach(f => {
    categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
  });

  return {
    questions: processedQuestions,
    overallScore,
    riskLevel,
    categoryBreakdown,
    aiUsed,
    summary: aiResults.summary || (aiUsed ? "Detailed AI analysis complete." : "Rule-based linguistic scan complete.")
  };
}

module.exports = { runUnifiedPipeline };
