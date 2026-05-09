/**
 * analyzeController.js
 *
 * Handles POST /api/analyze
 *
 * Accepts optional context fields (role, industry, company_type, country)
 * in the request body and forwards them to the pipeline so the master
 * analysis prompt can produce role-specific output.
 *
 * The raw result from the pipeline is stored in full in Supabase and
 * returned to the client — plan gating of premium fields is applied
 * inside aiPipeline.js before the result reaches this controller.
 */

"use strict";

const crypto                               = require("crypto");
const { supabase }                         = require("../config/supabase");
const { runUnifiedPipeline }               = require("../utils/pipeline");
const { withTimeout, logger }              = require("../utils/helpers");
const { getSubscription, getUsage }        = require("../services/subscriptionService");

const LIMITS = {
  free:       5,
  lite:       20,
  starter:    40,
  growth:     200,
  enterprise: null,
};

// Simple in-process cache (keyed on mode + context + short text prefix)
const globalCache = new Map();

const analyzeText = async (req, res) => {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";

    // ── Body ──────────────────────────────────────────────────────────────────
    const {
      text,
      name,
      mode,
      // Optional context fields for role-aware analysis
      role         = "unspecified role",
      industry     = "general",
      company_type = "company",
      country      = "India",
    } = req.body;

    const analysisMode = ["standard", "india", "full"].includes(mode)
      ? mode
      : "full";

    if (!text || text.length < 5) {
      return res.status(400).json({ error: "Input text too short" });
    }

    // ── Usage gate ────────────────────────────────────────────────────────────
    if (userId !== "anonymous") {
      const [sub, usage] = await Promise.all([
        getSubscription(userId),
        getUsage(userId),
      ]);
      const planId       = sub?.plan_id      || "free";
      const analysesUsed = usage?.analyses_used || 0;
      const limit        = LIMITS[planId];

      if (limit !== null && analysesUsed >= limit) {
        let teaserCheck;
        try {
          teaserCheck = await withTimeout(
            runUnifiedPipeline(text, 'deterministic', { role }),
            3000
          );
        } catch (e) {
          teaserCheck = { overall_bias_score: 55, categories: { questions: [{ bias_score: 55, bias_types: ["Potential Bias"], rewrite: "Consider revising this question for neutrality.", explanation: "This question might unintentionally exclude certain groups." }] } };
        }
        
        const issuesCount = teaserCheck?.categories?.questions?.reduce((acc, q) => acc + (q.bias_types ? q.bias_types.length : (q.bias_score > 30 ? 1 : 0)), 0) || 1;

        return res.status(403).json({
          error:      "limit_reached",
          message:    `You have used all ${limit} analyses this month.`,
          planId,
          upgradeUrl: "/pricing",
          teaser: {
            issuesCount,
            score: teaserCheck.overall_bias_score || 50,
          }
        });
      }
    }

    // ── Personalisation context (Layer 3) ───────────────────────────────────────
    let personalisationContext = "";
    const personalisationHeader = req.headers["x-personalisation"];
    if (personalisationHeader) {
      try {
        const adjustments = JSON.parse(personalisationHeader);
        const values = Object.values(adjustments).filter(Boolean);
        if (values.length > 0) {
          personalisationContext = [
            "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "PERSONALISATION CONTEXT",
            "(Apply silently — do not mention to user)",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            values.join("\n\n"),
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          ].join("\n");
        }
      } catch (e) {
        // Malformed header — ignore gracefully
      }
    }

    // ── Pipeline call (with context) ──────────────────────────────────────────
    const context  = { role, industry, company_type, country, personalisationContext };
    // Personalisation is user-specific, so exclude it from the cache key to avoid
    // serving one user's personalised response to another.
    const textHash = crypto.createHash("sha256").update(text).digest("hex");
    const cacheKey = `analyze:${analysisMode}:${JSON.stringify({ role, industry, company_type, country })}:${textHash}`;

    let aiResponse;
    if (globalCache.has(cacheKey) && !personalisationContext) {
      // Only use cache when there is no personalisation — personalised responses must be fresh
      aiResponse = globalCache.get(cacheKey);
    } else {
      aiResponse = await runUnifiedPipeline(text, analysisMode, context);
      if (!personalisationContext) {
        globalCache.set(cacheKey, aiResponse);
      }
    }

    // ── Persist ───────────────────────────────────────────────────────────────
    const safeTextSnippet = text.length > 100
      ? text.substring(0, 97) + "..."
      : text;

    const reportData = {
      user_id:    userId,
      input_text: name ? `Analysis - '${name}'` : safeTextSnippet,
      bias_score: aiResponse.overall_bias_score || 0,
      risk_level: aiResponse.risk_level         || "low",
      categories: {
        ...aiResponse,
        analysis_type: "analysis",
        analysis_mode: analysisMode,
        original_input: text,
        context,
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
      const fallbackReport = {
        ...reportData,
        id:         `temp_${Date.now()}`,
        is_unsaved: true,
      };
      return res.json({
        report:  insertedData || fallbackReport,
        warning: "Persistence failed",
      });
    }

    // ── Usage increment ───────────────────────────────────────────────────────
    if (userId !== "anonymous") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage        = await getUsage(userId);
      await supabase
        .from("usage")
        .update({
          analyses_used: (usage.analyses_used ?? 0) + 1,
          updated_at:    new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("month",   currentMonth);
    }

    res.json({ report: insertedData });
  } catch (error) {
    // Append to error log for debugging
    const fs = require("fs");
    const errorLog = `\n[${new Date().toISOString()}] CONTROLLER ERROR: ${error.message}\nStack: ${error.stack}\n`;
    try { fs.appendFileSync("error_logs.txt", errorLog); } catch (_) {}

    console.error("CONTROLLER ERROR (analyze):", error);
    res.status(500).json({
      error:   "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = { analyzeText };
