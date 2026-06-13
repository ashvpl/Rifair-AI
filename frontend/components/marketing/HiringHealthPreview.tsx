"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HiringHealthPreview() {
  const shouldReduceMotion = useReducedMotion();
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const score = 87;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const breakdowns = [
    { label: "Interview Quality", value: 90, color: "#10b981" },
    { label: "JD Clarity", value: 84, color: "#6366f1" },
    { label: "Scorecard Consistency", value: 86, color: "#3b82f6" },
    { label: "Evaluation Completeness", value: 88, color: "#8b5cf6" },
  ];

  return (
    <section
      aria-labelledby="health-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F5F7] border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Card Visual */}
        <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="w-full max-w-md bg-white border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-black/[0.06] pb-4 mb-4">
              <div>
                <h3 className="text-base font-black text-[#1D1D1F]">Hiring Health Score</h3>
                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-0.5">Example Preview</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                Bias Risk: Low
              </span>
            </div>

            {/* Score Arc */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32" aria-label="Hiring health score: 87 out of 100">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="#F5F5F7" strokeWidth="8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#1D1D1F"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset }}
                    viewport={{ once: true }}
                    transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    style={{ willChange: 'stroke-dashoffset' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-black text-[#1D1D1F] tracking-tighter tabular-nums">
                    {score}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#86868B]">/ 100</span>
                </div>
              </div>
            </div>

            {/* Breakdown meters */}
            <div className="space-y-3 pt-4 border-t border-black/[0.05]">
              {breakdowns.map((b, i) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1D1D1F]">{b.label}</span>
                    <span className="font-black text-[#86868B] tabular-nums">{b.value}</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: b.color }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${b.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Copy */}
        <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full border border-black/10">
            Hiring Quality
          </span>
          <h2
            id="health-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight leading-tight"
          >
            Track hiring quality before decisions are made
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed">
            Rifair AI helps teams understand whether their hiring process is structured enough before final decisions are made. Our platform aggregates candidate scorecard consistency, job description clarity, and interview kit quality to calculate a holistic Hiring Health Score for every open role.
          </p>
        </div>

      </div>
    </section>
  );
}
