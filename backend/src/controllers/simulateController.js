const { simulateBias } = require("../services/aiService");
const { getFallbackSimulation } = require("../services/fallbackService");
const { withTimeout, logger } = require("../utils/helpers");

// Simple global cache
const globalCache = new Map();

const getCacheKey = (prefix, params) => {
  return `${prefix}:${Object.values(params).join(":").toLowerCase()}`;
};

const simulate = async (req, res) => {
  try {
    const { neutral_question } = req.body;
    if (!neutral_question) {
      return res.status(400).json({ error: "neutral_question required." });
    }

    const cacheKey = getCacheKey("simulate", { neutral_question });
    if (globalCache.has(cacheKey)) {
      return res.json({ simulation: globalCache.get(cacheKey) });
    }

    let simulation;
    try {
      simulation = await withTimeout(simulateBias(neutral_question), 10000);
    } catch (e) {
      console.error("-> [AI] Simulation Failed:", e.message);
      simulation = getFallbackSimulation(neutral_question);
    }

    globalCache.set(cacheKey, simulation);
    res.json({ simulation });
  } catch (error) {
    console.error("CONTROLLER ERROR (simulate):", error);
    res.status(500).json({ error: "Simulation failed." });
  }
};

module.exports = { simulate };
