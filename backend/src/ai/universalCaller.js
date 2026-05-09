// backend/src/ai/universalCaller.js
'use strict';

/**
 * Compatibility wrapper for the new AIGateway.
 * Ensures existing JS controllers can use the hardened AI infrastructure.
 */
const { AIGateway } = require('../core/ai/aiGateway');

/**
 * Call AI with automatic provider fallback.
 */
async function callAIWithFallback(prompt, options = {}) {
  return await AIGateway.call(prompt, options);
}

const callAI = callAIWithFallback;

module.exports = { callAIWithFallback, callAI };
