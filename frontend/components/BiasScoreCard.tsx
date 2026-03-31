"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BiasScoreCardProps {
  score: number;
}

export function BiasScoreCard({ score }: BiasScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s <= 30) return { stroke: "#22C55E", text: "text-success", bg: "bg-success/10", border: "border-success/20", label: "Low Risk" };
    if (s <= 70) return { stroke: "#F59E0B", text: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "Medium Risk" };
    return { stroke: "#EF4444", text: "text-danger", bg: "bg-danger/10", border: "border-danger/20", label: "High Risk" };
  };

  const style = getScoreColor(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden", style.border)}>
      {/* Background glow behind ring */}
      <div className={cn("absolute inset-0 blur-[60px] opacity-20 transition-colors", style.bg)} />
      
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 z-10 w-full text-center">Bias Severity Score</h3>
      
      <div className="relative flex items-center justify-center z-10">
        <svg className="transform -rotate-90 w-40 h-40">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-surface"
          />
          {/* Progress Ring */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="80"
            cy="80"
            r={radius}
            stroke={style.stroke}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn("text-4xl font-extrabold tracking-tighter", style.text)}
          >
            {score}
          </motion.span>
        </div>
      </div>
      
      <div className={cn("mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border", style.bg, style.text, style.border)}>
        {style.label}
      </div>
    </div>
  );
}
