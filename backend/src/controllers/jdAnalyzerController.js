/**
 * jdAnalyzerController.js
 *
 * POST /api/analyze/jd
 *
 * Dedicated JD bias analysis — uses a single AI call with a
 * specialised JD-analysis prompt (not the interview pipeline).
 *
 * Returns: section scores, coded language, gender analysis,
 * legal risks, full rewritten JD, and inclusivity scores.
 *
 * Gated to Growth + Enterprise plans.
 */

"use strict";

const { callAIWithFallback }              = require("../ai/universalCaller");
const { getSubscription }                  = require("../services/subscriptionService");
const { getUsage, incrementUsage }         = require("../services/usageService");
const { supabase }                        = require("../config/supabase");
const { parseJSON }                       = require("../utils/parseJSON");

const GROWTH_PLANS = ["growth", "enterprise"];

// ── Prompt builder ──────────────────────────────────────────────────────────
function buildJDAnalysisPrompt(jobDescription, companyType, role) {
  return `You are the world's leading expert in inclusive job description writing and employment discrimination law.

You have reviewed 50,000+ job descriptions for Fortune 500 companies, Indian unicorns, and global MNCs. You know every bias pattern, coded phrase, and exclusionary requirement that deters qualified candidates from applying.

ANALYSE THIS JOB DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${companyType ? `Company type: ${companyType}` : ""}
${role ? `Role: ${role}` : ""}

YOUR ANALYSIS FRAMEWORK:

1. BIAS BY SECTION — Analyse each section:
   Job title, About the company, Responsibilities, Requirements/Qualifications, Nice to have, Culture/Team description, Perks/Benefits

2. CODED LANGUAGE DETECTION
   "Rockstar/Ninja/Guru" → age/gender coded; "Fast-paced/High-energy" → age bias;
   "Recent graduate" → age discrimination; "Native speaker" → nationality bias;
   "Cultural fit" → exclusionary; "Young team/Dynamic team" → age bias;
   Degree requirements where not needed → socioeconomic; "Pleasing personality" → appearance/gender

3. REQUIREMENT INFLATION CHECK — flag unnecessarily restrictive requirements, excess years-of-experience, narrow tech stack requirements

4. GENDER LANGUAGE ANALYSIS — masculine-coded: competitive, dominant, aggressive, champion, drive, rock, ninja;
   feminine-coded: support, nurture, collaborate, help, assist

5. INCLUSIVITY SCORING — language, requirements, culture_description (all 0-100)

CRITICAL RULES:
- Flag EVERY biased phrase — no benefit of doubt
- Rewrite must preserve the role's actual requirements
- Legal risk must cite specific applicable law (Indian or International)
- Rewritten JD must be COMPLETE — not truncated
- Suggestions must be specific and actionable

RETURN ONLY VALID JSON — NO MARKDOWN — NO EXPLANATION BEFORE OR AFTER:
{
  "overall_bias_score": <0-100, higher = more biased>,
  "overall_inclusivity_score": <0-100, higher = more inclusive>,
  "overall_verdict": "INCLUSIVE|MILD_BIAS|BIASED|SEVERELY_BIASED",
  "legal_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "<3 sentences: what this JD does well and what its main problems are>",
  "section_analysis": [
    {
      "section": "<Job Title|About Company|Responsibilities|Requirements|Nice to Have|Culture|Benefits>",
      "bias_score": <0-100>,
      "issues_found": [
        {
          "phrase": "<exact phrase from JD>",
          "bias_type": "<gender|age|socioeconomic|nationality|appearance|culture_coded|requirement_inflation>",
          "explanation": "<why this is biased and who it excludes>",
          "severity": "CRITICAL|HIGH|MODERATE|LOW",
          "fixed_phrase": "<replacement phrase or null if should be removed>"
        }
      ],
      "section_verdict": "<one sentence assessment of this section>"
    }
  ],
  "coded_language": [
    {
      "phrase": "<exact phrase>",
      "decoded_meaning": "<what this actually signals to candidates>",
      "who_it_deters": "<which candidate group avoids applying>",
      "replacement": "<neutral alternative>"
    }
  ],
  "requirement_inflation": [
    {
      "requirement": "<the inflated requirement>",
      "issue": "<why it's unnecessarily restrictive>",
      "suggestion": "<what to replace it with>"
    }
  ],
  "gender_language_analysis": {
    "masculine_coded_count": <number>,
    "feminine_coded_count": <number>,
    "balance": "MASCULINE_SKEWED|FEMININE_SKEWED|BALANCED",
    "flagged_words": ["<word>"],
    "recommendation": "<one sentence>"
  },
  "inclusivity_scores": {
    "language": <0-100>,
    "requirements": <0-100>,
    "culture_description": <0-100>,
    "overall": <0-100>
  },
  "legal_risks": [
    {
      "issue": "<what the legal risk is>",
      "applicable_law": "<specific law or regulation>",
      "severity": "HIGH|MEDIUM|LOW"
    }
  ],
  "top_3_fixes": [
    "<most impactful single change to make>",
    "<second most impactful>",
    "<third most impactful>"
  ],
  "rewritten_jd": "<complete rewritten job description — bias-free, inclusive, same requirements preserved>",
  "rewrite_changelog": [
    {
      "original": "<what was changed>",
      "replacement": "<what it became>",
      "reason": "<why>"
    }
  ],
  "positive_observations": [
    "<something the JD did well inclusivity-wise>"
  ],
  "talent_pool_impact": {
    "baseline_pool": 100,
    "after_title_bias": <percentage remaining>,
    "after_requirements": <percentage remaining>,
    "after_culture_section": <percentage remaining>,
    "after_coded_language": <percentage remaining>,
    "final_reach_percent": <0-100>,
    "interpretation": "<one sentence — what this means for hiring>",
    "after_rifair_rewrite": <projected reach after fix>
  },
  "candidate_persona": {
    "current_jd": {
      "gender_skew": "<e.g. ~74% male / ~26% female>",
      "age_skew": "<e.g. 22-28 years>",
      "background_skew": "<e.g. Urban, tier-1 college>",
      "experience_skew": "<e.g. Over-qualified, high churn risk>"
    },
    "after_rewrite": {
      "gender_skew": "<projected>",
      "age_skew": "<projected>",
      "background_skew": "<projected>",
      "experience_skew": "<projected>"
    }
  },
  "business_impact": {
    "time_to_hire_multiplier": <1.0-3.0>,
    "estimated_extra_days": <number>,
    "daily_cost_of_vacancy_inr": <number>,
    "estimated_cost_of_bias_inr": <number>,
    "rifair_roi": "<e.g. 117x>",
    "key_insight": "<the most important business reason to fix this>"
  },
  "industry_benchmark": {
    "role_category": "<detected role category>",
    "your_bias_score": <number>,
    "industry_avg_bias_score": <number>,
    "your_inclusivity_score": <number>,
    "industry_avg_inclusivity_score": <number>,
    "competitive_position": "LEADING|AVERAGE|LAGGING|CRITICAL",
    "insight": "<one sentence on competitive position>"
  }
}`;
}

// ── JSON parser ──────────────────────────────────────────────────────────────
// parseJSON is now the shared robust utility from ../utils/parseJSON

// ── Controller ───────────────────────────────────────────────────────────────
const analyzeJd = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub || "anonymous";

    // ── Plan gate ──────────────────────────────────────────────────────────
    let currentUsage = null;
    let currentPlanId = "free";

    if (userId !== "anonymous") {
      const sub = await getSubscription(userId);
      currentPlanId = sub?.plan_id || "free";
      
      if (!GROWTH_PLANS.includes(currentPlanId)) {
        return res.status(403).json({
          error:        "plan_required",
          message:      "JD Analyser is available on the Growth plan and above.",
          requiredPlan: "growth",
          upgradeUrl:   "/pricing?highlight=growth&feature=jd_analyser",
        });
      }

      currentUsage = await getUsage(userId);
      if (currentPlanId === "growth" && (currentUsage?.jd_analyses_used || 0) >= 20) {
        return res.status(403).json({
          error: "limit_reached",
          message: "You have reached your limit of 20 JD analyses for this month.",
          upgradeUrl: "/pricing?addon=jd_analyses",
        });
      }
    }

    const { jobDescription, companyType, role } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: "Please provide a valid job description (minimum 50 characters).",
      });
    }

    if (jobDescription.length > 12000) {
      return res.status(400).json({
        error: "Job description is too long — maximum 12,000 characters.",
      });
    }

    console.log(`[JD_ANALYSER] Analysing JD for userId=${userId}, role="${role || 'unknown'}"`);

    // ── Single AI call ─────────────────────────────────────────────────────
    const prompt = buildJDAnalysisPrompt(
      jobDescription.trim(),
      companyType?.trim(),
      role?.trim()
    );

    let raw;
    try {
      raw = await callAIWithFallback(prompt, { temperature: 0.1, maxTokens: 5000 });
    } catch (err) {
      if (err.message === "ALL_KEYS_EXHAUSTED") {
        return res.status(503).json({
          error:               "api_quota_exceeded",
          message:             "AI quota reached. Try again in ~1 hour.",
          retry_after_minutes: 60,
        });
      }
      throw err;
    }

    const result = parseJSON(raw);

    // ── Persist to Supabase ────────────────────────────────────────────────
    const { data: insertedData, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([{
        user_id:    userId,
        input_text: role ? `JD Analysis — ${role}` : "Job Description Analysis",
        bias_score: result.overall_bias_score || 0,
        risk_level: result.legal_risk_level?.toLowerCase() || "low",
        categories: {
          ...result,
          analysis_type:  "jd_analysis",
          original_input: jobDescription.trim(),
          role:           role || null,
          company_type:   companyType || null,
        },
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (dbError) {
      console.error("[JD_ANALYSER] DB persistence error:", dbError.message);
      // Non-fatal — still return result
    }

    // ── Usage increment (atomic) ──────────────────────────────────────────────
    // Persists to `usage` table only — independent of analysis_reports history.
    if (userId !== "anonymous") {
      try {
        await incrementUsage(userId, 'jd_analyses_used');
      } catch (usageErr) {
        console.error('[USAGE INCREMENT FATAL ERROR (jd)]', usageErr);
      }
    }

    return res.json({
      ...result,
      reportId: insertedData?.id || null,
    });

  } catch (err) {
    console.error("[JD_ANALYSER] Controller error:", err.message);
    res.status(500).json({
      error:   "JD analysis failed.",
      message: err.message,
    });
  }
};

module.exports = { analyzeJd };
