/**
 * app/api/intelligence/rebuild-profile/route.ts
 *
 * Layer 2 — Async profile rebuild trigger.
 * Called fire-and-forget from the analyze and kit proxy routes.
 * Returns immediately; the actual work runs in the background.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { rebuildUserProfile } from '@/lib/intelligence/profile-builder'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    const body = await req.json().catch(() => ({}))
    const targetUserId: string = body.userId || userId

    // Kick off rebuild without awaiting — respond immediately
    rebuildUserProfile(targetUserId).catch(err =>
      console.error('[rebuild-profile] background error:', err)
    )

    return NextResponse.json({ ok: true, queued: true }, { status: 200 })
  } catch (err) {
    console.error('[rebuild-profile] route error:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
