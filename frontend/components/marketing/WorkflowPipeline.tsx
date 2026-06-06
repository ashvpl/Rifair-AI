"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const steps = [
  {
    num: "01",
    label: "Job Description",
    desc: "Input or improve a JD for clarity, inclusivity, and role alignment.",
    href: "/features/job-description-optimizer",
    color: "#6366f1",
    bg: "bg-indigo-50",
    accent: "text-indigo-600",
    border: "border-indigo-100",
  },
  {
    num: "02",
    label: "Interview Kit",
    desc: "Generate structured role-specific questions and evaluation rubrics.",
    href: "/features/interview-kit-generator",
    color: "#10b981",
    bg: "bg-emerald-50",
    accent: "text-emerald-600",
    border: "border-emerald-100",
  },
  {
    num: "03",
    label: "Bias Layer",
    desc: "Detect biased, leading, vague, or inconsistent questions.",
    href: "/features/bias-checker",
    color: "#f59e0b",
    bg: "bg-amber-50",
    accent: "text-amber-600",
    border: "border-amber-100",
  },
  {
    num: "04",
    label: "Candidate Scorecard",
    desc: "Evaluate candidates with consistent criteria.",
    href: "/features/candidate-evaluation",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    accent: "text-violet-600",
    border: "border-violet-100",
  },
  {
    num: "05",
    label: "Hiring Decision",
    desc: "Compare evaluations and move forward with confidence.",
    href: "/dashboard",
    color: "#1D1D1F",
    bg: "bg-[#F5F5F7]",
    accent: "text-[#1D1D1F]",
    border: "border-black/10",
  },
];

export function WorkflowPipeline() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="workflow"
      aria-labelledby="workflow-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2
            id="workflow-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight"
          >
            From job description to hiring decision
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed">
            Rifair AI turns scattered hiring tasks into one repeatable workflow.
          </p>
        </div>

        {/* Desktop: horizontal pipeline */}
        <div className="hidden lg:flex items-stretch gap-0 relative">
          {/* Animated connector line (behind cards) */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-black/[0.06] -translate-y-1/2 pointer-events-none" aria-hidden />
          <motion.div
            className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-indigo-400 via-emerald-400 to-[#1D1D1F] -translate-y-1/2 pointer-events-none"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ willChange: 'transform' }}
            aria-hidden
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform' }}
              className="flex-1 relative z-10 px-2"
            >
              <Link
                href={step.href}
                className={`group flex flex-col gap-3 h-full p-5 rounded-2xl border-2 ${step.border} ${step.bg} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                style={{ touchAction: 'manipulation' }}
              >
                {/* Step number badge */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white border border-white/20"
                  style={{ background: step.color }}
                >
                  {step.num}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className={`text-sm font-black ${step.accent}`}>{step.label}</h3>
                  <p className="text-xs text-[#86868B] font-medium leading-relaxed">{step.desc}</p>
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 ${step.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200`}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="flex flex-col gap-0 relative lg:hidden">
          {/* Vertical line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-black/[0.07]" aria-hidden />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform' }}
              className="relative flex gap-5 pb-6 last:pb-0"
            >
              {/* Step dot */}
              <div
                className="relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black text-white border-2 border-white shadow-sm"
                style={{ background: step.color }}
              >
                {step.num}
              </div>

              <Link
                href={step.href}
                className={`group flex-1 p-4 rounded-2xl border-2 ${step.border} ${step.bg} active:scale-[0.98] transition-transform duration-150`}
                style={{ touchAction: 'manipulation' }}
              >
                <h3 className={`text-sm font-black ${step.accent} mb-1`}>{step.label}</h3>
                <p className="text-xs text-[#86868B] font-medium leading-relaxed">{step.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
