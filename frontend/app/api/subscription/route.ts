import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription
 * Proxies to backend /api/subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Frontend Auth Missing: Unauthorized' }, { status: 401 })
    }

    const token = await getToken({ template: 'backend' }).catch(() => getToken())
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
    console.error('Subscription Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
