"use client";

import { Info, Shield, Layers, HelpCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const hints = [
  { text: "Adapts to company type", icon: Shield, color: "text-blue-400" },
  { text: "Adjusts for seniority", icon: Layers, color: "text-purple-400" },
  { text: "Applies fairness filters", icon: CheckCircle2, color: "text-emerald-400" }
];

export function SmartHints() {
  return (
    <div className="flex items-center gap-6 py-6 border-t border-white/5 mt-8">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Smart Constraints:</span>
      </div>
      
      <div className="flex gap-4">
        {hints.map((hint, idx) => (
          <div key={idx} className="flex items-center gap-2 group cursor-help transition-all hover:scale-105">
            <hint.icon className={`w-3 h-3 ${hint.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors">{hint.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
