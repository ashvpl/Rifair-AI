const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// ─── Circuit Breaker ──────────────────────────────────────────────────────────
class CircuitBreaker {
  constructor(failureThreshold = 3, recoveryTimeoutMs = 60000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
    this.failures = 0;
    this.state = "closed";
    this.lastFailureTime = null;
  }

  async execute(action) {
    if (this.state === "open") {
      const now = Date.now();
      if (now - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open - forcing fallback");
      }
    }
    try {
      const result = await action();
      this.failures = 0;
      this.state = "closed";
      return result;
    } catch (e) {
      this.failures++;
      this.lastFailureTime = Date.now();
      if (this.failures >= this.failureThreshold) this.state = "open";
      throw e;
    }
  }
}

const aiBreaker = new CircuitBreaker(3, 60000);

// ─── Key Rotation ─────────────────────────────────────────────────────────────
// All available Gemini keys. Loaded once at startup from .env.
// currentGeminiIndex persists in-process — once a key is exhausted it stays
// at the next valid index until the process restarts or recovers.
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_SECONDARY,
  process.env.GEMINI_API_KEY_TERTIARY,
].filter(Boolean);

let currentGeminiIndex = 0;

function getNextGeminiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  return GEMINI_KEYS[currentGeminiIndex % GEMINI_KEYS.length];
}

function rotateGeminiKey() {
  currentGeminiIndex = (currentGeminiIndex + 1) % GEMINI_KEYS.length;
  console.log(`[KEY-ROTATION] Switched to Gemini key index ${currentGeminiIndex}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function cleanJsonString(str) {
  return str.replace(/```json\n?|```\n?/g, "").trim();
}

// ─── Strict Bias Audit Prompt ─────────────────────────────────────────────────
// This prompt is what the user specified must be used — never lenient.
const STRICT_BIAS_PROMPT = `You are a strict hiring bias auditor with zero tolerance for discriminatory language.
Your job is to find bias, not to clear questions.

BIAS CATEGORIES AND TRIGGER TERMS:
- age_bias: "young", "energetic", "fresh", "dynamic", "fast-paced", "keep up", "digital native", "recent grad"
- gender_bias: "male-dominated", "bro culture", "manpower", "guys", "he/she assumptions"
- family_status: "family", "kids", "children", "planning to", "start a family", "pregnant", "spouse"
- work_life_intrusion: "late nights", "nights and weekends", "always available", "24/7", "no boundaries"
- culture_coded: "bro culture", "fraternity", "rockstar", "ninja", "hustle", "grind"
- aggressive_framing: "aggressive enough", "tough enough", "can you handle", "survive"
- background_bias: "background", "where are you from", "adapt here", "fit in here"

SCORING RULES — FOLLOW EXACTLY:
1. Score each question individually from 0-100
2. If ANY critical term is present → minimum score of 65
3. If question implies age preference → minimum 70
4. If question implies gender context → minimum 75
5. If question asks about family plans → minimum 85
6. "bro culture" = gender bias, score minimum 75
7. "male-dominated" = severe gender bias, score minimum 85
8. "late nights regularly" = work-life intrusion, score minimum 60
9. "young and energetic" = age bias, score minimum 80
10. "planning to start a family" = family status discrimination, score minimum 90
11. "background might make it hard" = background/origin bias, score minimum 80
12. NEVER mark a question NEUTRAL if it contains any term from the categories above
13. Overall score = weighted average. If 5+ questions are biased, overall minimum is 75

REWRITE RULES:
- Replace "aggressive enough to handle deadlines" → "How do you prioritize when multiple deadlines compete?"
- Replace "fit into bro culture" → "How do you collaborate with diverse teams under pressure?"
- Replace "late nights regularly" → "This role sometimes requires flexibility in hours. Are you able to meet those requirements?"
- Replace "young and energetic" framing → focus on motivation and adaptability instead
- Replace "male-dominated team" → remove entirely, ask about cross-functional collaboration
- Replace "planning to start a family" → NEVER ask this. Rewrite as availability confirmation only
- Replace "background might make it hard" → "What experience do you have adapting to new work environments?"

Return ONLY a valid JSON object, no markdown, no explanation outside JSON:
{
  "results": [
    {
      "semantic_score": <0-100 integer, following scoring rules above>,
      "bias_categories": ["<category from list above>"],
      "reasoning": "<one sentence: what makes it biased and why it is legally/ethically problematic>",
      "rewritten": "<completely rewritten version that assesses the same competency without any bias>"
    }
  ]
}`;

// ─── Gemini Call (with per-key retry) ────────────────────────────────────────
async function callGeminiBatch(questionsTextList, timeoutMs = 10000) {
  const attemptsMax = GEMINI_KEYS.length;
  let lastError;

  for (let attempt = 0; attempt < attemptsMax; attempt++) {
    const apiKey = getNextGeminiKey();
    if (!apiKey) break;

    try {
      console.log(`[GEMINI] Attempt ${attempt + 1}/${attemptsMax} with key index ${currentGeminiIndex}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      });
      const prompt = `${STRICT_BIAS_PROMPT}\n\nQuestions to analyze:\n${JSON.stringify(questionsTextList)}`;
      const result = await withTimeout(model.generateContent(prompt), timeoutMs);
      const rawText = (await result.response).text();
      const parsed = JSON.parse(cleanJsonString(rawText));
      if (!parsed.results) throw new Error("Missing 'results' key in Gemini response");
      console.log(`[GEMINI] Success with key index ${currentGeminiIndex}`);
      return parsed;
    } catch (e) {
      const isQuotaError =
        e.message?.includes("429") ||
        e.message?.includes("quota") ||
        e.message?.includes("RESOURCE_EXHAUSTED");

      console.error(`[GEMINI] Key ${currentGeminiIndex} failed: ${e.message}`);
      lastError = e;

      if (isQuotaError || e.message?.includes("timed out")) {
        rotateGeminiKey(); // try next key
      } else {
        // Non-quota error (bad request, malformed JSON) — no point rotating
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini keys exhausted");
}

// ─── Grok Call ────────────────────────────────────────────────────────────────
async function callGrokBatch(questionsTextList, timeoutMs = 10000) {
  if (!process.env.GROK_API_KEY) throw new Error("No Grok API key configured");

  const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });

  const result = await withTimeout(
    openai.chat.completions.create({
      model: "grok-3-mini",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: STRICT_BIAS_PROMPT },
        { role: "user", content: `Questions to analyze:\n${JSON.stringify(questionsTextList)}` },
      ],
    }),
    timeoutMs
  );

  const parsed = JSON.parse(result.choices[0].message.content);
  if (!parsed.results) throw new Error("Missing 'results' key in Grok response");
  return parsed;
}

// ─── OpenAI Call ──────────────────────────────────────────────────────────────
async function callOpenAIBatch(questionsTextList, timeoutMs = 10000) {
  if (!process.env.OPENAI_API_KEY) throw new Error("No OpenAI API key configured");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await withTimeout(
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: STRICT_BIAS_PROMPT },
        { role: "user", content: `Questions to analyze:\n${JSON.stringify(questionsTextList)}` },
      ],
    }),
    timeoutMs
  );

  const parsed = JSON.parse(result.choices[0].message.content);
  if (!parsed.results) throw new Error("Missing 'results' key in OpenAI response");
  return parsed;
}

// ─── Main batch entrypoint (with full provider cascade) ───────────────────────
async function callAIBatch(sysPrompt, userPrompt) {
  // Legacy interface — wrap into the new batch call
  // This is called by batchAnalyzeOptimized below
  throw new Error("Use batchAnalyzeOptimized directly");
}

async function batchAnalyzeOptimized(questionsTextList) {
  const timeoutMs = 10000;

  return await aiBreaker.execute(async () => {
    let lastError;

    // 1. Try Gemini with key rotation
    if (GEMINI_KEYS.length > 0) {
      try {
        return await callGeminiBatch(questionsTextList, timeoutMs);
      } catch (e) {
        console.error("[PIPELINE] All Gemini keys failed:", e.message);
        lastError = e;
      }
    }

    // 2. Try Grok
    if (process.env.GROK_API_KEY) {
      try {
        console.log("[PIPELINE] Falling back to Grok...");
        return await callGrokBatch(questionsTextList, timeoutMs);
      } catch (e) {
        console.error("[PIPELINE] Grok failed:", e.message);
        lastError = e;
      }
    }

    // 3. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("[PIPELINE] Falling back to OpenAI...");
        return await callOpenAIBatch(questionsTextList, timeoutMs);
      } catch (e) {
        console.error("[PIPELINE] OpenAI failed:", e.message);
        lastError = e;
      }
    }

    throw lastError || new Error("All AI providers exhausted — using rule-based fallback");
  });
}

// ─── Kit generation (unchanged contract) ─────────────────────────────────────
const { generateInterviewKit } = require("./fallback");

async function generateKitOptimized(role, experience, company, goals) {
  const grounded = generateInterviewKit(role, experience);
  const examples = grounded?.categories ? Object.values(grounded.categories).flat().slice(0, 3) : [];

  const sysPrompt = `Generate a structured interview kit for a ${role} (${experience}) at ${company}.
RULES:
1. No questions about age, family, health, nationality, religion, or personal life. Focus only on demonstrated skills, past behavior, and problem-solving.
2. Every question must require ${role} domain expertise.
3. Use JSON only.
SCHEMA:
{
  "role_summary": { "focus": "", "skills": [], "tasks": [] },
  "questions": ["Specific Question 1", "Specific Question 2", "Specific Question 3", "Specific Question 4", "Specific Question 5"],
  "rubric": [{ "skill": "", "criteria": "", "levels": { "basic": "", "good": "", "excellent": "" } }]
}
EXAMPLES: ${examples.join(" | ")}`;

  const userPrompt = `Role: ${role}, Experience: ${experience}, Company: ${company}`;

  try {
    // For kit gen we use Gemini directly (no bias prompt needed)
    const genAI = new GoogleGenerativeAI(getNextGeminiKey() || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    });
    const result = await withTimeout(model.generateContent(`${sysPrompt}\n\nINPUT:\n${userPrompt}`), 10000);
    const rawText = (await result.response).text();
    return JSON.parse(cleanJsonString(rawText));
  } catch (error) {
    console.error("[KIT] AI generation failed:", error.message);
    throw error;
  }
}

module.exports = {
  callAIBatch,
  batchAnalyzeOptimized,
  generateKitOptimized,
};
