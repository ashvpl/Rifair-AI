import { Router, type Request, type Response } from 'express';
import 'server-only';
import { AIGateway } from '../core/ai/aiGateway';
import { analyzeBias } from '../core/ai/tasks/biasAnalysis';
import { regenerateQuestion } from '../core/ai/tasks/kitRegen';
import { rewriteQuestion } from '../core/ai/tasks/rewriteQuestion';
import { AI_ERRORS, SAFE_ERROR_MESSAGES } from '../../../shared/constants/errors';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps an error code to a safe HTTP response.
 * NEVER exposes provider names, stack traces, or raw SDK errors.
 */
function safeErrorResponse(res: Response, err: unknown): void {
  const code = err instanceof Error ? err.message : AI_ERRORS.AI_UNAVAILABLE;
  const message = SAFE_ERROR_MESSAGES[code] ?? SAFE_ERROR_MESSAGES[AI_ERRORS.AI_UNAVAILABLE];

  const status =
    code === AI_ERRORS.RATE_LIMITED     ? 429 :
    code === AI_ERRORS.INVALID_REQUEST  ? 400 :
    code === AI_ERRORS.PROVIDER_TIMEOUT ? 504 :
    500;

  res.status(status).json({ success: false, error: message });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/simulate
 * Bias simulation — generates biased variants of a neutral question.
 */
router.post('/simulate', async (req: Request, res: Response) => {
  const { neutral_question } = req.body as { neutral_question?: string };

  if (!neutral_question?.trim()) {
    return res.status(400).json({ success: false, error: 'neutral_question is required' });
  }

  const sysPrompt = `You are Rifair's Bias Simulator. The user provides a neutral professional interview question.
Generate 3 biased variations to demonstrate how bias sneaks in.
Each variation must target a different category (e.g. gender, age, cultural, work_life, tone).

Return strict JSON only:
{
  "original": "the neutral question",
  "variants": [
    { "biased_question": "...", "category": "gender", "explanation": "..." }
  ]
}`;

  const result = await AIGateway.callSafe(
    `${sysPrompt}\n\nUSER:\n${neutral_question}`,
    { temperature: 0.7, jsonMode: true }
  );

  if (!result.success) {
    console.error('[/simulate] AI unavailable');
    return safeErrorResponse(res, new Error(result.error.code));
  }

  try {
    res.json({ success: true, simulation: JSON.parse(result.data) });
  } catch {
    return safeErrorResponse(res, new Error(AI_ERRORS.INVALID_PROVIDER_RESPONSE));
  }
});

/**
 * POST /api/ai/analyze
 * Bias analysis gateway.
 */
router.post('/analyze', async (req: Request, res: Response) => {
  const { text, hints } = req.body as { text?: string; hints?: unknown };

  if (!text?.trim()) {
    return res.status(400).json({ success: false, error: 'text is required' });
  }

  try {
    const analysis = await analyzeBias(text, hints);
    res.json({ success: true, ...analysis });
  } catch (err: unknown) {
    console.error('[/analyze] Analysis failed');
    safeErrorResponse(res, err);
  }
});

/**
 * POST /api/ai/kit/regenerate-question
 * Kit question regeneration.
 */
router.post('/kit/regenerate-question', async (req: Request, res: Response) => {
  try {
    const result = await regenerateQuestion(req.body);
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('[/kit/regenerate-question] Regen failed');
    safeErrorResponse(res, err);
  }
});

/**
 * POST /api/ai/rewrite-question
 * Question rewrite gateway.
 */
router.post('/rewrite-question', async (req: Request, res: Response) => {
  try {
    const result = await rewriteQuestion(req.body);
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('[/rewrite-question] Rewrite failed');
    safeErrorResponse(res, err);
  }
});

/**
 * GET /api/ai/health
 * Internal health endpoint — returns provider status summary.
 * Must be protected by auth middleware in production.
 */
router.get('/health', (_req: Request, res: Response) => {
  const summary = AIGateway.getHealthSummary();
  res.json({ success: true, providers: summary });
});

export default router;
