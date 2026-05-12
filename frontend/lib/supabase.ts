import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "./env";

const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === "undefined") {
    console.warn("Supabase credentials missing. Check your environment variables.");
  }
}

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || (!supabaseUrl && !supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
    }
  }
);
