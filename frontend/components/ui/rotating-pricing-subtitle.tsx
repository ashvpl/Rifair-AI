"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
    "A single hiring mistake can cost far more than the tools designed to prevent it.",
    "Better hiring decisions today can save months of lost productivity tomorrow.",
    "Smarter hiring decisions can reduce costly mistakes and improve long-term performance.",
    "The cost of inefficient hiring often exceeds the cost of improving it.",
    "Invest in better hiring workflows today — avoid costly decisions tomorrow.",
    "One better hiring decision can outweigh months of recruiting costs.",
    "Build stronger teams with smarter, AI-powered hiring decisions.",
    "Hire faster, evaluate better, and reduce avoidable hiring risks."
]

export function RotatingPricingSubtitle() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MESSAGES.length)
        }, 3500) // 500ms fade in + 2500ms visible + 500ms fade out
        
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative min-h-[90px] sm:min-h-[60px] flex items-center justify-center max-w-2xl mx-auto overflow-hidden py-2">
            <AnimatePresence mode="wait">
                <motion.p
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                        duration: 0.5,
                        ease: "easeInOut"
                    }}
                    className="absolute text-gray-600 text-lg md:text-xl font-bold w-full px-4 text-center"
                >
                    {MESSAGES[currentIndex]}
                </motion.p>
            </AnimatePresence>
        </div>
    )
}
