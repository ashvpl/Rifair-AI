const { BIAS_LANGUAGE_INTELLIGENCE, SOFT_PATTERNS } = require("../utils/constants");

/**
 * STEP 1: Proper Input Splitting + Signal Extraction
 * - No compression. Full question text sent downstream.
 */
function preprocess(text) {
  if (!text) return [];

  // Proper question splitting — handles numbered lists and newlines
  const questions = text
    .split(/\n|\d+[.)]\s*/)
    .map(q => q.trim())
    .filter(q => q.length > 10);

  return questions.map(q => {
    const lower = q.toLowerCase();
    const signals = new Set();

    // Keyword-based signal extraction
    for (const [category, words] of Object.entries(BIAS_LANGUAGE_INTELLIGENCE)) {
      words.forEach(word => {
        if (lower.includes(word.toLowerCase())) {
          signals.add(word);
        }
      });
    }

    // Pattern-based signal extraction
    // (Patterns are hard to highlight specifically without capturing, but we can store them if needed)
    for (const [category, pattern] of Object.entries(SOFT_PATTERNS)) {
      const match = lower.match(pattern);
      if (match) {
        signals.add(match[0]);
      }
    }

    // STEP 4: Hard rule score boost (pre-AI, instant correction)
    let ruleBoost = 0;
    if (/\bage\b|young|old/i.test(q)) ruleBoost += 40;
    if (/\bwoman\b|\bmale\b|\bfemale\b|\bgender\b/i.test(q)) ruleBoost += 50;
    if (/bro culture/i.test(q)) ruleBoost += 35;
    if (/family|pregnant|married|kids/i.test(q)) ruleBoost += 40;
    if (/\brace\b|ethnicity|religion/i.test(q)) ruleBoost += 45;
    if (/late nights|weekends|24\/7/i.test(q)) ruleBoost += 25;
    if (/salary|current ctc|current pay/i.test(q)) ruleBoost += 20;

    return {
      original_text: q,         // Full, uncompressed question
      signals: Array.from(signals),
      rule_boost: Math.min(ruleBoost, 70), // cap at 70 so AI can still influence final
    };
  });
}

function highlightBiasKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return text;
  
  let highlighted = text;
  // Sort by length descending to avoid partial matches on longer phrases
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(word => {
    if (!word || word.length < 2) return;
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="bias-highlight">$1</span>');
  });
  
  return highlighted;
}

module.exports = { preprocess, highlightBiasKeywords };
