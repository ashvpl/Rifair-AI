"use client";

import { motion, useReducedMotion } from "framer-motion";

const metrics = [
  { value: "5 min", label: "Average workflow setup", sub: "From Job Description to kit" },
  { value: "80%", label: "Less manual prep", sub: "Designed to cut manual work" },
  { value: "3x", label: "Faster kit creation", sub: "Structured templates vs ad-hoc" },
  { value: "100%", label: "Structured evaluation", sub: "Every role, every evaluation" },
];

export function MetricsBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Product outcomes"
      className="w-full bg-white border-y border-black/[0.05] py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Safe microcopy */}
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-8">
          Designed to reduce repetitive hiring preparation and structure every evaluation.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)" }}
              className="group relative bg-[#F5F5F7] border border-black/[0.06] rounded-2xl p-4 sm:p-5 lg:p-6 overflow-hidden cursor-default transition-shadow duration-300"
              style={{ willChange: 'transform' }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden />

              <p className="font-mono text-2xl sm:text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tighter tabular-nums">
                {m.value}
              </p>
              <p className="mt-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]">
                {m.label}
              </p>
              <p className="mt-1 text-[10px] font-medium text-[#86868B] leading-relaxed hidden sm:block">
                {m.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
