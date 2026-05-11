/**
 * batchAnalyzeController.js
 *
 * POST /api/analyze/batch
 *
 * Accepts up to 50 questions, runs them through the unified pipeline
 * in chunks and returns full spectral results.
 *
 * Gated to Growth + Enterprise plans.
 */

"use strict";

const { runUnifiedPipeline } = require("../utils/pipeline");
const { getSubscription, getUsage } = require("../services/subscriptionService");
const { supabase }                  = require("../config/supabase");

const GROWTH_PLANS = ["growth", "enterprise"];
const MAX_BATCH    = 50;

const batchAnalyze = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";

    // ── Plan gate ──
    if (userId !== "anonymous") {
      const sub = await getSubscription(userId);
      if (!GROWTH_PLANS.includes(sub?.plan_id || "free")) {
        return res.status(403).json({
          error: "plan_required",
          message: "Batch analysis requires a Growth plan.",
          requiredPlan: "growth",
          upgradeUrl: "/pricing?highlight=growth&feature=batch_analysis",
        });
      }
    }

    const { questions, name, mode = "full", context = {} } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "questions array is required" });
    }

    if (questions.length > MAX_BATCH) {
      return res.status(400).json({
        error: `Maximum ${MAX_BATCH} questions per batch request`,
      });
    }

    // Join questions as numbered list for pipeline
    const combinedText = questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");

    const result = await runUnifiedPipeline(combinedText, mode, context);

    // Persist batch report
    const reportData = {
      user_id:    userId,
      input_text: name ? `Batch - '${name}'` : `Batch analysis (${questions.length} questions)`,
      bias_score: result.overall_bias_score || 0,
      risk_level: result.risk_level || "low",
      categories: {
        ...result,
        analysis_type: "batch",
        original_input: combinedText,
        question_count: questions.length,
      },
      created_at: new Date().toISOString(),
    };

    const { data: insertedData, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([reportData])
      .select()
      .single();

    if (dbError) {
      console.error("[BATCH] DB error:", dbError);
      return res.json({ report: reportData, warning: "Persistence failed" });
    }

    // Increment usage
    if (userId !== "anonymous") {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageData = await getUsage(userId);
        const currentUsed = usageData?.analyses_used ?? 0;

        const { error: upsertError } = await supabase
          .from('usage')
          .upsert(
            {
              user_id: userId,
              month: currentMonth,
              analyses_used: currentUsed + 1,
              kits_used: usageData?.kits_used ?? 0,
              jd_analyses_used: usageData?.jd_analyses_used ?? 0,
              evaluations_used: usageData?.evaluations_used ?? 0,
              updated_at: new Date().toISOString()
            },
            { 
              onConflict: 'user_id,month',
              ignoreDuplicates: false 
            }
          );

        if (upsertError) {
          console.error('[USAGE UPDATE FAILED (batch)]', upsertError);
        }
      } catch (usageErr) {
        console.error('[USAGE INCREMENT FATAL ERROR (batch)]', usageErr);
      }
    }

    res.json({ report: insertedData });
  } catch (err) {
    console.error("[BATCH] Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};

module.exports = { batchAnalyze };
