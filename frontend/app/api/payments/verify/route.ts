import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'
import { getBackendToken, extractBearerToken } from '@/lib/server-auth'

/**
 * POST /api/payments/verify
 * Proxies to backend /api/payments/verify
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("PAYMENT_VERIFY", incomingToken);

    if (!token) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to verify payment' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[AUTH API] Verify Payment Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
