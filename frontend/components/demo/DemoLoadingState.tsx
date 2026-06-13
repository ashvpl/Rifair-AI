"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { motion } from "framer-motion";

interface DemoLoadingStateProps {
  onComplete: () => void;
}

const STEPS = [
  "Structuring role requirements",
  "Preparing interview questions",
  "Building scorecard criteria",
  "Reviewing bias-sensitive areas",
  "Creating evaluation guidance",
];

export function DemoLoadingState({ onComplete }: DemoLoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex >= STEPS.length) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timeout);
    }

    // Step duration: simulate active generating
    const duration = 250 + Math.random() * 150; // around 250ms to 400ms per step
    const interval = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, duration);

    return () => clearTimeout(interval);
  }, [currentStepIndex, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[350px] bg-white border border-black/[0.08] rounded-3xl shadow-sm max-w-lg mx-auto w-full">
      <Loader2 className="w-10 h-10 animate-spin text-[#1D1D1F] mb-6" />
      <h3 className="text-lg font-bold text-[#1D1D1F] mb-4 text-center">
        Building your role-based hiring workflow...
      </h3>
      
      <div className="w-full space-y-3 max-w-xs">
        {STEPS.map((step, index) => {
          const isDone = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0.5, y: 5 }}
              animate={{
                opacity: isDone || isActive ? 1 : 0.3,
                y: 0,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 text-sm font-semibold text-left"
            >
              {isDone ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4.5 h-4.5 text-[#1D1D1F] animate-spin shrink-0" />
              ) : (
                <Circle className="w-4.5 h-4.5 text-[#86868B]/30 shrink-0" />
              )}
              <span
                className={
                  isDone
                    ? "text-[#86868B] line-through decoration-black/10"
                    : isActive
                    ? "text-[#1D1D1F] font-bold"
                    : "text-[#86868B]"
                }
              >
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
