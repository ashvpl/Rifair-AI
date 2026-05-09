/**
 * lib/intelligence/trend-engine.ts
 *
 * Layer 4 — Platform Trend Intelligence.
 *
 * Runs once daily via Vercel Cron. Aggregates bias patterns across all
 * users and stores them in platform_trends. Also drives the daily batch
 * profile rebuild for all active users.
 */

import { supabaseAdmin } from '@/lib/supabase-admin'
import { rebuildUserProfile } from './profile-builder'

// ─── Public API ──────────────────────────────────────────────────────────────

export async function computeDailyTrends(): Promise<{
  trend_date: string
  analysis_count: number
  unique_users: number
  avg_bias_score: number
  most_common_bias_type: string | null
  bias_trend_direction: string
}> {
  const today = new Date().toISOString().split('T')[0]

  // Fetch all analyses from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: analyses } = await supabaseAdmin
    .from('analysis_reports')
    .select('user_id, bias_score, categories')
    .gte('created_at', sevenDaysAgo)

  if (!analyses || analyses.length === 0) {
    return {
      trend_date: today,
      analysis_count: 0,
      unique_users: 0,
      avg_bias_score: 0,
      most_common_bias_type: null,
      bias_trend_direction: 'stable',
    }
  }

  // Aggregate bias types and scores
  const biasTypeFreq: Record<string, number> = {}
  let totalBiasScore = 0
  let scoredCount    = 0

  for (const a of analyses) {
    if (typeof a.bias_score === 'number' && a.bias_score > 0) {
      totalBiasScore += a.bias_score
      scoredCount++
    }
    const categories = (a.categories as Record<string, unknown>) ?? {}
    const questions  = (categories.questions as Record<string, unknown>[]) ?? []
    for (const q of questions) {
      const biasTypes = (q.bias_types as string[]) ?? (q.bias_categories as string[]) ?? []
      for (const bt of biasTypes) {
        biasTypeFreq[bt] = (biasTypeFreq[bt] ?? 0) + 1
      }
    }
  }

  const avgBiasScore = scoredCount > 0 ? totalBiasScore / scoredCount : 0
  const topBiasType  = Object.entries(biasTypeFreq).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
  const uniqueUsers  = new Set(analyses.map(a => a.user_id)).size
  const biasTrend    = await computeBiasTrend()

  const trendRow = {
    trend_date:            today,
    avg_bias_score:        avgBiasScore,
    most_common_bias_type: topBiasType,
    bias_trend_direction:  biasTrend,
    analysis_count:        analyses.length,
    unique_users:          uniqueUsers,
  }

  await supabaseAdmin
    .from('platform_trends')
    .upsert(trendRow, { onConflict: 'trend_date' })

  console.log('[trend-engine] Daily trends computed:', trendRow)
  return trendRow
}

/**
 * Rebuilds intelligence profiles for all users active in the last 24 hours.
 * Returns the count of profiles rebuilt.
 */
export async function rebuildActiveUserProfiles(): Promise<number> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: activeRows } = await supabaseAdmin
    .from('user_events')
    .select('user_id')
    .gte('created_at', oneDayAgo)

  if (!activeRows || activeRows.length === 0) return 0

  const uniqueUsers = [...new Set(activeRows.map(r => r.user_id as string))]

  // Rebuild profiles with limited concurrency to avoid rate-limiting Supabase
  const CONCURRENCY = 5
  for (let i = 0; i < uniqueUsers.length; i += CONCURRENCY) {
    const batch = uniqueUsers.slice(i, i + CONCURRENCY)
    await Promise.allSettled(batch.map(uid => rebuildUserProfile(uid)))
  }

  return uniqueUsers.length
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function computeBiasTrend(): Promise<string> {
  const now           = Date.now()
  const thisWeekStart = new Date(now - 7 * 86400000).toISOString().split('T')[0]
  const lastWeekStart = new Date(now - 14 * 86400000).toISOString().split('T')[0]

  const [{ data: thisWeek }, { data: lastWeek }] = await Promise.all([
    supabaseAdmin
      .from('platform_trends')
      .select('avg_bias_score')
      .gte('trend_date', thisWeekStart),
    supabaseAdmin
      .from('platform_trends')
      .select('avg_bias_score')
      .gte('trend_date', lastWeekStart)
      .lt('trend_date', thisWeekStart),
  ])

  if (!thisWeek?.length || !lastWeek?.length) return 'stable'

  const thisAvg = thisWeek.reduce((s, r) => s + (r.avg_bias_score ?? 0), 0) / thisWeek.length
  const lastAvg = lastWeek.reduce((s, r) => s + (r.avg_bias_score ?? 0), 0) / lastWeek.length

  if (thisAvg < lastAvg - 2) return 'improving'
  if (thisAvg > lastAvg + 2) return 'worsening'
  return 'stable'
}
