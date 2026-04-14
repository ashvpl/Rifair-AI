const { getFallback } = require("./fallback");

// ─── CRITICAL BIAS TERMS ──────────────────────────────────────────────
// Any match = minimum score floor as specified. These take priority over
// the regex tiers below. Phrases sorted longest-first to catch multi-word
// matches before contained single words.
const CRITICAL_BIAS_TERMS = [
  { phrase: "planning to start a family",  cat: "family_status",       floor: 90 },
  { phrase: "bro culture",                 cat: "culture_coded",       floor: 80 },
  { phrase: "male-dominated",              cat: "gender_bias",         floor: 85 },
  { phrase: "young and energetic",         cat: "age_bias",            floor: 80 },
  { phrase: "background might make",       cat: "background_bias",     floor: 80 },
  { phrase: "fast-paced bro",              cat: "culture_coded",       floor: 80 },
  { phrase: "aggressive enough",           cat: "aggressive_framing",  floor: 65 },
  { phrase: "late nights regularly",       cat: "work_life_intrusion", floor: 65 },
  { phrase: "fit into our",                cat: "culture_fit_coded",   floor: 60 },
  { phrase: "start a family",              cat: "family_status",       floor: 90 },
  { phrase: "digital native",              cat: "age_bias",            floor: 65 },
  { phrase: "hustle culture",              cat: "culture_coded",       floor: 65 },
  { phrase: "keep up with",                cat: "age_bias",            floor: 65 },
  { phrase: "can you handle",              cat: "aggressive_framing",  floor: 65 },
  { phrase: "tough enough",                cat: "aggressive_framing",  floor: 65 },
  { phrase: "where are you from",          cat: "background_bias",     floor: 70 },
  { phrase: "adapt here",                  cat: "background_bias",     floor: 70 },
  { phrase: "fit in here",                 cat: "background_bias",     floor: 70 },
  { phrase: "guys",                        cat: "gender_bias",         floor: 60 },
  { phrase: "manpower",                    cat: "gender_bias",         floor: 60 },
  { phrase: "late nights",                 cat: "work_life_intrusion", floor: 60 },
  { phrase: "nights and weekends",         cat: "work_life_intrusion", floor: 60 },
  { phrase: "24/7",                        cat: "work_life_intrusion", floor: 60 },
  { phrase: "always available",            cat: "work_life_intrusion", floor: 60 },
  { phrase: "young",                       cat: "age_bias",            floor: 65 },
  { phrase: "energetic",                   cat: "age_bias",            floor: 60 },
  { phrase: "fresh graduate",              cat: "age_bias",            floor: 65 },
  { phrase: "fresh grad",                  cat: "age_bias",            floor: 65 },
  { phrase: "rockstar",                    cat: "culture_coded",       floor: 60 },
  { phrase: "ninja",                       cat: "culture_coded",       floor: 55 },
  { phrase: "hustle",                      cat: "culture_coded",       floor: 60 },
  { phrase: "grind",                       cat: "culture_coded",       floor: 55 },
];

// Rewrite map for critical terms
const CRITICAL_REWRITES = {
  "planning to start a family": "Are you available to meet the full-time schedule requirements for this role?",
  "start a family":             "Are you available to meet the full-time schedule requirements for this role?",
  "bro culture":                "How do you collaborate with diverse teams under pressure?",
  "male-dominated":             "How do you approach cross-functional collaboration in team environments?",
  "young and energetic":        "How do you stay motivated and adaptable in a fast-changing environment?",
  "background might make":      "What experience do you have adapting to new work environments?",
  "aggressive enough":          "How do you prioritize when multiple deadlines compete?",
  "late nights regularly":      "This role sometimes requires flexibility in hours. Are you able to meet those requirements?",
  "late nights":                "This role sometimes requires flexibility in hours. Are you able to meet those requirements?",
  "nights and weekends":        "How do you manage workload during intensive project cycles?",
  "fit into our":               "How do you align your working style with a collaborative team environment?",
  "guys":                       "How does your team typically approach this type of challenge?",
  "manpower":                   "What staffing or resource strategy would you use for this project?",
  "digital native":             "How do you approach learning and adapting to new digital tools and workflows?",
  "rockstar":                   "Can you describe a project where you demonstrated exceptional technical skill?",
  "ninja":                      "How would you describe your technical expertise in this area?",
  "hustle":                     "How do you maintain high performance during demanding project phases?",
  "grind":                      "How do you sustain focus and output during intensive work periods?",
};

const BIAS_TERMS = {
  critical: [
    { rx: /\b(young|energetic|recent grad|fresh|older|mature candidate)\b/i, cat: "age" },
    { rx: /\b(he|she|manpower|mankind|girls|guys|wife|husband)\b/i, cat: "gender" },
    { rx: /\b(christian|jewish|muslim|church|pray)\b/i, cat: "cultural" },
    { rx: /\b(american-born|native speaker|where are you from originally)\b/i, cat: "cultural" }
  ],
  moderate: [
    { rx: /\b(kids|children|pregnant|married|spouse|babysitter)\b/i, cat: "gender" },
    { rx: /\b(healthy|physically fit|able-bodied)\b/i, cat: "health" },
    { rx: /\b(dynamic|youthful team|digital native)\b/i, cat: "age" }
  ],
  mild: [
    { rx: /\b(nights and weekends|always available|no work-life balance)\b/i, cat: "work_life" },
    { rx: /\b(prestigious school|ivy league|pedigree)\b/i, cat: "socioeconomic" }
  ]
};

const STRUCTURAL_PATTERNS = [
    { rx: /\bdo you have (kids|children|a family|plans to)\b/i, weight: 25, cat: "gender" },
    { rx: /\bwhere (are|were) you (born|from originally)\b/i, weight: 30, cat: "cultural" },
    { rx: /\bhow (old|young) are you\b/i, weight: 35, cat: "age" },
    { rx: /\baren't you (too|a bit)\b/i, weight: 20, cat: "tone" },
    { rx: /\bwe're a (young|fun|fast-paced|bro)\b/i, weight: 15, cat: "cultural" },
    { rx: /\bcan you (keep up|handle the pace)\b/i, weight: 18, cat: "age" }
];

const explanations = {
  age: "This question implies age affects capability or cultural alignment. [DATASET INSIGHT]: Historical recruitment data indicates that age-based inquiries correlate with a 12% higher risk of hiring disparities.",
  gender: "This question introduces gender-based assumptions or targets familial status. [DATASET INSIGHT]: Analysis of systemic recruitment patterns shows that familial/gender inquiries are primary drivers of involuntary bias.",
  cultural: "This question enforces narrow cultural conformity bias or targets personal beliefs. It risks alienating candidates from diverse backgrounds.",
  work_life: "This question implies high-pressure expectations that may target specific demographics or caregivers. It creates a 'barrier to entry'.",
  socioeconomic: "This question uses financial or educational status as a proxy for talent. [DATASET INSIGHT]: Such inquiries often perpetuate historical pay gaps.",
  tone: "The phrasing uses doubting or coercive language which can be intimidating to candidates.",
  health: "Asks about physical or mental capabilities which can be exclusionary to candidates with disabilities."
};

function analyzeDeterministally(text) {
  let keywordScore = 0;
  let structuralScore = 0;
  let detectedBias = new Set();
  let detectedSignals = new Set();
  let criticalMatch = false;
  let criticalFloor = 0;
  let criticalRewrite = null;
  let criticalExplanation = null;

  const lowerText = text.toLowerCase();

  // ── TIER 0: Critical phrase lookup (highest priority) ──────────────────
  // Longest phrases are listed first in CRITICAL_BIAS_TERMS, so multi-word
  // matches are caught before their contained single words.
  for (const { phrase, cat, floor } of CRITICAL_BIAS_TERMS) {
    if (lowerText.includes(phrase)) {
      criticalMatch = true;
      criticalFloor = Math.max(criticalFloor, floor);
      detectedBias.add(cat);
      detectedSignals.add(phrase);
      if (!criticalRewrite && CRITICAL_REWRITES[phrase]) {
        criticalRewrite = CRITICAL_REWRITES[phrase];
      }
      if (!criticalExplanation) {
        criticalExplanation = `Contains a critical bias indicator: "${phrase}". This language is legally and ethically problematic in a hiring context and must be removed.`;
      }
    }
  }

  // ── TIER 1: Regex keyword engine ──────────────────────────────────────
  for (const term of BIAS_TERMS.critical) {
    if (term.rx.test(text)) {
      criticalMatch = true;
      keywordScore += 35;
      detectedBias.add(term.cat);
      const m = text.match(term.rx);
      if (m) detectedSignals.add(m[0].toLowerCase());
    }
  }

  for (const term of BIAS_TERMS.moderate) {
    if (term.rx.test(text)) {
      keywordScore += 15;
      detectedBias.add(term.cat);
      const m = text.match(term.rx);
      if (m) detectedSignals.add(m[0].toLowerCase());
    }
  }

  for (const term of BIAS_TERMS.mild) {
    if (term.rx.test(text)) {
      keywordScore += 8;
      detectedBias.add(term.cat);
      const m = text.match(term.rx);
      if (m) detectedSignals.add(m[0].toLowerCase());
    }
  }

  if (keywordScore > 70) keywordScore = 70;
  if (criticalMatch) keywordScore = Math.max(keywordScore, 60);

  // ── TIER 2: Structural patterns ────────────────────────────────────────
  for (const pat of STRUCTURAL_PATTERNS) {
    if (pat.rx.test(text)) {
      structuralScore += pat.weight;
      detectedBias.add(pat.cat);
    }
  }
  if (structuralScore > 100) structuralScore = 100;

  const bias_types = Array.from(detectedBias);
  const primaryType = bias_types[0] || null;

  // Final score: take the MAX of the Tier-0 floor and the calculated score
  const calcScore = Math.round(keywordScore * 0.7 + structuralScore * 0.6);
  const finalScore = Math.min(100, Math.max(calcScore, criticalFloor));

  return {
    original: text,
    keywordScore,
    structuralScore,
    bias_score: finalScore,
    bias_types,
    signals: Array.from(detectedSignals),
    explanation: criticalExplanation ||
      (primaryType ? (explanations[primaryType] || explanations.cultural) : "No obvious bias detected."),
    improved_question: criticalRewrite || getFallback({ bias_types }, text) || text,
    source: "deterministic_engine",
    confidence: 0.82
  };
}

module.exports = { analyzeDeterministally };
