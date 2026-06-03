'use strict';

/**
 * usageService.js — single source of truth for usage counters.
 *
 * Rows are keyed by user_id + month (period key from usagePeriod.js).
 * Counters reset only when the period key changes:
 *   - Free: on plan upgrade (new subscription period_start)
 *   - Monthly paid: on subscription renewal / purchase
 *   - Annual paid: each monthly window within the annual term
 */

const { supabase } = require('../config/supabase');
const { resolveUsagePeriod } = require('../utils/usagePeriod');

const VALID_FIELDS = new Set([
  'analyses_used',
  'kits_used',
  'jd_analyses_used',
  'evaluations_used',
  'api_calls_used',
]);

async function getSubscriptionForUsage(userId) {
  const { getSubscription } = require('./subscriptionService');
  return getSubscription(userId);
}

/**
 * @param {string} userId
 * @returns {Promise<{ periodKey: string, meta: ReturnType<typeof resolveUsagePeriod> }>}
 */
async function getUsagePeriodContext(userId) {
  const sub = await getSubscriptionForUsage(userId);
  const meta = resolveUsagePeriod(sub);
  return { periodKey: meta.periodKey, meta, subscription: sub };
}

/**
 * @param {string} userId
 * @returns {Promise<object & { _usageMeta?: object }>}
 */
async function getUsage(userId) {
  const { periodKey, meta } = await getUsagePeriodContext(userId);

  let { data: usage, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month', periodKey)
    .single();

  if (!usage || (error && error.code === 'PGRST116')) {
    // One-time migration from deprecated UTC calendar-month keys (YYYY-MM)
    const legacyKey = new Date().toISOString().slice(0, 7);
    if (legacyKey !== periodKey) {
      const { data: legacyUsage } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month', legacyKey)
        .single();

      if (legacyUsage) {
        const { data: migrated, error: migrateError } = await supabase
          .from('usage')
          .update({ month: periodKey, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('month', legacyKey)
          .select()
          .single();

        if (!migrateError && migrated) {
          return attachMeta(migrated, meta);
        }
      }
    }

    const { data: newUsage, error: insertError } = await supabase
      .from('usage')
      .upsert(
        {
          user_id:          userId,
          month:            periodKey,
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
      throw new Error(`Failed to create usage row: ${insertError.message}`);
    }
    return attachMeta(newUsage, meta);
  }

  if (error) {
    console.error('[usageService] getUsage — fetch error:', error.message);
    throw new Error(`Failed to fetch usage: ${error.message}`);
  }

  return attachMeta(usage, meta);
}

function attachMeta(usage, meta) {
  return {
    ...usage,
    _usageMeta: {
      periodKey: meta.periodKey,
      resetsAt: meta.resetsAt,
      billingCycle: meta.billingCycle,
      resetsOnUpgradeOnly: meta.resetsOnUpgradeOnly,
    },
  };
}

async function incrementUsage(userId, field, amount = 1) {
  if (!VALID_FIELDS.has(field)) {
    console.error(`[usageService] incrementUsage — invalid field: ${field}`);
    return;
  }

  const { periodKey } = await getUsagePeriodContext(userId);
  await getUsage(userId);

  const { error: rpcError } = await supabase.rpc('increment_usage_field', {
    p_user_id: userId,
    p_month:   periodKey,
    p_field:   field,
    p_amount:  amount,
  });

  if (!rpcError) return;

  console.warn(
    `[usageService] RPC unavailable (${rpcError.message}) — using fallback for ${field}`
  );

  const currentUsage = await getUsage(userId);
  const currentVal = currentUsage?.[field] ?? 0;

  const { error: fallbackError } = await supabase
    .from('usage')
    .upsert(
      {
        user_id:          userId,
        month:            periodKey,
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
    console.error(`[usageService] increment failed for ${field}:`, fallbackError.message);
  }
}

module.exports = {
  getUsage,
  incrementUsage,
  getUsagePeriodContext,
};
