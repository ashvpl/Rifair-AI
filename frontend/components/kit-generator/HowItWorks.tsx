"use client";

import { Search, Cpu, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Define Role",
    desc: "Input role, seniority, and constraints",
    icon: Search,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  {
    title: "AI Processing",
    desc: "Multi-layer bias-aware generation",
    icon: Cpu,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  },
  {
    title: "Structured Output",
    desc: "Receive a complete interview kit",
    icon: FileCheck,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  }
];

export function HowItWorks() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">How it works</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Connecting Lines (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0" />
        
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative z-10 group"
          >
            <div className="h-full p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-900 hover:border-white/10 shadow-2xl">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                <step.icon className={`w-5 h-5 ${step.iconColor}`} />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 mb-1 tracking-tight">{step.title}</h5>
              <p className="text-xs text-zinc-500 leading-normal font-medium">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
