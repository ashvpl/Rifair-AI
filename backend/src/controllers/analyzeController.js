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
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    const { text, name } = req.body;

    if (!text || text.length < 5) {
      return res.status(400).json({ error: "Input text too short" });
    }

    const cacheKey = getCacheKey("analyze", { text });
    let aiResponse;

    if (globalCache.has(cacheKey)) {
      aiResponse = globalCache.get(cacheKey).categories;
    } else {
      try {
        aiResponse = await withTimeout(runUnifiedPipeline(text), 10000);
        aiResponse.original_input = text;
        aiResponse.analysis_type = 'analysis'; // Save inside JSONB
        logger("AI ANALYSIS SUCCESSFUL");
      } catch (error) {
        console.error("AI ANALYSIS FAILED:", error.message);
        throw new Error("AI analysis unavailable");
      }
    }

    const reportData = {
      user_id: userId,
      input_text: name ? `Analysis - '${name}'` : text,
      bias_score: aiResponse.overallScore,
      risk_level: aiResponse.riskLevel,
      categories: aiResponse,
      created_at: new Date(),
    };

    const { data, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([reportData])
      .select()
      .single();

    if (dbError) {
      console.error("SUPABASE PERSISTENCE ERROR (analyze):", dbError);
      throw new Error(`Data retention failed: ${dbError.message}`);
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
