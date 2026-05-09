'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { PlanId, BillingCycle } from '@/lib/pricing/types'

declare global {
  interface Window { Razorpay: any }
}

type CurrencyKey = 'inr' | 'usd'

function detectCurrency(): CurrencyKey {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'inr'
  } catch {}
  return 'usd'
}

interface CheckoutButtonProps {
  planId: PlanId
  billingCycle: BillingCycle
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

export function CheckoutButton({
  planId,
  billingCycle,
  className,
  disabled,
  children
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState<CurrencyKey>('usd')
  const router = useRouter()

  useEffect(() => {
    setCurrency(detectCurrency())
  }, [])

  const handleCheckout = async () => {
    if (planId === 'free') {
      router.push('/sign-up')
      return
    }
    if (planId === 'enterprise') {
      // Open mailto for enterprise contact
      window.location.href = 'mailto:rifairaiteam@gmail.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }

    setLoading(true)

    try {
      // Load Razorpay script
      await loadRazorpayScript()

      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle, currency })
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'Unauthorized') {
          router.push(`/sign-in?redirect_url=/pricing`)
          return
        }
        throw new Error(err.error)
      }

      const order = await res.json()

      // Open Razorpay checkout modal
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: ' ', // Hides the "Rifair AI" text next to the logo
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan — ${billingCycle}`,
        image: 'https://rifair-ai.vercel.app/logo.png',
        theme: { 
          color: '#FFFFFF',
          image_padding: false // Removes Razorpay's default internal padding to make logo appear larger
        },
        handler: async (response: any) => {
          // Verify payment server-side
          const verify = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              billingCycle,
              currency
            })
          })

          if (verify.ok) {
            router.push('/dashboard?upgraded=true')
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      })

      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current
                           border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : children}
    </button>
  )
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}
