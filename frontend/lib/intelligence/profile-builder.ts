/**
 * lib/intelligence/profile-builder.ts
 *
 * Layer 2 — User Intelligence Profile Builder.
 *
 * Runs asynchronously after each analysis/kit generation.
 * Reads last 90 days of events + last 100 analysis reports,
 * computes a rich behavioural profile, and upserts user_intelligence.
 *
 * Never awaited from the critical path — always fire-and-forget.
 */

import { supabaseAdmin } from '@/lib/supabase-admin'

// ─── Public API ─────────────────────────────────────────────────────────────

export async function rebuildUserProfile(userId: string): Promise<void> {
  if (!userId) return

  try {
    // Fetch last 90 days of events
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const [{ data: events }, { data: analyses }] = await Promise.all([
      supabaseAdmin
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('analysis_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (!events || events.length === 0) return

    const profile = computeProfile(userId, events, analyses ?? [])

    await supabaseAdmin
      .from('user_intelligence')
      .upsert(profile, { onConflict: 'user_id' })
  } catch (err) {
    // Never throw — this is a background task
    console.error('[profile-builder] rebuildUserProfile failed:', err)
  }
}

// ─── Core Computation ────────────────────────────────────────────────────────

function computeProfile(
  userId: string,
  events: Record<string, unknown>[],
  analyses: Record<string, unknown>[]
): Record<string, unknown> {
  const roleFreq:    Record<string, number> = {}
  const industryFreq: Record<string, number> = {}
  const companyFreq:  Record<string, number> = {}
  const biasTypes:    Record<string, number> = {}
  let totalBiasScore = 0
  let biasScoreCount = 0

  // ── Analyse history ─────────────────────────────────────────────────────
  for (const a of analyses) {
    const result = (a.categories as Record<string, unknown>) ?? {}
    const context = (result.context as Record<string, unknown>) ?? {}

    if (context.role && typeof context.role === 'string') {
      roleFreq[context.role] = (roleFreq[context.role] ?? 0) + 1
    }
    if (context.industry && typeof context.industry === 'string') {
      industryFreq[context.industry] = (industryFreq[context.industry] ?? 0) + 1
    }
    if (context.company_type && typeof context.company_type === 'string') {
      companyFreq[context.company_type] = (companyFreq[context.company_type] ?? 0) + 1
    }

    const questions = (result.questions as Record<string, unknown>[]) ?? []
    for (const q of questions) {
      const categories = (q.bias_categories as string[]) ?? (q.bias_types as string[]) ?? []
      for (const cat of categories) {
        biasTypes[cat] = (biasTypes[cat] ?? 0) + 1
      }
      if (typeof q.bias_score === 'number' && q.bias_score > 0) {
        totalBiasScore += q.bias_score
        biasScoreCount++
      }
    }
  }

  // ── Behaviour analysis ──────────────────────────────────────────────────
  const rewritesCopied  = events.filter(e => e.event === 'analysis.rewrite_copied').length
  const rewritesIgnored = events.filter(e => e.event === 'analysis.rewrite_ignored').length
  const rewriteAcceptanceRate =
    rewritesCopied + rewritesIgnored > 0
      ? rewritesCopied / (rewritesCopied + rewritesIgnored)
      : 0

  // ── Session analysis ────────────────────────────────────────────────────
  const sessions = groupBySessions(events)
  const avgSessionDuration =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0

  // ── Engagement scoring ──────────────────────────────────────────────────
  const lastEventDate = events[0]?.created_at
  const daysSinceLastActive =
    lastEventDate && typeof lastEventDate === 'string'
      ? Math.floor((Date.now() - new Date(lastEventDate).getTime()) / 86400000)
      : 999

  const churnRisk = computeChurnRisk(
    daysSinceLastActive,
    sessions.length,
    rewriteAcceptanceRate,
    analyses.length
  )

  const upgradeLikelihood = computeUpgradeLikelihood(
    events,
    analyses.length,
    rewriteAcceptanceRate
  )

  // ── Preference detection ─────────────────────────────────────────────────
  const explanationsExpanded = events.filter(e => e.event === 'analysis.explanation_expanded').length
  const totalAnalysedEvents  = events.filter(e => e.event === 'analysis.completed').length
  const prefersDetailed = totalAnalysedEvents > 0 && explanationsExpanded / totalAnalysedEvents > 0.6

  return {
    user_id:                      userId,
    dominant_role_types:          topN(roleFreq, 5),
    dominant_industries:          topN(industryFreq, 5),
    dominant_company_types:       topN(companyFreq, 5),
    most_common_bias_types:       topN(biasTypes, 5),
    avg_bias_score_submitted:     biasScoreCount > 0 ? totalBiasScore / biasScoreCount : 0,
    rewrite_acceptance_rate:      rewriteAcceptanceRate,
    avg_session_duration_seconds: Math.round(avgSessionDuration),
    analyses_per_session:         sessions.length > 0 ? analyses.length / sessions.length : 0,
    total_sessions:               sessions.length,
    churn_risk_score:             churnRisk,
    upgrade_likelihood_score:     upgradeLikelihood,
    prefers_detailed_explanations: prefersDetailed,
    prefers_quick_rewrites:       !prefersDetailed,
    last_active_at:               events[0]?.created_at ?? null,
    streak_days:                  computeStreak(events),
    updated_at:                   new Date().toISOString(),
  }
}

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

function computeChurnRisk(
  daysSinceActive: number,
  sessionCount:    number,
  rewriteAcceptance: number,
  analysisCount:   number
): number {
  let risk = 0
  if (daysSinceActive > 14)      risk += 40
  else if (daysSinceActive > 7)  risk += 20
  else if (daysSinceActive > 3)  risk += 10

  if (sessionCount < 3)          risk += 20
  if (analysisCount < 5)         risk += 15
  if (rewriteAcceptance < 0.3)   risk += 15
  if (analysisCount < 8)         risk += 10

  return Math.min(100, risk)
}

function computeUpgradeLikelihood(
  events:           Record<string, unknown>[],
  analysisCount:    number,
  rewriteAcceptance: number
): number {
  let score = 0
  const promptsSeen    = events.filter(e => e.event === 'upgrade.prompt_seen').length
  const promptsClicked = events.filter(e => e.event === 'upgrade.prompt_clicked').length
  const gateHits       = events.filter(e => e.event === 'gate.hit').length

  if (promptsClicked > 0) score += 40
  if (promptsSeen > 3)    score += 20
  if (analysisCount > 7)  score += 20
  if (rewriteAcceptance > 0.7) score += 15
  if (gateHits > 2)       score += 25

  return Math.min(100, score)
}

function computeStreak(events: Record<string, unknown>[]): number {
  const days = new Set(
    events
      .map(e => {
        const d = e.created_at
        return typeof d === 'string' ? d.split('T')[0] : null
      })
      .filter(Boolean)
  )

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (days.has(key)) streak++
    else break
  }
  return streak
}

function topN(freq: Record<string, number>, n: number): string[] {
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([k]) => k)
}

function groupBySessions(
  events: Record<string, unknown>[]
): { events: Record<string, unknown>[]; duration: number }[] {
  const sessions: { events: Record<string, unknown>[]; duration: number }[] = []
  let currentSession: Record<string, unknown>[] = []

  for (let i = 0; i < events.length; i++) {
    if (i === 0) {
      currentSession = [events[i]]
      continue
    }

    const prevDate = events[i - 1]?.created_at
    const currDate = events[i]?.created_at

    if (typeof prevDate !== 'string' || typeof currDate !== 'string') {
      currentSession.push(events[i])
      continue
    }

    const gap = new Date(prevDate).getTime() - new Date(currDate).getTime()

    if (gap > 30 * 60 * 1000) {
      sessions.push({ events: currentSession, duration: gap / 1000 })
      currentSession = [events[i]]
    } else {
      currentSession.push(events[i])
    }
  }

  if (currentSession.length > 0) {
    sessions.push({ events: currentSession, duration: 0 })
  }

  return sessions
}
