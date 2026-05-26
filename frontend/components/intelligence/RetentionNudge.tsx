'use client'

/**
 * components/intelligence/RetentionNudge.tsx
 *
 * Layer 5 — In-app retention nudge card.
 *
 * Renders a dismissible floating card at the bottom-right of the viewport.
 * Fetches the highest-priority retention action for the current user.
 * Silently does nothing if no action is triggered.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RetentionAction {
  type:    string
  trigger: string
  message: string
  cta:     string
  ctaUrl:  string
}

interface RetentionNudgeProps {
  userId: string
}

export function RetentionNudge({ userId }: RetentionNudgeProps) {
  const [nudge, setNudge]         = useState<RetentionAction | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible]     = useState(false)

  useEffect(() => {
    if (!userId) return

    fetch('/api/intelligence/retention')
      .then(r => r.json())
      .then(data => {
        if (data?.action) {
          setNudge(data.action)
          // Delay appearance for a polished entry
          setTimeout(() => setVisible(true), 1500)
        }
      })
      .catch(() => {})
  }, [userId])

  if (!nudge || dismissed) return null

  return (
    <div
      className={`
        fixed bottom-[calc(60px+env(safe-area-inset-bottom)+16px)] sm:bottom-6 right-4 sm:right-6 max-w-[320px] w-[calc(100vw-2rem)] sm:w-auto
        bg-white border border-black/[0.08] rounded-2xl shadow-xl p-4 z-50
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
        className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center
                   text-[#86868B] hover:text-[#1D1D1F] transition-colors rounded-full
                   hover:bg-black/[0.05] text-xs font-bold"
      >
        ✕
      </button>

      {/* Trigger badge */}
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#86868B] mb-2 pr-6">
        {nudge.trigger === 'high_churn_risk'        && '⚠ Heads up'}
        {nudge.trigger === 'streak_protection'       && '🔥 Streak alert'}
        {nudge.trigger === 'high_upgrade_likelihood' && '✨ Quick win'}
        {nudge.trigger === 'value_milestone'         && '🎯 Milestone'}
        {!['high_churn_risk', 'streak_protection', 'high_upgrade_likelihood', 'value_milestone'].includes(nudge.trigger) && 'For you'}
      </p>

      {/* Message */}
      <p className="text-sm text-[#1D1D1F] leading-relaxed mb-3 pr-4 font-medium">
        {nudge.message}
      </p>

      {/* CTA */}
      <Link
        href={nudge.ctaUrl}
        className="block w-full text-center bg-[#0a3d2e] text-white
                   text-xs font-bold py-2.5 px-4 rounded-full
                   hover:bg-[#085035] active:scale-95 transition-all"
        onClick={() => setDismissed(true)}
      >
        {nudge.cta} →
      </Link>
    </div>
  )
}
