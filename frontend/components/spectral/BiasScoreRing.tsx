"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BiasScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getSeverity(score: number) {
  if (score >= 60) return {
    stroke: "#EF4444",
    glow: "rgba(239,68,68,0.4)",
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "CRITICAL",
    ring: "shadow-[0_0_32px_rgba(239,68,68,0.25)]",
    pulse: true,
  };
  if (score >= 25) return {
    stroke: "#F97316",
    glow: "rgba(249,115,22,0.3)",
    text: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    label: "MODERATE",
    ring: "shadow-[0_0_24px_rgba(249,115,22,0.15)]",
    pulse: false,
  };
  return {
    stroke: "#22C55E",
    glow: "rgba(34,197,94,0.2)",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "SAFE",
    ring: "",
    pulse: false,
  };
}

export function BiasScoreRing({ score, size = "lg", showLabel = true, className }: BiasScoreRingProps) {
  const s = getSeverity(score);

  const dimensions = {
    sm:  { svgSize: 80,  cx: 40,  cy: 40,  r: 32,  strokeW: 8,  fontSize: "text-xl",    subFontSize: "text-[8px]"  },
    md:  { svgSize: 120, cx: 60,  cy: 60,  r: 48,  strokeW: 10, fontSize: "text-3xl",   subFontSize: "text-[9px]"  },
    lg:  { svgSize: 192, cx: 96,  cy: 96,  r: 80,  strokeW: 14, fontSize: "text-6xl",   subFontSize: "text-[10px]" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.r;
  const dashOffset = circumference - (Math.min(100, score) / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Score ring */}
      <div className={cn("relative flex items-center justify-center rounded-full", s.ring, s.pulse && "animate-pulse-slow")}>
        <svg
          width={dimensions.svgSize}
          height={dimensions.svgSize}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={dimensions.cx} cy={dimensions.cy} r={dimensions.r}
            stroke="#F1F5F9" strokeWidth={dimensions.strokeW}
            fill="transparent"
          />
          {/* Progress arc */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            cx={dimensions.cx} cy={dimensions.cy} r={dimensions.r}
            stroke={s.stroke} strokeWidth={dimensions.strokeW}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
            className="text-center"
          >
            <span className={cn("font-black tracking-tighter leading-none block", dimensions.fontSize, s.text)}>
              {score}
            </span>
            <span className={cn("font-black text-slate-400 uppercase tracking-widest mt-0.5 block", dimensions.subFontSize)}>
              /100
            </span>
          </motion.div>
        </div>
      </div>

      {/* Severity label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
            s.bg, s.text, s.border
          )}
        >
          {s.label}
        </motion.div>
      )}
    </div>
  );
}
