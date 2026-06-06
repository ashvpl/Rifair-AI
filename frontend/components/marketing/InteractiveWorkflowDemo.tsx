"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";

// Simulated generation steps — no backend calls
const GENERATION_STEPS = [
  "Generating role-specific interview questions",
  "Creating evaluation rubric",
  "Checking for biased language",
  "Building candidate scorecard",
];

const ROLE_DATA = [
  {
    role: "Frontend Developer",
    sections: [
      {
        title: "Technical Skills",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        questions: ["How would you optimize a slow React component?"],
      },
      {
        title: "Problem Solving",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        questions: ["Walk us through how you debug production UI issues."],
      },
      {
        title: "Communication",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        questions: ["How do you explain technical tradeoffs to non-technical stakeholders?"],
      },
    ],
  },
  {
    role: "Product Designer",
    sections: [
      {
        title: "Design Thinking",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        questions: ["Describe your process for taking a feature from concept to mockup."],
      },
      {
        title: "User Empathy",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        questions: ["How do you conduct user research when time or budget is highly limited?"],
      },
      {
        title: "Collaboration",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        questions: ["Explain how you handle critical feedback from developers on your designs."],
      },
    ],
  },
  {
    role: "Sales Manager",
    sections: [
      {
        title: "Methodology",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        questions: ["Walk us through your qualification process for enterprise leads."],
      },
      {
        title: "Performance",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        questions: ["Tell us about a time you turned a lost deal into a won account."],
      },
      {
        title: "Negotiation",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        questions: ["How do you handle price objections without immediately offering discounts?"],
      },
    ],
  },
  {
    role: "Data Analyst",
    sections: [
      {
        title: "Technical Skills",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        questions: ["Write a SQL query or explain how to join tables and filter by aggregation."],
      },
      {
        title: "Analytics",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        questions: ["How do you distinguish between correlation and causation in user metrics?"],
      },
      {
        title: "Presentation",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        questions: ["Tell us about a time you used data to persuade a product manager to pivot."],
      },
    ],
  },
  {
    role: "DevOps Engineer",
    sections: [
      {
        title: "Infrastructure",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        questions: ["How would you design a highly available architecture for a global app?"],
      },
      {
        title: "Incident Response",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        questions: ["Describe your post-mortem process after a critical production outage."],
      },
      {
        title: "Automation",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        questions: ["What strategies do you use to detect bottlenecks in a CI/CD pipeline?"],
      },
    ],
  },
];

const ROLES = [
  "Frontend Developer",
  "Product Designer",
  "Sales Manager",
  "Data Analyst",
  "DevOps Engineer",
];

const GOALS = [
  "Assess React, problem-solving, communication, and ownership",
  "Evaluate UX thinking, creativity, and collaboration",
  "Test sales methodology, pipeline management, and resilience",
  "Analyse SQL, data storytelling, and business acumen",
  "Check cloud infra, CI/CD, and incident response skills",
];

export function InteractiveWorkflowDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roleIdx, setRoleIdx] = useState(0);
  const [seniority, setSeniority] = useState("Mid-level");
  const [genIdx, setGenIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [output, setOutput] = useState<any>(null);

  // Advance generation checklist
  useEffect(() => {
    if (step !== 2) return;
    if (genIdx >= GENERATION_STEPS.length) {
      const t = setTimeout(() => setStep(3), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCompletedSteps((p) => [...p, genIdx]);
      setGenIdx((p) => p + 1);
    }, shouldReduceMotion ? 100 : 620);
    return () => clearTimeout(t);
  }, [step, genIdx, shouldReduceMotion]);

  const handleGenerate = useCallback(() => {
    // Generate randomized scorecard percentages that sum to 90% (leaving 10% for Bias Risk)
    let r1 = Math.floor(Math.random() * 20) + 15; // 15 to 35
    let r2 = Math.floor(Math.random() * 15) + 15; // 15 to 30
    let r3 = Math.floor(Math.random() * 10) + 15; // 15 to 25
    let r4 = 90 - (r1 + r2 + r3);
    if (r4 < 10) {
      r1 -= 5;
      r4 += 5;
    }
    const dynamicScorecard = [
      { label: "Technical Depth", pct: r1, color: "bg-indigo-500" },
      { label: "Problem Solving", pct: r2, color: "bg-emerald-500" },
      { label: "Communication", pct: r3, color: "bg-amber-500" },
      { label: "Ownership", pct: r4, color: "bg-violet-500" },
      { label: "Bias Risk", pct: 10, color: "bg-[#1D1D1F]" },
    ];

    // Pick role data
    const roleData = ROLE_DATA[roleIdx];

    setOutput({
      role: roleData.role,
      seniority: seniority,
      sections: roleData.sections,
      scorecard: dynamicScorecard,
      biasRisk: "Low",
      questionCount: 3,
      competencyAreas: 3,
    });

    setGenIdx(0);
    setCompletedSteps([]);
    setStep(2);
  }, [roleIdx, seniority]);

  const handleReset = useCallback(() => {
    setStep(1);
    setGenIdx(0);
    setCompletedSteps([]);
    setRoleIdx((p) => (p + 1) % ROLES.length);
  }, []);

  return (
    <section
      aria-labelledby="demo-heading"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F5F7] border-t border-black/[0.05] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2
            id="demo-heading"
            className="text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight"
          >
            See Rifair build a hiring workflow
          </h2>
          <p className="text-[#86868B] text-base lg:text-lg font-medium">
            Enter a role. Rifair turns it into interview questions, rubrics, scorecards, and bias checks.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3" aria-label="Demo progress">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                  step === s
                    ? "bg-[#1D1D1F] text-white shadow-md"
                    : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-black/[0.08] text-[#86868B]"
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-10 h-px transition-colors duration-500 ${step > s ? "bg-emerald-400" : "bg-black/10"}`}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        {/* Main demo panel */}
        <div className="relative min-h-[440px]">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform' }}
                className="grid lg:grid-cols-2 gap-6 items-center"
              >
                {/* Form mock */}
                <div className="bg-white border-2 border-black rounded-2xl p-6 lg:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-5">
                  <h3 className="text-lg font-black text-[#1D1D1F]">Build a hiring workflow</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-2">
                        Role
                      </label>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        {ROLES.map((r, i) => (
                          <button
                            key={r}
                            onClick={() => setRoleIdx(i)}
                            style={{ touchAction: 'manipulation' }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-200 active:scale-95 ${
                              roleIdx === i
                                ? "border-black bg-black text-white"
                                : "border-black/10 bg-[#F5F5F7] text-[#1D1D1F] hover:border-black/30"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-2">
                        Seniority
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Junior", "Mid-level", "Senior", "Lead"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSeniority(s)}
                            style={{ touchAction: 'manipulation' }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-200 active:scale-95 ${
                              seniority === s
                                ? "border-black bg-black text-white"
                                : "border-black/10 bg-[#F5F5F7] text-[#1D1D1F] hover:border-black/30"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-2">
                        Hiring Goal
                      </label>
                      <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs font-medium text-[#86868B] border border-black/[0.06]">
                        {GOALS[roleIdx]}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full h-12 bg-[#1D1D1F] text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-black/80 active:scale-[0.98] transition-all duration-150 shadow-lg"
                  >
                    Generate Hiring Workflow →
                  </button>
                </div>

                {/* Preview placeholder */}
                <div className="hidden lg:flex flex-col gap-4 p-8 bg-white border-2 border-dashed border-black/10 rounded-2xl items-center justify-center text-center min-h-[380px]">
                  <div className="space-y-2 opacity-30">
                    {[80, 60, 90, 50, 70].map((w, i) => (
                      <div key={i} className="h-2.5 bg-black/20 rounded-full mx-auto" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <p className="text-[#86868B] text-sm font-semibold mt-6">
                    Your interview kit will appear here
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Generating */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform' }}
                className="flex items-center justify-center min-h-[440px]"
              >
                <div className="bg-white border-2 border-black rounded-2xl p-8 lg:p-12 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6 max-w-md w-full">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-[#1D1D1F]">Building your workflow</h3>
                    <p className="text-sm text-[#86868B] font-medium">{ROLES[roleIdx]} · {seniority}</p>
                  </div>

                  <div className="space-y-4">
                    {GENERATION_STEPS.map((gs, i) => {
                      const done = completedSteps.includes(i);
                      const active = genIdx === i && !done;
                      return (
                        <div key={gs} className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            done ? "bg-emerald-500" : active ? "bg-black" : "bg-black/[0.08]"
                          }`}>
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : active ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                              />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-black/20" />
                            )}
                          </div>
                          <span className={`text-sm font-semibold transition-colors duration-300 ${
                            done ? "text-emerald-600 line-through" : active ? "text-[#1D1D1F]" : "text-[#86868B]"
                          }`}>
                            {gs}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      animate={{ width: `${(completedSteps.length / GENERATION_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ willChange: 'transform' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Output */}
            {step === 3 && output && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform' }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Interview Kit */}
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-5 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-[#1D1D1F] text-base">Interview Kit Generated</h3>
                      <p className="text-xs text-[#86868B] font-medium mt-0.5">
                        {output.questionCount} questions · {output.competencyAreas} competency areas
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Bias Risk: Low
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {output.sections.map((sec: any) => (
                      <div key={sec.title} className={`p-4 rounded-xl border-2 ${sec.border} ${sec.bg} space-y-2`}>
                        <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${sec.color}`}>{sec.title}</h4>
                        <ul className="space-y-1.5">
                          {sec.questions.map((q: string, i: number) => (
                            <li key={i} className="flex gap-2 text-xs text-[#1D1D1F] font-medium leading-relaxed">
                              <ChevronRight className={`w-3.5 h-3.5 ${sec.color} shrink-0 mt-0.5`} />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scorecard + CTA */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                    <h3 className="font-black text-[#1D1D1F] text-base">Candidate Scorecard</h3>
                    <div className="space-y-3">
                      {output.scorecard.map((item: any, i: number) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#1D1D1F]">{item.label}</span>
                            <span className="text-xs font-black text-[#86868B] tabular-nums">{item.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${item.color} rounded-full`}
                              initial={{ width: "0%" }}
                              animate={{ width: `${item.pct}%` }}
                              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: i * 0.08, ease: "easeOut" }}
                              style={{ willChange: 'transform' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/sign-in?redirect_url=/kit"
                      style={{ touchAction: 'manipulation' }}
                      className="flex-1 h-12 bg-[#1D1D1F] text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-black/80 active:scale-[0.98] transition-all duration-150 shadow-lg flex items-center justify-center"
                    >
                      Generate Your Own Kit
                    </Link>
                    <button
                      onClick={handleReset}
                      style={{ touchAction: 'manipulation' }}
                      className="h-12 px-5 border-2 border-black/10 rounded-xl text-sm font-bold text-[#86868B] hover:border-black/30 hover:text-[#1D1D1F] active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
