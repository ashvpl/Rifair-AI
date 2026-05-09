'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { FEATURE_GATES, PLANS } from '@/lib/pricing/plans'
import type { PlanId, Subscription, Usage, PaymentRecord } from '@/lib/pricing/types'

interface SubscriptionState {
  subscription: Subscription | null
  usage: Usage | null
  payments: PaymentRecord[]
  planId: PlanId
  isLoading: boolean
  error: string | null
  isExpired: boolean
  isNearExpiry: boolean
  daysRemaining: number
  canUse: (feature: string) => boolean
  isAtLimit: (type: 'analyses' | 'kits' | 'api' | 'jdAnalyses' | 'evaluations') => boolean
  usagePercent: (type: 'analyses' | 'kits' | 'jdAnalyses' | 'evaluations') => number
  refetch: () => Promise<void>
}

export function useSubscription(): SubscriptionState {
  const { isLoaded, userId, getToken } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!isLoaded || !userId) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const token = await getToken()
      
      const res = await fetch(`/api/subscription?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch subscription')
      }

      setSubscription(data.subscription)
      setUsage(data.usage)
      setPayments(data.payments ?? [])
    } catch (err) {
      console.error('Subscription fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const planId = (subscription?.planId ?? 'free') as PlanId
  const plan = PLANS.find(p => p.id === planId)

  // Expiration logic
  const now = new Date()
  const expiryDate = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
  
  const isExpired = expiryDate ? now > expiryDate : false
  const daysRemaining = expiryDate 
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 999
  
  // Warning threshold: 3 days (don't warn for free plans with far future expiry)
  const isNearExpiry = !isExpired && planId !== 'free' && daysRemaining <= 3

  const canUse = useCallback((feature: string): boolean => {
    const allowedPlans = FEATURE_GATES[feature] ?? []
    return allowedPlans.includes(planId)
  }, [planId])

  const isAtLimit = useCallback((type: 'analyses' | 'kits' | 'api' | 'jdAnalyses' | 'evaluations'): boolean => {
    if (!usage || !plan) return false
    if (type === 'analyses') {
      if (plan.analysesLimit === null) return false
      return (usage.analysesUsed ?? 0) >= plan.analysesLimit
    }
    if (type === 'kits') {
      if (plan.kitLimit === null) return false
      return (usage.kitsUsed ?? 0) >= plan.kitLimit
    }
    if (type === 'jdAnalyses') {
      if (plan.jdAnalysesLimit === null) return false
      return (usage.jdAnalysesUsed ?? 0) >= plan.jdAnalysesLimit
    }
    if (type === 'evaluations') {
      if (plan.evaluationsLimit === null) return false
      return (usage.evaluationsUsed ?? 0) >= plan.evaluationsLimit
    }
    if (type === 'api') {
      if (plan.apiCallsLimit === null) return false
      return (usage.apiCallsUsed ?? 0) >= (plan.apiCallsLimit ?? 0)
    }
    return false
  }, [usage, plan])

  const usagePercent = useCallback((type: 'analyses' | 'kits' | 'jdAnalyses' | 'evaluations'): number => {
    if (!usage || !plan) return 0
    if (type === 'analyses') {
      if (!plan.analysesLimit) return 0
      return Math.min(100, Math.round((usage.analysesUsed / plan.analysesLimit) * 100))
    }
    if (type === 'kits') {
      if (!plan.kitLimit) return 0
      return Math.min(100, Math.round((usage.kitsUsed / plan.kitLimit) * 100))
    }
    if (type === 'jdAnalyses') {
      if (!plan.jdAnalysesLimit) return 0
      return Math.min(100, Math.round((usage.jdAnalysesUsed / plan.jdAnalysesLimit) * 100))
    }
    if (type === 'evaluations') {
      if (!plan.evaluationsLimit) return 0
      return Math.min(100, Math.round((usage.evaluationsUsed / plan.evaluationsLimit) * 100))
    }
    return 0
  }, [usage, plan])

  return {
    subscription,
    usage,
    payments,
    planId,
    isLoading,
    error,
    isExpired,
    isNearExpiry,
    daysRemaining,
    canUse,
    isAtLimit,
    usagePercent,
    refetch: fetchData,
  }
}
