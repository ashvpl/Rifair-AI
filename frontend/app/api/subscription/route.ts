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

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      let errMsg = 'Failed to fetch subscription';
      if (contentType.includes('application/json')) {
        const errData = await response.json().catch(() => ({}));
        errMsg = errData.error || errMsg;
      } else {
        errMsg = `Server responded with status ${response.status}: ${response.statusText}`;
      }
      return NextResponse.json(
        { error: `Backend Error: ${errMsg}` },
        { status: response.status }
      )
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[AUTH API] Expected JSON but got text:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Backend returned invalid non-JSON content' },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[AUTH API] Subscription Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
