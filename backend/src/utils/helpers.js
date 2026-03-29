/**
 * AI Call Timeout Wrapper
 */
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);

/**
 * Conditional Logging for Production
 */
const logger = (message, data = null) => {
  if (process.env.NODE_ENV !== "production") {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Validation Logic (Moved from server.js)
 */
function isGeneric(text) {
  const genericPhrases = [
    "tell me about yourself",
    "strengths and weaknesses",
    "where do you see yourself",
    "why should we hire you",
    "your experience",
  ];
  return genericPhrases.some((phrase) => text.toLowerCase().includes(phrase));
}

function hasDomainMismatch(role, text) {
  role = role.toLowerCase();
  text = text.toLowerCase();
  const techKeywords = [
    "react",
    "javascript",
    "coding",
    "software",
    "api",
    "database",
    "frontend",
    "backend",
  ];
  const isTechRole = techKeywords.some((kw) => role.includes(kw));
  if (!isTechRole && techKeywords.some((kw) => text.includes(kw))) return true;
  return false;
}

function validateKit(role, kit) {
  if (!kit || !kit.questions || kit.questions.length < 3) return false;
  const questions = kit.questions;
  let genericCount = 0;
  for (const q of questions) {
    if (isGeneric(q)) genericCount++;
    if (hasDomainMismatch(role, q)) return false;
  }
  return genericCount / questions.length <= 0.5;
}

module.exports = {
  withTimeout,
  logger,
  isGeneric,
  hasDomainMismatch,
  validateKit,
};
