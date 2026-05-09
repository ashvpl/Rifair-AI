'use client'

/**
 * components/intelligence/PersonalisedInsights.tsx
 *
 * Personalised Dashboard Panel — unique to every user.
 *
 * Shows:
 *  - Dominant bias pattern alert
 *  - Improvement trend indicator
 *  - Active streak badge
 *  - Rewrite acceptance rate progress bar
 *
 * Renders nothing if the user has no intelligence profile yet (new users).
 */

import { motion } from 'framer-motion'

interface UserIntelligenceProfile {
  most_common_bias_types?:      string[]
  bias_improvement_trend?:      number
  streak_days?:                 number
  rewrite_acceptance_rate?:     number
  dominant_industries?:         string[]
  dominant_role_types?:         string[]
  total_sessions?:              number
  churn_risk_score?:            number
  avg_bias_score_submitted?:    number
}

interface PersonalisedInsightsProps {
  profile: UserIntelligenceProfile | null
}

export function PersonalisedInsights({ profile }: PersonalisedInsightsProps) {
  if (!profile) return null

  // Need at least 1 session of data to show meaningful insights
  if (!profile.total_sessions || profile.total_sessions < 1) return null

  const topBias          = profile.most_common_bias_types?.[0]
  const improvement      = profile.bias_improvement_trend ?? 0
  const streak           = profile.streak_days ?? 0
  const rewriteRate      = profile.rewrite_acceptance_rate ?? 0
  const hasRewriteSignal = rewriteRate > 0

  // Don't render the card if there's genuinely nothing to show
  const hasContent = topBias || improvement !== 0 || streak > 1 || hasRewriteSignal
  if (!hasContent) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 26 }}
      className="bg-white border border-black/[0.04] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 space-y-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">
          Your hiring intelligence
        </p>
        <span className="text-[9px] font-bold text-[#0a3d2e] bg-[#f0fdf4] px-2 py-1 rounded-full uppercase tracking-wider">
          Personalised
        </span>
      </div>

      {/* ── Bias pattern alert ─────────────────────────────────── */}
      {topBias && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1">
            Pattern detected
          </p>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <span className="font-bold capitalize">{topBias.replace(/_/g, ' ')} bias</span>{' '}
            appears across your submitted questions. Your team may have an unconscious pattern worth reviewing.
          </p>
        </div>
      )}

      {/* ── Improvement trend ──────────────────────────────────── */}
      {improvement !== 0 && (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
            improvement > 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {improvement > 0 ? '↗' : '↘'}
          </div>
          <div>
            <p className="text-sm font-bold text-[#1D1D1F] leading-tight">
              {improvement > 0 ? 'Bias scores are improving' : 'Bias scores need attention'}
            </p>
            <p className="text-xs text-[#86868B] mt-0.5">
              {improvement > 0
                ? `${Math.abs(improvement).toFixed(0)}-point average improvement this month`
                : 'Consider reviewing your question patterns'}
            </p>
          </div>
        </div>
      )}

      {/* ── Active streak badge ────────────────────────────────── */}
      {streak > 1 && (
        <div className="flex items-center gap-2.5 bg-[#f0fdf4] border border-green-100 rounded-xl p-3">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-bold text-[#0a3d2e]">
              {streak}-day active streak
            </p>
            <p className="text-[10px] text-[#059669] font-medium mt-0.5">
              You're building a habit of fair hiring
            </p>
          </div>
        </div>
      )}

      {/* ── Rewrite acceptance rate ────────────────────────────── */}
      {hasRewriteSignal && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              Rewrites accepted
            </span>
            <span className="text-xs font-black text-[#1D1D1F]">
              {Math.round(rewriteRate * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rewriteRate * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-[#0a3d2e] rounded-full"
            />
          </div>
          <p className="text-[10px] text-[#86868B] font-medium">
            {rewriteRate >= 0.7
              ? 'You consistently adopt bias-free rewrites — great signal.'
              : rewriteRate >= 0.4
              ? 'You accept some rewrites. Try applying more to build better patterns.'
              : 'Most rewrites are ignored. They&apos;re designed to help \u2014 give one a try.'}
          </p>
        </div>
      )}
    </motion.div>
  )
}
