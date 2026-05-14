'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavBarDemo } from '@/components/ui/navbar-demo'
import FooterSection from '@/components/ui/footer-section'
import type { Plan, BillingCycle } from '@/lib/pricing/types'
import { ApplePricing } from '@/components/pricing/ApplePricing'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { isAdmin } from '@/lib/auth/admin'
import { IndustrialPricing } from '@/components/pricing/IndustrialPricing'

interface PricingClientProps {
  plans: Plan[]
}

type CurrencyKey = 'inr' | 'usd'

function detectCurrency(): CurrencyKey {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
      return 'inr'
    }
  } catch {}
  return 'usd'
}

const PRICING_DATA = [
  {
    id: 'free',
    badge: 'GET STARTED',
    name: 'Free',
    price: {
      inr: { monthly: '₹0', annual: '₹0' },
      usd: { monthly: '$0', annual: '$0' }
    },
    originalPrice: undefined as { inr: string, usd: string } | undefined,
    yearlySavings: undefined as { inr: string, usd: string } | undefined,
    period: '/mo',
    desc: 'Fair hiring starts here. Upgrade when you need the full toolkit.',
    btnText: 'Get started free',
    btnVariant: 'outline',
    sections: [
      {
        title: 'BIAS DETECTION',
        features: [
          { text: '5 analyses per month', status: 'active' },
          { text: 'Bias score (0-100)', status: 'active' },
          { text: 'Bias category tags (Gender, Age, etc.)', status: 'active' },
          { text: '1-line issue summary', status: 'active' },
          { text: 'Full explanation of why', status: 'inactive' },
          { text: 'Rewritten question', status: 'inactive' },
        ]
      },
      {
        title: 'INTERVIEW KIT',
        features: [
          { text: '1 kit per month', status: 'active' },
          { text: '10 questions per kit', status: 'active' },
          { text: 'Why each question is asked', status: 'inactive' },
          { text: 'Strong answer criteria', status: 'inactive' },
          { text: 'Red flags per question', status: 'inactive' },
        ]
      },
      {
        title: 'CANDIDATE EVALUATION',
        features: [
          { text: '1 evaluation per month', status: 'active' },
          { text: 'AI hire / hold / reject recommendation', status: 'active' },
          { text: 'Evaluation report PDF export', status: 'inactive' },
        ]
      }
    ],
    bgClass: 'bg-[#2D2D2D] border border-white/5',
    calloutClass: 'bg-[#3E2D1D] text-[#ECA95A]'
  },
  {
    id: 'starter',
    badge: 'FOR INDIVIDUALS',
    isBestValue: true,
    name: 'Starter',
    price: {
      inr: { monthly: '₹999', annual: '₹799' },
      usd: { monthly: '$12', annual: '$10' }
    },
    originalPrice: {
      inr: '₹1,499',
      usd: '$18'
    },
    yearlySavings: {
      inr: '₹2,400',
      usd: '$24'
    },
    period: '/mo',
    desc: 'For founders and solo HR who interview weekly. Full bias detection + structured kits.',
    btnText: 'Start free trial',
    btnVariant: 'outline',
    sections: [
      {
        title: 'BIAS DETECTION',
        features: [
          { text: '40 analyses per month', status: 'active' },
          { text: 'Full explanation (3-layer: what, who, why)', status: 'active' },
          { text: 'AI rewritten question', status: 'active' },
          { text: 'JD analyser (0)', status: 'inactive' },
          { text: 'Keyword evidence highlighter', status: 'inactive' },
          { text: 'Batch analysis', status: 'inactive' },
        ]
      },
      {
        title: 'INTERVIEW KIT',
        features: [
          { text: '20 kits per month', status: 'active' },
          { text: 'Why each question is asked', status: 'active' },
          { text: 'Strong answer criteria per question', status: 'active' },
          { text: 'Red flags per question', status: 'active' },
          { text: 'Follow-up probes', status: 'inactive' },
          { text: 'Evaluation scorecard', status: 'inactive' },
        ]
      },
      {
        title: 'CANDIDATE EVALUATION',
        features: [
          { text: '5 evaluations per month', status: 'active' },
          { text: 'Score each answer (1-4 scale)', status: 'active' },
          { text: 'AI hire / hold / reject recommendation', status: 'active' },
          { text: 'Strengths + gaps breakdown', status: 'active' },
          { text: 'Evaluation report PDF', status: 'inactive' },
        ]
      },
      {
        title: 'DASHBOARD',
        features: [
          { text: 'Session bias report', status: 'active' },
        ]
      }
    ],
    bgClass: 'bg-[#2D2D2D] border border-white/5',
    calloutClass: 'bg-[#3E2D1D] text-[#ECA95A]'
  },
  {
    id: 'growth',
    badge: 'FOR TEAMS',
    isMostPopular: true,
    name: 'Growth',
    price: {
      inr: { monthly: '₹2,999', annual: '₹2,399' },
      usd: { monthly: '$36', annual: '$29' }
    },
    originalPrice: {
      inr: '₹3,999',
      usd: '$48'
    },
    yearlySavings: {
      inr: '₹7,200',
      usd: '$84'
    },
    period: '/mo',
    desc: 'For teams hiring 3+ roles monthly. Batch processing, compliance exports, team analytics.',
    btnText: 'Start free trial',
    btnVariant: 'outline-green',
    sections: [
      {
        title: 'BIAS DETECTION',
        features: [
          { text: 'Everything in Starter + these extras', status: 'active' },
          { text: '200 analyses per month', status: 'active' },
          { text: '20 JD analyses per month', status: 'active' },
          { text: 'Bias DNA report (monthly patterns)', status: 'active' },
        ]
      },
      {
        title: 'INTERVIEW KIT',
        features: [
          { text: '80 kits per month', status: 'active' },
          { text: 'Follow-up probes per question', status: 'active' },
          { text: 'Full evaluation scorecard', status: 'active' },
          { text: 'Interviewer guide per kit', status: 'active' },
        ]
      },
      {
        title: 'CANDIDATE EVALUATION',
        features: [
          { text: 'Unlimited evaluations', status: 'active' },
          { text: 'Evaluation report PDF export', status: 'active' },
          { text: 'Multi-candidate comparison', status: 'active' },
          { text: 'Evaluation history + trends', status: 'active' },
          { text: 'Bias check on your scoring patterns', status: 'active' },
        ]
      },
      {
        title: 'TEAM + DASHBOARD',
        features: [
          { text: 'Full analytics dashboard', status: 'active' },
          { text: 'PDF audit report export', status: 'active' },
        ]
      }
    ],
    bgClass: 'bg-[#0B3D2B] border border-[#145C41]',
    calloutClass: 'bg-[#125A41] text-[#7DE2B5]'
  },
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

const ADDON_DATA = [
  {
    id: 'analyses_20',
    name: '+20 analyses',
    price: { inr: '₹599', usd: '$8' },
    originalPrice: undefined,
    desc: '20 extra bias checks',
    target: 'Starter & Growth'
  },
  {
    id: 'kits_5',
    name: '+5 kits',
    price: { inr: '₹249', usd: '$3' },
    originalPrice: undefined,
    desc: '5 more interview kits',
    target: 'Starter & Growth'
  },
  {
    id: 'kits_15',
    name: '+15 kits',
    price: { inr: '₹599', usd: '$8' },
    originalPrice: undefined,
    desc: '15 kits at bulk pricing',
    target: 'Starter & Growth'
  }
]

export function PricingClient({ plans }: PricingClientProps) {
  return <IndustrialPricing />
}
