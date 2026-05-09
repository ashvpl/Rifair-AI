/**
 * app/api/cron/daily-intelligence/route.ts
 *
 * Layer 4 — Vercel Cron endpoint.
 * Scheduled to run at 02:00 UTC daily via vercel.json.
 * Protected by CRON_SECRET to prevent unauthorised triggers.
 */

import { NextResponse } from 'next/server'
import { computeDailyTrends, rebuildActiveUserProfiles } from '@/lib/intelligence/trend-engine'
import { env } from '@/lib/env'

export async function GET(req: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cronSecret = env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/daily-intelligence] Unauthorized attempt')
    return new Response('Unauthorized', { status: 401 })
  }

  console.log('[cron/daily-intelligence] Starting daily intelligence run...')
  const startedAt = Date.now()

  try {
    // Run trend computation and profile rebuilds concurrently
    const [trendResult, profilesUpdated] = await Promise.all([
      computeDailyTrends(),
      rebuildActiveUserProfiles(),
    ])

    const duration = Math.round((Date.now() - startedAt) / 1000)
    console.log(`[cron/daily-intelligence] Done in ${duration}s. Profiles updated: ${profilesUpdated}`)

    return NextResponse.json({
      success:          true,
      trend_date:       trendResult.trend_date,
      analysis_count:   trendResult.analysis_count,
      unique_users:     trendResult.unique_users,
      avg_bias_score:   trendResult.avg_bias_score,
      bias_direction:   trendResult.bias_trend_direction,
      profiles_updated: profilesUpdated,
      duration_seconds: duration,
    })
  } catch (err) {
    console.error('[cron/daily-intelligence] Error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
