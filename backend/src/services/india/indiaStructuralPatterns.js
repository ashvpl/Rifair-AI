// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — India Structural Pattern Engine
// Regex-based detection of bias patterns specific to Indian hiring context.
// Each pattern returns a match object with category, score, and reason.
// ═══════════════════════════════════════════════════════════════════════════════

const INDIA_STRUCTURAL_PATTERNS = [

  // ── CASTE PROXY PATTERNS ──
  {
    rx: /\b(which|what)\s+(college|university|school|institution)\b/i,
    name: "institution_proxy",
    category: "caste_bias",
    score: 55,
    reason: "Asking about educational institution can be used as a caste/class proxy in India"
  },
  {
    rx: /\b(surname|last name|family name)\b/i,
    name: "surname_proxy",
    category: "caste_bias",
    score: 70,
    reason: "Asking for surname directly can be used to infer caste in Indian context"
  },
  {
    rx: /\b(community|sect|sub-caste|jati)\b/i,
    name: "community_direct",
    category: "caste_bias",
    score: 90,
    reason: "Direct reference to community or sect is caste-discriminatory"
  },
  {
    rx: /\b(iit|iim|tier 1 college)\b/i,
    name: "elite_institution_proxy",
    category: "caste_bias",
    score: 55,
    reason: "Elite institution requirements serve as socioeconomic and caste proxies in India"
  },
  {
    rx: /\b(reservation|reserved category|quota)\b/i,
    name: "reservation_mention",
    category: "caste_bias",
    score: 80,
    reason: "Asking about reservation status is discriminatory"
  },

  // ── RELIGION PROXY PATTERNS ──
  {
    rx: /\b(fast|fasting|dietary)\s+(habits|preference|restriction)\b/i,
    name: "dietary_religion_proxy",
    category: "religion_bias",
    score: 60,
    reason: "Dietary questions in Indian context are often religion proxies (halal, jain, etc.)"
  },
  {
    rx: /\b(available|work)\s+(on|during)\s+(friday|saturday|sunday)\b/i,
    name: "weekend_religion_proxy",
    category: "religion_bias",
    score: 50,
    reason: "Availability on specific days can be a religion proxy (Friday prayers, Saturday Sabbath)"
  },
  {
    rx: /\b(celebrate|observe)\s+(which|any|your)\s+(festival|holiday)\b/i,
    name: "festival_religion",
    category: "religion_bias",
    score: 75,
    reason: "Asking about festivals observed directly reveals religion"
  },

  // ── REGIONAL PROXY PATTERNS ──
  {
    rx: /\b(fluent|proficient|speak)\s+(in\s+)?(hindi|tamil|telugu|marathi|bengali|gujarati|kannada|malayalam|punjabi|odia)\b/i,
    name: "regional_language",
    category: "regional_bias",
    score: 65,
    reason: "Requiring specific regional language without job necessity is discriminatory"
  },
  {
    rx: /\b(native|local|from\s+this\s+city|originally\s+from)\b/i,
    name: "local_preference",
    category: "regional_bias",
    score: 70,
    reason: "Preference for local or native candidates is regional discrimination"
  },
  {
    rx: /\b(north|south|east|west)\s+indian\b/i,
    name: "region_label",
    category: "regional_bias",
    score: 85,
    reason: "Labelling candidates by region is discriminatory"
  },
  {
    rx: /\baccent\b/i,
    name: "accent_bias",
    category: "regional_bias",
    score: 60,
    reason: "References to accent in Indian context are proxies for regional discrimination"
  },

  // ── GENDER / MARRIAGE PROXY PATTERNS ──
  {
    rx: /\b(married|single|divorced|separated|widowed)\b/i,
    name: "marital_status",
    category: "gender_bias",
    score: 80,
    reason: "Marital status is a protected characteristic — directly discriminatory"
  },
  {
    rx: /\b(husband|wife|spouse)\b/i,
    name: "spouse_reference",
    category: "gender_bias",
    score: 75,
    reason: "Asking about spouse implies family status discrimination"
  },
  {
    rx: /\b(in[-\s]?law|joint family|parents[-\s]in[-\s]law)\b/i,
    name: "family_structure",
    category: "gender_bias",
    score: 70,
    reason: "Asking about family structure is discriminatory in Indian context"
  },
  {
    rx: /\bnight\s*(shift|duty|cab|travel)\s*(safe|safety|concern|comfortable)\b/i,
    name: "gender_night_safety",
    category: "gender_bias",
    score: 65,
    reason: "Night shift safety questions are implicitly directed at women and are discriminatory"
  },
  {
    rx: /\b(lady|female|woman|girl)\s+(candidate|employee|staff)\b/i,
    name: "gender_label",
    category: "gender_bias",
    score: 80,
    reason: "Gendering the candidate role is discriminatory"
  },

  // ── APPEARANCE PROXY PATTERNS ──
  {
    rx: /\bpleasing\s+personality\b/i,
    name: "pleasing_personality",
    category: "appearance_bias",
    score: 90,
    reason: "'Pleasing personality' is a common Indian JD euphemism for appearance discrimination"
  },
  {
    rx: /\b(smart|good|presentable)\s+(looking|appearance|personality)\b/i,
    name: "appearance_coded",
    category: "appearance_bias",
    score: 80,
    reason: "Appearance-coded language with no job relevance"
  },
  {
    rx: /\b(height|weight|complexion|skin)\b/i,
    name: "physical_attributes",
    category: "appearance_bias",
    score: 85,
    reason: "Physical attribute requirements unrelated to job function"
  },

  // ── SOCIOECONOMIC PROXY PATTERNS ──
  {
    rx: /\b(convent|english[-\s]medium|public school|boarding school)\b/i,
    name: "elite_school",
    category: "socioeconomic_bias",
    score: 65,
    reason: "Preference for elite school types is socioeconomic discrimination"
  },
  {
    rx: /\b(own|personal)\s+(vehicle|car|bike|transport|conveyance)\b/i,
    name: "vehicle_ownership",
    category: "socioeconomic_bias",
    score: 55,
    reason: "Requiring personal vehicle ownership discriminates on socioeconomic grounds"
  },
  {
    rx: /\b(well[-\s]settled|financially\s+stable|good\s+family\s+background)\b/i,
    name: "wealth_background",
    category: "socioeconomic_bias",
    score: 70,
    reason: "Family financial status is irrelevant to job performance"
  },

  // ── AGE PROXY PATTERNS ──
  {
    rx: /\b(fresher|fresh\s+graduate|0[-\s]to[-\s]2\s+years?)\b/i,
    name: "fresher_only",
    category: "age_bias",
    score: 60,
    reason: "Fresher-only requirements exclude experienced candidates based on age"
  },
  {
    rx: /\bcomfortable\s+(working\s+)?(with|under|reporting\s+to)\s+(a\s+)?(younger|junior)\b/i,
    name: "younger_manager",
    category: "age_bias",
    score: 75,
    reason: "Asking if comfortable with younger manager signals age discrimination"
  },
  {
    rx: /\b(below|under|maximum|max)\s+(age\s+)?\d{2}\b/i,
    name: "age_limit",
    category: "age_bias",
    score: 90,
    reason: "Setting explicit age limits is age discrimination"
  },
];


/**
 * Runs all India-specific structural patterns against a question.
 * @param {string} question - The question text to analyze
 * @returns {Array} List of all matches with scores
 */
function runIndiaStructuralAnalysis(question) {
  const matches = [];

  for (const pattern of INDIA_STRUCTURAL_PATTERNS) {
    const match = pattern.rx.exec(question);
    if (match) {
      matches.push({
        pattern_name: pattern.name,
        category: pattern.category,
        score: pattern.score,
        matched_text: match[0],
        reason: pattern.reason,
      });
    }
  }

  return matches;
}

module.exports = { INDIA_STRUCTURAL_PATTERNS, runIndiaStructuralAnalysis };
