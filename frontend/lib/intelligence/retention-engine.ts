/**
 * lib/intelligence/retention-engine.ts
 *
 * Layer 5 — Engagement & Retention Engine.
 *
 * Reads the user_intelligence profile and returns the single highest-priority
 * retention action for the current user. Used to drive in-app nudges.
 * Email delivery is deferred to a future pass.
 */

import { supabaseAdmin } from '@/lib/supabase-admin'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RetentionAction {
  type:    'in_app_nudge' | 'feature_highlight' | 'email' // email stubbed, not wired
  trigger: string
  message: string
  cta:     string
  ctaUrl:  string
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the single most relevant retention action for the user,
 * or null if no trigger matches.
 */
export async function getRetentionAction(
  userId: string
): Promise<RetentionAction | null> {
  if (!userId) return null

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) return null

    const daysSinceActive = profile.last_active_at
      ? Math.floor(
          (Date.now() - new Date(profile.last_active_at as string).getTime()) / 86400000
        )
      : 999

    // ── Priority 1: High churn risk — re-engage ──────────────────────────
    if ((profile.churn_risk_score as number) > 70) {
      const topBias = (profile.most_common_bias_types as string[])?.[0]
      return {
        type:    'in_app_nudge',
        trigger: 'high_churn_risk',
        message: topBias
          ? `Your questions show a pattern of ${topBias.replace(/_/g, ' ')} bias. A quick re-analysis could make a real difference before your next round.`
          : `You haven't run an analysis in ${daysSinceActive} days. Your next interview might have bias you haven't caught yet.`,
        cta:    'Run a quick analysis',
        ctaUrl: '/analyze',
      }
    }

    // ── Priority 2: Streak protection (active yesterday, not today) ──────
    if ((profile.streak_days as number) > 1 && daysSinceActive === 1) {
      return {
        type:    'in_app_nudge',
        trigger: 'streak_protection',
        message: `You're on a ${profile.streak_days}-day streak of fair hiring. Don't break the habit today.`,
        cta:    'Keep your streak',
        ctaUrl: '/analyze',
      }
    }

    // ── Priority 3: High upgrade likelihood on a free plan ───────────────
    if ((profile.upgrade_likelihood_score as number) > 65) {
      return {
        type:    'in_app_nudge',
        trigger: 'high_upgrade_likelihood',
        message: `You've hit feature limits multiple times. Starter unlocks everything for ₹999/month.`,
        cta:    'See what you unlock',
        ctaUrl: '/pricing?highlight=starter',
      }
    }

    // ── Priority 4: Value milestone at session 5 ─────────────────────────
    if ((profile.total_sessions as number) === 5) {
      return {
        type:    'in_app_nudge',
        trigger: 'value_milestone',
        message: `You've completed 5 analysis sessions. Your fairness patterns are starting to emerge — see your progress.`,
        cta:    'View your trend',
        ctaUrl: '/dashboard',
      }
    }

    return null
  } catch (err) {
    console.error('[retention-engine] getRetentionAction failed:', err)
    return null
  }
}
