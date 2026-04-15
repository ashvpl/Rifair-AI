"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    id: "recon",
    label: "AI Pattern Recon",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
    description: "Deep semantic analysis of question intent."
  },
  {
    id: "neutralize",
    label: "Bias Neutralization",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200",
    description: "Automatic removal of non-inclusive language."
  },
  {
    id: "scoring",
    label: "Fairness Scoring",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
    description: "Explainable risk scores for every parameter."
  },
  {
    id: "localize",
    label: "Localized Expertise",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200",
    description: "Adapts to role, seniority, and culture."
  }
];

const AUTO_PLAY_INTERVAL = 4000;

export function KitFeatureCards() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURES.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getCardStatus = (index: number) => {
    const len = FEATURES.length;
    const diff = (index - currentIndex + len) % len;

    if (diff === 0) return "active";
    if (diff === len - 1) return "prev";
    if (diff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center">
        {FEATURES.map((feature, index) => {
          const status = getCardStatus(index);
          const isActive = status === "active";
          const isPrev = status === "prev";
          const isNext = status === "next";

          return (
            <motion.div
              key={feature.id}
              initial={false}
              animate={{
                x: isActive ? 0 : isPrev ? -120 : isNext ? 120 : 0,
                scale: isActive ? 1 : isPrev || isNext ? 0.82 : 0.6,
                opacity: isActive ? 1 : isPrev || isNext ? 0.35 : 0,
                rotate: isPrev ? -6 : isNext ? 6 : 0,
                zIndex: isActive ? 30 : isPrev || isNext ? 20 : 10,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 24,
                mass: 0.8,
              }}
              className="absolute inset-0 rounded-[3rem] overflow-hidden border-8 border-black bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] origin-center"
            >
              <img
                src={feature.image}
                alt={feature.label}
                className={cn(
                  "w-full h-full object-cover transition-all duration-1000",
                  isActive ? "grayscale-0 blur-0" : "grayscale blur-[4px] brightness-75"
                )}
              />

              {/* Top Label */}
              <div
                className={cn(
                  "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-500",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
                <span className="text-white font-black text-[9px] uppercase tracking-[0.3em]">
                  Rifair Intelligence
                </span>
              </div>

              {/* Bottom Label & Description */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute inset-x-0 bottom-0 p-10 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end pointer-events-none"
                  >
                    <div className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-xl mb-4 border border-black/10">
                      {index + 1} • {feature.label}
                    </div>
                    <p className="text-white font-black text-2xl leading-tight tracking-tight drop-shadow-xl">
                      {feature.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      {/* Indicator dots */}
      <div className="flex gap-2 mt-12">
        {FEATURES.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentIndex ? "w-8 bg-black" : "w-1.5 bg-black/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
