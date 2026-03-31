/**
 * Server-side environment variables
 */
export const env = {
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5001",
  NODE_ENV: process.env.NODE_ENV || "development",
};

/**
 * Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
 */
export const publicEnv = {
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "/api",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
};

// Validation for production
if (process.env.NODE_ENV === "production") {
  if (!process.env.BACKEND_URL) {
    console.warn("⚠️ BACKEND_URL is not set in production!");
  }
}
