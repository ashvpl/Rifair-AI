import { supabaseAdmin } from '../supabase-admin';

export async function logRewrite(userId: string, evalId: string, questionIndex: number) {
  // Insert log
  const { error: insertError } = await supabaseAdmin
    .from('rewrite_logs')
    .insert({
      user_id: userId,
      eval_id: evalId,
      question_index: questionIndex,
      created_at: new Date().toISOString()
    });

  if (insertError) {
    console.error("Failed to log rewrite (table might be missing):", insertError);
    return; // Don't block the user
  }

  // Check for patterns
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { count: rewriteCount, error: countError } = await supabaseAdmin
    .from('rewrite_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo);

  if (!countError && rewriteCount && rewriteCount > 50) {
    console.warn(`[ABUSE ALERT] User ${userId} has performed ${rewriteCount} rewrites in 24h.`);
    
    // Optional: soft flag account for review
    const { error: flagError } = await supabaseAdmin.from('user_flags').insert({
      user_id: userId,
      reason: 'excessive_rewrites',
      count: rewriteCount
    });
    if (flagError) {
      console.error("Failed to insert user_flag:", flagError);
    }
  }
}
