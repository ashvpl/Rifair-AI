"use client";

import { motion, useReducedMotion } from "framer-motion";

const mockMetrics = [
  { label: "Active Roles", value: "12", color: "text-indigo-600", dot: "bg-indigo-500" },
  { label: "Interview Kits", value: "17", color: "text-emerald-600", dot: "bg-emerald-500" },
  { label: "Candidate Scorecards", value: "42", color: "text-amber-600", dot: "bg-amber-500" },
  { label: "JD Quality", value: "91%", color: "text-violet-600", dot: "bg-violet-500" },
  { label: "Hiring Health", value: "87", color: "text-[#1D1D1F]", dot: "bg-[#1D1D1F]" },
];

const workflowMini = ["JD", "Kit", "Bias Layer", "Evaluation", "Decision"];

export function HiringOSPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="preview-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F5F7] border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2
            id="preview-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight"
          >
            Your hiring workflow in one dashboard
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium max-w-xl mx-auto">
            A command center for every hiring decision — from job description to final offer.
          </p>
        </div>

        {/* Mock Dashboard */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform' }}
          className="relative bg-[#0f0f10] rounded-3xl border border-white/[0.06] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

          {/* Title bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map((c, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
              ))}
            </div>
            <div className="flex-1 h-5 bg-white/[0.04] rounded-full mx-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Hiring Workflow Dashboard</span>
          </div>

          <div className="p-5 lg:p-8 space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {mockMetrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: "easeOut" }}
                  style={{ willChange: 'transform' }}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 lg:p-4 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{m.label}</span>
                  </div>
                  <p className={`font-mono text-xl lg:text-2xl font-black ${m.color} tracking-tighter tabular-nums`}>
                    {m.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Mini workflow pipeline */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 lg:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">Workflow Status</p>
              <div className="flex items-center gap-0 overflow-x-auto pb-1">
                {workflowMini.map((step, i) => (
                  <div key={step} className="flex items-center shrink-0">
                    <motion.div
                      animate={{ boxShadow: i < 3 ? ["0 0 0px #10b98100", "0 0 12px #10b98166", "0 0 0px #10b98100"] : [] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap ${
                        i < 3
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          : i === 3
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "bg-white/[0.05] text-white/30 border border-white/[0.08]"
                      }`}
                    >
                      {step}
                    </motion.div>
                    {i < workflowMini.length - 1 && (
                      <div className="w-6 h-px bg-white/10 shrink-0" aria-hidden />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sample row — blurred data */}
            <div className="space-y-2">
              {[
                { role: "Senior Frontend Developer", status: "Kit Generated", pct: 75 },
                { role: "Product Designer", status: "Evaluating", pct: 45 },
                { role: "Data Analyst", status: "JD Optimized", pct: 20 },
              ].map((row, i) => (
                <motion.div
                  key={row.role}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.04] rounded-xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white/70 truncate">{row.role}</p>
                    <p className="text-[10px] font-bold text-emerald-400/70 mt-0.5">{row.status}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-white/30 tabular-nums">{row.pct}%</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Example preview label */}
            <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/15">
              Example Preview — Your real data appears after first workflow
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
