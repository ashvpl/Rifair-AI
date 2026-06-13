"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  duration: number; // simulated duration in ms
}

const GENERATING_STEPS: Step[] = [
  { id: 1, label: "Extracting core role competencies...", duration: 2500 },
  { id: 2, label: "Calibrating job description requirements...", duration: 3000 },
  { id: 3, label: "Aligning inclusive language and bias checks...", duration: 3500 },
  { id: 4, label: "Building structured interview question bank...", duration: 4000 },
  { id: 5, label: "Assembling scorecard rubrics and interviewer guide...", duration: 3000 },
];

export function WorkflowGeneratingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    const runSteps = async () => {
      for (let i = 0; i < GENERATING_STEPS.length; i++) {
        if (!active) break;
        setCurrentStep(i);
        await new Promise((resolve) => setTimeout(resolve, GENERATING_STEPS[i].duration));
        if (!active) break;
        setCompletedSteps((prev) => [...prev, GENERATING_STEPS[i].id]);
      }
    };

    runSteps();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-6 max-w-lg mx-auto space-y-8 text-center animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-[#1D1D1F] tracking-tight">
          Architecting Hiring Workflow
        </h3>
        <p className="text-xs sm:text-sm font-medium text-[#86868B]">
          Please wait. Rifair AI is analyzing your inputs and generating structured assets.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 border-b border-black/[0.04] pb-2.5">
          Generation Steps
        </p>

        <div className="space-y-3.5">
          {GENERATING_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === idx && !isCompleted;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 transition-colors duration-300",
                  isCompleted ? "text-emerald-600" : isCurrent ? "text-black" : "text-black/30"
                )}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-600 animate-in zoom-in-50 duration-200" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-black/10" />
                  )}
                </div>
                <span className={cn(
                  "text-xs sm:text-sm font-bold tracking-tight",
                  isCurrent && "font-extrabold"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
