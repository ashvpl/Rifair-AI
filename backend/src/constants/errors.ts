/**
 * Shared Error Constants — Single Source of Truth
 *
 * Used by both backend (Express routes) and frontend (client error handling).
 * Never send raw SDK errors, provider names, or stack traces to the client —
 * always map to one of these constants.
 */

export const AI_ERRORS = {
  /** All providers in the fallback chain failed or are unavailable */
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',

  /** A specific provider request timed out */
  PROVIDER_TIMEOUT: 'PROVIDER_TIMEOUT',

  /** Request was rate-limited (429) */
  RATE_LIMITED: 'RATE_LIMITED',

  /** Provider returned malformed or unparseable JSON */
  INVALID_PROVIDER_RESPONSE: 'INVALID_PROVIDER_RESPONSE',

  /** The request was rejected before reaching a provider (bad input) */
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const;

export type AIErrorCode = (typeof AI_ERRORS)[keyof typeof AI_ERRORS];

export const AUTH_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
} as const;

export const PLAN_ERRORS = {
  PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
} as const;

/** Safe user-facing messages — never include internal details */
export const SAFE_ERROR_MESSAGES: Record<string, string> = {
  [AI_ERRORS.AI_UNAVAILABLE]:            'AI is temporarily unavailable. Please try again in a moment.',
  [AI_ERRORS.PROVIDER_TIMEOUT]:          'The AI request timed out. Please try again.',
  [AI_ERRORS.RATE_LIMITED]:              'You have reached the request limit. Please wait a moment.',
  [AI_ERRORS.INVALID_PROVIDER_RESPONSE]: 'Received an unexpected response. Please try again.',
  [AI_ERRORS.INVALID_REQUEST]:           'Your request could not be processed. Please check your input.',
  [AUTH_ERRORS.UNAUTHORIZED]:            'Authentication required.',
  [AUTH_ERRORS.FORBIDDEN]:               'You do not have permission to perform this action.',
  [PLAN_ERRORS.PLAN_LIMIT_REACHED]:      'You have reached your plan limit.',
  [PLAN_ERRORS.UPGRADE_REQUIRED]:        'This feature requires a plan upgrade.',
};
