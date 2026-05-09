/**
 * lib/intelligence/event-collector.ts
 *
 * Layer 1 — Event Collection Engine
 *
 * Call track() anywhere in the frontend (fire-and-forget).
 * Never awaited — never blocks UI. Silently swallows network errors.
 */

export const EVENTS = {
  // Analysis events
  ANALYSIS_STARTED:          'analysis.started',
  ANALYSIS_COMPLETED:        'analysis.completed',
  REWRITE_COPIED:            'analysis.rewrite_copied',
  REWRITE_IGNORED:           'analysis.rewrite_ignored',
  EXPLANATION_EXPANDED:      'analysis.explanation_expanded',
  RESULT_TIME_SPENT:         'analysis.time_spent',
  ANALYSIS_SHARED:           'analysis.shared',

  // Kit events
  KIT_GENERATED:             'kit.generated',
  QUESTION_EXPANDED:         'kit.question_expanded',
  QUESTION_COPIED:           'kit.question_copied',
  QUESTION_SKIPPED:          'kit.question_skipped',
  KIT_DOWNLOADED:            'kit.downloaded',
  KIT_REGENERATED:           'kit.regenerated',
  FOLLOWUP_VIEWED:           'kit.followup_viewed',

  // JD events
  JD_ANALYSED:               'jd.analysed',
  JD_REWRITE_COPIED:         'jd.rewrite_copied',
  IMPACT_TAB_VIEWED:         'jd.impact_viewed',
  CODED_LANGUAGE_EXPANDED:   'jd.coded_expanded',

  // Evaluation events
  EVALUATION_STARTED:        'eval.started',
  EVALUATION_COMPLETED:      'eval.completed',
  RECOMMENDATION_AGREED:     'eval.recommendation_agreed',
  RECOMMENDATION_OVERRIDDEN: 'eval.recommendation_overridden',

  // Engagement events
  SESSION_STARTED:           'session.started',
  SESSION_ENDED:             'session.ended',
  UPGRADE_PROMPT_SEEN:       'upgrade.prompt_seen',
  UPGRADE_PROMPT_CLICKED:    'upgrade.prompt_clicked',
  UPGRADE_CONVERTED:         'upgrade.converted',
  FEATURE_GATE_HIT:          'gate.hit',

  // Satisfaction signals
  RESULT_RATED_POSITIVE:     'feedback.positive',
  RESULT_RATED_NEGATIVE:     'feedback.negative',
  SUPPORT_CONTACTED:         'support.contacted',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

/** Session ID — persisted in sessionStorage for the browser tab lifetime. */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('rifair_session')
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('rifair_session', sid)
  }
  return sid
}

/**
 * Fire-and-forget event tracker.
 * Never awaited — never throws — never blocks UI.
 */
export function track(
  userId: string,
  event: string,
  properties: Record<string, unknown> = {},
  planId: string = 'free'
): void {
  if (!userId || typeof window === 'undefined') return

  fetch('/api/intelligence/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      event,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      planId,
    }),
  }).catch(() => {}) // Silently fail — never affect UX
}
