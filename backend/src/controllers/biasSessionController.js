/**
 * biasSessionController.js
 *
 * GET /api/bias-session
 *
 * Returns the current user's session state for the Spectral Bias Report
 * conversion funnel:
 *   - analyses_this_month: count from usage table
 *   - funnel_state: 1 | 2 | 3 (drives conversion banner logic)
 *   - session_fairness_score: 100 − avg bias score across today's reports
 *   - dominant_bias_types: top 3 bias categories across this month
 *   - biased_unrewritten_count: count of biased questions with no rewrite seen
 */

"use strict";

const { supabase: supabaseAdmin } = require("../config/supabase");
const { getSubscription, getUsage } = require("../services/subscriptionService");

const getBiasSession = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";
    if (userId === "anonymous") {
      return res.json({
        analyses_this_month: 0,
        funnel_state: 1,
        session_fairness_score: null,
        dominant_bias_types: [],
        biased_unrewritten_count: 0,
      });
    }

    const [sub, usage] = await Promise.all([
      getSubscription(userId),
      getUsage(userId),
    ]);

    const analysesThisMonth = usage?.analyses_used || 0;

    // Funnel state: 1 (first), 2 (second — legal warning), 3+ (scarcity)
    let funnelState = 1;
    if (analysesThisMonth >= 3) funnelState = 3;
    else if (analysesThisMonth >= 2) funnelState = 2;

    // Fetch today's reports to compute session fairness score
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayReports } = await supabaseAdmin
      .from("analysis_reports")
      .select("bias_score, categories")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    let sessionFairnessScore = null;
    let biasedUnrewrittenCount = 0;

    if (todayReports && todayReports.length > 0) {
      const avgBias =
        todayReports.reduce((s, r) => s + (r.bias_score || 0), 0) /
        todayReports.length;
      sessionFairnessScore = Math.max(0, Math.round(100 - avgBias));

      // Count biased questions (score > 20) across today's reports
      todayReports.forEach((r) => {
        const questions = r.categories?.questions || [];
        questions.forEach((q) => {
          if ((q.bias_score || 0) > 20) biasedUnrewrittenCount++;
        });
      });
    }

    // Compute dominant bias types from this month's reports
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: monthReports } = await supabaseAdmin
      .from("analysis_reports")
      .select("categories")
      .eq("user_id", userId)
      .gte("created_at", `${currentMonth}-01`)
      .limit(50);

    const typeCount = {};
    if (monthReports) {
      monthReports.forEach((r) => {
        const qs = r.categories?.questions || [];
        qs.forEach((q) => {
          (q.bias_types || q.flags?.map((f) => f.category) || []).forEach((t) => {
            typeCount[t] = (typeCount[t] || 0) + 1;
          });
        });
      });
    }

    const dominantBiasTypes = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    return res.json({
      analyses_this_month: analysesThisMonth,
      funnel_state: funnelState,
      session_fairness_score: sessionFairnessScore,
      dominant_bias_types: dominantBiasTypes,
      biased_unrewritten_count: biasedUnrewrittenCount,
      plan_id: sub?.plan_id || "free",
    });
  } catch (err) {
    console.error("[BIAS-SESSION] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch bias session data" });
  }
};

module.exports = { getBiasSession };
