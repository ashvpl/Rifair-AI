import { auth } from '@clerk/nextjs/server';

/**
 * getBackendToken — Centralized Server-Side Auth Token Utility
 *
 * ALL server-side backend token retrieval must go through this function.
 * No API route should call auth() / getToken() directly.
 *
 * Strategy (in priority order):
 * 1. If the caller provides an incomingToken (forwarded from the client's
 *    Authorization header), use it immediately — skips server-side re-generation
 *    and eliminates the dual-retrieval failure point.
 * 2. Fall back to server-side auth() retrieval: tries the 'backend' JWT
 *    template first, then the default session token.
 *
 * @param context    Short string identifying the calling route for logs (e.g. "ANALYZE")
 * @param incomingToken  Optional: the raw token from the client's Authorization header.
 *                   Extract with: req.headers.get('authorization')?.replace('Bearer ', '') ?? null
 */
export async function getBackendToken(
  context: string,
  incomingToken?: string | null,
): Promise<string | null> {
  // ── Stage 1: Use forwarded client token if available ──────────────────
  // This eliminates the double-retrieval failure: if the client already
  // obtained a valid token, we trust and forward it without re-generating.
  if (incomingToken && incomingToken.trim().length > 0) {
    console.log(`[AUTH SESSION] [${context}] Using forwarded client token (skipping server-side re-generation)`);
    return incomingToken.trim();
  }

  // ── Stage 2: Server-side generation (fallback) ────────────────────────
  console.log(`[AUTH SESSION] [${context}] No forwarded token — attempting server-side auth()`);

  try {
    // Validate environment — misconfigured keys will cause silent failures
    if (!process.env.CLERK_SECRET_KEY) {
      console.error(`[AUTH SESSION] [${context}] CRITICAL: CLERK_SECRET_KEY is missing from environment`);
    }

    const authData = await auth();
    const { userId, getToken } = authData;

    if (!userId) {
      console.warn(`[AUTH SESSION] [${context}] No userId in server session — user not authenticated`);
      return null;
    }

    // ── Attempt 2a: 'backend' JWT template ────────────────────────────
    let token: string | null = null;
    try {
      token = await getToken({ template: 'backend' });
      if (token) {
        console.log(`[AUTH SESSION] [${context}] Server-side token via "backend" template — OK`);
        return token;
      }
    } catch (templateErr) {
      const msg = templateErr instanceof Error ? templateErr.message : String(templateErr);
      console.warn(`[AUTH SESSION] [${context}] Template "backend" failed server-side:`, msg);
    }

    // ── Attempt 2b: Default session token fallback ────────────────────
    console.log(`[AUTH SESSION] [${context}] Falling back to default session token...`);
    try {
      token = await getToken();
      if (token) {
        console.log(`[AUTH SESSION] [${context}] Server-side default session token — OK (fallback)`);
        return token;
      }
    } catch (defaultErr) {
      const msg = defaultErr instanceof Error ? defaultErr.message : String(defaultErr);
      console.warn(`[AUTH SESSION] [${context}] Default session token also failed:`, msg);
    }

    // ── Total failure ─────────────────────────────────────────────────
    console.error(
      `[AUTH SESSION] [${context}] CRITICAL: Failed to retrieve any token for userId=${userId}. ` +
      `Verify: (1) JWT template "backend" exists in Clerk Dashboard for this instance, ` +
      `(2) CLERK_SECRET_KEY matches the frontend publishable key's instance.`
    );
    return null;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH SESSION] [${context}] Unexpected error in getBackendToken:`, msg);
    return null;
  }
}

/**
 * Extracts the bearer token from an incoming Next.js Request's
 * Authorization header. Use this in every API route handler to
 * pass the client-provided token to getBackendToken().
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
