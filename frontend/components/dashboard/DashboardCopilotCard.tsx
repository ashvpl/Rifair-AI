"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const DEFAULT_SUGGESTIONS = [
  { text: "What should I ask a Senior React Developer?", route: "/kit" },
  { text: "What hiring risks exist in this job description?", route: "/jd-analyser" },
  { text: "Generate a candidate scorecard for a Sales Manager.", route: "/evaluations" },
  { text: "Create a structured interview kit for a Product Designer.", route: "/kit" },
];

interface DashboardCopilotCardProps {
  suggestions?: { text: string; route: string }[];
}

export function DashboardCopilotCard({ suggestions = DEFAULT_SUGGESTIONS }: DashboardCopilotCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [inputValue, setInputValue] = useState("");

  const handleSuggestionClick = useCallback((suggestion: { text: string; route: string }) => {
    router.push(suggestion.route);
  }, [router]);

  const handleAsk = useCallback(() => {
    // Route based on input content heuristics
    const lower = inputValue.toLowerCase();
    if (lower.includes("job description") || lower.includes("jd")) {
      router.push("/jd-analyser");
    } else if (lower.includes("scorecard") || lower.includes("evaluation") || lower.includes("candidate")) {
      router.push("/evaluations");
    } else if (lower.includes("bias") || lower.includes("question")) {
      router.push("/analyze");
    } else {
      router.push("/kit");
    }
  }, [inputValue, router]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'transform' }}
      className="bg-gradient-to-br from-[#1D1D1F] to-[#2d2d30] rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" aria-hidden />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Ask Rifair</h3>
            <p className="text-[10px] font-medium text-white/40">Start with a hiring task and let Rifair build the workflow.</p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim()) handleAsk(); }}
            placeholder="E.g. What should I ask a Product Designer?"
            className="flex-1 h-10 bg-white/[0.07] border border-white/10 rounded-xl px-3 text-xs font-medium text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
            aria-label="Ask Rifair a hiring question"
          />
          <button
            onClick={handleAsk}
            disabled={!inputValue.trim()}
            style={{ touchAction: 'manipulation' }}
            className="h-10 px-4 bg-white text-[#1D1D1F] rounded-xl text-xs font-black hover:bg-white/90 active:scale-[0.96] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
            aria-label="Submit question to Rifair"
          >
            Ask <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.text}
              onClick={() => handleSuggestionClick(s)}
              style={{ touchAction: 'manipulation' }}
              className="px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-[11px] font-semibold text-white/60 hover:bg-white/[0.12] hover:text-white/90 hover:border-white/20 active:scale-[0.96] transition-all duration-150 text-left"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
