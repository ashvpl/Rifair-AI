'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import type { PlanId } from '@/lib/pricing/types'
import { CheckoutButton } from './CheckoutButton'

interface FeatureGateProps {
  feature: string
  requiredPlan?: PlanId
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  customPrompt?: string
}

export function FeatureGate({
  feature,
  requiredPlan = 'starter',
  children,
  fallback,
  showUpgradePrompt = true,
  customPrompt
}: FeatureGateProps) {
  const { canUse, isLoading } = useSubscription()
  const router = useRouter()

  if (isLoading) return <div className="animate-pulse h-8 bg-gray-100 rounded" />

  if (!canUse(feature)) {
    if (fallback) return <>{fallback}</>
    if (!showUpgradePrompt) return null

    return (
      <div className="relative group">
        <div className="opacity-40 pointer-events-none select-none blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white/98 border border-black/[0.08] rounded-2xl p-4
                          text-center shadow-xl max-w-[220px] backdrop-blur-md z-20">
            <p className="text-[11px] text-[#1D1D1F] mb-3 font-bold leading-tight whitespace-pre-line">
              {customPrompt || `Upgrade to ${requiredPlan} to unlock insights`}
            </p>
            <button
              onClick={() => router.push(
                `/pricing?highlight=${requiredPlan}&feature=${feature}`
              )}
              className="text-[10px] font-black text-white bg-black
                         px-4 py-2 rounded-full hover:bg-black/90 
                         transition-all active:scale-95 shadow-sm"
            >
              Upgrade now →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/** Usage limit warning banner */
export function UsageLimitBanner({ type: forceType }: { type?: 'analyses' | 'kits' }) {
  const { usagePercent, planId, isAtLimit } = useSubscription()
  const router = useRouter()
  
  if (planId === 'enterprise' || planId === 'growth') return null

  const analysesPercent = usagePercent('analyses')
  const kitsPercent = usagePercent('kits')
  
  const isAnalysesAtLimit = isAtLimit('analyses')
  const isKitsAtLimit = isAtLimit('kits')

  // Determine which type to show
  let type: 'analyses' | 'kits'
  if (forceType) {
    type = forceType
  } else {
    // Show the most critical limit (at limit or highest percentage)
    type = isKitsAtLimit || (kitsPercent > analysesPercent) ? 'kits' : 'analyses'
  }
  
  const percent = type === 'kits' ? kitsPercent : analysesPercent
  const atLimit = type === 'kits' ? isKitsAtLimit : isAnalysesAtLimit
  const label = type === 'kits' ? 'kit generations' : 'analyses'

  const showBanner = (forceType === 'kits' ? (isKitsAtLimit || kitsPercent >= 80) : 
                      forceType === 'analyses' ? (isAnalysesAtLimit || analysesPercent >= 80) :
                      (isAnalysesAtLimit || isKitsAtLimit || analysesPercent >= 80 || kitsPercent >= 80))
  
  if (!showBanner) return null

  // Special contextual banner for Starter users approaching/at limits
  if (planId === 'starter') {
    const isAnalysesIssue = forceType === 'analyses' || (!forceType && analysesPercent >= kitsPercent)
    const isKitsIssue = forceType === 'kits' || (!forceType && kitsPercent > analysesPercent)

    let addonText = ""
    let addonPrice = ""
    let upgradeText = ""
    
    if (isAnalysesIssue) {
      addonText = "+20 analyses"
      addonPrice = "₹599"
      upgradeText = planId === 'starter' ? "upgrade to Growth for 150/month" : "contact sales for Enterprise"
    } else {
      addonText = "+5 kits"
      addonPrice = "₹249"
      upgradeText = planId === 'starter' ? "upgrade to Growth for 80/month" : "buy +15 kits for ₹599"
    }

    return (
      <div className={`rounded-2xl px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border transition-colors ${
        atLimit ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${atLimit ? 'text-red-800' : 'text-amber-800'}`}>
            {atLimit ? `You've used all ${label}.` : `You are approaching your ${label} limit (${Math.round(percent)}%).`}
          </p>
          <p className={`text-xs mt-0.5 font-medium ${atLimit ? 'text-red-600' : 'text-amber-600'}`}>
            Need more? {addonText} for {addonPrice} or {upgradeText}.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <CheckoutButton
            planId={isAnalysesIssue ? 'analyses_20' as PlanId : 'kits_5' as PlanId}
            billingCycle="monthly"
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all active:scale-95 shadow-sm border flex items-center justify-center ${
              atLimit ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
            }`}
          >
            Top up {addonPrice}
          </CheckoutButton>
          {planId === 'starter' && (
            <button
              onClick={() => router.push('/pricing')}
              className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all active:scale-95 shadow-sm ${
                atLimit ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              Upgrade to Growth
            </button>
          )}
        </div>
      </div>
    )
  }

  // Fallback for Free users
  const bothAtLimit = !forceType && isAnalysesAtLimit && isKitsAtLimit
  const title = bothAtLimit ? 'Analysis & Kit generation limits reached' : (atLimit ? `${type === 'kits' ? 'Kit generation' : 'Analysis'} limit reached` : `${percent}% of your monthly ${label} used`)
  const description = atLimit ? 'Upgrade your plan to continue without interruption' : `You are approaching your monthly ${type === 'kits' ? 'kit' : 'analysis'} limit`

  return (
    <div className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-4 mb-5 border transition-colors ${
      atLimit ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="min-w-0">
        <p className={`text-sm font-bold ${atLimit ? 'text-red-800' : 'text-amber-800'}`}>
          {title}
        </p>
        <p className={`text-xs mt-0.5 font-medium ${atLimit ? 'text-red-600' : 'text-amber-600'}`}>
          {description}
        </p>
      </div>
      <button
        onClick={() => router.push('/pricing')}
        className={`text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all active:scale-95 shadow-sm ${
          atLimit ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        {atLimit ? 'Upgrade now' : 'Upgrade plan'}
      </button>
    </div>
  )
}
