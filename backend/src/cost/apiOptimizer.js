/**
 * apiOptimizer.js
 *
 * Cost intelligence layer:
 *   - Model routing (flash vs pro) based on pre-scored bias level
 *   - In-memory caches for analysis (30 days) and kits (7 days)
 *   - Token cost estimation in INR for observability
 *
 * NOTE: The in-memory Map cache is suitable for single-instance deployments.
 * For multi-instance/serverless, swap cacheStore for a Redis client.
 */

"use strict";

const crypto = require("crypto");

// ─── Model Routing ────────────────────────────────────────────────────────────

const MODEL_ROUTING = {
  simple:  "gemini-2.0-flash",   // cheap + fast — clearly biased questions
  complex: "gemini-2.0-flash",   // default; swap to gemini-1.5-pro when available
  kit:     "gemini-2.0-flash",   // kit generation
};

/**
 * Choose the cheapest model appropriate for the question's estimated bias level.
 *
 * @param {number} estimatedBiasScore  - 0-100 deterministic pre-score
 * @returns {string}                   - Model name to use
 */
function routeModel(estimatedBiasScore) {
  if (estimatedBiasScore >= 70) {
    // Already clearly biased from keyword matching — flash is enough for rewrite
    return MODEL_ROUTING.simple;
  }
  // Needs semantic understanding — use the more capable model
  return MODEL_ROUTING.complex;
}

// ─── In-Memory Cache Store ────────────────────────────────────────────────────

// TTLs in milliseconds
const ANALYSIS_TTL_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days
const KIT_TTL_MS      =  7 * 24 * 60 * 60 * 1000;  //  7 days

/**
 * Simple in-memory cache entry: { value, expiresAt }
 * @private
 */
const _cacheStore = new Map();

function _cacheGet(key) {
  const entry = _cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cacheStore.delete(key);
    return null;
  }
  return entry.value;
}

function _cacheSet(key, value, ttlMs) {
  _cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function _md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

// ─── Analysis Cache ───────────────────────────────────────────────────────────

/**
 * Look up a cached analysis result for a given question string.
 *
 * @param {string} question
 * @returns {object|null}
 */
function getCachedAnalysis(question) {
  const key = `analysis_v2:${_md5((question || "").toLowerCase().trim())}`;
  return _cacheGet(key);
}

/**
 * Store an analysis result for a given question string.
 *
 * @param {string} question
 * @param {object} result
 */
function setCachedAnalysis(question, result) {
  const key = `analysis_v2:${_md5((question || "").toLowerCase().trim())}`;
  _cacheSet(key, result, ANALYSIS_TTL_MS);
}

// ─── Kit Cache ────────────────────────────────────────────────────────────────

/**
 * Look up a cached kit for a given set of parameters.
 *
 * @param {object} kitParams  - { role, experience_level, company_type, industry, ... }
 * @returns {object|null}
 */
function getCachedKit(kitParams) {
  const key = `kit_v2:${_md5(JSON.stringify(sortedKeys(kitParams)))}`;
  return _cacheGet(key);
}

/**
 * Store a kit result for a given set of parameters.
 *
 * @param {object} kitParams
 * @param {object} kit
 */
function setCachedKit(kitParams, kit) {
  const key = `kit_v2:${_md5(JSON.stringify(sortedKeys(kitParams)))}`;
  _cacheSet(key, kit, KIT_TTL_MS);
}

/** Sort object keys for a stable hash regardless of insertion order */
function sortedKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {});
}

// ─── Token Cost Estimation ────────────────────────────────────────────────────

/**
 * Estimate API cost in INR for a single AI call.
 *
 * Rates based on Gemini 1.5 Pro pricing:
 *   Input:  ~$0.00125 / 1K tokens
 *   Output: ~$0.005   / 1K tokens
 *   USD→INR: 83
 *
 * @param {string} prompt    - The prompt sent to the model
 * @param {string} response  - The raw response from the model
 * @returns {number}         - Estimated cost in INR (rounded to 4 decimal places)
 */
function estimateTokenCostINR(prompt, response) {
  const inputTokens  = ((prompt   || "").split(/\s+/).length) * 1.3;
  const outputTokens = ((response || "").split(/\s+/).length) * 1.3;

  const inputCostUSD  = (inputTokens  / 1000) * 0.00125;
  const outputCostUSD = (outputTokens / 1000) * 0.005;

  const totalINR = (inputCostUSD + outputCostUSD) * 83;
  return Math.round(totalINR * 10000) / 10000;
}

module.exports = {
  routeModel,
  getCachedAnalysis,
  setCachedAnalysis,
  getCachedKit,
  setCachedKit,
  estimateTokenCostINR,
  MODEL_ROUTING,
};
