"use client";

import { motion, useReducedMotion } from "framer-motion";

const competencies = [
  { label: "Technical Skills", score: 8.5, color: "bg-indigo-500" },
  { label: "Problem Solving", score: 8.0, color: "bg-emerald-500" },
  { label: "Communication", score: 7.5, color: "bg-amber-500" },
  { label: "Ownership", score: 8.0, color: "bg-violet-500" },
];

export function CandidateScorecardPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="scorecard-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Copy */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            Decision Support
          </span>
          <h2
            id="scorecard-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight leading-tight"
          >
            Evaluate candidates with structured scorecards
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed">
            Move from scattered opinions to consistent evidence-based evaluation. Rifair AI generates structured candidate scorecards that ensure all interviewers rate candidates against the same defined competencies.
          </p>
        </div>

        {/* Right Column: Scorecard Card */}
        <div className="lg:col-span-7 flex justify-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="w-full max-w-md bg-white border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            {/* Header / Info */}
            <div className="flex justify-between items-start border-b border-black/[0.06] pb-4 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Candidate Profile</p>
                <h3 className="text-xl font-black text-[#1D1D1F] mt-1">Priya Shah</h3>
                <p className="text-xs font-semibold text-[#86868B]">Frontend Developer Candidate</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Role Fit: Strong
                </span>
                <p className="text-[9px] font-black text-[#86868B] uppercase tracking-wider mt-1.5">Scorecard Preview</p>
              </div>
            </div>

            {/* Scores / Progress bars */}
            <div className="space-y-4">
              {competencies.map((comp, i) => (
                <div key={comp.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1D1D1F]">{comp.label}</span>
                    <span className="font-black text-[#86868B] tabular-nums">{comp.score} / 10</span>
                  </div>
                  <div className="h-2 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${comp.color} rounded-full`}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${comp.score * 10}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: i * 0.08, ease: "easeOut" }}
                      style={{ willChange: 'transform' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Evidence & Action */}
            <div className="mt-6 pt-4 border-t border-black/[0.06] space-y-4">
              <div className="bg-[#F5F5F7] border border-black/[0.06] rounded-xl p-4 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#86868B]">Evidence Summary</p>
                <p className="text-xs font-semibold text-[#1D1D1F] leading-relaxed">
                  "Strong React fundamentals, clear debugging approach, and good explanation of tradeoffs."
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 bg-[#1D1D1F] text-white text-[10px] font-black uppercase tracking-wider rounded-xl">
                  Move to final round
                </span>
                <span className="text-[9px] font-black text-black/25 uppercase tracking-widest">
                  Generated by Rifair AI
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
