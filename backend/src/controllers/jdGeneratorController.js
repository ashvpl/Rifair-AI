"use strict";

const { callAIWithFallback }              = require("../ai/universalCaller");
const { getSubscription, getUsage }       = require("../services/subscriptionService");
const { supabase }                        = require("../config/supabase");
const { parseJSON }                       = require("../utils/parseJSON");
const { buildJDGeneratorPrompt }          = require("../ai/jd-gen-prompt");

const GROWTH_PLANS = ["growth", "enterprise"];

const generateJd = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";

    if (userId === "anonymous") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let currentUsage = null;
    let currentPlanId = "free";

    const sub = await getSubscription(userId);
    currentPlanId = sub?.plan_id || "free";
    
    if (!GROWTH_PLANS.includes(currentPlanId)) {
      return res.status(403).json({
        error:        "upgrade_required",
        message:      "JD Generator is available on the Growth plan.",
        upgradeUrl:   "/pricing",
      });
    }

    currentUsage = await getUsage(userId);
    const used = currentUsage?.jd_analyses_used || 0;
    const JD_LIMIT = 20;

    if (used >= JD_LIMIT) {
      return res.status(403).json({
        error: "limit_reached",
        message: `You have used all ${JD_LIMIT} JD operations this month.`,
        upgradeUrl: "/pricing",
      });
    }

    const {
      role, company, location, experience,
      companyType, industry, teamSize,
      keySkills, workMode, salaryRange, tone
    } = req.body;

    if (!role || !company || !location || !experience) {
      return res.status(400).json({
        error: "role, company, location and experience are required"
      });
    }

    console.log(`[JD_GENERATOR] Generating JD for userId=${userId}, role="${role}"`);

    const prompt = buildJDGeneratorPrompt({
      role, company, location, experience,
      companyType, industry, teamSize,
      keySkills, workMode, salaryRange, tone
    });

    let raw;
    try {
      raw = await callAIWithFallback(prompt, { temperature: 0.5, maxTokens: 4000 });
    } catch (err) {
      if (err.message === "ALL_KEYS_EXHAUSTED" || err.message === "ALL_PROVIDERS_EXHAUSTED") {
        return res.status(503).json({
          error:               "api_quota_exceeded",
          message:             "AI quota reached. Try again in ~1 hour."
        });
      }
      throw err;
    }

    const result = parseJSON(raw);

    // Save to history — aligned with history page expectations
    const { data: insertedData, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([{
        user_id:    userId,
        input_text: `JD Generated — ${role} at ${company}`,
        bias_score: result.bias_verification?.bias_score ?? 0,
        risk_level: "low",
        categories: {
          ...result,
          analysis_type: "jd_generated",
        },
        created_at: new Date().toISOString(),
      }])
      .select("id")
      .single();

    if (dbError) {
      console.error("[JD_GENERATOR] DB persistence error:", dbError.message);
    }

    // Increment JD usage counter
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await supabase
        .from("usage")
        .upsert({
          user_id:           userId,
          month:             currentMonth,
          jd_analyses_used:  used + 1,
          updated_at:        new Date().toISOString()
        }, { onConflict: "user_id, month" });
    } catch (usageErr) {
      console.warn("[JD_GENERATOR] Usage increment failed:", usageErr.message);
    }

    return res.json({
      ...result,
      reportId: insertedData?.id || null,
    });

  } catch (err) {
    console.error("[JD_GENERATOR] Controller error:", err.message);
    res.status(500).json({
      error: "Generation failed",
      details: err.message,
    });
  }
};

module.exports = { generateJd };
