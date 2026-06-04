"use client"
import React, { useState, useEffect } from 'react'
import { PricingContainer, PricingPlan } from "@/components/ui/pricing-container"
import { NavBarDemo } from '@/components/ui/navbar-demo'
import FooterSection from '@/components/ui/footer-section'
import { PLANS, PLAN_DISPLAY_FEATURES } from '@/lib/pricing/plans'
import { useUser } from '@clerk/nextjs'
import { isAdmin } from '@/lib/auth/admin'
import { TrustedByRotator } from "@/components/ui/trusted-by-rotator"
import { RotatingPricingSubtitle } from "@/components/ui/rotating-pricing-subtitle"
import { motion } from 'framer-motion'

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

export function IndustrialPricing() {
    const { user } = useUser()
    const [currency, setCurrency] = useState<CurrencyKey>('usd')
    
    useEffect(() => {
        setCurrency(detectCurrency())
    }, [])

    const userEmail = user?.primaryEmailAddress?.emailAddress
    const userIsAdmin = isAdmin(userEmail)

    // Filter for Free, Starter, and Growth tiers as requested
    const currencyKey = currency === 'inr' ? 'inr' : 'usd';

    const planConfig = [
        {
            id: 'free',
            name: 'Free',
            accent: 'bg-rose-500',
            rotation: -2,
            features: [
                { text: 'BIAS DETECTION', status: 'enabled', isHeader: true },
                { text: '5 analyses per month', status: 'enabled' },
                { text: '1 JD analysis per month', status: 'enabled' },
                { text: 'Bias score (0-100)', status: 'enabled' },
                { text: 'Bias category tags (Gender, Age, etc.)', status: 'enabled' },
                { text: '1-line issue summary', status: 'enabled' },
                { text: 'Full explanation of why', status: 'disabled' },
                { text: 'Rewritten question', status: 'disabled' },
                { text: 'INTERVIEW KIT', status: 'enabled', isHeader: true },
                { text: '1 kit per month', status: 'enabled' },
                { text: '10 questions per kit', status: 'enabled' },
                { text: 'Why each question is asked', status: 'disabled' },
                { text: 'Strong answer criteria', status: 'disabled' },
                { text: 'Red flags per question', status: 'disabled' },
                { text: 'CANDIDATE EVALUATION', status: 'enabled', isHeader: true },
                { text: '1 evaluation per month', status: 'enabled' },
                { text: 'AI hire / hold / reject recommendation', status: 'enabled' },
                { text: 'Evaluation report PDF export', status: 'disabled' },
            ]
        },
        {
            id: 'starter',
            name: 'Starter',
            accent: 'bg-blue-500',
            rotation: 1,
            badgeText: 'MOST VALUE',
            features: [
                { text: 'BIAS DETECTION', status: 'enabled', isHeader: true },
                { text: '40 analyses per month', status: 'enabled' },
                { text: 'Full explanation (3-layer: what, who, why)', status: 'enabled' },
                { text: 'AI rewritten question', status: 'enabled' },
                { text: '5 JD analyses per month', status: 'enabled' },
                { text: 'Keyword evidence highlighter', status: 'disabled' },
                { text: 'Batch analysis', status: 'disabled' },
                { text: 'INTERVIEW KIT', status: 'enabled', isHeader: true },
                { text: '20 kits per month', status: 'enabled' },
                { text: 'Why each question is asked', status: 'enabled' },
                { text: 'Strong answer criteria per question', status: 'enabled' },
                { text: 'Red flags per question', status: 'enabled' },
                { text: 'Follow-up probes', status: 'disabled' },
                { text: 'Evaluation scorecard', status: 'disabled' },
                { text: 'CANDIDATE EVALUATION', status: 'enabled', isHeader: true },
                { text: '5 evaluations per month', status: 'enabled' },
                { text: 'Score each answer (1-4 scale)', status: 'enabled' },
                { text: 'AI hire / hold / reject recommendation', status: 'enabled' },
                { text: 'Strengths + gaps breakdown', status: 'enabled' },
                { text: 'Evaluation report PDF', status: 'disabled' },
            ]
        },
        {
            id: 'growth',
            name: 'Growth',
            accent: 'bg-purple-500',
            rotation: 2,
            isPopular: true,
            badgeText: 'POPULAR',
            features: [
                { text: 'BIAS DETECTION', status: 'enabled', isHeader: true },
                { text: 'Everything in Starter + these extras', status: 'enabled' },
                { text: '200 analyses per month', status: 'enabled' },
                { text: '20 JD analyses per month', status: 'enabled' },
                { text: 'Bias DNA report (monthly patterns)', status: 'enabled' },
                { text: 'INTERVIEW KIT', status: 'enabled', isHeader: true },
                { text: '80 kits per month', status: 'enabled' },
                { text: 'Follow-up probes per question', status: 'enabled' },
                { text: 'Full evaluation scorecard', status: 'enabled' },
                { text: 'Interviewer guide per kit', status: 'enabled' },
                { text: 'CANDIDATE EVALUATION', status: 'enabled', isHeader: true },
                { text: 'Unlimited evaluations', status: 'enabled' },
                { text: 'Evaluation report PDF export', status: 'enabled' },
                { text: 'Multi-candidate comparison', status: 'enabled' },
                { text: 'Evaluation history + trends', status: 'enabled' },
                { text: 'Bias check on your scoring patterns', status: 'enabled' },
                { text: 'TEAM + DASHBOARD', status: 'enabled', isHeader: true },
                { text: 'Full analytics dashboard', status: 'enabled' },
                { text: 'PDF audit report export', status: 'enabled' },
            ]
        }
    ];

    const mappedPlans: PricingPlan[] = planConfig.map(config => {
        const basePlan = PLANS.find(p => p.id === config.id);
        return {
            id: config.id as any,
            name: config.name,
            monthlyPrice: basePlan?.price?.[currencyKey]?.monthly ?? 0,
            yearlyPrice: basePlan?.price?.[currencyKey]?.annual ?? 0,
            features: config.features as any,
            accent: config.accent,
            isPopular: config.isPopular,
            badgeText: config.badgeText,
            rotation: config.rotation
        } as PricingPlan;
    });

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans relative overflow-visible">
            <div className="relative z-50 w-full">
                <NavBarDemo />
            </div>

            <main className="flex-1">
                <PricingContainer
                    title="Fair hiring starts here."
                    description={<RotatingPricingSubtitle />}
                    plans={mappedPlans}
                    currencySymbol={currency === 'inr' ? '₹' : '$'}
                    className="pt-16 sm:pt-20 lg:pt-24 pb-20"
                />
            </main>

            {/* Restored TrustedByRotator section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-[#f0f0f0] pb-24 text-center border-t border-black/5"
            >
                <div className="max-w-5xl mx-auto px-4">
                    <p className="text-black/40 font-black text-xs uppercase tracking-[0.3em] mb-8">
                        TRUSTED BY INNOVATIVE TEAMS
                    </p>
                    <TrustedByRotator />
                </div>
            </motion.div>

            <FooterSection />
        </div>
    );
}
