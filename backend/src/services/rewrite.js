const fs = require('fs');
const path = require('path');
const { callAI } = require("./aiService");
const { getFallback } = require("./fallback");

// Load grounded dataset patterns
let neutralPatterns = ["How do you approach...", "Can you explain..."];
let biasPairs = [];

try {
  const bankPath = path.join(__dirname, '../data/neutral_bank.json');
  if (fs.existsSync(bankPath)) {
    const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
    if (bank.patterns) neutralPatterns = bank.patterns.map(p => p + "...");
  }
  
  const pairsPath = path.join(__dirname, '../data/bias_pairs.json');
  if (fs.existsSync(pairsPath)) {
    biasPairs = JSON.parse(fs.readFileSync(pairsPath, 'utf8'));
  }
} catch (e) {}

/**
 * Simple similarity checker (Dice Coefficient)
 */
function getSimilarity(s1, s2) {
  const v1 = s1.toLowerCase().replace(/[^\w\s]/g, '');
  const v2 = s2.toLowerCase().replace(/[^\w\s]/g, '');
  const pairs1 = new Set(v1.split(' '));
  const pairs2 = new Set(v2.split(' '));
  const intersect = new Set([...pairs1].filter(x => pairs2.has(x)));
  return (2 * intersect.size) / (pairs1.size + pairs2.size);
}

/**
 * STEP 5 & 6: Always execute rewrite. Simple, clear prompt.
 */
async function generateRewrite(processed, classification) {
  const original = processed.original_text;

  // 1. FAST PATH: Exact or High-Similarity Match from Grounded Dataset
  for (const pair of biasPairs) {
    if (getSimilarity(original, pair.input) > 0.7) {
      console.log(`[REWRITE] High-precision match found for: "${pair.input}"`);
      return {
        improved_question: pair.output,
        improved_score: 5,
        source: "direct_match"
      };
    }
  }

  // 2. AI PATH: Intelligence Layer
  const systemPrompt = `You are an expert Interview Coach at EquiHire AI. 
  Your job is to transform biased or personal interview questions into professional, competency-based questions.
  
  REFRAMING RULES:
  - Focus on skills, behavior, and outcome.
  - Remove all mentions of personal life, physical traits, gendered language, or age-based assumptions.
  - USE PROFESSIONAL STARTERS like: ${neutralPatterns.slice(0, 5).join(', ')}.
  - Strictly skill-focussed. 15-25 words max.`;

  const userPrompt =
`ORIGINAL BIASED QUESTION:
"${original}"

TASK:
1. Reframe as a professional behavioral question.
2. Ensure the bias is 100% neutralized.
3. Return a predicted bias severity score (0-20).

Return ONLY this JSON:
{
  "improved_question": "<the rebuilt question>",
  "improved_score": <predicted numeric bias score 0-20>
}`;

  try {
    const result = await callAI(systemPrompt, userPrompt, true);
    const improved = result.improved_question;

    if (!improved || improved.trim().length < 10 || improved.toLowerCase() === original.toLowerCase()) {
      return {
        improved_question: getFallback(classification, original),
        improved_score: 10,
        source: "fallback"
      };
    }

    return {
      improved_question: improved.trim(),
      improved_score: Number(result.improved_score) || 10,
      source: "ai_refined"
    };
  } catch (error) {
    console.warn("[REWRITE] AI failed, using fallback:", error.message);
    return {
      improved_question: getFallback(classification, original),
      improved_score: 10,
      source: "fallback"
    };
  }
}

module.exports = { generateRewrite };
