"use client"
import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { CheckoutButton } from '@/components/pricing/CheckoutButton';
import { PlanId } from '@/lib/pricing/types';

export interface PricingFeature {
    text: string;
    status: 'enabled' | 'disabled';
    isHeader?: boolean;
}

export interface PricingPlan {
    id: PlanId;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: (string | PricingFeature)[];
    isPopular?: boolean;
    badgeText?: string;
    accent: string;
    rotation?: number;
}

interface PricingProps {
    title?: string;
    description?: React.ReactNode;
    plans: PricingPlan[];
    currencySymbol?: string;
    className?: string;
}

// Counter Component
const Counter = ({ from, to }: { from: number; to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const controls = animate(from, to, {
            duration: 1,
            onUpdate(value) {
                node.textContent = value.toFixed(0);
            },
        });
        return () => controls.stop();
    }, [from, to]);
    return <span ref={nodeRef} />;
};

// Header Component
const PricingHeader = ({ title, description }: { title?: string; description?: React.ReactNode }) => (
    <div className="text-center mb-12 sm:mb-16 lg:mb-20 relative z-30 px-4 mt-4 sm:mt-6 lg:mt-10">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block max-w-4xl"
        >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black text-slate-800 
                bg-gradient-to-r from-white to-gray-100 px-3 py-2 sm:px-8 sm:py-6 lg:px-12 lg:py-8 rounded-2xl border-4 border-black
                shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]
                transform transition-transform hover:translate-x-1 hover:translate-y-1 mb-6 relative
                before:absolute before:inset-0 before:bg-white/50 before:rounded-xl before:blur-sm before:-z-10">
                {title}
            </h1>
            {description && (
                <div className="text-gray-600 text-lg md:text-xl lg:text-2xl font-bold max-w-2xl mx-auto mb-6">
                    {description}
                </div>
            )}
            <motion.div
                className="h-2 bg-gradient-to-r from-black via-gray-600 to-black rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
            />
        </motion.div>
    </div>
);

// Toggle Component
const PricingToggle = ({ isYearly, onToggle }: { isYearly: boolean; onToggle: () => void }) => (
    <div className="flex justify-center items-center gap-4 mb-8 relative z-10">
        <span className={`text-gray-600 font-medium ${!isYearly ? 'text-black' : ''}`}>Monthly</span>
        <motion.button
            className="w-16 h-8 flex items-center bg-gray-200 rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            onClick={onToggle}
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full border-2 border-black"
                animate={{ x: isYearly ? 32 : 0 }}
            />
        </motion.button>
        <span className={`text-gray-600 font-medium ${isYearly ? 'text-black' : ''}`}>Yearly</span>
        {isYearly && (
            <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-500 font-medium text-sm"
            >
                Save 20%
            </motion.span>
        )}
    </div>
);

// Background Effects Component
const BackgroundEffects = () => {
    const [particles, setParticles] = useState<{ left: string; top: string; x: number; duration: number }[]>([]);

    React.useEffect(() => {
        const newParticles = [...Array(30)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            x: Math.random() * 20 - 10,
            duration: 3 + Math.random() * 2,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <>
            <div className="absolute inset-0">
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-black/5 rounded-full"
                        style={{
                            left: p.left,
                            top: p.top,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, p.x, 0],
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
            <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
                backgroundSize: "16px 16px"
            }} />
        </>
    );
};

// Pricing Card Component
const PricingCard = ({
    plan,
    isYearly,
    index,
    currencySymbol = "$"
}: {
    plan: PricingPlan;
    isYearly: boolean;
    index: number;
    currencySymbol?: string;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

    const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const previousPrice = !isYearly ? plan.yearlyPrice : plan.monthlyPrice;

    // Card JSX remains the same as original, just destructured from props
    return (
        <motion.div
            ref={cardRef}
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            style={{
                rotateX,
                rotateY,
                perspective: 1000,
            }}
            onMouseMove={(e) => {
                if (!cardRef.current) return;
                const rect = cardRef.current.getBoundingClientRect();
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                mouseX.set((e.clientX - centerX) / rect.width);
                mouseY.set((e.clientY - centerY) / rect.height);
            }}
            onMouseLeave={() => {
                mouseX.set(0);
                mouseY.set(0);
            }}
            className={`relative w-full bg-white rounded-xl p-4 sm:p-6 lg:p-8 xl:p-10 border-3 border-black
                shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
                hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] lg:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)]
                transition-all duration-200`}
        >
            {/* Price Badge */}
            <motion.div
                className={cn(
                    `absolute right-2 top-2 sm:-top-4 sm:-right-4 w-16 h-16 
                    rounded-full flex items-center justify-center border-2 border-black
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]`
                    , plan.accent)}
                animate={{
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 0.9, 1.1, 1],
                    y: [0, -5, 5, -3, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: [0.76, 0, 0.24, 1]
                }}
            >
                <div className="text-center text-white">
                    <div className="text-lg font-black">{currencySymbol}
                        <Counter from={previousPrice} to={currentPrice} />
                    </div>
                    <div className="text-[10px] font-bold">/{isYearly ? 'yr' : 'mo'}</div>
                </div>
            </motion.div>

            {/* Plan Name and Badge */}
            <div className="mb-4 min-h-[90px] flex flex-col justify-end items-start">
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-black mb-2">{plan.name}</h3>
                {plan.badgeText ? (
                    <motion.span
                        className={cn(
                            `inline-block px-3 py-1 text-white w-fit
                            font-bold rounded-md text-[10px] border-2 border-black
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]`
                            , plan.accent)}
                        animate={{
                            y: [0, -3, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                    >
                        {plan.badgeText}
                    </motion.span>
                ) : (
                    <div className="h-[28px]" /> /* Spacer to match the badge height */
                )}
            </div>

            {/* CTA Button */}
            <div className="mb-8">
                <CheckoutButton
                    planId={plan.id}
                    billingCycle={isYearly ? 'annual' : 'monthly'}
                    className={cn(`w-full py-2 sm:py-3 lg:py-4 rounded-lg lg:rounded-xl text-white font-black text-xs sm:text-sm lg:text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200`, plan.accent)}
                >
                    GET STARTED →
                </CheckoutButton>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4">
                {plan.features.map((featureObj, i) => {
                    const feature = typeof featureObj === 'string' 
                        ? { text: featureObj, status: 'enabled' as const } 
                        : featureObj;
                    
                    if (feature.isHeader) {
                        return (
                            <div key={`header-${i}`} className="mt-4 mb-2">
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                                    {feature.text}
                                </span>
                            </div>
                        );
                    }

                    const isDisabled = feature.status === 'disabled';

                    return (
                        <motion.div
                            key={`${feature.text}-${i}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={!isDisabled ? {
                                x: 5,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 400 }
                            } : {}}
                            className={cn(
                                `flex items-center gap-2 p-2 rounded-md border-2 border-black
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]`,
                                isDisabled ? "bg-gray-100 opacity-40 grayscale" : "bg-gray-50"
                            )}
                        >
                            <motion.span
                                whileHover={!isDisabled ? { scale: 1.2, rotate: 360 } : {}}
                                className={cn(
                                    `w-5 h-5 rounded-md flex items-center justify-center
                                    text-white font-bold text-xs border border-black
                                    shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]`,
                                    isDisabled ? "bg-gray-400" : plan.accent
                                )}
                            >
                                {isDisabled ? (
                                    <div className="w-2 h-[2px] bg-white rounded-full" />
                                ) : (
                                    <Check size={12} strokeWidth={4} />
                                )}
                            </motion.span>
                            <span className={cn("text-black font-bold text-xs sm:text-sm lg:text-base", isDisabled && "line-through decoration-black/30")}>
                                {feature.text}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

// Main Container Component
export const PricingContainer = ({ 
    title = "Pricing Plans", 
    description,
    plans, 
    currencySymbol = "$",
    className = "" 
}: PricingProps) => {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className={`min-h-fit bg-[#f0f0f0] p-4 sm:p-6 lg:p-10 xl:p-16 relative overflow-visible rounded-[12px] ${className}`}>
            <PricingHeader title={title || ""} description={description || ""} />
            <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
            <BackgroundEffects />

            <div className="w-[100%] max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 relative z-10">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        isYearly={isYearly}
                        index={index}
                        currencySymbol={currencySymbol}
                    />
                ))}
            </div>
        </div>
    );
};
