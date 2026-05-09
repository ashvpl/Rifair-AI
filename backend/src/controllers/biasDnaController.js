/**
 * biasDnaController.js
 *
 * GET /api/bias-dna
 *
 * Aggregates analysis_reports for the current user over the past 30 days.
 * Returns:
 *   - dominant_bias_types: ranked list of bias categories
 *   - frequency_map: { type: count }
 *   - total_questions_analyzed: int
 *   - total_biased_questions: int
 *   - fairness_trend: 'improving' | 'worsening' | 'stable'
 *   - narrative: AI-style human-readable insight string
 *   - weekly_scores: last 4 weeks avg bias score
 *
 * Gated to Growth + Enterprise plans.
 */

"use strict";

const { supabase: supabaseAdmin } = require("../config/supabase");
const { getSubscription } = require("../services/subscriptionService");

const GROWTH_PLANS = ["growth", "enterprise"];

const BIAS_NARRATIVES = {
  "Gender Bias":     "You consistently use gender-coded language. Consider auditing job descriptions for masculine/feminine-coded adjectives.",
  "Age Bias":        "Age-coded questions appear frequently in your sessions. Phrases about 'energy', 'digital natives', or 'years of experience' can signal this.",
  "Caste Bias":      "Caste-signalling language is appearing. Questions about surname origin, community, or regional schooling can carry caste implications in Indian contexts.",
  "Regional Bias":   "You have a pattern of regional discrimination flags. Assumptions about language fluency or cultural fit based on geography are common triggers.",
  "Marital Status":  "Questions probing family plans or marital status appear frequently and may violate the Equal Remuneration Act.",
  "Pregnancy Bias":  "Maternity-related questions are being flagged. These may directly violate the Maternity Benefit Act, 1961.",
  "Religion Bias":   "Religion-coded language is appearing in your questions. This may violate Article 16 of the Indian Constitution.",
};

const getBiasDna = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";

    if (userId === "anonymous") {
      return res.status(401).json({ error: "Authentication required" });
    }

    // ── Plan gate ──
    const sub = await getSubscription(userId);
    if (!GROWTH_PLANS.includes(sub?.plan_id || "free")) {
      return res.status(403).json({
        error: "plan_required",
        message: "Bias DNA requires a Growth plan.",
        requiredPlan: "growth",
        upgradeUrl: "/pricing?highlight=growth&feature=bias_dna",
      });
    }

    // Fetch last 30 days of reports
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: reports, error } = await supabaseAdmin
      .from("analysis_reports")
      .select("bias_score, categories, created_at")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    if (!reports || reports.length === 0) {
      return res.json({
        dominant_bias_types: [],
        frequency_map: {},
        total_questions_analyzed: 0,
        total_biased_questions: 0,
        fairness_trend: "stable",
        narrative: "Not enough data yet. Run more analyses to see your Bias DNA.",
        weekly_scores: [],
      });
    }

    // Build frequency map across all questions
    const frequencyMap = {};
    let totalQuestions = 0;
    let totalBiased = 0;

    reports.forEach((r) => {
      const qs = r.categories?.questions || [];
      qs.forEach((q) => {
        totalQuestions++;
        if ((q.bias_score || 0) > 20) totalBiased++;
        const types = q.bias_types || q.flags?.map((f) => f.category) || [];
        types.forEach((t) => {
          frequencyMap[t] = (frequencyMap[t] || 0) + 1;
        });
      });
    });

    const dominantBiasTypes = Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([type, count]) => ({ type, count }));

    // Weekly score aggregation (last 4 weeks)
    const now = new Date();
    const weeklyScores = [0, 1, 2, 3].map((weeksAgo) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weeksAgo + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - weeksAgo * 7);

      const weekReports = reports.filter((r) => {
        const d = new Date(r.created_at);
        return d >= weekStart && d < weekEnd;
      });

      if (!weekReports.length) return { week: `Week ${4 - weeksAgo}`, avg: null };
      const avg = weekReports.reduce((s, r) => s + (r.bias_score || 0), 0) / weekReports.length;
      return { week: `Week ${4 - weeksAgo}`, avg: Math.round(avg) };
    }).reverse();

    // Fairness trend
    const filledWeeks = weeklyScores.filter((w) => w.avg !== null);
    let trend = "stable";
    if (filledWeeks.length >= 2) {
      const first = filledWeeks[0].avg;
      const last  = filledWeeks[filledWeeks.length - 1].avg;
      if (last < first - 5) trend = "improving";
      else if (last > first + 5) trend = "worsening";
    }

    // Generate narrative
    const topType = dominantBiasTypes[0]?.type;
    const narrative = topType && BIAS_NARRATIVES[topType]
      ? BIAS_NARRATIVES[topType]
      : topType
        ? `${topType} is your most frequent bias pattern. Review how you phrase questions in this category.`
        : "Keep analyzing more questions to uncover your bias patterns.";

    return res.json({
      dominant_bias_types: dominantBiasTypes,
      frequency_map: frequencyMap,
      total_questions_analyzed: totalQuestions,
      total_biased_questions: totalBiased,
      fairness_trend: trend,
      narrative,
      weekly_scores: weeklyScores,
    });
  } catch (err) {
    console.error("[BIAS-DNA] Error:", err.message);
    res.status(500).json({ error: "Failed to compute Bias DNA" });
  }
};

module.exports = { getBiasDna };
