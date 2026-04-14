const BIAS_LANGUAGE_INTELLIGENCE = {
  gender: ["aggressive", "dominant", "assertive", "ninja", "rockstar", "bro culture", "male-dominated", "alpha", "competitive personality", "family plans", "start a family", "maternity", "paternity", "girl", "guys", "chairman", "manpower", "female", "male", "gender", "family", "marriage"],
  age: ["young", "energetic", "recent graduate", "freshers", "digital native", "junior mindset", "overqualified", "too experienced", "early career", "young team", "mature", "seasoned", "old school", "experience", "enough"],
  cultural: ["fit into culture", "culture fit", "bro culture", "fast-paced environment", "work hard play hard", "native speaker", "perfect English", "local candidates only", "background", "upbringing", "traditional values"],
  work_life: ["late nights", "weekends", "24/7 availability", "dedicate your life", "no work-life balance", "always available", "high pressure environment", "long hours", "working hours", "overtime expected", "manage family", "personal life", "can you adjust", "flexible enough", "manage work"],
  socioeconomic: ["top-tier colleges", "elite universities", "IIT only", "premium background", "well-spoken", "polished personality", "pedigree", "wealthy", "privileged", "low salary", "salary expectations", "current salary", "salary at beginning"],
  health: ["health conditions", "medical issues", "physically fit", "mentally strong", "no disabilities", "stress tolerance limit", "sick days", "handicap", "illness"],
  harassment: ["sex", "sexy", "sexual", "vulgar", "dating", "romantic relation", "hookup", "intimate relation", "handsome", "gorgeous", "physical appearance"]
};

const SOFT_PATTERNS = {
  cultural: /(fit into culture|culture fit|blend in|our kind of people|like us|traditional values)/gi,
  work_life: /(late nights|weekends|24\/7 availability|flexible hours|personal commitments|family obligations|outside of work|manage family)/gi,
  socioeconomic: /(low salary|salary expectations|current salary|salary at beginning|adjust with the low|can you adjust)/gi,
  tone: /(punishment|penalty|consequences|must|strictly|mandatory|do you think you can really|given your background|how would you manage despite|can you adjust|flexible enough)/gi,
};

const FALLBACK_TEMPLATES = [
  "How do your skills and experience prepare you for this role?",
  "How do you handle high-pressure or fast-paced work environments?",
  "Can you describe your approach to managing responsibilities effectively?",
  "How do you ensure consistent performance in challenging situations?"
];

module.exports = {
  BIAS_LANGUAGE_INTELLIGENCE,
  SOFT_PATTERNS,
  FALLBACK_TEMPLATES
};
