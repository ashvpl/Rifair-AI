"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BiasScoreCardProps {
  score: number;
  type?: 'kit' | 'analysis';
}

export function BiasScoreCard({ score, type = 'analysis' }: BiasScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (type === 'kit') {
      if (s === 0) return { stroke: "#22C55E", text: "text-success", bg: "bg-success/[0.03]", border: "border-success/10", label: "BIAS FREE" };
      if (s <= 15) return { stroke: "#22C55E", text: "text-success", bg: "bg-success/[0.03]", border: "border-success/10", label: "CLEAN" };
      if (s >= 40) return { stroke: "#EF4444", text: "text-danger", bg: "bg-danger/[0.03]", border: "border-danger/10", label: "REVIEW NEEDED" };
      return { stroke: "#22C55E", text: "text-success", bg: "bg-success/[0.03]", border: "border-success/10", label: "LOW BIAS" };
    }

    if (s >= 65) return { stroke: "#EF4444", text: "text-danger", bg: "bg-danger/[0.03]", border: "border-danger/10", label: "HIGH BIAS" };
    if (s >= 40) return { stroke: "#F59E0B", text: "text-warning", bg: "bg-warning/[0.03]", border: "border-warning/10", label: "MODERATE" };
    return { stroke: "#22C55E", text: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "LOW BIAS" };
  };

  const style = getScoreColor(score);
  // Smaller ring on mobile, full size on desktop
  const radius = 52;
  const desktopRadius = 64;
  const circumference = 2 * Math.PI * desktopRadius;
  const visualScore = Math.min(100, score);
  const strokeDashoffset = circumference - (visualScore / 100) * circumference;

  return (
    <div className={cn("bg-white border border-black/[0.05] p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-[0_4px_32px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)]", style.border)}>
      <h3 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 md:mb-8 z-10 w-full text-center">Spectral Bias Index</h3>
      
      {/* Responsive ring: w-36 h-36 on mobile, w-48 h-48 on desktop */}
      <div className="relative flex items-center justify-center z-10 w-36 h-36 md:w-48 md:h-48">
        <svg className="transform -rotate-90 w-36 h-36 md:w-48 md:h-48 drop-shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          {/* Background Track — small */}
          <circle cx="72" cy="72" r={radius} stroke="#F5F5F7" strokeWidth="13" fill="transparent" className="block md:hidden transition-colors" />
          {/* Progress Ring — small */}
          <motion.circle
            initial={{ strokeDashoffset: 2 * Math.PI * radius }}
            animate={{ strokeDashoffset: 2 * Math.PI * radius - (visualScore / 100) * 2 * Math.PI * radius }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            cx="72" cy="72" r={radius}
            stroke={style.stroke} strokeWidth="13" fill="transparent"
            strokeDasharray={2 * Math.PI * radius}
            strokeLinecap="round"
            className="block md:hidden"
          />
          {/* Background Track — desktop */}
          <circle cx="96" cy="96" r={desktopRadius} stroke="#F5F5F7" strokeWidth="16" fill="transparent" className="hidden md:block transition-colors" />
          {/* Progress Ring — desktop */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            cx="96" cy="96" r={desktopRadius}
            stroke={style.stroke} strokeWidth="16" fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="hidden md:block"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <span className={cn("text-4xl md:text-6xl font-black tracking-tighter leading-none block", style.text)}>
              {score}
            </span>
            <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest mt-1 block">PTS</span>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className={cn("mt-6 md:mt-10 px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", style.bg, style.text, style.border)}
      >
        {style.label}
      </motion.div>
    </div>
  );
}

