import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'

/**
 * POST /api/payments/create-order
 * Proxies to backend /api/payments/create-order
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const token = await getToken()
    
    const response = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
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
        { error: data.error || 'Failed to create payment order' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Create Order Proxy Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
