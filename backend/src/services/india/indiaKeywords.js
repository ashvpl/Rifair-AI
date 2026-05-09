// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — India Keyword Dictionary
// Instant, no-API bias detection via exhaustive term matching.
// Each category has a weight (0-100), severity, and list of terms.
// ═══════════════════════════════════════════════════════════════════════════════

const INDIA_BIAS_DICTIONARY = {

  // ─────────────────────────────────────────
  // CASTE BIAS
  // ─────────────────────────────────────────
  caste_direct: {
    weight: 95,
    category: "caste_bias",
    severity: "critical",
    terms: [
      // Direct caste mentions
      "brahmin", "kshatriya", "vaishya", "shudra",
      "scheduled caste", "scheduled tribe", "obc",
      "general category", "upper caste", "lower caste",
      "dalit", "adivasi", "forward caste", "backward caste",
      "sc/st", "sc candidate", "st candidate",
      "caste certificate", "category certificate",
      "reservation candidate", "quota candidate",
      "unreserved", "open category",
      // Euphemisms
      "good family background", "cultured family",
      "traditional family values",
    ]
  },

  caste_surname_proxy: {
    weight: 75,
    category: "caste_bias",
    severity: "high",
    description: "Surnames used as caste proxies in Indian hiring",
    terms: [
      "what is your surname",
      "what's your surname",
      "family surname",
      "what caste",
      "caste background",
      "community background",
      "which community do you belong",
      "family community",
      "gothra", "gotra",
    ]
  },

  institution_caste_proxy: {
    weight: 70,
    category: "caste_bias",
    severity: "high",
    description: "Using institution tier as caste/class proxy",
    terms: [
      "iit only", "iim only", "tier 1 college only",
      "premier institution", "top 10 college",
      "nit graduate", "bits graduate",
      "which college did you attend",
      "rank in entrance exam",
      "jee rank", "cat percentile",
      "where did you study", "alma mater",
    ]
  },

  // ─────────────────────────────────────────
  // RELIGION BIAS
  // ─────────────────────────────────────────
  religion_direct: {
    weight: 90,
    category: "religion_bias",
    severity: "critical",
    terms: [
      "hindu", "muslim", "christian", "sikh",
      "jain", "buddhist", "parsi", "jewish",
      "namaz", "prayer times", "friday prayers",
      "sunday church", "religious holidays",
      "eid", "diwali leaves", "christmas leave",
      "religious practice", "religious belief",
      "your religion", "which religion",
      "do you fast", "roza", "upvas",
      "religious dress code", "hijab", "turban", "tilak",
      "dietary restrictions", "halal", "kosher", "jain food",
      "vegetarian for religious reasons",
    ]
  },

  religion_indirect: {
    weight: 65,
    category: "religion_bias",
    severity: "moderate",
    terms: [
      "cultural practices at work",
      "religious commitments",
      "faith-based leaves",
      "prayer breaks",
      "religious events",
      "temple", "mosque", "church", "gurudwara",
      "festival leave",
      "minority background",
    ]
  },

  // ─────────────────────────────────────────
  // REGIONAL / LANGUAGE BIAS
  // ─────────────────────────────────────────
  regional_direct: {
    weight: 80,
    category: "regional_bias",
    severity: "high",
    terms: [
      // State-based discrimination
      "north indian", "south indian", "bhaiya",
      "madrasi", "gujju", "marwari", "bong",
      "up wala", "bihari", "punjabi",
      "where are you from originally",
      "which state are you from",
      "hometown", "native place",
      "are you a local", "local candidate preferred",
      "domicile", "state domicile",
      "speaking hindi", "hindi speaking",
      "comfortable with hindi", "hindi mandatory",
      // Language proxies
      "mother tongue",
      "what language do you speak at home",
      "regional language",
      "accent", "your accent",
      "english accent",
    ]
  },

  regional_culture: {
    weight: 60,
    category: "regional_bias",
    severity: "moderate",
    terms: [
      "cultural fit for our team",
      "team is mostly from",
      "our office culture is very",
      "comfortable with our food",
      "team lunches include",
      "office culture might be different for you",
    ]
  },

  // ─────────────────────────────────────────
  // GENDER BIAS (India-specific forms)
  // ─────────────────────────────────────────
  gender_india_specific: {
    weight: 85,
    category: "gender_bias",
    severity: "critical",
    terms: [
      // Marriage and family pressure unique to India
      "are you married", "marital status",
      "planning to get married",
      "when are you getting married",
      "husband's job", "wife's job",
      "in-laws", "joint family",
      "will your family support",
      "husband's location", "husband's transfer",
      "spouse transfer",
      "saas sasur", "joint family pressure",
      // Maternity-specific India context
      "maternity leave plans",
      "planning to have children soon",
      "how many children do you have",
      "who takes care of your kids",
      "childcare arrangements",
      "domestic responsibilities",
      "housewife background",
      // Sexist assumptions common in India
      "girls in our team", "ladies in our team",
      "our team is male dominated", "male-dominated",
      "comfortable working with all male team",
      "late night safety concern",
      "cab facility for women",
      "female candidate",
      "lady candidate",
    ]
  },

  career_break_india: {
    weight: 75,
    category: "gender_bias",
    severity: "high",
    terms: [
      "gap in your resume",
      "career gap",
      "years of gap",
      "why did you leave",
      "were you working during",
      "homemaker period",
      "sabbatical reason",
      "what were you doing between",
    ]
  },

  // ─────────────────────────────────────────
  // AGE BIAS (India-specific context)
  // ─────────────────────────────────────────
  age_india: {
    weight: 70,
    category: "age_bias",
    severity: "high",
    terms: [
      "fresher only", "freshers preferred",
      "0-2 years experience only",
      "young team", "youthful environment",
      "digital native", "tech savvy youngster",
      "energetic young professional",
      "our team is very young",
      // Older worker bias
      "overqualified",
      "too experienced",
      "willing to work under younger manager",
      "comfortable reporting to someone younger",
      "age no bar",  // often signals age discrimination in JDs
      "below 30", "under 35",
      "maximum age 28",
    ]
  },

  // ─────────────────────────────────────────
  // SOCIOECONOMIC BIAS
  // ─────────────────────────────────────────
  socioeconomic: {
    weight: 65,
    category: "socioeconomic_bias",
    severity: "moderate",
    terms: [
      "english medium school",
      "convent educated",
      "public school background",
      "boarding school",
      "what school did you attend",
      "private school",
      "family income",
      "financially stable family",
      "well-settled family",
      "own vehicle", "own conveyance",
      "presentable appearance",
      "well-groomed",
    ]
  },

  // ─────────────────────────────────────────
  // POLITICAL BIAS (India-specific)
  // ─────────────────────────────────────────
  political_india: {
    weight: 80,
    category: "political_bias",
    severity: "high",
    terms: [
      "political affiliation",
      "which party do you support",
      "your political views",
      "rss", "bjp supporter", "congress supporter",
      "your views on current government",
      "nationalist", "secular views",
      "patriotic", "anti-national",
    ]
  },

  // ─────────────────────────────────────────
  // APPEARANCE / COLORISM (India-specific)
  // ─────────────────────────────────────────
  appearance_colorism: {
    weight: 85,
    category: "appearance_bias",
    severity: "critical",
    terms: [
      "fair complexion", "fair skin",
      "good looking", "presentable",
      "height requirement",
      "weight requirement",
      "smart appearance",
      "photogenic",
      "attractive personality",
      "pleasing personality",  // common Indian JD euphemism
      "good personality",      // often appearance proxy
      "well-maintained",
    ]
  },

  // ─────────────────────────────────────────
  // DISABILITY BIAS
  // ─────────────────────────────────────────
  disability_india: {
    weight: 85,
    category: "disability_bias",
    severity: "critical",
    terms: [
      "physically fit", "100% physically fit",
      "no physical disability",
      "able-bodied",
      "good eyesight required",
      "no medical conditions",
      "health certificate",
      "medical fitness certificate",
      "mentally sound",
      "no history of mental illness",
      "physically and mentally fit",
    ]
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// INDIA-SPECIFIC CLEAN REWRITE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const INDIA_REWRITE_TEMPLATES = {
  caste_bias: {
    template: "This question asks about protected characteristics under the Indian Constitution (Article 15/16). Remove entirely or replace with skills-based question.",
    replacement: "What qualifications and experience make you the right fit for this role?"
  },
  religion_bias: {
    template: "Religion is a protected characteristic under Indian law. Remove entirely. If asking about availability, replace with:",
    replacement: "Are you able to meet the working hours and schedule requirements of this role?"
  },
  regional_bias: {
    template: "Regional origin is discriminatory. Replace with a question about communication skills if that is the intent:",
    replacement: "Are you comfortable communicating in English and Hindi in a professional setting?"
  },
  gender_bias: {
    template: "Gender and family status questions are prohibited under the Maternity Benefits Act and Equal Remuneration Act:",
    replacement: "Are you able to meet the travel and availability requirements of this role?"
  },
  age_bias: {
    template: "Age-based hiring is discriminatory. Focus on capability:",
    replacement: "Can you walk us through your most relevant experience for this position?"
  },
  socioeconomic_bias: {
    template: "Socioeconomic background is irrelevant to job performance. Replace with:",
    replacement: "What professional skills and experiences make you qualified for this role?"
  },
  appearance_bias: {
    template: "'Pleasing personality' and appearance requirements are discriminatory proxies. Remove entirely. If client-facing role is the concern:",
    replacement: "This role involves client interaction. Can you describe your experience managing professional relationships?"
  },
  disability_bias: {
    template: "Disability-related questions violate the Rights of Persons with Disabilities Act 2016. Remove entirely. If specific physical requirement is genuine:",
    replacement: "This role requires [specific task]. Are you able to perform this function with or without reasonable accommodation?"
  },
  political_bias: {
    template: "Political views are irrelevant to job performance and asking is discriminatory:",
    replacement: "Remove this question entirely — it has no place in a professional interview."
  },
};

module.exports = { INDIA_BIAS_DICTIONARY, INDIA_REWRITE_TEMPLATES };
