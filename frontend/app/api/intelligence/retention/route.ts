/**
 * app/api/intelligence/retention/route.ts
 *
 * Layer 5 — Retention action API endpoint.
 * Called by the RetentionNudge component on mount.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRetentionAction } from '@/lib/intelligence/retention-engine'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ action: null }, { status: 200 })
    }

    const action = await getRetentionAction(userId)
    return NextResponse.json({ action }, { status: 200 })
  } catch (err) {
    console.error('[intelligence/retention] error:', err)
    return NextResponse.json({ action: null }, { status: 200 })
  }
}
