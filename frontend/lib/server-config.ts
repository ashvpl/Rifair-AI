/**
 * SERVER-ONLY configuration for Next.js API proxy routes.
 * This is NOT imported by client-side code.
 *
 * Uses BACKEND_URL (no NEXT_PUBLIC_ prefix for security).
 * Falls back to NEXT_PUBLIC_BACKEND_URL for backwards compat.
 */

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5001";

if (!BACKEND_URL || BACKEND_URL === "http://localhost:5001") {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "❌ [server-config] BACKEND_URL is not set or is localhost in production! " +
      "Set BACKEND_URL in your Vercel environment variables to your Render backend URL."
    );
  }
}
