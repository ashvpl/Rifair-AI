const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key";

if (supabaseUrl === "https://placeholder.supabase.co" || supabaseKey === "placeholder-key") {
  console.error("🚨 CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing! Using placeholders, but database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };

