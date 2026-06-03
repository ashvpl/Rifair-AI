export type PlanId = 'free' | 'lite' | 'starter' | 'growth' | 'enterprise' | 'internal_qa_plan' | 'analyses_20' | 'kits_5' | 'kits_15'
export type BillingCycle = 'monthly' | 'annual'
export type SubscriptionStatus =
  'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused'

export interface Plan {
  id: PlanId
  name: string
  price: {
    inr: { monthly: number; annual: number }
    usd: { monthly: number; annual: number }
  }
  analysesLimit: number | null
  kitLimit: number | null
  jdAnalysesLimit: number | null
  evaluationsLimit: number | null
  apiCallsLimit: number | null
  seatsLimit: number | null
  features: string[]
  badge?: string
  isFeatured?: boolean
  comingSoon?: boolean
  internal?: boolean
  testPlan?: boolean
  qaOnly?: boolean
  ctaLabel: string
  ctaVariant: 'outline' | 'default' | 'primary' | 'sales'
}

export interface Subscription {
  id: string
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEndsAt?: string
  razorpaySubscriptionId?: string
  cancelledAt?: string
}

export interface Usage {
  analysesUsed: number
  kitsUsed: number
  jdAnalysesUsed: number
  evaluationsUsed: number
  apiCallsUsed: number
  month: string
  /** Billing-aligned usage window key (YYYY-MM-DD) */
  periodKey?: string
  /** ISO timestamp when monthly quotas refresh; null if upgrade-only (free) */
  resetsAt?: string | null
  /** True when limits only reset after purchasing/upgrading a paid plan */
  resetsOnUpgradeOnly?: boolean
  billingCycle?: BillingCycle
}

export interface PaymentRecord {
  id: string
  planId: PlanId
  amount: number
  currency: string
  status: string
  paymentProvider: string
  billingCycle: string
  createdAt: string
}
