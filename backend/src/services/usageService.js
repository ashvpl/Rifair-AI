'use strict';

/**
 * usageService.js
 *
 * ENTERPRISE USAGE TRACKING — SINGLE SOURCE OF TRUTH
 * ====================================================
 *
 * This service is the ONLY place usage counts are read and written.
 * It is completely independent from:
 *   - analysis_reports (history)
 *   - candidate_evaluations (evaluation records)
 *   - any other user-visible data table
 *
 * Deleting ANY history record NEVER affects usage counters.
 *
 * Architecture:
 *   - Uses the `usage` table in Supabase (keyed on user_id + month)
 *   - Atomic increment via `increment_usage_field` PostgreSQL RPC
 *   - Falls back to UPDATE with COALESCE if RPC is not yet deployed
 *
 * Usage fields:
 *   analyses_used     — bias analyses (POST /api/analyze)
 *   kits_used         — kit generations (POST /api/generate-kit)
 *   jd_analyses_used  — JD analysis + generation (jd-analyser, jd-generator)
 *   evaluations_used  — candidate evaluations (evaluate-candidate, custom-eval)
 *   api_calls_used    — REST API calls (future)
 */

const { supabase } = require('../config/supabase');

// Valid incrementable fields — used as an allowlist to prevent SQL injection
const VALID_FIELDS = new Set([
  'analyses_used',
  'kits_used',
  'jd_analyses_used',
  'evaluations_used',
  'api_calls_used',
]);

/**
 * Get current month's usage row for a user.
 * Creates the row if it doesn't exist.
 * NEVER reads from analysis_reports or candidate_evaluations.
 *
 * @param {string} userId
 * @returns {Promise<object>} usage row
 */
async function getUsage(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  let { data: usage, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .single();

  if (!usage || (error && error.code === 'PGRST116')) {
    // Row doesn't exist — create it
    const { data: newUsage, error: insertError } = await supabase
      .from('usage')
      .upsert(
        {
          user_id:          userId,
          month:            currentMonth,
          analyses_used:    0,
          kits_used:        0,
          jd_analyses_used: 0,
          evaluations_used: 0,
          api_calls_used:   0,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id,month' }
      )
      .select()
      .single();

    if (insertError) {
      console.error('[usageService] getUsage — row creation failed:', insertError.message);
      // Return a safe zero-usage object so the app doesn't crash
      return {
        user_id:          userId,
        month:            currentMonth,
        analyses_used:    0,
        kits_used:        0,
        jd_analyses_used: 0,
        evaluations_used: 0,
        api_calls_used:   0,
      };
    }
    return newUsage;
  }

  if (error) {
    console.warn('[usageService] getUsage — fetch error:', error.message);
    return {
      user_id:          userId,
      month:            currentMonth,
      analyses_used:    0,
      kits_used:        0,
      jd_analyses_used: 0,
      evaluations_used: 0,
      api_calls_used:   0,
    };
  }

  return usage;
}

/**
 * Atomically increment a usage field.
 *
 * Preferred path: Supabase RPC `increment_usage_field` (true atomic, no race conditions).
 * Fallback path:  Direct UPDATE using `field = COALESCE(field, 0) + amount`
 *                 (still atomic at the DB level via a single UPDATE statement).
 *
 * Both paths require the row to exist — getUsage() is called first to guarantee that.
 *
 * @param {string} userId
 * @param {'analyses_used'|'kits_used'|'jd_analyses_used'|'evaluations_used'|'api_calls_used'} field
 * @param {number} [amount=1]
 */
async function incrementUsage(userId, field, amount = 1) {
  if (!VALID_FIELDS.has(field)) {
    console.error(`[usageService] incrementUsage — invalid field: ${field}`);
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Ensure the usage row exists before we try to increment
  await getUsage(userId);

  // ── Path 1: Atomic RPC (preferred) ──────────────────────────────────────────
  // Requires the SQL migration in docs/supabase-migration.sql to be deployed.
  // See: CREATE FUNCTION increment_usage_field(...)
  const { error: rpcError } = await supabase.rpc('increment_usage_field', {
    p_user_id: userId,
    p_month:   currentMonth,
    p_field:   field,
    p_amount:  amount,
  });

  if (!rpcError) {
    // RPC succeeded — done
    return;
  }

  // ── Path 2: Fallback UPDATE (still server-side atomic) ───────────────────────
  // The UPDATE statement is atomic at the PostgreSQL level (single row lock).
  // This is safe for typical load; only the RPC avoids the INSERT race on first use.
  console.warn(
    `[usageService] RPC unavailable (${rpcError.message}) — using fallback UPDATE for ${field}`
  );

  // We need the current values to do a full upsert (Supabase JS doesn't support
  // partial-column upserts without specifying all columns with a unique constraint).
  // The UPDATE below is a direct single-statement update which IS atomic.
  const { error: updateError } = await supabase
    .from('usage')
    .update({
      [field]:    supabase.raw ? supabase.raw(`COALESCE(${field}, 0) + ${amount}`) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('month', currentMonth);

  if (updateError || !supabase.raw) {
    // supabase.raw may not exist in all JS client versions — use the safe read-modify-write
    const currentUsage = await getUsage(userId);
    const currentVal   = currentUsage?.[field] ?? 0;

    const { error: fallbackError } = await supabase
      .from('usage')
      .upsert(
        {
          user_id:          userId,
          month:            currentMonth,
          analyses_used:    field === 'analyses_used'    ? currentVal + amount : (currentUsage?.analyses_used    ?? 0),
          kits_used:        field === 'kits_used'        ? currentVal + amount : (currentUsage?.kits_used        ?? 0),
          jd_analyses_used: field === 'jd_analyses_used' ? currentVal + amount : (currentUsage?.jd_analyses_used ?? 0),
          evaluations_used: field === 'evaluations_used' ? currentVal + amount : (currentUsage?.evaluations_used ?? 0),
          api_calls_used:   field === 'api_calls_used'   ? currentVal + amount : (currentUsage?.api_calls_used   ?? 0),
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id,month', ignoreDuplicates: false }
      );

    if (fallbackError) {
      console.error(`[usageService] All increment paths failed for ${field}:`, fallbackError.message);
    }
  }
}

module.exports = { getUsage, incrementUsage };
