const { supabase } = require("../config/supabase");
const { generateKitOptimized } = require("../services/aiService");
const { getFallbackKit } = require("../services/fallbackService");
const { runUnifiedPipeline } = require("../utils/pipeline");
const { withTimeout, logger, validateKit } = require("../utils/helpers");

// Simple global cache
const globalCache = new Map();

const getCacheKey = (prefix, params) => {
  return `${prefix}:${Object.values(params).join(":").toLowerCase()}`;
};

const generateKit = async (req, res) => {
  try {
    const { role, experience_level, company_context, diversity_goals } = req.body;
    const userId = req.auth.userId;

    if (!role || !experience_level) {
      return res.status(400).json({ error: "Role and experience required." });
    }

    const cacheKey = getCacheKey("kit", {
      role,
      experience_level,
      company_context,
    });
    if (globalCache.has(cacheKey)) {
      return res.json(globalCache.get(cacheKey));
    }

    let kit;
    try {
      logger(`-> [API] Generating Optimized Kit for ${role}...`);
      kit = await withTimeout(
        generateKitOptimized(
          role,
          experience_level,
          company_context,
          diversity_goals
        ),
        15000
      );

      // Mandatory Validation Layer
      if (!validateKit(role, kit)) {
        logger(`-> [VALIDATION] AI Output rejected for ${role}. Using Fallback.`);
        kit = getFallbackKit(role);
      }
    } catch (e) {
      console.error("-> [AI] Kit Generation Failed:", e.message);
      kit = getFallbackKit(role);
    }

    // Scan for bias in the final kit
    let biasCheck;
    try {
      biasCheck = await withTimeout(
        runUnifiedPipeline(kit.questions.join("\n")),
        10000
      );
    } catch (error) {
      console.error("BIAS CHECK FAILED:", error.message);
      biasCheck = { overallScore: 0, riskLevel: "unknown" }; // Minimal fallback
    }

    const response = { kit, bias_validation: biasCheck };

    // Persistence
    await supabase.from("analysis_reports").insert([
      {
        user_id: userId,
        input_text: `Interview Kit: ${role}`,
        bias_score: biasCheck.overallScore,
        risk_level: biasCheck.riskLevel,
        categories: { kit_data: kit, validation: biasCheck },
        created_at: new Date(),
      },
    ]);

    globalCache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error("CONTROLLER ERROR (generate-kit):", error);
    res.status(500).json({
      error: "Failed to generate kit.",
      message: error.message,
    });
  }
};

module.exports = { generateKit };
