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

if (!BACKEND_URL || BACKEND_URL.includes("localhost")) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL ERROR: BACKEND_URL is missing or set to localhost in production.\n" +
      "This will cause all API calls to fail.\n" +
      "FIX: Add BACKEND_URL to your Vercel Project Settings > Environment Variables."
    );
  }
}
