"use strict";
/**
 * Shared Error Constants — Single Source of Truth
 *
 * Used by both backend (Express routes) and frontend (client error handling).
 * Never send raw SDK errors, provider names, or stack traces to the client —
 * always map to one of these constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAFE_ERROR_MESSAGES = exports.PLAN_ERRORS = exports.AUTH_ERRORS = exports.AI_ERRORS = void 0;
exports.AI_ERRORS = {
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
};
exports.AUTH_ERRORS = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
};
exports.PLAN_ERRORS = {
    PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
    UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
};
/** Safe user-facing messages — never include internal details */
exports.SAFE_ERROR_MESSAGES = {
    [exports.AI_ERRORS.AI_UNAVAILABLE]: 'AI is temporarily unavailable. Please try again in a moment.',
    [exports.AI_ERRORS.PROVIDER_TIMEOUT]: 'The AI request timed out. Please try again.',
    [exports.AI_ERRORS.RATE_LIMITED]: 'You have reached the request limit. Please wait a moment.',
    [exports.AI_ERRORS.INVALID_PROVIDER_RESPONSE]: 'Received an unexpected response. Please try again.',
    [exports.AI_ERRORS.INVALID_REQUEST]: 'Your request could not be processed. Please check your input.',
    [exports.AUTH_ERRORS.UNAUTHORIZED]: 'Authentication required.',
    [exports.AUTH_ERRORS.FORBIDDEN]: 'You do not have permission to perform this action.',
    [exports.PLAN_ERRORS.PLAN_LIMIT_REACHED]: 'You have reached your plan limit.',
    [exports.PLAN_ERRORS.UPGRADE_REQUIRED]: 'This feature requires a plan upgrade.',
};
