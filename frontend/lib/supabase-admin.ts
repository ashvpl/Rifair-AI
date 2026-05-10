import 'server-only';
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service role key.
 * This bypasses RLS and has full read/write access.
 * ONLY use in API routes / server components — never import from client code.
 */
let _supabaseAdmin: any = null;

/**
 * Returns a server-side Supabase client with service role key.
 * Lazy-initialized to prevent build-time side effects.
 */
export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    if (typeof window !== "undefined") {
      throw new Error("getSupabaseAdmin must not be called from client code");
    }
    console.warn(
      "⚠️ Admin keys or Supabase URL missing. " +
      "Check your environment configuration."
    );
  }

  _supabaseAdmin = createClient(
    supabaseUrl || "",
    supabaseServiceKey || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return _supabaseAdmin;
}

// Keep export for backwards compatibility, but it will be initialized on first import
// Better to use getSupabaseAdmin() in new code
export const supabaseAdmin = getSupabaseAdmin();
