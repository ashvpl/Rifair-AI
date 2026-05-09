import { supabaseAdmin } from '../supabase-admin';

export async function checkRewriteLimit(
  userId: string,
  evalId: string,
  questionIndex: number
) {
  const now = new Date();
  
  // We use Supabase to check the number of rewrites in the last hour and day
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Get recent rewrites for the specific question
  const { count: questionCount, error: qError } = await supabaseAdmin
    .from('rewrite_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('eval_id', evalId)
    .eq('question_index', questionIndex)
    .gte('created_at', oneHourAgo);

  // Get recent rewrites for the whole session today
  const { count: sessionCount, error: sError } = await supabaseAdmin
    .from('rewrite_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('eval_id', evalId)
    .gte('created_at', oneDayAgo);

  // If table doesn't exist or fails, allow by default but log error
  if (qError || sError) {
    console.error("Rate limit check error (table might be missing):", qError || sError);
    return {
      allowed: true,
      questionRemaining: 5,
      sessionRemaining: 20,
      resetTime: now.getTime() + 60 * 60 * 1000
    };
  }

  const qRewrites = questionCount || 0;
  const sRewrites = sessionCount || 0;

  // Max 5 rewrites per question per hour
  const questionLimitSuccess = qRewrites < 5;
  // Max 20 rewrites per evaluation session per day
  const sessionLimitSuccess = sRewrites < 20;

  return {
    allowed: questionLimitSuccess && sessionLimitSuccess,
    questionRemaining: Math.max(0, 5 - qRewrites),
    sessionRemaining: Math.max(0, 20 - sRewrites),
    // Rough estimate for reset time (1 hr from now if question blocked, 24h if session blocked)
    resetTime: now.getTime() + (questionLimitSuccess ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000) 
  };
}
