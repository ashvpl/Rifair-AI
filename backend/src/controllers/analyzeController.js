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
    // Robust UserID extraction
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";
    const { text, name } = req.body;

    if (!text || text.length < 5) {
      return res.status(400).json({ error: "Input text too short" });
    }

    // Cache key for AI response
    const cacheKey = `analyze:${text.substring(0, 50)}`;
    let aiResponse;

    if (globalCache.has(cacheKey)) {
      aiResponse = globalCache.get(cacheKey);
    } else {
      aiResponse = await runUnifiedPipeline(text);
      globalCache.set(cacheKey, aiResponse);
    }

    // Truncate text for input_text if no name provided to avoid DB column limits
    const safeTextSnippet = text.length > 100 ? text.substring(0, 97) + "..." : text;
    
    const reportData = {
      user_id: userId,
      input_text: name ? `Analysis - '${name}'` : safeTextSnippet,
      bias_score: aiResponse.overall_bias_score || 0,
      risk_level: aiResponse.risk_level || "low",
      categories: {
        ...aiResponse,
        analysis_type: "analysis",
        original_input: text, // Keep full text in JSON if needed
      },
      created_at: new Date().toISOString(),
    };

    const { data: insertedData, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([reportData])
      .select()
      .single();

    if (dbError) {
      console.error("SUPABASE PERSISTENCE ERROR:", dbError);
      // Still return the report for immediate UI, but log accurately
      // and maybe attach a temporary ID or flag
      const fallbackReport = { ...reportData, id: `temp_${Date.now()}`, is_unsaved: true };
      return res.json({ report: insertedData || fallbackReport, warning: "Persistence failed" });
    }

    res.json({ report: insertedData });
  } catch (error) {
    const fs = require("fs");
    const errorLog = `\n[${new Date().toISOString()}] CONTROLLER ERROR: ${error.message}\nStack: ${error.stack}\n`;
    try {
      fs.appendFileSync("error_logs.txt", errorLog);
    } catch (e) {}
    
    console.error("CONTROLLER ERROR (analyze):", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = { analyzeText };
