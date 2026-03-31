import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "./env";

const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === "undefined") {
    console.warn("Supabase credentials missing. Check your environment variables.");
  }
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
