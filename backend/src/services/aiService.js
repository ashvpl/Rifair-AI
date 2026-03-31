const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const SYSTEM_PROMPT = `You are an expert AI bias detection engine.
Analyze the provided interview questions for:
1. INFLEXIBLE TONE: Coercive, aggressive, or doubtful phrasing.
2. HIDDEN ASSUMPTIONS: Assumptions about personal life, age, or gender.
3. EXCLUSIONARY LANGUAGE: Words like "fit", "belong", "adjust" that imply cultural gatekeeping.
4. NON-SKILL FOCUS: Questions evaluating personal life instead of job skills.

STRICT JSON OUTPUT:
{
  "overall_bias_score": number,
  "risk_level": "low" | "medium" | "high",
  "summary": "1-2 line analysis of intent",
  "questions": [
    {
      "question": "exact input",
      "bias_probability": number (0-1),
      "confidence": number (0-1),
      "severity": "low" | "medium" | "high",
      "tone_type": "Neutral" | "Suggestive" | "Pressuring" | "Judgmental" | "Exclusionary",
      "bias_type": ["gender", "age", "cultural", "work_life", "socioeconomic", "health", "tone", "harassment"],
      "issue": "specific detection",
      "explanation": "WHY it's biased",
      "rewrite": "skill-focused version"
    }
  ]
}`;

// --- AI CONFIGURATION & MODELS ---
// Only models confirmed valid on the Google AI v1 API as of Q1 2026.
// gemini-1.5-* and gemini-pro are deprecated/removed — causes 404s.
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-002",
  "gemini-1.5-pro-002",
];
const OPENAI_MODEL = "gpt-3.5-turbo"; // gpt-4o-mini quota exhausted; use gpt-3.5-turbo as fallback

// Cache permanently-failing models (404, invalid) to skip them on retry
const deadModels = new Set();

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

function getGemini(apiKey) {
  return new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || "");
}

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

/**
 * Unified AI Call Logic - STRICT GEMINI FOCUS
 */
async function callAI(sysPrompt, userPrompt, useGemini = true) {
  const geminiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_SECONDARY].filter(Boolean);
  const timeoutMs = 25000;

  if (useGemini && geminiKeys.length > 0) {
    for (const key of geminiKeys) {
      const keyLabel = key === process.env.GEMINI_API_KEY ? 'Primary' : 'Secondary';
      for (const modelName of GEMINI_MODELS) {
        // Skip models confirmed permanently invalid (404 / not supported)
        if (deadModels.has(modelName)) {
          console.log(`-> [AI-PIPELINE] Skipping blacklisted model [${modelName}]`);
          continue;
        }
        try {
          console.log(`-> [AI-PIPELINE] Trying Gemini [${keyLabel}] with Model [${modelName}]...`);
          const genAI = getGemini(key);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { 
              responseMimeType: "application/json",
              temperature: 0.1,
              topP: 0.9,
              maxOutputTokens: 2000
            }
          });

          const prompt = `${sysPrompt}\n\nUSER INPUT:\n${userPrompt}`;
          const result = await withTimeout(model.generateContent(prompt), timeoutMs);
          const rawText = (await result.response).text();
          if (!rawText) throw new Error("Empty response from Gemini");
          return JSON.parse(cleanJsonString(rawText));
        } catch (e) {
          const errMsg = e.message || "";
          // Permanently blacklist models that are 404 / not available on this API version
          if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("not supported")) {
            console.warn(`-> [AI-PIPELINE] Blacklisting dead model [${modelName}]: ${errMsg.slice(0, 120)}`);
            deadModels.add(modelName);
          } else {
            console.warn(`-> [AI-PIPELINE] Gemini Failed [${modelName}]: ${errMsg.slice(0, 120)}`);
          }
        }
      }
    }
  }

  // --- FINAL FALLBACK: OPENAI ---
  console.warn("-> [AI] All Gemini attempts exhausted. Falling back to OpenAI...");
  try {
    const openai = getOpenAI();
    const completion = await withTimeout(openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: `USER INPUT:\n${userPrompt}` },
      ],
    }), timeoutMs);
    const output = completion.choices[0].message.content;
    return JSON.parse(output);
  } catch (e) {
    throw new Error(`AI processing failed across all providers: ${e.message}`);
  }
}

function cleanAIResponse(data, originalText) {
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  const cleanedQuestions = rawQuestions.map((q) => ({
    ...q,
    bias_probability: Number(q.bias_probability) || 0,
    confidence: Number(q.confidence) || 0,
    severity: q.severity || "low",
    tone_type: q.tone_type || "Neutral",
    bias_type: Array.isArray(q.bias_type) ? q.bias_type : []
  }));

  return {
    overall_bias_score: data.overall_bias_score || 0,
    risk_level: data.risk_level || "low",
    summary: data.summary || "Analysis complete.",
    questions: cleanedQuestions,
    is_fallback: false
  };
}

/**
 * Detects bias in existing text.
 */
async function validateWithAI(text, hints = []) {
  const userPrompt = hints.length > 0 
    ? `TEXT TO ANALYZE:\n${text}\n\n[CONTEXT HINTS:\n${hints.join("\n")}]`
    : text;

  const result = await callAI(SYSTEM_PROMPT, userPrompt, true);
  return cleanAIResponse(result, text);
}

/**
 * Optimized Master Prompt for Interview Kit Generation.
 */
async function generateKitOptimized(role, experience, company, goals) {
  const masterPrompt = `You are an expert in hiring, job analysis, and bias-free interview design.
Your task is to generate a complete interview kit in ONE single response.

STEP 1: ROLE UNDERSTANDING
Analyze the role and extract domain, key skills, and responsibilities. DO NOT assume software.

STEP 2: QUESTION GENERATION
Generate 5–7 questions relevant to the role. Focus on real job skills. NO generic filler.

STEP 3: BIAS CHECK
Ensure all questions are bias-free. If biased, rewrite.

STEP 4: RUBRIC GENERATION
Generate evaluation criteria for each skill with scoring (basic / good / excellent).

STRICT JSON OUTPUT:
{
  "role_summary": { "domain": "", "skills": [], "responsibilities": [] },
  "questions": [],
  "rubric": [ { "skill": "", "criteria": "", "levels": { "basic": "", "good": "", "excellent": "" } } ]
}`;

  const userPrompt = `Role: ${role}\nExperience: ${experience}\nCompany Context: ${company}\nDiversity Goals: ${goals || "N/A"}`;
  return await callAI(masterPrompt, userPrompt, true);
}

/**
 * Simulates biased variations of a neutral question.
 */
async function simulateBias(neutral_question) {
  const sysPrompt = `You are EquiHire's Bias Simulator. 
Generate 3 distinct biased variants of the provided question (gender, age, cultural, work_life, tone).
STRICT JSON:
{
  "original": "...",
  "variants": [ { "biased_question": "...", "category": "...", "explanation": "..." } ]
}`;
  return await callAI(sysPrompt, neutral_question, true);
}

module.exports = {
  validateWithAI,
  generateKitOptimized,
  simulateBias,
  callAI
};
