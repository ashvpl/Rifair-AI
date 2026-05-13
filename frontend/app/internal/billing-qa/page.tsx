'use client'

import { useUser } from "@clerk/nextjs"
import { isAdmin } from "@/lib/auth/admin"
import { ApplePricing } from "@/components/pricing/ApplePricing"
import { NavBarDemo } from "@/components/ui/navbar-demo"
import FooterSection from "@/components/ui/footer-section"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertCircle, Lock, ShieldCheck } from "lucide-react"

const QA_PRICING_DATA = [
  {
    id: 'internal_qa_plan',
    internal: true,
    badge: 'INTERNAL QA',
    name: 'QA Test Plan',
    price: {
      inr: { monthly: '₹1', annual: '₹1' },
      usd: { monthly: '$0.01', annual: '$0.01' }
    },
    desc: 'Internal ₹1 plan for safely validating production payments. Admins only.',
    btnText: 'Test Payment',
    btnVariant: 'primary',
    sections: [
      {
        title: 'QA VALIDATION',
        features: [
          { text: 'Real Razorpay pipeline', status: 'active' },
          { text: 'Signature verification', status: 'active' },
          { text: 'DB persistence test', status: 'active' },
          { text: 'No premium credits', status: 'star' },
        ]
      }
    ],
    bgClass: 'bg-[#1D1D1F] border border-red-500/30',
    calloutClass: 'bg-red-500/10 text-red-400'
  }
]

export default function InternalBillingQAPage() {
  const { user, isLoaded } = useUser()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const userEmail = user?.primaryEmailAddress?.emailAddress
  const userIsAdmin = isAdmin(userEmail)

  useEffect(() => {
    if (isLoaded && !userIsAdmin) {
      redirect("/")
    }
  }, [isLoaded, userIsAdmin])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userIsAdmin) return null

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <NavBarDemo />
      
      <main className="flex-1 pt-32 pb-20 container max-w-6xl mx-auto px-4">
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            Internal Admin Only
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Billing QA Dashboard
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            This page is for production payment validation. Payments made here are <strong>REAL</strong> but cost only ₹1. 
            Use this to verify the entire Razorpay → Backend → DB → Entitlement pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
             <div className="p-6 rounded-3xl border border-border bg-muted/30 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  QA Instructions
                </h2>
                <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                  <li>Ensure you are using a <strong>Live</strong> Razorpay key (check environment).</li>
                  <li>Click "Test Payment" to initiate a real ₹1 transaction.</li>
                  <li>Use any valid payment method (UPI is fastest).</li>
                  <li>After success, verify the "Payments" table in Supabase.</li>
                  <li>Verify that your <code>subscription</code> status updated correctly.</li>
                  <li>Check the Razorpay Dashboard for the "internal: true" note.</li>
                </ul>
             </div>

             <div className="p-6 rounded-3xl border border-border bg-green-500/5 space-y-4">
                <h2 className="text-xl font-bold">System Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-widest">Auth Context</p>
                    <p className="text-sm font-mono truncate">{userEmail}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border border-border">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-widest">Admin Role</p>
                    <p className="text-sm font-bold text-green-500">Verified</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-3xl rounded-full opacity-50" />
            <div className="relative">
              <ApplePricing 
                plans={QA_PRICING_DATA as any} 
                currency="inr"
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
              />
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
