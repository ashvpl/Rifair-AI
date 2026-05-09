const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('kit_audits').select('*').order('created_at', { ascending: false }).limit(1);
  console.log('Last audit:', data);
  console.log('Error:', error);
}
check();
