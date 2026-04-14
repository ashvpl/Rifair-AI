/**
 * Non-LLM Validation Layer
 */
function validate(original, improved) {
  if (!improved || improved.length < 5) return false;

  // 1. Similarity Check (Jaccard-like)
  const similarity = calculateSimilarity(original, improved);
  if (similarity > 0.85) return false; // Too similar = bias likely leaked

  // 2. Bias Leakage Check
  const sensitiveTerms = ["age", "young", "old", "woman", "man", "gender", "pregnant", "kids", "married"];
  const improvedLower = improved.toLowerCase();
  if (sensitiveTerms.some(term => improvedLower.includes(term))) return false;

  // 3. Length Check
  const wordCount = improved.split(/\s+/).length;
  if (wordCount > 25) return false;

  // 4. Structure Check
  if (!improved.includes("?") && !improved.endsWith(".")) return false;

  return true;
}

function calculateSimilarity(str1, str2) {
  const s1 = new Set(str1.toLowerCase().split(/\s+/));
  const s2 = new Set(str2.toLowerCase().split(/\s+/));
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

module.exports = { validate };
