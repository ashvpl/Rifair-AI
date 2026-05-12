'use client';

/**
 * useBackendToken — Centralized Client-Side Auth Token Hook
 *
 * ALL client-side backend token retrieval must go through this hook.
 * No component or page should call getToken() directly.
 *
 * Features:
 * - Guards against Clerk hydration races (checks isLoaded + isSignedIn first)
 * - Tries the 'backend' JWT template, falls back to default session token
 * - Structured [AUTH TOKEN] logging for production observability
 * - Returns a stable getAuthToken() function safe to call in effects/handlers
 * - Never throws; always returns string | null
 */

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UseBackendTokenResult {
  /**
   * Call this inside useEffect or event handlers to get a valid backend token.
   * Returns null if Clerk is not yet loaded, user is not signed in,
   * or token retrieval fails for any reason.
   */
  getAuthToken: () => Promise<string | null>;

  /**
   * True once Clerk has finished loading and we know the auth state.
   * Use this to gate UI that depends on auth — do not attempt token
   * retrieval until isReady is true.
   */
  isReady: boolean;

  /**
   * True if the user is currently signed in according to Clerk.
   */
  isSignedIn: boolean;
}

export function useBackendToken(): UseBackendTokenResult {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    // ── Guard 1: Clerk must be fully loaded ──────────────────────────────
    if (!isLoaded) {
      console.log('[AUTH TOKEN] Skipped — Clerk not yet loaded');
      return null;
    }

    // ── Guard 2: User must be signed in ─────────────────────────────────
    if (!isSignedIn) {
      console.log('[AUTH TOKEN] Skipped — user not signed in');
      return null;
    }

    // ── Attempt 1: 'backend' JWT template ───────────────────────────────
    try {
      const templateToken = await getToken({ template: 'backend' });
      if (templateToken) {
        console.log('[AUTH TOKEN] Retrieved via "backend" template');
        return templateToken;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[AUTH TOKEN] Template "backend" failed:', msg);
    }

    // ── Attempt 2: Default session token fallback ────────────────────────
    console.log('[AUTH TOKEN] Falling back to default session token...');
    try {
      const defaultToken = await getToken();
      if (defaultToken) {
        console.log('[AUTH TOKEN] Retrieved via default session token (fallback)');
        return defaultToken;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[AUTH TOKEN] Default session token also failed:', msg);
    }

    // ── Total failure ────────────────────────────────────────────────────
    console.error(
      '[AUTH TOKEN] CRITICAL: Failed to retrieve any token. ' +
      'isLoaded=true, isSignedIn=true — possible session expiry or Clerk misconfiguration.'
    );
    return null;
  }, [isLoaded, isSignedIn, getToken]);

  return {
    getAuthToken,
    isReady: isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}
