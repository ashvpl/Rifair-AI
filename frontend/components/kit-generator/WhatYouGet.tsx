"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  "Role-specific interview questions",
  "Bias-checked phrasing",
  "Evaluation criteria",
  "Difficulty segmentation",
  "Follow-up questions"
];

export function WhatYouGet() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">What you'll get</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md shadow-xl transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight leading-tight">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
