'use strict';

/**
 * kitAuditController.js
 *
 * POST /api/kit-audit            → createAudit
 *   Accepts user's existing interview questions, runs batch bias detection
 *   (and structural analysis for paid users), persists result, returns report.
 *
 * GET  /api/kit-audit/:id        → getAudit
 *   Returns a saved audit report (plan-gates paid fields).
 *
 * POST /api/kit-audit/:id/rewrite → rewriteQuestion
 *   Generates an AI rewrite for a single flagged question (paid users only).
 */

const { supabase }                  = require('../config/supabase');
const { getSubscription }           = require('../services/subscriptionService');
const { getUsage, incrementUsage }  = require('../services/usageService');
const { callAIWithFallback }        = require('../ai/universalCaller');
const { runUnifiedPipeline }        = require('../utils/pipeline');
const { withTimeout }               = require('../utils/helpers');
const { parseJSON }                 = require('../utils/parseJSON');
const {
  buildKitAuditBiasPrompt,
  buildKitStructuralPrompt,
  buildKitAuditRewritePrompt,
} = require('../prompts/kitAuditPrompts');

// ── Constants ────────────────────────────────────────────────────────────────

// Max questions allowed per audit, keyed by plan
const AUDIT_Q_LIMITS = {
  free:       5,
  lite:       5,
  starter:    20,
  growth:     20,
  enterprise: 50,
};

// Max audit runs per month (consumes 1 analyses_used credit per run)
const AUDIT_MONTHLY_LIMITS = {
  free:       3,
  lite:       5,
  starter:    20,
  growth:     80,
  enterprise: null,
};

// Plans that unlock structural analysis and AI rewrites
const PAID_PLANS = new Set(['starter', 'growth', 'enterprise']);

const MIN_Q_LENGTH = 10;
const MAX_Q_LENGTH = 1000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * runBatchBiasCheck
 *
 * Same two-layer approach as customEvalController.js:
 *  Layer 1: Deterministic pipeline (content safety — catches sexual/profane content)
 *  Layer 2: AI batch analysis (richer, contextual bias detection)
 * 
 * Content safety flags from Layer 1 are ABSOLUTE — AI cannot override them.
 */
async function runBatchBiasCheck(questions, role = '') {
  // ── Layer 1: Deterministic content safety (always runs in parallel) ─────────
  const safetyResults = await Promise.allSettled(
    questions.map(q =>
      withTimeout(runUnifiedPipeline(q, 'deterministic', {}), 4000)
    )
  );

  const safetyScores = safetyResults.map(r => {
    if (r.status === 'rejected') return { score: 0, tags: [], oneLiner: '', explanation: '' };
    const res       = r.value;
    const pipelineQ = res.questions?.[0] ?? {};
    return {
      score:       res.overall_bias_score ?? 0,
      tags:        (pipelineQ.bias_types ?? []).map(t => String(t).toLowerCase()),
      oneLiner:    pipelineQ.explanation ? String(pipelineQ.explanation).split('.')[0].trim() : '',
      explanation: pipelineQ.explanation ?? '',
    };
  });

  // ── Layer 2: AI batch bias analysis ─────────────────────────────────────────
  let aiResults = null;
  try {
    const prompt = buildKitAuditBiasPrompt(questions, role);
    const raw    = await withTimeout(
      callAIWithFallback(prompt, { temperature: 0.15, maxTokens: 3000 }),
      25000
    );
    const parsed = parseJSON(raw);

    if (Array.isArray(parsed) && parsed.length === questions.length) {
      aiResults = parsed;
      console.log('[KitAudit] ✓ AI bias analysis complete for', questions.length, 'questions');
    } else {
      console.warn('[KitAudit] AI returned unexpected array length — using deterministic fallback');
    }
  } catch (err) {
    console.warn('[KitAudit] AI bias call failed, using deterministic fallback:', err.message);
  }

  // ── Merge layers ─────────────────────────────────────────────────────────────
  return questions.map((_, i) => {
    const safety = safetyScores[i];

    // Content-safety flags are absolute — never override
    const hasContentSafetyFlag = safety.tags.some(t =>
      ['inappropriate_content', 'sexual_content', 'sexual_harassment', 'profanity', 'threatening_content'].includes(t)
    );

    if (hasContentSafetyFlag) {
      return {
        bias_score:  100,
        score:       100,
        tags:        safety.tags,
        severity:    'SEVERE',
        oneLiner:    safety.oneLiner || 'Inappropriate or harmful content detected',
        explanation: safety.explanation || 'This question contains inappropriate content and cannot be used.',
        type:        'behavioral',
        competency:  'General',
      };
    }

    if (aiResults) {
      const ai = aiResults[i] ?? {};
      const aiScore    = Number(ai.bias_score) || 0;
      const finalScore = Math.max(aiScore, safety.score);
      const allTags    = Array.from(new Set([
        ...(ai.tags ?? []).map(t => String(t).toLowerCase()),
        ...safety.tags,
      ]));

      return {
        bias_score:  finalScore,
        score:       finalScore,
        tags:        allTags,
        severity:    ai.severity ?? (finalScore > 75 ? 'SEVERE' : finalScore > 50 ? 'MODERATE' : finalScore > 20 ? 'MILD' : 'NONE'),
        oneLiner:    ai.oneLiner     || safety.oneLiner    || '',
        explanation: ai.explanation  || safety.explanation || '',
        type:        ai.type         || 'behavioral',
        competency:  ai.competency   || 'General',
      };
    }

    // Pure deterministic fallback
    return {
      bias_score:  safety.score,
      score:       safety.score,
      tags:        safety.tags,
      severity:    safety.score > 75 ? 'SEVERE' : safety.score > 50 ? 'MODERATE' : safety.score > 20 ? 'MILD' : 'NONE',
      oneLiner:    safety.oneLiner    || '',
      explanation: safety.explanation || '',
      type:        'behavioral',
      competency:  'General',
    };
  });
}

/**
 * runStructuralAnalysis
 *
 * Single AI call to analyse the kit's competency coverage, redundancy, and type balance.
 * Only called for paid plans (starter+) with ≥3 questions.
 */
async function runStructuralAnalysis(questions, biasBreakdown, role = '') {
  const biasScores = biasBreakdown.map(b => b.bias_score ?? b.score ?? 0);

  try {
    const prompt = buildKitStructuralPrompt(questions, biasScores, role);
    const raw    = await withTimeout(
      callAIWithFallback(prompt, { temperature: 0.2, maxTokens: 2000 }),
      25000
    );
    const parsed = parseJSON(raw);
    console.log('[KitAudit] ✓ Structural analysis complete');
    return parsed;
  } catch (err) {
    console.warn('[KitAudit] Structural analysis failed:', err.message);
    // Return a minimal valid structure so the response doesn't break
    return {
      competencyGaps:     [],
      redundancyFlags:    [],
      typeDistribution:   {},
      typeBalanceScore:   50,
      suggestedAdditions: [],
      overallStructureScore: 50,
      recommendations:    ['Structural analysis was unavailable. Please try again.'],
    };
  }
}

// ── Controller: createAudit ──────────────────────────────────────────────────

const createAudit = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // ── Validate body ────────────────────────────────────────────────────────
    const { title, questions: rawQuestions, source = 'paste', role = '' } = req.body;

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    // Normalise + filter questions
    const questionTexts = rawQuestions
      .map(q => (typeof q === 'string' ? q : q?.text ?? '').trim())
      .filter(q => q.length >= MIN_Q_LENGTH && q.length <= MAX_Q_LENGTH);

    if (questionTexts.length === 0) {
      return res.status(400).json({
        error: `Each question must be between ${MIN_Q_LENGTH} and ${MAX_Q_LENGTH} characters`,
      });
    }

    // ── Plan + quota check ───────────────────────────────────────────────────
    const [sub, usage] = await Promise.all([
      getSubscription(userId),
      getUsage(userId),
    ]);
    const planId   = sub?.plan_id ?? 'free';
    const isPaid   = PAID_PLANS.has(planId);

    // Question count limit
    const qLimit = AUDIT_Q_LIMITS[planId] ?? 5;
    if (questionTexts.length > qLimit) {
      return res.status(403).json({
        error:        'AUDIT_LIMIT_EXCEEDED',
        message:      `Your ${planId} plan allows ${qLimit} questions per audit. You submitted ${questionTexts.length}.`,
        allowed:      qLimit,
        currentCount: questionTexts.length,
        planId,
        upgradeUrl:   '/pricing?reason=audit_limit',
      });
    }

    // Monthly audit run limit (via analyses_used)
    const monthlyLimit = AUDIT_MONTHLY_LIMITS[planId];
    if (monthlyLimit !== null) {
      const analysesUsed = usage?.analyses_used ?? 0;
      if (analysesUsed >= monthlyLimit) {
        return res.status(403).json({
          error:      'ANALYSIS_LIMIT_EXCEEDED',
          message:    `You've used all ${monthlyLimit} monthly audits on the ${planId} plan.`,
          planId,
          upgradeUrl: '/pricing?reason=analysis_limit',
        });
      }
    }

    // ── Step 1: Batch bias detection (AI call #1) ────────────────────────────
    const biasBreakdown = await runBatchBiasCheck(questionTexts, role);

    // ── Step 1b: Content safety gate ────────────────────────────────────────
    const unsafeQuestions = biasBreakdown
      .map((b, i) => ({ ...b, index: i, text: questionTexts[i] }))
      .filter(b => b.tags.includes('inappropriate_content') ||
                   b.tags.includes('sexual_content')        ||
                   b.tags.includes('sexual_harassment')     ||
                   b.tags.includes('profanity')             ||
                   b.tags.includes('threatening_content'));

    if (unsafeQuestions.length > 0) {
      return res.status(400).json({
        error:   'inappropriate_content',
        message: `${unsafeQuestions.length} question(s) contain inappropriate content and cannot be audited. Please remove them.`,
        flaggedQuestions: unsafeQuestions.map(q => ({
          index:    q.index + 1,
          text:     q.text,
          reason:   q.tags.filter(t => t !== 'inappropriate_content').join(', '),
          oneLiner: q.oneLiner,
        })),
      });
    }

    // ── Step 2: Overall bias score ───────────────────────────────────────────
    const overallBiasScore = Math.round(
      biasBreakdown.reduce((sum, b) => sum + (b.bias_score ?? b.score ?? 0), 0) / biasBreakdown.length
    );

    // ── Step 3: Structural analysis (paid, ≥3 questions, AI call #2) ─────────
    let structuralData = null;
    if (isPaid && questionTexts.length >= 3) {
      structuralData = await runStructuralAnalysis(questionTexts, biasBreakdown, role);
    }

    // ── Step 4: Persist to kit_audits ────────────────────────────────────────
    const auditTitle = title?.trim() || `Kit Audit — ${new Date().toLocaleDateString('en-IN')}`;

    const { data: audit, error: insertError } = await supabase
      .from('kit_audits')
      .insert({
        user_id:            userId,
        title:              auditTitle,
        source,
        original_questions: questionTexts,
        question_count:     questionTexts.length,
        bias_breakdown:     biasBreakdown,
        overall_bias_score: overallBiasScore,
        competency_gaps:    structuralData?.competencyGaps    ?? [],
        redundancy_flags:   structuralData?.redundancyFlags   ?? [],
        type_distribution:  structuralData?.typeDistribution  ?? {},
        suggested_additions: structuralData?.suggestedAdditions ?? [],
        structural_analysis: structuralData ?? {},
        plan_tier:          planId,
        status:             'completed',
        structural_analysis: { ...(structuralData || {}), role: role || '' },
      })
      .select('id, title, created_at, structural_analysis')
      .single();

    if (insertError) {
      console.error('[KitAudit] DB insert error:', insertError.message);
      return res.status(500).json({ error: 'Failed to save audit report' });
    }

    // ── Step 5: Mirror to analysis_reports (for History page) ────────────────
    await supabase.from('analysis_reports').insert([{
      user_id:    userId,
      input_text: `Kit Audit: ${auditTitle}`,
      bias_score: overallBiasScore,
      risk_level: overallBiasScore > 70 ? 'high' : overallBiasScore > 40 ? 'medium' : 'low',
      categories: {
        analysis_type: 'kit_audit',
        audit_id:      audit.id,
        question_count: questionTexts.length,
        flagged_count:  biasBreakdown.filter(b => (b.bias_score ?? b.score ?? 0) > 50).length,
        plan_tier:      planId,
      },
      created_at: new Date().toISOString(),
    }]);

    // ── Usage increment (atomic) ──────────────────────────────────────────────
    // Consumes 1 'analyses_used' credit per audit run.
    if (userId !== "anonymous") {
      try {
        await incrementUsage(userId, 'analyses_used');
      } catch (usageErr) {
        console.error('[USAGE INCREMENT FATAL ERROR (audit)]', usageErr);
      }
    }

    // ── Step 7: Respond ───────────────────────────────────────────────────────
    const flaggedCount = biasBreakdown.filter(b => (b.bias_score ?? b.score ?? 0) > 50).length;

    return res.json({
      id:             audit.id,
      title:          audit.title,
      role:           role || '',
      createdAt:      audit.created_at,
      overallScore:   overallBiasScore,
      questionCount:  questionTexts.length,
      flaggedCount,
      questions:      questionTexts,
      biasBreakdown,
      // Paid-only fields — never leak to free users
      structuralAnalysis: isPaid ? structuralData : null,
      competencyGaps:     isPaid ? structuralData?.competencyGaps    : null,
      redundancyFlags:    isPaid ? structuralData?.redundancyFlags   : null,
      typeDistribution:   structuralData?.typeDistribution ?? {},     // teaser for all
      suggestedAdditions: isPaid ? structuralData?.suggestedAdditions : null,
      planTier:           planId,
    });
  } catch (err) {
    console.error('[KitAudit] createAudit error:', err.message);
    return res.status(500).json({ error: 'Audit failed', message: err.message });
  }
};

// ── Controller: getAudit ─────────────────────────────────────────────────────

const getAudit = async (req, res) => {
  try {
    const userId  = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Audit ID required' });

    const { data: audit, error } = await supabase
      .from('kit_audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)   // ownership check
      .single();

    if (error || !audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const isPaid = PAID_PLANS.has(audit.plan_tier);

    return res.json({
      id:               audit.id,
      title:            audit.title,
      role:             audit.structural_analysis?.role || '',
      createdAt:        audit.created_at,
      overallScore:     audit.overall_bias_score,
      questionCount:    audit.question_count,
      questions:        audit.original_questions,
      biasBreakdown:    audit.bias_breakdown,
      typeDistribution: audit.type_distribution,  // teaser for all
      // Paid-only
      structuralAnalysis: isPaid ? audit.structural_analysis : null,
      competencyGaps:     isPaid ? audit.competency_gaps     : null,
      redundancyFlags:    isPaid ? audit.redundancy_flags    : null,
      suggestedAdditions: isPaid ? audit.suggested_additions : null,
      planTier:           audit.plan_tier,
    });
  } catch (err) {
    console.error('[KitAudit] getAudit error:', err.message);
    return res.status(500).json({ error: 'Failed to load audit' });
  }
};

// ── Controller: rewriteQuestion ──────────────────────────────────────────────

const rewriteQuestion = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id }                                    = req.params;
    const { questionIndex, previousRewrites = [], role = '' } = req.body;

    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ error: 'Valid questionIndex is required' });
    }

    // ── Load and verify audit ownership ─────────────────────────────────────
    const { data: audit, error: fetchErr } = await supabase
      .from('kit_audits')
      .select('user_id, plan_tier, original_questions, bias_breakdown')
      .eq('id', id)
      .single();

    if (fetchErr || !audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    if (audit.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // ── Plan gate ────────────────────────────────────────────────────────────
    if (!PAID_PLANS.has(audit.plan_tier)) {
      return res.status(403).json({
        error:      'REQUIRES_UPGRADE',
        message:    'AI rewrites require Starter or Growth plan.',
        upgradeUrl: '/pricing?reason=audit_rewrite',
      });
    }

    const originalQuestion = audit.original_questions[questionIndex];
    const biasInfo         = audit.bias_breakdown[questionIndex];

    if (!originalQuestion) {
      return res.status(400).json({ error: `No question at index ${questionIndex}` });
    }

    // ── Rate limit: max 3 rewrites per question per hour ─────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('kit_audit_rewrites')
      .select('*', { count: 'exact', head: true })
      .eq('audit_id',       id)
      .eq('question_index', questionIndex)
      .gte('created_at',    oneHourAgo);

    if (count !== null && count >= 3) {
      return res.status(429).json({
        error:   'RATE_LIMITED',
        message: 'Maximum 3 rewrites per question per hour. Please wait a moment.',
      });
    }

    // ── Generate rewrite ─────────────────────────────────────────────────────
    const prompt = buildKitAuditRewritePrompt(
      originalQuestion,
      biasInfo ?? {},
      Array.isArray(previousRewrites) ? previousRewrites : [],
      role
    );

    let rewriteData;
    try {
      const raw    = await withTimeout(
        callAIWithFallback(prompt, { temperature: 0.4, maxTokens: 600 }),
        20000
      );
      rewriteData = parseJSON(raw);
    } catch (err) {
      if (err.message === 'ALL_KEYS_EXHAUSTED') {
        return res.status(503).json({
          error:   'api_quota_exceeded',
          message: 'AI quota reached. Please try again in ~1 hour.',
        });
      }
      return res.status(500).json({ error: 'Failed to generate rewrite', message: err.message });
    }

    if (!rewriteData?.rewrite) {
      return res.status(500).json({ error: 'AI returned an invalid rewrite. Please try again.' });
    }

    // ── Log rewrite ──────────────────────────────────────────────────────────
    await supabase.from('kit_audit_rewrites').insert({
      audit_id:       id,
      question_index: questionIndex,
      original_text:  originalQuestion,
      rewritten_text: rewriteData.rewrite,
      user_id:        userId,
    });

    return res.json({
      rewrite:         rewriteData.rewrite,
      competency:      rewriteData.competency      ?? biasInfo?.competency ?? 'General',
      type:            rewriteData.type            ?? biasInfo?.type       ?? 'behavioral',
      changeRationale: rewriteData.changeRationale ?? '',
      questionIndex,
    });
  } catch (err) {
    console.error('[KitAudit] rewriteQuestion error:', err.message);
    return res.status(500).json({ error: 'Rewrite failed', message: err.message });
  }
};

// ── Controller: updateAudit ──────────────────────────────────────────────────

const updateAudit = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    const { data: audit, error: fetchErr } = await supabase
      .from('kit_audits')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !audit) return res.status(404).json({ error: 'Audit not found' });
    if (audit.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { error: updateErr } = await supabase
      .from('kit_audits')
      .update({ original_questions: questions })
      .eq('id', id);

    if (updateErr) throw updateErr;

    return res.json({ success: true });
  } catch (err) {
    console.error('[KitAudit] updateAudit error:', err.message);
    return res.status(500).json({ error: 'Update failed' });
  }
};

module.exports = { createAudit, getAudit, rewriteQuestion, updateAudit };
