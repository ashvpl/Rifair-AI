/**
 * Centralized API configuration for Rifair AI.
 * This ensures consistency across all API calls and Vercel compatibility.
 * 
 * IMPORTANT: By default, we use a Next.js Proxy approach. 
 * Browser calls go to '/api/*', which Next.js resolves via app/api routes.
 * Server calls use the actual NEXT_PUBLIC_BACKEND_URL.
 */

const isBrowser = typeof window !== 'undefined';

// Use a relative path '/api' in the browser to hit the Next.js proxy routes.
// Proxying hides the real backend URL from the client and simplifies CORS.
// On the server (inside Next.js API routes), we use the absolute backend URL.
export const API_BASE_URL = 
  (isBrowser ? "/api" : process.env.NEXT_PUBLIC_BACKEND_URL) || 
  "http://localhost:5001";

if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_BACKEND_URL && !isBrowser) {
    console.error(
      "CRITICAL: NEXT_PUBLIC_BACKEND_URL is not defined in the production environment!\n" +
      "This will cause client-side and server-side fetches to fail.\n" +
      "FIX: In Vercel, go to Settings > Environment Variables and add NEXT_PUBLIC_BACKEND_URL."
    );
  }
}
