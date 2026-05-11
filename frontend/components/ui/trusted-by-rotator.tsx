"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { BlurTextAnimation } from "@/components/ui/blur-text-animation"

const TRUSTED_BY_LINES = [
  "Modern recruiting teams",
  "Fast-growing startups",
  "AI-driven enterprises",
  "Talent acquisition professionals",
  "Future-ready organizations",
  "Teams hiring smarter with AI",
  "Enterprise hiring workflows",
  "Recruitment teams worldwide",
]

export function TrustedByRotator({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TRUSTED_BY_LINES.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  // Prevent hydration mismatch by rendering a static version first
  if (!mounted) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1.5", className)}>
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70 uppercase tracking-widest">
          Used by
        </span>
        <div className="relative h-20 flex items-center justify-center w-full min-w-[280px]">
          <BlurTextAnimation 
            text={TRUSTED_BY_LINES[0]}
            fontSize="text-xl sm:text-2xl"
            textColor="text-black dark:text-white"
            fontFamily="font-semibold"
            animationDelay={10000}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-1.5", className)}>
      <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70 uppercase tracking-widest">
        Used by
      </span>
      <div className="relative h-20 flex items-center justify-center w-full min-w-[280px]">
        <BlurTextAnimation 
          text={TRUSTED_BY_LINES[index]}
          fontSize="text-xl sm:text-2xl"
          textColor="text-black dark:text-white"
          fontFamily="font-semibold"
          animationDelay={10000}
        />
      </div>
    </div>
  )
}
