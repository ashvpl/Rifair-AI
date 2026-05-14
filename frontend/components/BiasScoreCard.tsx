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
      if (s === 0) return { stroke: "#22C55E", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "BIAS FREE" };
      if (s <= 15) return { stroke: "#22C55E", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "CLEAN" };
      if (s >= 40) return { stroke: "#EF4444", text: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "REVIEW NEEDED" };
      return { stroke: "#22C55E", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "LOW BIAS" };
    }

    if (s >= 60) return { stroke: "#EF4444", text: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "CRITICAL" };
    if (s >= 25) return { stroke: "#F97316", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "MODERATE" };
    return { stroke: "#22C55E", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "SAFE" };
  };

  const style = getScoreColor(score);
  // Smaller ring on mobile, full size on desktop
  const radius = 52;
  const desktopRadius = 64;
  const circumference = 2 * Math.PI * desktopRadius;
  const visualScore = Math.min(100, score);
  const strokeDashoffset = circumference - (visualScore / 100) * circumference;

  return (
    <div className="bg-white border-2 border-black p-5 sm:p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-none hover:translate-x-1 hover:translate-y-1" style={style}>
      <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] mb-4 sm:mb-6 md:mb-8 z-10 w-full text-center">Bias Index</h3>
      
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
            <span className={cn("text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-none block", style.text)}>
              {score}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mt-1 block">PTS</span>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className={cn("mt-4 sm:mt-6 md:mt-10 px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", style.bg, style.text, "border-black")}
      >
        {style.label}
      </motion.div>
    </div>
  );
}

