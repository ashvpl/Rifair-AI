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
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const visualScore = Math.min(100, score);
  const strokeDashoffset = circumference - (visualScore / 100) * circumference;

  return (
    <div className={cn("bg-white border border-black/[0.05] p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-[3rem] shadow-[0_4px_32px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)]", style.border)}>
      <h3 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-8 z-10 w-full text-center">Spectral Bias Index</h3>
      
      <div className="relative flex items-center justify-center z-10 w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48 drop-shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          {/* Background Track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#F5F5F7"
            strokeWidth="16"
            fill="transparent"
            className="transition-colors"
          />
          {/* Progress Ring */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            cx="96"
            cy="96"
            r={radius}
            stroke={style.stroke}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <span className={cn("text-6xl font-black tracking-tighter leading-none block", style.text)}>
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
        className={cn("mt-10 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", style.bg, style.text, style.border)}
      >
        {style.label}
      </motion.div>
    </div>
  );
}

