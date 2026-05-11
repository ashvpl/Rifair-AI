"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

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
}

export function BlurTextAnimation({
  text = "Elegant blur animation that brings your words to life with cinematic transitions.",
  words,
  className = "",
  fontSize = "text-4xl md:text-5xl lg:text-6xl",
  fontFamily = "font-['Avenir_Next',_'Avenir',_system-ui,_sans-serif]",
  textColor = "text-white",
  animationDelay = 4000,
  containerClassName = ""
}: BlurTextAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textWords = useMemo(() => {
    if (words) return words;
    
    const splitWords = text.split(" ");
    const totalWords = splitWords.length;
    
    return splitWords.map((word, index) => {
      const progress = index / totalWords;
      
      const exponentialDelay = Math.pow(progress, 0.8) * 0.5;
      
      const baseDelay = index * 0.06;
      
      const microVariation = parseFloat((((index % 7) - 3) * 0.01).toFixed(4));
      
      return {
        text: word,
        duration: parseFloat((2.2 + Math.cos(index * 0.3) * 0.3).toFixed(4)),
        delay: parseFloat((baseDelay + exponentialDelay + microVariation).toFixed(4)),
        blur: 12 + (index % 8),
        scale: parseFloat((0.9 + Math.sin(index * 0.2) * 0.05).toFixed(4))
      };
    });
  }, [text, words]);

  useEffect(() => {
    // Reset animation state when text changes
    setIsAnimating(false);
    
    const startAnimation = () => {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 100);
      
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
      }, (maxTime + 1) * 1000);

      return timer;
    };

    const initialTimer = startAnimation();

    return () => {
      clearTimeout(initialTimer);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [textWords, animationDelay]);

  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      <div className={cn("text-center w-full", className)}>
        <p className={cn(textColor, fontSize, fontFamily, "font-light leading-relaxed tracking-wide")}>
          {textWords.map((word, index) => (
            <span
              key={`${text}-${index}`}
              className={cn("inline-block transition-all", isAnimating ? 'opacity-100' : 'opacity-0')}
              style={{
                transitionDuration: `${word.duration}s`,
                transitionDelay: `${word.delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                filter: isAnimating 
                  ? 'blur(0px) brightness(1)' 
                  : `blur(${word.blur}px) brightness(0.6)`,
                transform: isAnimating 
                  ? 'translateY(0) scale(1) rotateX(0deg)' 
                  : `translateY(20px) scale(${word.scale || 1}) rotateX(-15deg)`,
                marginRight: '0.35em',
                willChange: 'filter, transform, opacity',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                textShadow: isAnimating 
                  ? '0 2px 8px rgba(255,255,255,0.1)' 
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

export function Component() {
  return <BlurTextAnimation />;
}
