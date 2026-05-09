'use client'

import React from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { AlertCircle, ArrowRight, Crown, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function PlanExpiryBanner() {
  const { planId, isExpired, isNearExpiry, daysRemaining, isLoading } = useSubscription()

  if (isLoading) return null

  const shouldShow = isExpired || isNearExpiry

  if (!shouldShow) return null

  // Special logic for free/starter upgrade option
  const isStarterOrFree = planId === 'free' || planId === 'starter'
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          "relative overflow-hidden transition-all duration-500",
          isExpired ? "bg-red-500/10 border-b border-red-500/20" : "bg-amber-500/10 border-b border-amber-500/20"
        )}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isExpired ? "bg-red-500/20 text-red-600" : "bg-amber-500/20 text-amber-600"
            )}>
              {isExpired ? <AlertCircle className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4 animate-spin-slow" />}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <p className={cn(
                "text-sm font-bold",
                isExpired ? "text-red-700" : "text-amber-700"
              )}>
                {isExpired 
                  ? "Your current plan has expired" 
                  : `Your ${planId} plan expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                }
              </p>
              <p className={cn(
                "text-[13px] font-medium opacity-80",
                isExpired ? "text-red-600" : "text-amber-600"
              )}>
                {isExpired 
                  ? "Renew now to continue using premium features without interruption." 
                  : "Renew early to ensure continuous access to your workspace."
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all active:scale-95 shadow-sm",
                isExpired 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-amber-600 text-white hover:bg-amber-700"
              )}
            >
              {isStarterOrFree ? (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade Plan
                </>
              ) : (
                <>
                  Renew Plan
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
