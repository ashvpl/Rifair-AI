/**
 * app/api/intelligence/profile/route.ts
 *
 * Returns the user_intelligence row for the authenticated user.
 * Used by the PersonalisedInsights dashboard panel.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }

    const { data: profile } = await supabaseAdmin
      .from('user_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({ profile: profile ?? null }, { status: 200 })
  } catch (err) {
    console.error('[intelligence/profile] error:', err)
    return NextResponse.json({ profile: null }, { status: 200 })
  }
}
