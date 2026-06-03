"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { REVEAL_TEXT_BACKGROUNDS } from "@/lib/site-images";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
  className?: string;
}

export function RevealText({
  text = "STUNNING",
  textColor = "text-foreground",
  overlayColor = "text-primary",
  fontSize = "text-[60px]",
  letterDelay = 0.05,
  overlayDelay = 0.04,
  overlayDuration = 0.4,
  springDuration = 600,
  className,
  letterImages = [...REVEAL_TEXT_BACKGROUNDS],
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = (lastLetterDelay * 1000) + springDuration;
    
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, totalDelay);
    
    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  if (!isMounted) {
    return (
      <div className={cn("flex items-center justify-center relative select-none", className)}>
        <div className="flex flex-wrap justify-center">
          {text.split(" ").map((word, wordIndex, wordsArray) => (
            <span key={wordIndex} className="inline-flex whitespace-nowrap">
              {word.split("").map((letter, letterIndex) => (
                <span
                  key={letterIndex}
                  className={cn(fontSize, textColor, "font-black tracking-tighter cursor-crosshair relative overflow-hidden inline-block py-0 lg:py-2 lg:leading-[1.3]")}
                >
                  {letter}
                </span>
              ))}
              {wordIndex < wordsArray.length - 1 && (
                <span className={cn(fontSize, "w-[0.25em]")} />
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center relative select-none", className)}>
      <div className="flex flex-wrap justify-center">
        {text.split(" ").map((word, wordIndex, wordsArray) => {
          const previousWordsLen = wordsArray.slice(0, wordIndex).reduce((acc, w) => acc + w.length, 0);
          const globalWordStartIdx = previousWordsLen + wordIndex;
          
          return (
            <span key={wordIndex} className="inline-flex whitespace-nowrap">
              {word.split("").map((letter, letterIndex) => {
                const index = globalWordStartIdx + letterIndex;
                return (
                  <motion.span
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(fontSize, "font-black tracking-tighter cursor-crosshair relative overflow-hidden inline-block py-0 lg:py-2 lg:leading-[1.3]")}
                    initial={{ 
                      scale: 0,
                      opacity: 0,
                      y: 20
                    }}
                    animate={{ 
                      scale: 1,
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: index * letterDelay,
                      type: "spring",
                      damping: 12,
                      stiffness: 200,
                      mass: 0.8,
                    }}
                  >
                    {/* Single dynamic text layer with hover-based image background transition */}
                    <span
                      className={cn(
                        "transition-all duration-300 py-0 lg:py-2 select-none inline-block",
                        hoveredIndex === index
                          ? "text-transparent bg-clip-text bg-cover bg-no-repeat bg-center scale-110"
                          : textColor
                      )}
                      style={{
                        backgroundImage: hoveredIndex === index ? `url('${letterImages[index % letterImages.length]}')` : 'none',
                        WebkitBackgroundClip: hoveredIndex === index ? 'text' : 'unset',
                        WebkitTextFillColor: hoveredIndex === index ? 'transparent' : 'unset',
                      }}
                    >
                      {letter}
                    </span>
                    
                    {/* Overlay text sweep */}
                    {showOverlay && (
                      <motion.span
                        className={cn("absolute inset-0 pointer-events-none py-0 lg:py-2", overlayColor)}
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ 
                          opacity: [0, 1, 1, 0],
                          x: ["-100%", "0%", "0%", "100%"]
                        }}
                        transition={{
                          delay: index * overlayDelay,
                          duration: overlayDuration,
                          times: [0, 0.2, 0.8, 1],
                          ease: "easeInOut"
                        }}
                      >
                        {letter}
                      </motion.span>
                    )}
                  </motion.span>
                );
              })}
              {wordIndex < wordsArray.length - 1 && (
                <span className={cn(fontSize, "w-[0.25em]")} />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
