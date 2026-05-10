
import { ProviderRouter, type AICallOptions } from './router/providerRouter';
import { AI_ERRORS, SAFE_ERROR_MESSAGES } from '../../constants/errors';

// ─── Re-export options type for callers ──────────────────────────────────────

export type { AICallOptions };

// ─── Safe Error Response ─────────────────────────────────────────────────────

export interface SafeAIError {
  code: string;
  message: string;
}

function toSafeError(err: unknown): SafeAIError {
  const code = err instanceof Error ? err.message : AI_ERRORS.AI_UNAVAILABLE;
  const message = SAFE_ERROR_MESSAGES[code] ?? SAFE_ERROR_MESSAGES[AI_ERRORS.AI_UNAVAILABLE];
  return { code, message };
}

// ─── AI Gateway ──────────────────────────────────────────────────────────────

/**
 * AI Gateway — Unified Backend Interface
 *
 * ALL AI calls in the backend MUST go through this class.
 * It delegates to the ProviderRouter which handles:
 *   - Provider chain: GROQ_PRIMARY → GROQ_SECONDARY → GROQ_TERTIARY → GEMINI_PRIMARY → GEMINI_SECONDARY
 *   - AbortController timeouts
 *   - Health tracking & circuit breaking
 *   - Rate-limit & auth-error cooldowns
 *
 * This class adds:
 *   - Safe error mapping (never exposes provider internals to callers)
 *   - Consistent return shape
 *
 * SECURITY: `import 'server-only'` prevents this file from ever
 * being bundled into a browser/client build.
 */
export class AIGateway {
  /**
   * Primary call interface — throws a sanitised error code on failure.
   * Callers should catch and map to safe HTTP responses.
   */
  static async call(prompt: string, options: AICallOptions = {}): Promise<string> {
    try {
      return await ProviderRouter.call(prompt, options);
    } catch (err: unknown) {
      const safeErr = toSafeError(err);
      // Re-throw the code so route handlers can map to HTTP status
      throw new Error(safeErr.code);
    }
  }

  /**
   * Result-wrapped call — never throws; returns { success, data } | { success, error }.
   * Use in route handlers where you want inline error handling.
   */
  static async callSafe(
    prompt: string,
    options: AICallOptions = {}
  ): Promise<{ success: true; data: string } | { success: false; error: SafeAIError }> {
    try {
      const data = await ProviderRouter.call(prompt, options);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: toSafeError(err) };
    }
  }

  /** Internal health summary — never expose to clients */
  static getHealthSummary(): Record<string, object> {
    return ProviderRouter.getHealthSummary();
  }
}

export default AIGateway;
