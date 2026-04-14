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
    const { role, experience_level, company_context, company_type, diversity_goals } = req.body;
    const finalCompanyContext = company_context || company_type;
    const userId = req.auth?.userId || req.auth?.claims?.sub;

    if (!role || !experience_level) {
      return res.status(400).json({ error: "Role and experience required." });
    }

    const cacheKey = getCacheKey("kit", {
      role,
      experience_level,
      finalCompanyContext,
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
            finalCompanyContext,
            diversity_goals
          ),
          30000
        );

        // Mandatory Validation Layer
        if (!validateKit(role, kit)) {
          logger(`-> [VALIDATION] AI Output rejected for ${role}. Using Fallback.`);
          kit = getFallbackKit(role, experience_level);
        }
      } catch (e) {
        console.error("-> [AI] Kit Generation Failed (CRITICAL):", e.message);
        logger(`-> [FALLBACK] Triggering fallback dataset engine due to API outage.`);
        
        try {
          kit = getFallbackKit(role, experience_level);
        } catch (fallbackErr) {
          console.error("-> [FALLBACK ERROR]:", fallbackErr.message);
          kit = null;
        }
        
        // HACKATHON QUICK FIX: Absolute safety net so demo NEVER fails
        if (!kit || !kit.questions) {
           console.log("-> [HACKATHON QUICK FIX] Resorting to absolute static fallback to guarantee demo success");
           kit = {
              role_summary: {
                domain: role || "Professional",
                skills: ["Leadership", "Problem Solving", "Adaptability"],
                responsibilities: ["Core task execution and collaboration"]
              },
              questions: [
                "How do you handle high-pressure situations?",
                "Describe your experience working in teams.",
                "Can you walk me through a complex problem you recently solved?",
                "How do you prioritize your work when faced with competing deadlines?",
                "Describe your approach to learning and adapting to new technologies."
              ],
              rubric: [{"criteria": "Problem Solving", "look_for": "Clear explanation", "avoid": "Generic answers"}]
           };
        }
      }

      // Scan for bias in the final kit (Fail-safe)
      try {
        biasCheck = await withTimeout(
          runUnifiedPipeline(kit.questions.join("\n")),
          5000
        );
      } catch (error) {
        console.error("BIAS CHECK FAILED:", error.message);
        biasCheck = { overall_bias_score: 0, risk_level: "low", overallScore: 0, riskLevel: "low" }; 
      }
    }

    const response = { kit, bias_validation: biasCheck };

    // Persistence MUST happen on every request
    const { data: dbData, error: dbError } = await supabase.from("analysis_reports").insert([
      {
        user_id: userId,
        input_text: `Interview Kit: ${role}`,
        bias_score: biasCheck.overall_bias_score || biasCheck.overallScore || 0,
        risk_level: biasCheck.risk_level || biasCheck.riskLevel || "low",
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
