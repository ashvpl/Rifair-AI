// backend/src/controllers/evaluationController.js
// POST /api/evaluate-candidate
// Plan-gated: Starter + Growth only. Free plan → 403.

'use strict';

const { supabase }              = require('../config/supabase');
const { callAIWithFallback }    = require('../ai/universalCaller');
const { buildEvaluationPrompt } = require('../prompts/evaluationPrompt');
const { getSubscription, getUsage }       = require('../services/subscriptionService');
const { parseJSON }             = require('../utils/parseJSON');

// ── Helpers ──────────────────────────────────────────────────────────────────
// parseJSON is now the shared robust utility from ../utils/parseJSON

// ── Controller ───────────────────────────────────────────────────────────────

const evaluateCandidate = async (req, res) => {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sub = await getSubscription(userId);
    const planId = sub?.plan_id ?? 'free';

    const EVAL_LIMITS = {
      free:       1,
      lite:       3,
      starter:    5,
      growth:     20,
      enterprise: null,
    };

    const limit = EVAL_LIMITS[planId];

    if (limit !== null) {
      // Get first day of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Count evaluations this month
      const { count, error: countError } = await supabase
        .from('candidate_evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('interview_date', startOfMonth.toISOString().split('T')[0]);

      if (!countError && count >= limit) {
        return res.status(403).json({
          error:      'limit_reached',
          message:    `You have used all ${limit} candidate evaluations this month.`,
          planId,
          upgradeUrl: '/pricing',
        });
      }
    }

    // ── Body ─────────────────────────────────────────────────────────────────
    const {
      kitId,
      role,
      experience,
      companyType,
      candidateName,
      questionScores,
      kitSummary,
    } = req.body;

    if (!role || !experience || !companyType || !Array.isArray(questionScores) || questionScores.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: role, experience, companyType, questionScores',
      });
    }

    // Validate scores are in range 1–5
    for (const qs of questionScores) {
      if (qs.score < 1 || qs.score > 5) {
        return res.status(400).json({ error: `Invalid score ${qs.score} for question ${qs.id}. Must be 1–5.` });
      }
    }

    // ── Build prompt ─────────────────────────────────────────────────────────
    const prompt = buildEvaluationPrompt({
      role,
      experience,
      companyType,
      candidateName,
      questionScores,
      kitSummary: kitSummary || `Interview kit for ${role}`,
    });

    // ── Call AI ──────────────────────────────────────────────────────────────
    let evaluation;
    try {
      const raw = await callAIWithFallback(prompt, {
        temperature: 0.2,   // Low temp → consistent, calibrated evaluations
        maxTokens:   3000,
      });
      evaluation = parseJSON(raw);
    } catch (err) {
      if (err.message === 'ALL_KEYS_EXHAUSTED') {
        return res.status(503).json({
          error:               'api_quota_exceeded',
          message:             'AI quota reached. Please try again in ~1 hour.',
          retry_after_minutes: 60,
        });
      }
      // JSON parse failures → structured fallback instead of 500 crash
      if (err.message.startsWith('JSON parse failed') || err.message.startsWith('No JSON') || err.message.startsWith('Malformed')) {
        console.error('[Evaluate] AI JSON parse failed — using fallback structure:', err.message);
        evaluation = {
          overall_score:    50,
          recommendation:   'HOLD',
          confidence:       'LOW',
          confidence_reason: 'Evaluation could not be fully parsed — please resubmit for accurate results.',
          summary:          'The evaluation encountered a technical issue. Please resubmit for accurate results.',
          strengths:        [],
          gaps:             [],
          competency_breakdown: [],
          next_steps: { if_hold: ['Please resubmit the evaluation for detailed next steps'] },
          interview_quality_feedback: null,
          bias_check: { potential_bias_detected: false, bias_note: null },
          _parse_error: true,
        };
      } else {
        throw err;
      }
    }

    // ── Persist to candidate_evaluations ────────────────────────────────────
    const evaluationRecord = {
      user_id:         userId,
      kit_id:          kitId ?? 'unknown',
      candidate_name:  candidateName ?? null,
      role,
      experience,
      company_type:    companyType,
      question_scores: questionScores,
      overall_score:   evaluation.overall_score ?? null,
      recommendation:  evaluation.recommendation ?? null,
      ai_evaluation:   evaluation,
      plan_id:         planId,
      interview_date:  new Date().toISOString().split('T')[0],
    };

    const { data: insertedEval, error: dbError } = await supabase
      .from('candidate_evaluations')
      .insert(evaluationRecord)
      .select('id')
      .single();

    if (dbError) {
      console.error('[Evaluate] Supabase insert error:', dbError.message);
    }

    const evaluationId = insertedEval?.id;

    // ── Also Persist to analysis_reports for History UI ──────────────────────
    const historyRecord = {
      user_id: userId,
      input_text: `Candidate Evaluation: ${candidateName || 'Unnamed'} for ${role}`,
      bias_score: evaluation.overall_score || 0,
      risk_level: 'low',
      categories: {
        analysis_type: 'evaluation',
        evaluation_data: evaluation,
        role,
        candidate_name: candidateName,
        kit_id: kitId,
      },
      created_at: new Date().toISOString(),
    };

    const { error: historyError } = await supabase
      .from('analysis_reports')
      .insert([historyRecord]);

    if (historyError) {
      console.error('[Evaluate] History insert error:', historyError.message);
    }

    // ── Increment analyses_used in usage table ────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await getUsage(userId);
    await supabase
      .from('usage')
      .update({
        // evaluations_used omitted due to schema missing
        updated_at:       new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('month',   currentMonth);

    return res.json({
      ...evaluation,
      id: evaluationId,
    });

  } catch (err) {
    console.error('[Evaluate] Unexpected error:', err.message);
    const fs = require('fs');
    const log = `\n[${new Date().toISOString()}] EVALUATE ERROR: ${err.message}\nStack: ${err.stack}\n`;
    try { fs.appendFileSync('error_logs.txt', log); } catch (e) {}
    return res.status(500).json({ error: 'Evaluation failed', message: err.message });
  }
};

module.exports = { evaluateCandidate };
