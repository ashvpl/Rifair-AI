"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";

interface WordData {
  text: string;
  duration: number;
  delay: number;
  blur: number;
  scale?: number;
}

interface BlurTextAnimationProps {
  text?: string;
  words?: WordData[];
  className?: string;
  fontSize?: string;
  fontFamily?: string;
  textColor?: string;
  animationDelay?: number;
  containerClassName?: string;
  loop?: boolean;
  once?: boolean;
}

export function BlurTextAnimation({
  text = "Elegant blur animation that brings your words to life with cinematic transitions.",
  words,
  className = "",
  fontSize = "text-4xl md:text-5xl lg:text-6xl",
  fontFamily = "font-sans",
  textColor = "text-white",
  animationDelay = 4000,
  containerClassName = "",
  loop = false,
  once = true
}: BlurTextAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use framer-motion's useInView to detect when the section is visible
  const isInView = useInView(containerRef, {
    once: once, // Only trigger once by default
    amount: 0.3 // Trigger when 30% of the element is visible
  });

  const textWords = useMemo(() => {
    if (words) return words;
    
    const splitWords = text.split(" ");
    const totalWords = splitWords.length;
    
    return splitWords.map((word, index) => {
      const progress = index / totalWords;
      
      const exponentialDelay = Math.pow(progress, 0.8) * 0.5;
      const baseDelay = index * 0.06;
      
      // Use toFixed to ensure deterministic values across server/client (avoid float precision issues)
      // Replace Math.random() with a deterministic value based on position
      return {
        text: word,
        duration: parseFloat((1.5 + Math.cos(index * 0.3) * 0.3).toFixed(4)),
        delay: parseFloat((baseDelay + exponentialDelay).toFixed(4)),
        blur: 15 + ((index * 7) % 8),
        scale: parseFloat((0.8 + Math.sin(index * 0.2) * 0.1).toFixed(4))
      };
    });
  }, [text, words]);

  useEffect(() => {
    // Only start the animation sequence when it's in view
    if (!isInView) return;

    const startAnimation = () => {
      // Small buffer before starting the animate-in phase
      setTimeout(() => {
        setIsAnimating(true);
      }, 300);
      
      // If looping is enabled, calculate when to reset
      if (loop) {
        let maxTime = 0;
        textWords.forEach(word => {
          const totalTime = word.delay + word.duration;
          maxTime = Math.max(maxTime, totalTime);
        });
        
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          
          resetTimeoutRef.current = setTimeout(() => {
            startAnimation();
          }, animationDelay);
        }, (maxTime + 2) * 1000);
      }
    };

    startAnimation();

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [textWords, animationDelay, loop, isInView]);

  return (
    <div ref={containerRef} className={cn("flex items-center justify-center", containerClassName)}>
      <div className={cn("text-left w-full", className)}>
        <p className={cn(textColor, fontSize, fontFamily, "font-light leading-relaxed tracking-wide")}>
          {textWords.map((word, index) => (
            <span
              key={index}
              className={cn("inline-block transition-all")}
              style={{
                transitionDuration: `${word.duration}s`,
                transitionDelay: `${word.delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                // Start visible with slight blur, animate to fully sharp
                // This ensures text is ALWAYS readable even if animation doesn't trigger
                filter: isAnimating 
                  ? 'blur(0px) brightness(1)' 
                  : isInView 
                    ? `blur(${word.blur}px) brightness(0.6)` 
                    : 'blur(0px) brightness(1)',
                opacity: isInView && !isAnimating ? (word.blur > 18 ? 0.3 : 0.6) : 1,
                transform: isAnimating 
                  ? 'translateY(0) scale(1) rotateX(0deg)' 
                  : isInView
                    ? `translateY(30px) scale(${word.scale || 1}) rotateX(-15deg)`
                    : 'translateY(0) scale(1) rotateX(0deg)',
                marginRight: '0.35em',
                willChange: 'filter, transform, opacity',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                textShadow: isAnimating 
                  ? '0 0 20px rgba(255,255,255,0.2)' 
                  : '0 0 40px rgba(255,255,255,0.4)'
              }}
            >
              {word.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export function BlurTextDemo() {
  return <BlurTextAnimation />;
}
