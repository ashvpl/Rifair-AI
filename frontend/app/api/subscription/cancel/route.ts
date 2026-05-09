import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'

/**
 * POST /api/subscription/cancel
 * Proxies to backend /api/subscriptions/cancel
 */
export async function POST() {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken()
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
    console.error('Cancel Subscription Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
