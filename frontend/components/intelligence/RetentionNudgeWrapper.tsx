'use client'

/**
 * components/intelligence/RetentionNudgeWrapper.tsx
 *
 * Client-side wrapper that reads the userId from Clerk and renders the
 * RetentionNudge. Needed because the dashboard layout is a Server Component
 * and cannot directly pass userId to a 'use client' component.
 */

import { useAuth } from '@clerk/nextjs'
import { RetentionNudge } from './RetentionNudge'

export function RetentionNudgeWrapper() {
  const { userId, isLoaded } = useAuth()

  if (!isLoaded || !userId) return null

  return <RetentionNudge userId={userId} />
}
