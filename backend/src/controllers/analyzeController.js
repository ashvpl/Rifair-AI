const { supabase } = require("../config/supabase");
const { runUnifiedPipeline } = require("../utils/pipeline");
const { withTimeout, logger } = require("../utils/helpers");

// Simple global cache
const globalCache = new Map();

const getCacheKey = (prefix, params) => {
  return `${prefix}:${Object.values(params).join(":").toLowerCase()}`;
};

const analyzeText = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { text } = req.body;

    if (!text || text.length < 5) {
      return res.status(400).json({ error: "Input text too short" });
    }

    const cacheKey = getCacheKey("analyze", { text });
    if (globalCache.has(cacheKey)) {
      return res.json({ report: globalCache.get(cacheKey) });
    }

    // AI Call with Timeout and Fallback
    let aiResponse;
    try {
      aiResponse = await withTimeout(runUnifiedPipeline(text), 10000);
      logger("AI ANALYSIS SUCCESSFUL");
    } catch (error) {
      console.error("AI ANALYSIS FAILED:", error.message);
      // Fallback logic handled within runUnifiedPipeline or here if necessary
      // For now, let's assume it throws if it completely fails
      throw new Error("AI analysis unavailable");
    }

    const reportData = {
      user_id: userId,
      input_text: text,
      bias_score: aiResponse.overallScore,
      risk_level: aiResponse.riskLevel,
      categories: aiResponse,
      created_at: new Date(),
    };

    const { data, error } = await supabase
      .from("analysis_reports")
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE PERSISTENCE ERROR:", error);
    }

    const finalReport = data || reportData;
    globalCache.set(cacheKey, finalReport);
    res.json({ report: finalReport });
  } catch (error) {
    console.error("CONTROLLER ERROR (analyze):", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = { analyzeText };
