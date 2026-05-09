"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Check, ChevronRight, Crown, Heart, Shield, ShoppingCart, Star, Sparkles, Zap, AlertCircle, Loader2 } from "lucide-react"
import { Plan } from "@/lib/pricing/types"
import { CheckoutButton } from "@/components/pricing/CheckoutButton"
import { useSubscription } from "@/hooks/useSubscription"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Animated Price Counter Component
interface AnimatedPriceProps {
  finalPrice: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

function AnimatedPrice({ finalPrice, duration = 2000, prefix = "$", suffix = "", className = "" }: AnimatedPriceProps) {
  const [displayPrice, setDisplayPrice] = useState(finalPrice * 3)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const startPrice = finalPrice * 3
    const endPrice = finalPrice
    const startTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentPrice = startPrice - (startPrice - endPrice) * easeOutQuart
      setDisplayPrice(currentPrice)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(animate)
    }, 300)

    return () => clearTimeout(timer)
  }, [finalPrice, duration])

  return (
    <motion.div
      className={`text-5xl font-bold ${className}`}
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3, repeat: isAnimating ? Infinity : 0, repeatDelay: 0.5 }}
    >
      {prefix}
      {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      {suffix}
    </motion.div>
  )
}

// Testimonial Interface
interface Testimonial {
  id: number
  name: string
  role: string
  company?: string
  content: string
  rating: number
  avatar: string
}

// Main Pricing Component
interface PricingPageProps {
  plans: any[]
  addons?: any[]
  currency?: 'usd' | 'inr'
  billingCycle?: 'monthly' | 'annual'
  setBillingCycle?: (cycle: 'monthly' | 'annual') => void
}

export function ApplePricing({ 
  plans, 
  addons = [], 
  currency = 'usd', 
  billingCycle = 'monthly',
  setBillingCycle
}: PricingPageProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState<{ [key: string]: number }>({})
  const { planId: currentPlanId, isLoading: isSubLoading } = useSubscription()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Mock testimonials for now
  const mockTestimonials: Record<string, Testimonial[]> = {
    free: [
      { id: 1, name: "Alexia Rivera", role: "Solo Dev", content: "Perfect for my side projects. The bias score is a eye-opener!", rating: 5, avatar: "https://i.pravatar.cc/150?u=1" }
    ],
    starter: [
      { id: 2, name: "Jim", role: "HR Manager", content: "Advanced kits saved us 10+ hours a week. Essential tool.", rating: 5, avatar: "https://i.pravatar.cc/150?u=12" }
    ],
    growth: [
      { id: 3, name: "Marcus Thorne", role: "Director of Talent", content: "The compliance suite is top-notch. Batch analysis is a beast!", rating: 5, avatar: "https://i.pravatar.cc/150?u=68" }
    ],
    enterprise: [
      { id: 4, name: "Elena Rodriguez", role: "VP People", company: "Fortune 500", content: "Tailored to our scale. The custom models are incredibly accurate.", rating: 5, avatar: "https://i.pravatar.cc/150?u=4" }
    ]
  }

  useEffect(() => {
    const intervals = plans.map((plan) => {
      const testimonials = mockTestimonials[plan.id] || []
      if (testimonials.length <= 1) return null

      return setInterval(() => {
        setCurrentTestimonialIndex((prev) => ({
          ...prev,
          [plan.id]: ((prev[plan.id] || 0) + 1) % testimonials.length,
        }))
      }, 5000)
    })

    return () => intervals.forEach(interval => interval && clearInterval(interval))
  }, [plans])

  return (
    <>
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-32 pb-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-primary/20 bg-primary/5 shadow-lg"
          >
            <span className="text-sm font-medium">Limited Time Offer</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Fair hiring starts here.
          </h1>
          <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl mb-12 text-balance">
            Start free. Upgrade when your team scales. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle (Moved here) */}
          {setBillingCycle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 bg-muted/40 p-2 rounded-full border border-border/80 backdrop-blur-md shadow-sm relative z-20"
            >
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "text-sm font-bold transition-all px-6 py-2 rounded-full cursor-pointer",
                  billingCycle === 'monthly' ? 'text-foreground bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
              
              <div 
                className="w-14 h-7 rounded-full bg-black/10 border border-black/5 relative flex-shrink-0 cursor-pointer p-1"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              >
                <motion.div 
                  animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-black rounded-full shadow-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "text-sm font-bold transition-all px-6 py-2 rounded-full cursor-pointer flex items-center gap-2",
                  billingCycle === 'annual' ? 'text-foreground bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Annual
                <span className="bg-green-500/10 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2 Months Free
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, planIndex) => {
            const priceStr = plan.price[currency][billingCycle]
            const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0
            const originalPriceStr = plan.originalPrice?.[currency] || (billingCycle === 'monthly' ? Math.round(price * 1.5) : Math.round(price * 1.3))
            const originalPrice = typeof originalPriceStr === 'string' ? parseInt(originalPriceStr.replace(/[^0-9]/g, '')) : originalPriceStr
            const discount = billingCycle === 'annual' && price > 0 ? "2 MONTHS FREE" : (plan.id === 'starter' && price > 0) ? "Limited Time Deal" : null
            const testimonials = mockTestimonials[plan.id] || []

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: planIndex * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <Card
                  className={cn(
                    "overflow-hidden border relative group h-full flex flex-col transition-all duration-300",
                    plan.id === 'starter' || plan.isMostPopular
                      ? "border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30",
                    plan.bgClass && plan.bgClass.includes('bg-') ? plan.bgClass : ""
                  )}
                >
                  {(plan.id === 'starter' || plan.isMostPopular) && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
                  )}

                  <div className="p-8 flex flex-col flex-grow">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="px-3 py-1 bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <span>{plan.badge}</span>
                      </Badge>
                      {(plan.isBestValue || plan.isMostPopular) && (
                        <Badge className="px-3 py-1 bg-green-500/20 border-green-500/30 text-green-400">
                          <span>{plan.isMostPopular ? "Most Popular" : "Best Value"}</span>
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold mb-1 text-white">{plan.name}</h3>
                    <p className="text-white/60 text-sm mb-6 min-h-[48px]">
                      {plan.desc}
                    </p>

                    {/* Animated Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <AnimatedPrice 
                          finalPrice={price} 
                          prefix={currency === 'usd' ? '$' : '₹'} 
                          className="text-5xl font-black tracking-tight text-white" 
                        />
                        {price > 0 && originalPrice > price && (
                          <span className="text-white/40 line-through text-lg font-medium">
                            {currency === 'usd' ? '$' : '₹'}{originalPrice}
                          </span>
                        )}
                      </div>
                      {price > 0 && (
                        <div className="flex flex-col gap-1">
                          {discount && (
                            <Badge variant="outline" className="border-green-400/30 text-green-400 bg-green-400/10 w-fit">
                              <span>{discount}</span>
                            </Badge>
                          )}
                          {billingCycle === 'annual' && plan.yearlySavings && (
                             <span className="text-xs font-bold text-green-400 mt-1 uppercase tracking-wider">
                               SAVE {plan.yearlySavings[currency]}/YEAR
                             </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features Sections */}
                    <div className="space-y-6 mb-8 flex-grow">
                      {plan.sections.map((section: any, sIdx: number) => (
                        <div key={sIdx}>
                           <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">{section.title}</h4>
                           <div className="space-y-3">
                              {section.features.map((feature: any, fIdx: number) => (
                                <motion.div
                                  key={fIdx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                  transition={{ delay: 0.4 + (sIdx * 2 + fIdx) * 0.03 }}
                                  className="flex items-start gap-3"
                                >
                                  <div className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5",
                                    feature.status === 'active' ? "bg-green-500/20" : 
                                    feature.status === 'star' ? "bg-amber-500/20" : "bg-white/5"
                                  )}>
                                    {feature.status === 'active' ? (
                                      <Check className="h-3 w-3 text-green-400" />
                                    ) : feature.status === 'star' ? (
                                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                    ) : (
                                      <div className="h-1 w-2 bg-white/20 rounded-full" />
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-sm font-medium",
                                    feature.status === 'inactive' ? "text-white/30 line-through decoration-white/10" : "text-white/90"
                                  )}>
                                    {feature.text}
                                  </span>
                                </motion.div>
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6 opacity-50" />

                    {/* CTA Button */}
                    <CheckoutButton
                      planId={plan.id}
                      billingCycle={billingCycle}
                      disabled={currentPlanId === plan.id}
                      className={cn(
                        "w-full gap-2 group mb-6 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-12 px-6",
                        currentPlanId === plan.id
                          ? "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-80"
                          : plan.id === 'growth' || plan.isMostPopular
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]" 
                            : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {currentPlanId !== plan.id && <ShoppingCart className="h-4 w-4" />}
                      <span>
                        {isSubLoading ? "Loading..." : currentPlanId === plan.id ? "Current Plan" : (plan.btnText || plan.ctaLabel)}
                      </span>
                      {currentPlanId !== plan.id && <ChevronRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />}
                    </CheckoutButton>
                    
                    {currentPlanId === plan.id && plan.id !== 'free' && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full text-xs font-bold text-white/40 hover:text-red-400 transition-colors py-2 mb-4"
                      >
                        Cancel plan
                      </button>
                    )}

                    {/* Testimonial */}
                    {testimonials.length > 0 && (
                      <div className="rounded-xl p-4 border border-border/40 relative overflow-hidden min-h-[110px] bg-muted/20">
                        <AnimatePresence mode="wait">
                          {testimonials.map(
                            (testimonial, index) =>
                              index === (currentTestimonialIndex[plan.id] || 0) && (
                                <motion.div
                                  key={testimonial.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.4 }}
                                  className="absolute inset-0 p-4"
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="h-7 w-7 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                                      <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="font-bold text-[10px] truncate text-white">{testimonial.name}</p>
                                      <p className="text-[9px] text-white/50 truncate font-medium">
                                        {testimonial.role} {testimonial.company ? `at ${testimonial.company}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-[11px] font-medium leading-snug text-white/70 italic">"{testimonial.content}"</p>
                                </motion.div>
                              )
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>




        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 text-center border-t border-border/50 pt-12"
        >
          <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <Heart className="h-5 w-5 text-primary/60" />
            <span>Trusted by 10 Million + customers</span>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Premium Cancellation Modal */}
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-[#1D1D1F] p-8 text-white text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2 tracking-tight">
              Cancel your plan?
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm font-medium leading-relaxed">
              Warning: Cancelling the current plan will result in an <span className="text-red-400 font-bold underline">immediate downgrade</span> to the Free plan.
            </DialogDescription>
          </div>
        </div>
        
        <div className="p-8 bg-white flex flex-col gap-3">
          <button
            disabled={isCancelling}
            onClick={async () => {
              setIsCancelling(true);
              try {
                await fetch("/api/subscription/cancel", { method: "POST" });
                window.location.reload();
              } catch (err) {
                console.error(err);
                setIsCancelling(false);
              }
            }}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Yes, cancel immediately"
            )}
          </button>
          
          <button
            onClick={() => setShowCancelModal(false)}
            className="w-full h-14 bg-[#F5F5F7] hover:bg-[#EBEBEB] text-[#1D1D1F] font-bold rounded-2xl transition-all active:scale-[0.98]"
          >
            Keep my plan
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
