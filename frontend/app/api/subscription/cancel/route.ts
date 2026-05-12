import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'
import { getBackendToken, extractBearerToken } from '@/lib/server-auth'

/**
 * POST /api/subscription/cancel
 * Proxies to backend /api/subscriptions/cancel
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("SUBSCRIPTION_CANCEL", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to cancel subscription' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[AUTH API] Cancel Subscription Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
