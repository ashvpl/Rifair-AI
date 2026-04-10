"use client";

import { motion } from "framer-motion";
import { Sparkles, Terminal } from "lucide-react";

export function ExamplePreview() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Example Preview</h4>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="group relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative bg-[#0F0F10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 transition-transform duration-500 hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Terminal className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">Role Identity</p>
                <h6 className="text-sm font-bold text-zinc-200">Frontend Engineer</h6>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-purple-400/40 animate-pulse" />
          </div>
          
          <div className="space-y-8 font-mono">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-zinc-600 font-bold text-xs pt-1">Q1</div>
                <div>
                  <p className="text-sm font-bold text-zinc-200 mb-2 leading-relaxed tracking-tight underline decoration-purple-500/30 underline-offset-4">How do you optimize React performance?</p>
                  <div className="flex flex-col gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Evaluation Logic:</span>
                    <p className="text-[11px] text-zinc-400 font-medium">Problem-solving, depth of knowledge, memoization strategies, reconciliation internals.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-zinc-600 font-bold text-xs pt-1">Q2</div>
                <div>
                  <p className="text-sm font-bold text-zinc-200 mb-2 leading-relaxed tracking-tight underline decoration-blue-500/30 underline-offset-4">Describe a challenging UI bug you solved.</p>
                  <div className="flex flex-col gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Evaluation Logic:</span>
                    <p className="text-[11px] text-zinc-400 font-medium">Debugging approach, communication, browser rendering understanding.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
