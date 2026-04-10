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
    const userId = req.auth?.userId || req.auth?.claims?.sub;

    if (!role || !experience_level) {
      return res.status(400).json({ error: "Role and experience required." });
    }

    const cacheKey = getCacheKey("kit", {
      role,
      experience_level,
      company_context,
    });

    let kit;
    let biasCheck;

    if (globalCache.has(cacheKey)) {
      const cached = globalCache.get(cacheKey);
      kit = cached.kit;
      biasCheck = cached.bias_validation;
    } else {
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
      try {
        biasCheck = await withTimeout(
          runUnifiedPipeline(kit.questions.join("\n")),
          10000
        );
      } catch (error) {
        console.error("BIAS CHECK FAILED:", error.message);
        biasCheck = { overallScore: 0, riskLevel: "unknown" }; // Minimal fallback
      }
    }

    const response = { kit, bias_validation: biasCheck };

    // Persistence MUST happen on every request
    const { data: dbData, error: dbError } = await supabase.from("analysis_reports").insert([
      {
        user_id: userId,
        input_text: `Interview Kit: ${role}`,
        bias_score: biasCheck.overallScore,
        risk_level: biasCheck.riskLevel,
        categories: { 
          kit_data: kit, 
          validation: biasCheck,
          inputs: { role, experience_level, company_context, diversity_goals },
          analysis_type: 'kit' // Store inside JSONB
        },
        created_at: new Date(),
      },
    ]).select().single();

    if (dbError) {
      console.error("SUPABASE PERSISTENCE ERROR (kit):", dbError);
      throw new Error(`Failed to archive kit: ${dbError.message}`);
    }
    
    // Optional: map to final object if needed
    if (!globalCache.has(cacheKey)) {
      globalCache.set(cacheKey, response);
    }
    
    // To deep link properly, we can inject the ID into the payload
    if (dbData && dbData.id) {
       response.reportId = dbData.id;
    }
    
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
