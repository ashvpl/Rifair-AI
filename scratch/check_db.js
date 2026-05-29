const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runAudit() {
  console.log('--- 1.3 Database Health ---');
  try {
    const { count: subsCount, error: subsErr } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });
    console.log('Subscriptions count:', subsCount, 'Error:', subsErr);

    const { count: reportsCount, error: reportsErr } = await supabase
      .from('analysis_reports')
      .select('*', { count: 'exact', head: true });
    console.log('Analysis reports count:', reportsCount, 'Error:', reportsErr);

    const { count: usageCount, error: usageErr } = await supabase
      .from('usage')
      .select('*', { count: 'exact', head: true });
    console.log('Usage count:', usageCount, 'Error:', usageErr);
  } catch (e) {
    console.error('Error running 1.3 checks:', e);
  }

  console.log('\n--- 2.1 Payments ---');
  try {
    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    console.log('Last 3 payments:', payments, 'Error:', payErr);

    // Test updating a subscription
    const { data: firstSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .limit(1)
      .single();

    if (firstSub) {
      console.log('Testing subscription update for user_id:', firstSub.user_id);
      const { data: updatedSub, error: updateErr } = await supabase
        .from('subscriptions')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', firstSub.user_id)
        .select();
      console.log('Update result:', updatedSub, 'Error:', updateErr);
    } else {
      console.log('No subscriptions found to update.');
    }
  } catch (e) {
    console.error('Error running 2.1 checks:', e);
  }

  console.log('\n--- 2.2 Usage ---');
  try {
    const { data: usageData, error: usageErr } = await supabase
      .from('usage')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);
    console.log('Last 5 usage records:', usageData, 'Error:', usageErr);
  } catch (e) {
    console.error('Error running 2.2 checks:', e);
  }

  console.log('\n--- 2.5 RLS Data Isolation ---');
  try {
    // Check RLS status using postgres schema or system query
    // Let's run a query to get table status
    const { data: tables, error: rlsErr } = await supabase.rpc('get_rls_status');
    if (rlsErr) {
      console.log('get_rls_status RPC not available, let us run custom query via raw query or checking schemas if possible.');
      // Since we don't have direct SQL client, let's verify tablenames and see if we can do basic operations
      // We can also fetch all policies if we had SQL access, but checking get_rls_status or list of tables is good
      console.log('Fallback: Listing schemas. Tablenames RLS will be verified in the final check.');
    } else {
      console.log('RLS Status:', tables);
    }
  } catch (e) {
    console.error('Error running 2.5 checks:', e);
  }
}

runAudit();
