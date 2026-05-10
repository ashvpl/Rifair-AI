/**
 * app/api/intelligence/track/route.ts
 *
 * Layer 1 — Event ingestion endpoint.
 * Always returns 200 so the browser never surfaces errors to the user.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const supabase = getSupabaseAdmin()
    if (!userId) {
      // Return 200 even on auth failure — this is a telemetry endpoint
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    const body = await req.json()
    const { event, properties, sessionId, planId } = body

    if (!event) {
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    await supabase.from('user_events').insert({
      user_id:    userId,
      event,
      properties: properties ?? {},
      session_id: sessionId ?? null,
      plan_id:    planId    ?? 'free',
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    // Never surface errors — this endpoint must always silently succeed
    console.error('[intelligence/track] error:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
