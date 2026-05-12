import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BACKEND_URL } from '@/lib/server-config'
import { getBackendToken } from '@/lib/server-auth'

/**
 * POST /api/payments/create-order
 * Proxies to backend /api/payments/create-order
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      console.log('[PROXY] Unauthorized: No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const token = await getBackendToken("PAYMENTS");

    console.log(`[PROXY] Creating order for user: ${userId}`);
    console.log(`[PROXY] Token present: ${!!token}`);

    // getToken({ template: "backend" }) returns null when the session is stale/expired
    // Sending "Bearer null" causes Clerk on the backend to reject with Unauthenticated
    if (!token) {
      console.error('[PROXY] No token found — session might be expired');
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }
    
    const response = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    console.log(`[PROXY] Backend responded with status: ${response.status}`);

    if (!response.ok) {
      console.error('[PROXY] Backend Error:', data);
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
