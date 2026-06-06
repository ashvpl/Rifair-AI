"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";

const generic = [
  "Requires prompt engineering",
  "Output varies every time",
  "Manual copy-paste workflow",
  "No hiring workflow memory",
  "No structured scorecard layer",
  "Hard to standardize across team",
];

const rifair = [
  "Purpose-built hiring workflows",
  "Repeatable interview kits",
  "Structured evaluation scorecards",
  "Bias-aware question review",
  "Job description optimization",
  "Faster handoff for HR teams",
];

export function WorkflowComparison() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="comparison-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2
            id="comparison-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight"
          >
            Built for hiring workflows,<br className="hidden sm:block" /> not one-off prompts
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed">
            General AI tools can generate text. Rifair AI turns hiring tasks into repeatable workflows — interview kits, scorecards, JD optimization, and bias checks in one structured system.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">

          {/* Generic AI */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="bg-[#F5F5F7] border-2 border-black/10 rounded-2xl p-6 lg:p-8 space-y-5"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-2">General AI Chat</p>
              <div className="h-px bg-black/[0.08]" />
            </div>
            <ul className="space-y-3">
              {generic.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold text-[#86868B] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Rifair AI */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="bg-[#1D1D1F] border-2 border-black rounded-2xl p-6 lg:p-8 space-y-5 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Rifair AI</p>
              <div className="h-px bg-white/[0.08]" />
            </div>
            <ul className="space-y-3">
              {rifair.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-white/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/sign-in?redirect_url=/kit"
            style={{ touchAction: 'manipulation' }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1D1D1F] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-black/80 active:scale-[0.97] transition-all duration-150 shadow-xl"
          >
            Build Your First Hiring Workflow
          </Link>
        </div>
      </div>
    </section>
  );
}
