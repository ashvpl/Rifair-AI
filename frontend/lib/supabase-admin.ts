import 'server-only';
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service role key.
 * This bypasses RLS and has full read/write access.
 * ONLY use in API routes / server components — never import from client code.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  if (typeof window !== "undefined") {
    throw new Error("supabase-admin.ts must not be imported from client code");
  }
  console.warn(
    "⚠️ Admin keys or Supabase URL missing. " +
    "Check your environment configuration."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
