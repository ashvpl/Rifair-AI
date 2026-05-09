export type PlanId = 'free' | 'lite' | 'starter' | 'growth' | 'enterprise'
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
