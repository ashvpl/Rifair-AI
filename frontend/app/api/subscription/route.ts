import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'
import { getBackendToken, extractBearerToken } from '@/lib/server-auth'

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription
 * Proxies to backend /api/subscriptions
 * Forwards the client's token to avoid dual-retrieval failure.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Frontend Auth Missing: Unauthorized' }, { status: 401 })
    }

    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken('SUBSCRIPTION', incomingToken);
    if (!token) {
      return NextResponse.json({ error: 'Frontend Token Missing: Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/subscriptions`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend Error: ${data.error || 'Failed to fetch subscription'}` },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[AUTH API] Subscription Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
