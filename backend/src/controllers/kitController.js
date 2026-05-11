/**
 * kitController.js
 *
 * Handles POST /api/generate-kit
 *
 * Now uses the 5-stage Role Intelligence Pipeline:
 *   Stage 1: Role Intelligence Extraction
 *   Stage 2: Context Building (experience + company)
 *   Stage 3: Dynamic Question Generation
 *   Stage 4: Quality Validation (auto-retry)
 *   Stage 5: Plan-gated Structured Output
 *
 * The richer kit schema (follow-ups, scorecard, interviewer guide)
 * is plan-gated inside kitPipeline.js before reaching the frontend.
 */

"use strict";

const { supabase }                          = require("../config/supabase");
const { getFallbackKit }                    = require("../services/fallbackService");
const { runUnifiedPipeline }                = require("../utils/pipeline");
const { withTimeout, logger }               = require("../utils/helpers");
const { getSubscription, getUsage }         = require("../services/subscriptionService");
const { buildSingleCallKitPrompt }          = require("../ai/singleCallPrompt");
const { callAIWithFallback }                = require("../ai/universalCaller");
const { getCachedKit, setCachedKit }        = require("../ai/cache");
const { parseJSON }                         = require("../utils/parseJSON");

const KIT_LIMITS = {
  free:       1,
  lite:       10,
  starter:    20,
  growth:     80,
  enterprise: null,
};

const generateKit = async (req, res) => {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const userId = req.auth?.userId || req.auth?.claims?.sub;

    // ── Body ──────────────────────────────────────────────────────────────────
    const {
      role,
      experience_level,
      company_context,
      company_type,
      diversity_goals,
    } = req.body;

    const resolvedCompanyType = company_type || company_context || "product_company";

    if (!role || !experience_level) {
      return res.status(400).json({ error: "Role and experience required." });
    }

    // ── Usage gate ────────────────────────────────────────────────────────────
    let resolvedPlanId = "free";
    if (userId && userId !== "anonymous") {
      const [sub, usage] = await Promise.all([
        getSubscription(userId),
        getUsage(userId),
      ]);
      resolvedPlanId = sub?.plan_id || "free";
      const kitsUsed = usage?.kits_used || 0;
      const kitLimit = KIT_LIMITS[resolvedPlanId];

      if (kitLimit !== null && kitsUsed >= kitLimit) {
        return res.status(403).json({
          error:      "limit_reached",
          message:    `You have used all ${kitLimit} kit generations this month.`,
          planId:     resolvedPlanId,
          upgradeUrl: "/pricing",
        });
      }
    }

    // ── Kit generation — single AI call + one quality retry ──────────────
    let kit;

    // ── Personalisation context (Layer 3) ──────────────────────────────
    let personalisationSuffix = "";
    const personalisationHeader = req.headers["x-personalisation"];
    if (personalisationHeader) {
      try {
        const adjustments = JSON.parse(personalisationHeader);
        const values = Object.values(adjustments).filter(Boolean);
        if (values.length > 0) {
          personalisationSuffix = [
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
    const hasPersonalisation = personalisationSuffix.length > 0;

    try {
      logger(`-> [API] Generating kit for ${role} / ${experience_level}...`);

      // ── Step 1: Check cache first — zero API cost (─ skip if personalised)
      const cached = hasPersonalisation
        ? null
        : await getCachedKit(role, experience_level, resolvedCompanyType);
      if (cached) {
        kit = cached;
        kit._cached = true;
        logger('-> [Cache] HIT — returning cached kit');
      } else {
        // ── Step 2: Build single-call prompt (with optional personalisation suffix)
        const prompt = buildSingleCallKitPrompt({
          role:        role.trim(),
          experience:  experience_level.trim(),
          companyType: resolvedCompanyType.trim(),
          constraints: (diversity_goals || '').trim(),
        }) + personalisationSuffix;

        // ── Step 3: Single AI call with Groq-first fallback ──
        let rawResponse;
        try {
          rawResponse = await withTimeout(
            callAIWithFallback(prompt, { temperature: 0.4, maxTokens: 4000 }),
            45000
          );
        } catch (err) {
          if (err.message === 'ALL_KEYS_EXHAUSTED') {
            return res.status(503).json({
              error:               'api_quota_exceeded',
              message:             'AI quota reached. Resets in ~1 hour.',
              retry_after_minutes: 60,
            });
          }
          throw err;
        }

        // ── Step 4: Parse ──
        kit = parseJSON(rawResponse);

        // ── Step 5: Quality validation — ONE retry only ──
        const issues = validateKit(kit, role);
        if (issues.length > 0) {
          console.warn('[Kit] Quality issues:', issues);
          const retryPrompt = prompt + `

FIX THESE ISSUES:
${issues.map(i => `• ${i}`).join('\n')}
Return corrected JSON only.`;

          try {
            const retryRaw = await withTimeout(
              callAIWithFallback(retryPrompt, { temperature: 0.5, maxTokens: 4000 }),
              45000
            );
            kit = parseJSON(retryRaw);
          } catch (retryErr) {
            // Quality retry failed — keep original kit, just log
            console.warn('[Kit] Quality retry failed, using original:', retryErr.message);
            kit._quality_notes = issues;
          }
        }

        // ── Step 6: Cache ──
        await setCachedKit(role, experience_level, resolvedCompanyType, kit);
      }

      // Validate kit structure
      if (!kit || !kit.questions || kit.questions.length === 0) {
        logger('-> [VALIDATION] Pipeline returned no questions. Using fallback.');
        kit = getFallbackKit(role, experience_level);
      }
    } catch (e) {
      console.error('-> [AI] Kit pipeline failed:', e.message);
      logger('-> [FALLBACK] Triggering fallback dataset due to pipeline failure.');

      try {
        kit = getFallbackKit(role, experience_level);
      } catch (fallbackErr) {
        console.error('-> [FALLBACK ERROR]:', fallbackErr.message);
        kit = null;
      }

      // Absolute safety net
      if (!kit || !kit.questions) {
        console.log('-> [SAFETY NET] Resorting to static fallback.');
        kit = {
          kit_title:                  `${role} Interview Kit`,
          role,
          experience_level,
          company_type:               resolvedCompanyType,
          estimated_duration_minutes: 45,
          kit_summary:                `Basic interview kit for ${role}. AI pipeline was unavailable.`,
          questions: [
            { id: 1, question: 'Tell me about a time when you had to solve a complex problem with limited resources. What was your approach?', type: 'behavioral', competency: 'Problem Solving', time_minutes: 8, difficulty: 'intermediate', bias_score: 0, bias_verified: true },
            { id: 2, question: 'Describe a situation where you had to collaborate with a difficult stakeholder. How did you navigate it?', type: 'behavioral', competency: 'Stakeholder Management', time_minutes: 8, difficulty: 'intermediate', bias_score: 0, bias_verified: true },
            { id: 3, question: 'Give me an example of a time when you had to adapt quickly to a significant change at work.', type: 'situational', competency: 'Adaptability', time_minutes: 8, difficulty: 'foundation', bias_score: 0, bias_verified: true },
            { id: 4, question: 'Tell me about a project where you had to balance competing priorities under a tight deadline.', type: 'situational', competency: 'Prioritization', time_minutes: 8, difficulty: 'intermediate', bias_score: 0, bias_verified: true },
            { id: 5, question: 'Describe a situation where you had to influence a decision without having direct authority.', type: 'leadership', competency: 'Influence', time_minutes: 8, difficulty: 'advanced', bias_score: 0, bias_verified: true },
          ],
          _is_fallback: true,
        };
      }
    }

    // ── Bias-check the generated kit (deterministic only — no extra AI call) ───────
    // Kit questions are already AI-generated to be bias-free.
    // Using the deterministic engine (keyword + structural) is fast and free.
    let biasCheck;
    try {
      const questionsText = Array.isArray(kit.questions)
        ? kit.questions.map((q) => (typeof q === 'string' ? q : q.question || '')).join('\n')
        : '';

      // 'deterministic' mode — keyword + structural scoring only, zero AI calls
      biasCheck = await withTimeout(
        runUnifiedPipeline(questionsText, 'deterministic', { role }),
        5000
      );
    } catch (error) {
      console.error('BIAS CHECK FAILED:', error.message);
      biasCheck = {
        overall_bias_score: 0,
        risk_level:         'low',
        overallScore:       0,
        riskLevel:          'low',
      };
    }

    const response = { kit, bias_validation: biasCheck };

    // ── Persist ──────────────────────────────────────────────────────────────
    const { data: dbData, error: dbError } = await supabase
      .from("analysis_reports")
      .insert([{
        user_id:    userId,
        input_text: `Interview Kit: ${role}`,
        bias_score: biasCheck.overall_bias_score || biasCheck.overallScore || 0,
        risk_level: biasCheck.risk_level         || biasCheck.riskLevel    || "low",
        categories: {
          kit_data:      kit,
          validation:    biasCheck,
          inputs:        { role, experience_level, company_type: resolvedCompanyType, diversity_goals },
          analysis_type: "kit",
          pipeline_meta: kit._pipeline_meta || null,
        },
        created_at: new Date(),
      }])
      .select()
      .single();

    if (dbError) {
      console.error("SUPABASE PERSISTENCE ERROR (kit):", dbError);
      throw new Error(`Failed to archive kit: ${dbError.message}`);
    }

    // ── Usage increment ──────────────────────────────────────────────────────
    if (userId && userId !== "anonymous") {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageData = await getUsage(userId);
        const currentUsed = usageData?.kits_used ?? 0;

        const { error: upsertError } = await supabase
          .from('usage')
          .upsert(
            {
              user_id: userId,
              month: currentMonth,
              kits_used: currentUsed + 1,
              analyses_used: usageData?.analyses_used ?? 0,
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
          console.error('[USAGE UPDATE FAILED (kit)]', upsertError);
        }
      } catch (usageErr) {
        console.error('[USAGE INCREMENT FATAL ERROR (kit)]', usageErr);
      }
    }

    if (dbData?.id) {
      response.reportId = dbData.id;
    }

    res.json(response);
  } catch (error) {
    console.error("CONTROLLER ERROR (generate-kit):", error);
    res.status(500).json({
      error:   "Failed to generate kit.",
      message: error.message,
    });
  }
};

// ── JSON Parser ──────────────────────────────────────────────────────────────
// parseJSON is now the shared robust utility from ../utils/parseJSON

function validateKit(kit, role) {
  const issues = [];
  const questions = kit.questions || [];

  const banned = [
    'explain your specific methodology regarding',
    'give a recent example.',
    'specifically in the context of being'
  ];

  questions.forEach((q, i) => {
    const qText = (q.question || '').toLowerCase();
    banned.forEach(p => {
      if (qText.includes(p)) {
        issues.push(`Q\${i+1}: Banned phrase detected`);
      }
    });
    if ((q.question || '').length < 40) {
      issues.push(`Q\${i+1}: Too short`);
    }
  });

  if (questions.length < 8) {
    issues.push(`Only \${questions.length} questions`);
  }

  return issues;
}

module.exports = { generateKit };
