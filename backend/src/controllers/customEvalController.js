'use strict';

/**
 * customEvalController.js
 *
 * POST /api/custom-eval           → createSession
 *   Accepts user's questions, runs deterministic bias check, classifies
 *   question types/competencies via one AI call, saves session, returns
 *   enriched questions + bias scores + session id.
 *
 * POST /api/custom-eval/:id/score → submitScores
 *   Accepts user's 1-5 scores per question, runs AI evaluation,
 *   updates session to 'completed', mirrors to analysis_reports for History.
 */

const { supabase }                = require('../config/supabase');
const { getSubscription, getUsage } = require('../services/subscriptionService');
const { runUnifiedPipeline }      = require('../utils/pipeline');
const { callAIWithFallback }      = require('../ai/universalCaller');
const { withTimeout }             = require('../utils/helpers');
const { parseJSON }               = require('../utils/parseJSON');
const {
  buildBatchMetaPrompt,
  buildBiasCheckPrompt,
  buildCustomEvalPrompt,
}                                 = require('../prompts/customEvalPrompts');

// ── Constants ──────────────────────────────────────────────────────────────

const EVAL_LIMITS = {
  free:       1,
  lite:       3,
  starter:    5,
  growth:     20,
  enterprise: null,
};

const MAX_QUESTIONS  = 15;
const MIN_Q_LENGTH   = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
// parseJSON is now the shared robust utility from ../utils/parseJSON

/**
 * runBatchBiasCheck
 *
 * Analyses all user-submitted questions for bias using:
 *   1. Groq AI (via callAIWithFallback) — PRIMARY: rich, contextual bias analysis
 *   2. Content-safety deterministic engine — always runs in parallel to catch
 *      explicit/profane/sexual content the AI may softly score
 *   3. Pure deterministic fallback — only if AI call fails entirely
 *
 * Returns array of {score, tags, oneLiner, rewrite} parallel to input questions.
 */
async function runBatchBiasCheck(questions, role = '') {
  // ── Always run content safety check (TIER -1) in parallel ─────────────────
  // This catches sexual/profane/threatening content even if the AI misses it.
  const safetyResults = await Promise.allSettled(
    questions.map(q =>
      withTimeout(
        runUnifiedPipeline(q, 'deterministic', {}),
        4000
      )
    )
  );

  const safetyScores = safetyResults.map(r => {
    if (r.status === 'rejected') return { score: 0, tags: [], oneLiner: '', rewrite: null };
    const res       = r.value;
    const pipelineQ = res.questions?.[0] ?? {};
    return {
      score:    res.overall_bias_score ?? 0,
      tags:     (pipelineQ.bias_types ?? []).map(t => String(t).toLowerCase()),
      oneLiner: pipelineQ.explanation ? String(pipelineQ.explanation).split('.')[0].trim() : '',
      rewrite:  pipelineQ.improved_question ?? null,
    };
  });

  // ── Step 1: Try Groq AI for rich bias analysis (single batch call) ─────────
  let aiResults = null;
  try {
    const prompt = buildBiasCheckPrompt(questions, role);
    const raw    = await withTimeout(
      callAIWithFallback(prompt, { temperature: 0.1, maxTokens: 2000 }),
      20000
    );
    const parsed = parseJSON(raw);

    if (Array.isArray(parsed) && parsed.length === questions.length) {
      aiResults = parsed;
      console.log('[BiasCheck] ✓ AI bias analysis succeeded for', questions.length, 'question(s)');
    } else {
      console.warn('[BiasCheck] AI returned wrong array length — falling back to deterministic');
    }
  } catch (err) {
    console.warn('[BiasCheck] AI call failed, using deterministic fallback:', err.message);
  }

  // ── Step 2: Merge AI results with content-safety scores ────────────────────
  return questions.map((_, i) => {
    const safety = safetyScores[i];

    // Content safety flags are absolute — they can never be overridden by AI
    const hasContentSafetyFlag = safety.tags.some(t =>
      ['inappropriate_content', 'sexual_content', 'sexual_harassment', 'profanity', 'threatening_content'].includes(t)
    );

    if (hasContentSafetyFlag) {
      // Return the safety result unchanged — score 100 is non-negotiable
      return safety;
    }

    if (aiResults) {
      const ai = aiResults[i];
      const aiScore = Number(ai.bias_score) || 0;
      // Take the HIGHER of AI score and deterministic score
      const finalScore = Math.max(aiScore, safety.score);
      const allTags    = Array.from(new Set([
        ...(ai.bias_types ?? []).map(t => String(t).toLowerCase()),
        ...safety.tags,
      ]));

      return {
        score:    finalScore,
        tags:     allTags,
        oneLiner: ai.explanation || safety.oneLiner || '',
        rewrite:  ai.rewrite     || safety.rewrite   || null,
        type:       ai.type       || 'behavioral',
        competency: ai.competency || 'General',
      };
    }

    // Pure deterministic fallback
    return {
      ...safety,
      type: 'behavioral',
      competency: 'General',
    };
  });
}

// ── Controller: createSession ──────────────────────────────────────────────

const createSession = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // ── Validate body ───────────────────────────────────────────────────
    const { title, questions: rawQuestions, candidateName, role } = req.body;

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    // Filter out blank lines; enforce length constraints
    const questionTexts = rawQuestions
      .map(q => (typeof q === 'string' ? q : q?.text ?? '').trim())
      .filter(q => q.length >= MIN_Q_LENGTH)
      .slice(0, MAX_QUESTIONS);

    if (questionTexts.length === 0) {
      return res.status(400).json({
        error: `Each question must be at least ${MIN_Q_LENGTH} characters`,
      });
    }

    // ── Quota check — same approach as evaluationController.js ─────────
    // Counts ALL evaluations (kit + custom) from candidate_evaluations this month.
    const [sub, usage] = await Promise.all([
      getSubscription(userId),
      getUsage(userId),
    ]);
    const planId     = sub?.plan_id ?? 'free';
    const limit      = EVAL_LIMITS[planId];

    if (limit !== null) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('candidate_evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('interview_date', startOfMonth.toISOString().split('T')[0]);

      const evalsUsed = countError ? 0 : (count ?? 0);

      if (evalsUsed >= limit) {
        return res.status(403).json({
          error:      'limit_reached',
          message:    `You have used all ${limit} evaluations this month.`,
          planId,
          upgradeUrl: '/pricing',
          remaining:  0,
        });
      }

      // Attach remaining to response for UI display
      req._evalsRemaining = limit - evalsUsed - 1;  // -1 for this session completing
    } else {
      req._evalsRemaining = null; // unlimited
    }


    // ── Step 1: Bias check (deterministic — zero AI quota) ──────────────
    const biasResults = await runBatchBiasCheck(questionTexts, role ?? '');

    // ── Step 1b: Content safety gate ─────────────────────────────────────
    // If the content-safety engine (TIER -1 in deterministicEngine.js) flagged
    // any question as sexual, profane, or threatening, reject the entire session
    // immediately. Do NOT let inappropriate questions proceed to evaluation.
    const unsafeQuestions = biasResults
      .map((b, i) => ({ ...b, index: i, text: questionTexts[i] }))
      .filter(b => b.tags.includes('inappropriate_content') || b.tags.includes('sexual_content') || b.tags.includes('sexual_harassment') || b.tags.includes('profanity') || b.tags.includes('threatening_content'));

    if (unsafeQuestions.length > 0) {
      return res.status(400).json({
        error: 'inappropriate_content',
        message: `${unsafeQuestions.length} question(s) contain inappropriate content and cannot be used in an evaluation. Please remove or replace them.`,
        flaggedQuestions: unsafeQuestions.map(q => ({
          index:      q.index + 1,
          text:       q.text,
          reason:     q.tags.filter(t => t !== 'inappropriate_content').join(', '),
          oneLiner:   q.oneLiner,
        })),
      });
    }

    // ── Step 2: Merge into enriched questions array (0 additional API calls) ─
    const enrichedQuestions = questionTexts.map((text, i) => ({
      id:          i + 1,
      text,
      type:        biasResults[i]?.type       ?? 'behavioral',
      competency:  biasResults[i]?.competency ?? 'General',
      biasScore:   biasResults[i]?.score      ?? 0,
      biasTags:    biasResults[i]?.tags       ?? [],
      biasIssue:   biasResults[i]?.oneLiner   ?? '',
      aiRewrite:   biasResults[i]?.rewrite    ?? null,
    }));

    // ── Step 4: Persist session ─────────────────────────────────────────
    const { data: session, error: dbError } = await supabase
      .from('custom_evaluations')
      .insert({
        user_id:       userId,
        title:         title || 'Custom Evaluation',
        questions:     enrichedQuestions,
        bias_results:  biasResults,
        candidate_name: candidateName ?? null,
        plan_tier:     planId,
        status:        'draft',
      })
      .select('id, title, questions, bias_results, candidate_name, plan_tier, created_at')
      .single();

    if (dbError) {
      console.error('[CustomEval] DB insert error:', dbError.message);
      return res.status(500).json({ error: 'Failed to create evaluation session' });
    }

    const hasHighBias = biasResults.some(b => b.score > 50);

    return res.json({
      id:               session.id,
      title:            session.title,
      questions:        enrichedQuestions,
      biasResults,
      hasHighBias,
      planId,
      remaining:        req._evalsRemaining,
    });
  } catch (err) {
    console.error('[CustomEval] createSession error:', err.message);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};

// ── Controller: submitScores ───────────────────────────────────────────────

const submitScores = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id }           = req.params;
    const { scores, role, experience, companyType, candidateName } = req.body;

    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'Scores array is required' });
    }

    // Validate scores
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      if (!s || typeof s.score !== 'number' || s.score < 1 || s.score > 5) {
        return res.status(400).json({ error: `Invalid score at index ${i}. Must be 1-5.` });
      }
    }

    // ── Load session ────────────────────────────────────────────────────
    const { data: session, error: fetchErr } = await supabase
      .from('custom_evaluations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)   // ownership check
      .single();

    if (fetchErr || !session) {
      return res.status(404).json({ error: 'Evaluation session not found' });
    }

    if (session.status === 'completed') {
      // Already completed — return cached result
      return res.json({
        evaluation: session.ai_evaluation,
        fromCache: true,
      });
    }

    // ── Validate scores ─────────────────────────────────────────────────
    for (const s of scores) {
      if (s.score < 1 || s.score > 5) {
        return res.status(400).json({
          error: `Invalid score ${s.score}. Must be between 1 and 5.`,
        });
      }
    }

    // ── Merge scores with question metadata ─────────────────────────────
    const questions      = session.questions ?? [];
    const questionScores = scores.map((s, i) => {
      const q = questions[i] ?? {};
      return {
        text:        q.text        ?? s.question ?? `Question ${i + 1}`,
        type:        q.type        ?? 'behavioral',
        competency:  q.competency  ?? 'General',
        score:       s.score,
        notes:       s.notes ?? '',
      };
    });

    // ── Build prompt + call AI ──────────────────────────────────────────
    const prompt = buildCustomEvalPrompt({
      role:           role    ?? 'the role',
      experience:     experience ?? 'mid-level',
      companyType:    companyType ?? 'product company',
      candidateName:  candidateName ?? session.candidate_name,
      questionScores,
      sessionTitle:   session.title,
    });

    let evaluation;
    try {
      const raw = await withTimeout(
        callAIWithFallback(prompt, { temperature: 0.2, maxTokens: 2500 }),
        45000
      );
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
        console.error('[CustomEval] AI JSON parse failed — using fallback structure:', err.message);
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

    // ── Update custom_evaluations to completed ──────────────────────────
    await supabase
      .from('custom_evaluations')
      .update({
        scores,
        ai_evaluation:  evaluation,
        overall_score:  evaluation.overall_score ?? null,
        recommendation: evaluation.recommendation ?? null,
        status:        'completed',
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id);

    // ── Persist to candidate_evaluations (for History + quota counting) ─
    const sub    = await getSubscription(userId);
    const planId = sub?.plan_id ?? 'free';

    await supabase.from('candidate_evaluations').insert({
      user_id:         userId,
      kit_id:          `custom_${id}`,
      candidate_name:  candidateName ?? session.candidate_name ?? null,
      role:            role ?? 'Custom Evaluation',
      experience:      experience ?? 'unspecified',
      company_type:    companyType ?? 'unspecified',
      question_scores: questionScores,
      overall_score:   evaluation.overall_score ?? null,
      recommendation:  evaluation.recommendation ?? null,
      ai_evaluation:   evaluation,
      plan_id:         planId,
      source:          'custom_questions',              // tracks custom vs kit
      interview_date:  new Date().toISOString().split('T')[0],
    });

    // ── Mirror to analysis_reports (for /history page) ─────────────────
    const candidate = candidateName ?? session.candidate_name ?? 'Unnamed';
    await supabase.from('analysis_reports').insert([{
      user_id:    userId,
      input_text: `Custom Evaluation: ${candidate} — ${session.title}`,
      bias_score: evaluation.overall_score || 0,
      risk_level: 'low',
      categories: {
        analysis_type:    'evaluation',
        evaluation_data:  evaluation,
        role:             role ?? '',
        candidate_name:   candidate,
        custom_eval_id:   id,
        source:           'custom_questions',
      },
      created_at: new Date().toISOString(),
    }]);

    // ── Increment analyses_used ──────────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage        = await getUsage(userId);
    await supabase
      .from('usage')
      .update({
        analyses_used: (usage.analyses_used ?? 0) + 1,
        updated_at:       new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('month',   currentMonth);

    return res.json({ evaluation });
  } catch (err) {
    console.error('[CustomEval] submitScores error:', err.message);
    const fs = require('fs');
    const log = `\n[${new Date().toISOString()}] CUSTOM-EVAL SUBMIT ERROR: ${err.message}\nStack: ${err.stack}\n`;
    try { fs.appendFileSync('error_logs.txt', log); } catch (e) {}
    return res.status(500).json({ error: 'Evaluation failed', message: err.message });
  }
};

const getSession = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    const { data: session, error } = await supabase
      .from('custom_evaluations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Evaluation session not found' });
    }

    return res.json({ session });
  } catch (err) {
    console.error('[CustomEval] getSession error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createSession, submitScores, getSession };
