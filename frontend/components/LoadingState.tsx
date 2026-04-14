"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, FileCheck, Layers, Loader2 } from "lucide-react";
import { LiquidLoader } from "@/components/ui/LiquidLoader";


const MILESTONES = [
  { text: "Starting bias detection engine...", icon: Loader2 },
  { text: "Analyzing sentiment and tone...", icon: Search },
  { text: "Cross-referencing global DEI guidelines...", icon: ShieldCheck },
  { text: "Scanning for hidden demographic bias...", icon: Layers },
  { text: "Drafting improved, inclusive versions...", icon: FileCheck },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const remaining = 100 - prev;
        return prev + (Math.random() * remaining * 0.1);
      });
    }, 400);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < MILESTONES.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const Icon = MILESTONES[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 py-14 space-y-10 border border-indigo-100/50 rounded-[2.5rem] bg-white/60 backdrop-blur-xl shadow-2xl shadow-indigo-100/20 animate-in fade-in zoom-in duration-700 max-w-2xl mx-auto w-full">
      {/* Visual Indicator Container */}
      <div className="relative group flex flex-col items-center justify-center">
        <LiquidLoader text="" className="scale-75" />
      </div>

      <div className="w-full max-w-md space-y-8 text-center px-6">

        {/* Milestone Text with Fade & Scale */}
        <div className="h-20 relative overflow-hidden flex items-center justify-center">
          {MILESTONES.map((milestone, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
                idx === currentStep 
                  ? "opacity-100 translate-y-0 scale-100" 
                  : "opacity-0 translate-y-8 scale-95"
              }`}
            >
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                Phase 0{idx + 1}
              </span>
              <p className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
                {milestone.text}
              </p>
            </div>
          ))}
        </div>

        {/* Premium Progress Bar */}
        <div className="space-y-4">
          <div className="relative h-4 w-full bg-slate-100/80 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] p-1 border border-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated Inner Highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] animate-shimmer opacity-40"></div>
              
              {/* Floating Tooltip-like Percentage */}
              <div className="absolute -right-1 top-full mt-2 transform translate-x-1/2">
                <div className="px-2 py-0.5 bg-slate-800 text-[10px] text-white rounded font-bold">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span className={currentStep >= 1 ? "text-indigo-500 transition-colors" : ""}>Analyze</span>
            <span className={currentStep >= 3 ? "text-purple-500 transition-colors" : ""}>Transform</span>
            <span className={currentStep >= 4 ? "text-pink-500 transition-colors" : ""}>Finalize</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 animate-fade-up">
        <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping"></div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          Hiring Intelligence Engine Active
        </p>
      </div>
    </div>
  );
}
