"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  letterImages = [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000", 
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1000",
    "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=1000",
    "https://images.unsplash.com/photo-1557683917-29d509bd6617?q=80&w=1000",
  ]
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  
  useEffect(() => {
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = (lastLetterDelay * 1000) + springDuration;
    
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, totalDelay);
    
    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

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
                    className={cn(fontSize, "font-black tracking-tighter cursor-crosshair relative overflow-hidden inline-block")}
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
                    {/* Base text layer */}
                    <motion.span 
                      className={cn("absolute inset-0 transition-colors duration-300", textColor)}
                      animate={{ 
                        opacity: hoveredIndex === index ? 0 : 1 
                      }}
                      transition={{ duration: 0.1 }}
                    >
                      {letter}
                    </motion.span>
                    {/* Image text layer with background panning */}
                    <motion.span
                      className="text-transparent bg-clip-text bg-cover bg-no-repeat bg-center"
                      animate={{ 
                        opacity: hoveredIndex === index ? 1 : 0,
                        scale: hoveredIndex === index ? 1.1 : 1
                      }}
                      transition={{ 
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.4, ease: "easeOut" }
                      }}
                      style={{
                        backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {letter}
                    </motion.span>
                    
                    {/* Overlay text sweep */}
                    {showOverlay && (
                      <motion.span
                        className={cn("absolute inset-0 pointer-events-none", overlayColor)}
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
