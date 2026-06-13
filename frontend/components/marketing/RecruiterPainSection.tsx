"use client";

import { motion, useReducedMotion } from "framer-motion";

const pains = [
  {
    title: "Manual interview preparation",
    desc: "Recruiters spend time rebuilding questions and rubrics for every role.",
  },
  {
    title: "Different questions for every candidate",
    desc: "Interviewers often evaluate candidates using inconsistent standards.",
  },
  {
    title: "No clear evaluation rubric",
    desc: "Scores become subjective when criteria are not defined before interviews.",
  },
  {
    title: "Scattered feedback after interviews",
    desc: "Notes get lost across docs, chats, calls, and memory.",
  },
  {
    title: "Weak candidate comparison",
    desc: "Close candidates are hard to compare without structured evidence.",
  },
  {
    title: "Bias and inconsistency risks",
    desc: "Vague or leading questions can affect fairness and consistency.",
  },
];

export function RecruiterPainSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="pain-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F5F7] border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2
            id="pain-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight leading-tight"
          >
            Recruiters do not need more random AI output. They need structured hiring workflows.
          </h2>
          <p className="text-[#86868B] text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            Most hiring teams still create interview questions manually, evaluate candidates differently, and make decisions from scattered notes. Rifair AI helps turn that messy process into structured, repeatable hiring workflows.
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {pains.map((p, i) => (
            <motion.div
              key={p.title}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 flex flex-col justify-between"
              style={{ touchAction: 'manipulation', willChange: 'transform' }}
            >
              <div className="space-y-2">
                <h3 className="text-base font-black text-[#1D1D1F] tracking-tight">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed font-semibold">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
