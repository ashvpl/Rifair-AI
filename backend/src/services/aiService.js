/**
 * aiService.js
 *
 * Central AI service module.
 *
 * Architecture:
 *   - CircuitBreaker   — prevents hammering a dead provider
 *   - Key rotation     — cycles through multiple Gemini API keys on quota errors
 *   - Provider cascade — Gemini → Grok → OpenAI
 *   - Master prompts   — role/industry-aware prompts (analysisMasterPrompt, kitMasterPrompt)
 *   - Quality gating   — AIGenerationPipeline validates output and retries on failure
 *   - Cost optimizer   — model routing + caching
 */

"use strict";

const OpenAI                             = require("openai");
const { GoogleGenerativeAI }             = require("@google/generative-ai");
const { secrets }                        = require("../core/secrets/secretManager");

const { buildAnalysisPrompt }            = require("../prompts/analysisMasterPrompt");
const { buildKitPrompt, validateKitQuality } = require("../prompts/kitMasterPrompt");
const { AIGenerationPipeline }           = require("../quality/aiPipeline");
const { getCachedAnalysis, setCachedAnalysis,
        getCachedKit, setCachedKit,
        estimateTokenCostINR }           = require("../cost/apiOptimizer");
const { callAIWithFallback }             = require("../ai/universalCaller");

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

class CircuitBreaker {
  constructor(failureThreshold = 3, recoveryTimeoutMs = 60000) {
    this.failureThreshold  = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
    this.failures          = 0;
    this.state             = "closed";
    this.lastFailureTime   = null;
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
      const result  = await action();
      this.failures = 0;
      this.state    = "closed";
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

// Gemini key pool — sourced exclusively via SecretManager
const GEMINI_KEYS = secrets.getLegacyGeminiKeys();

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

// ─── Low-level Gemini caller ──────────────────────────────────────────────────
// Used by both the legacy pipeline AND the new master-prompt pipeline.

async function callGeminiRaw(prompt, options = {}, timeoutMs = 15000) {
  const temperature = options.temperature ?? 0.1;
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
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
        },
      });

      const result  = await withTimeout(model.generateContent(prompt), timeoutMs);
      const rawText = (await result.response).text();
      console.log(`[GEMINI] Success with key index ${currentGeminiIndex}`);
      return rawText;
    } catch (e) {
      const isQuotaError =
        e.message?.includes("429") ||
        e.message?.includes("quota") ||
        e.message?.includes("RESOURCE_EXHAUSTED");

      console.error(`[GEMINI] Key ${currentGeminiIndex} failed: ${e.message}`);
      lastError = e;

      if (isQuotaError || e.message?.includes("timed out")) {
        rotateGeminiKey();
      } else {
        break; // Non-quota error — no point rotating
      }
    }
  }

  throw lastError || new Error("All Gemini keys exhausted");
}

// ─── Low-level Groq caller ───────────────────────────────────────────────────
async function callGrokRaw(prompt, options = {}, timeoutMs = 15000) {
  // Use PRIMARY key; ProviderRouter handles full fallback chain for new code
  const groqKey = secrets.get('GROQ_API_KEY_PRIMARY');
  if (!groqKey) throw new Error("No Groq API key configured");

  const openai = new OpenAI({
    apiKey:  groqKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const result = await withTimeout(
    openai.chat.completions.create({
      model:           "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature:     options.temperature ?? 0.1,
      messages: [
        { role: "user", content: prompt },
      ],
    }),
    timeoutMs
  );

  return result.choices[0].message.content;
}

// ─── Low-level OpenAI caller ──────────────────────────────────────────────────
async function callOpenAIRaw(prompt, options = {}, timeoutMs = 15000) {
  const openAIKey = secrets.get('OPENAI_API_KEY');
  if (!openAIKey) throw new Error("No OpenAI API key configured");

  const openai = new OpenAI({ apiKey: openAIKey });
  const result = await withTimeout(
    openai.chat.completions.create({
      model:           "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature:     options.temperature ?? 0.1,
      messages: [
        { role: "user", content: prompt },
      ],
    }),
    timeoutMs
  );

  return result.choices[0].message.content;
}

// ─── Legacy alias helper (reads primary Groq key for cascade) ─────────────────

// ─── Provider cascade wrapper ─────────────────────────────────────────────────
// Tries Gemini → Grok → OpenAI in order, returns raw string.

async function callWithCascade(prompt, options = {}) {
  return await aiBreaker.execute(async () => {
    let lastError;

    if (GEMINI_KEYS.length > 0) {
      try {
        return await callGeminiRaw(prompt, options);
      } catch (e) {
        console.error("[CASCADE] All Gemini keys failed");
        lastError = e;
      }
    }

    const groqKey = secrets.get('GROQ_API_KEY_PRIMARY');
    if (groqKey) {
      try {
        console.log("[CASCADE] Falling back to Groq...");
        return await callGrokRaw(prompt, options);
      } catch (e) {
        console.error("[CASCADE] Groq failed");
        lastError = e;
      }
    }

    const openAIKey = secrets.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        console.log("[CASCADE] Falling back to OpenAI...");
        return await callOpenAIRaw(prompt, options);
      } catch (e) {
        console.error("[CASCADE] OpenAI failed");
        lastError = e;
      }
    }

    throw lastError || new Error("AI_UNAVAILABLE");
  });
}

// ─── Master Analysis ──────────────────────────────────────────────────────────

/**
 * Run the master analysis prompt for a list of question strings.
 * Returns the rich new schema, plan-gated appropriately.
 *
 * @param {string[]} questions  - Individual question strings
 * @param {object}   context    - { role, industry, company_type, country }
 * @param {string}   planId     - User plan for gating
 * @returns {object}            - Validated, plan-gated analysis result
 */
async function runMasterAnalysis(questions, context = {}, planId = "free") {
  const prompt = buildAnalysisPrompt(questions, context);

  const pipeline = new AIGenerationPipeline(
    async (p, opts) => callAIWithFallback(p, opts)
  );

  const result = await pipeline.generateAnalysis(prompt, planId, {
    temperature: 0.1,
    maxTokens:   4000,
  });

  // Log estimated cost for observability (best-effort)
  try {
    const costINR = estimateTokenCostINR(prompt, JSON.stringify(result));
    console.log(`[COST] Analysis estimated cost: ₹${costINR}`);
  } catch (_) { /* non-critical */ }

  return result;
}

// ─── Legacy batch entrypoint (for pipeline.js compatibility) ──────────────────

/**
 * Kept for backward compatibility with pipeline.js.
 * Submits questions through the legacy strict-bias prompt path
 * (now proxied through the master prompt when context is provided).
 *
 * @param {string[]} questionsTextList
 * @param {object}   context            - Optional role context
 * @returns {{ results: object[] }}     - Legacy format for pipeline.js
 */
async function batchAnalyzeOptimized(questionsTextList, context = {}) {
  // Use master analysis prompt — richer output, backward-compatible fallback
  const masterResult = await runMasterAnalysis(questionsTextList, context, "free");

  // Map master schema → legacy schema that pipeline.js expects
  const results = (masterResult.questions || []).map((q) => ({
    semantic_score:   q.bias_score    || 0,
    bias_categories:  q.bias_categories || [],
    reasoning:        q.primary_issue || q.detailed_explanation || "",
    rewritten:        q.rewritten     || "",
    // carry through new fields so pipeline.js can attach them
    _master:          q,
  }));

  return {
    results,
    // Pass through top-level fields for enhanced pipeline support
    overall_score:        masterResult.overall_score,
    overall_verdict:      masterResult.overall_verdict,
    overall_summary:      masterResult.overall_summary,
    hiring_health_report: masterResult.hiring_health_report,
  };
}

// ─── Master Kit Generation ────────────────────────────────────────────────────

/**
 * Generate a structured interview kit using the master kit prompt.
 *
 * @param {string}   role
 * @param {string}   experienceLevel
 * @param {string}   companyType
 * @param {string}   industry
 * @param {string[]} specificSkills
 * @param {string}   interviewRound
 * @param {number}   count
 * @param {string}   planId
 * @returns {object}  - Validated, plan-gated kit
 */
async function generateKitOptimized(
  role,
  experienceLevel,
  companyType,
  industry        = "general",
  specificSkills  = [],
  interviewRound  = "general",
  count           = 10,
  planId          = "free",
  constraints     = ""
) {
  // Check cache first
  const cacheParams = { role, experienceLevel, companyType, industry, interviewRound, count, constraints };
  const cached = getCachedKit(cacheParams);
  if (cached) {
    console.log("[KIT] Cache hit — returning cached kit");
    return cached;
  }

  const prompt = buildKitPrompt(
    role,
    experienceLevel,
    companyType,
    industry,
    specificSkills,
    interviewRound,
    count,
    constraints
  );

  const pipeline = new AIGenerationPipeline(
    async (p, opts) => callAIWithFallback(p, opts)
  );

  let kit = await pipeline.generateKit(prompt, planId, {
    temperature: 0.4,   // needs creativity but consistency
    maxTokens:   6000,
  });

  // ── Post-generation quality gate: catch banned patterns ──────────────
  const qualityIssues = validateKitQuality(kit, role);
  if (qualityIssues.length > 0) {
    console.warn(`[KIT-QUALITY] ${qualityIssues.length} issues detected — retrying once:`,
      qualityIssues);

    const retryPrompt = prompt + `\n\n
CRITICAL: Your previous response was REJECTED for these reasons:
${qualityIssues.map((i) => `- ${i}`).join("\n")}
Fix ALL of these issues. Do not repeat these patterns.`;

    try {
      kit = await pipeline.generateKit(retryPrompt, planId, {
        temperature: 0.5,
        maxTokens:   6000,
      });
    } catch (retryErr) {
      console.error("[KIT-QUALITY] Retry failed, serving original:", retryErr.message);
      // Fall through with original kit
    }
  }

  // Cache only clean results
  if (!kit.quality_warning) {
    setCachedKit(cacheParams, kit);
  }

  // Log cost
  try {
    const costINR = estimateTokenCostINR(prompt, JSON.stringify(kit));
    console.log(`[COST] Kit generation estimated cost: ₹${costINR}`);
  } catch (_) { /* non-critical */ }

  return kit;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  batchAnalyzeOptimized,
  generateKitOptimized,
  runMasterAnalysis,
  // Expose low-level cascade for direct use if needed
  callWithCascade,
  // Legacy export expected by older imports
  callAIBatch: () => { throw new Error("Use batchAnalyzeOptimized directly"); },
};
