"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Flag, Info } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureGate } from "@/components/pricing/FeatureGate";
import { BiasScoreRing } from "./BiasScoreRing";
import { BlurredRewritePreview } from "./BlurredRewritePreview";
import { LawViolationBadge } from "./LawViolationBadge";
import { cn } from "@/lib/utils";

interface Question {
  original: string;
  bias_score: number;
  bias_level?: string;
  bias_types?: string[];
  flags?: { category: string; severity: string }[];
  explanation?: string;
  improved_question?: string;
  highlighted?: string;
  detectionMethod?: string;
  primary_issue?: string | null;
  competency_being_assessed?: string | null;
  law_violation?: string | null;
  rewrite_rationale?: string | null;
  india_analysis?: {
    india_bias_score: number;
    verdict?: string;
    categories?: string[];
    explanation?: string;
    indian_law_violation?: string;
    confidence?: string;
  } | null;
  india_specific_flags?: string[];
  signals?: string[];
}

interface SpectralBiasReportProps {
  questions: Question[];
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  medium: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  low:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  neutral:{ bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export function SpectralBiasReport({ questions }: SpectralBiasReportProps) {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { canUse } = useSubscription();

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {questions.map((q, idx) => {
          const score      = q.bias_score ?? 0;
          const isNeutral  = score <= 20 && (q.flags?.length || 0) === 0;
          const hasHigh    = q.flags?.some((f) => f.severity === "high");
          const biasLevel  = isNeutral ? "neutral" : (hasHigh || score >= 55) ? "high" : score >= 25 ? "medium" : "low";
          const lawText    = q.india_analysis?.indian_law_violation || q.law_violation;
          const signals    = q.signals || [];
          
          const typeStyle = TYPE_STYLES[biasLevel] ?? TYPE_STYLES.neutral;
          const questionId = idx + 1;
          const isExpanded = expanded === questionId;

          return (
            <motion.div
              key={questionId}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "bg-white border-2 border-black rounded-[2rem] overflow-hidden transition-all duration-300",
                isExpanded
                  ? "shadow-none translate-x-1 translate-y-1"
                  : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              )}
            >
              {/* Question header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : questionId)}
                className="w-full text-left p-5 md:p-6 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Number badge */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5 transition-all duration-300 border-2 border-black",
                    isExpanded
                      ? "bg-[#dc2626] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  )}>
                    {questionId}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide flex items-center gap-1",
                        typeStyle.bg, typeStyle.text, typeStyle.border
                      )}>
                        {isNeutral ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {isNeutral ? "Neutral" : biasLevel}
                      </span>
                      {!isNeutral && (
                        <span className="text-[11px] text-[#86868B] font-medium flex items-center gap-1">
                          Score: <span className={cn("font-bold", typeStyle.text)}>{score}</span>
                        </span>
                      )}
                      {q.detectionMethod && (
                        <span className="hidden sm:inline text-[11px] text-[#86868B] font-medium">
                          · {q.detectionMethod === "full" ? "AI Detected" : "Rule Detected"}
                        </span>
                      )}
                      {q.flags && q.flags.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1">
                          <span className="text-[11px] text-[#86868B] font-medium">·</span>
                          {q.flags.map((f, fi) => (
                            <span key={fi} className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">
                              {f.category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="text-base font-black text-[#1D1D1F] leading-relaxed tracking-tight highlight-container" dangerouslySetInnerHTML={{ __html: q.highlighted || q.original }} />
                  </div>

                  {/* Expand icon */}
                  <span className={cn(
                    "text-[#86868B] flex-shrink-0 transition-transform duration-300 text-lg",
                    isExpanded ? "rotate-180" : ""
                  )}>
                    ↓
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden bg-[#dc2626]/[0.01]"
                  >
                    <div className="p-8 space-y-8 border-t border-black/[0.04]">
                      {isNeutral ? (
                        <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[2rem] p-8 text-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]">
                          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                          <p className="text-lg font-black text-emerald-700 uppercase tracking-widest">Compliance Verified</p>
                          <p className="text-sm text-emerald-600/80 font-medium mt-2">This question passed our fairness checks. No significant bias detected.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left: Issues & Rationale */}
                          <div className="space-y-6">
                            {/* Primary issue badge */}
                            {q.primary_issue && (
                              <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-red-100 border-2 border-red-200 flex items-center justify-center">
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Primary Violation</p>
                                  <p className="text-sm font-bold text-red-900 leading-tight">{q.primary_issue}</p>
                                </div>
                              </div>
                            )}

                            {/* Detailed rationale card */}
                            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                              <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-indigo-600" />
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Bias Rationale</p>
                              </div>
                              <p className="text-sm text-[#1D1D1F] font-medium leading-relaxed italic">
                                "{q.explanation || "This question contains potential bias markers that may inadvertently exclude qualified candidates based on non-essential criteria."}"
                              </p>
                            </div>

                            {/* Law Violation */}
                            {(lawText || score > 40) && (
                              <LawViolationBadge
                                violation={q.law_violation}
                                indiaLawViolation={q.india_analysis?.indian_law_violation}
                              />
                            )}

                            {/* India Analysis (Industrial Card) */}
                            {q.india_analysis && q.india_analysis.india_bias_score > 0 && (
                              <FeatureGate
                                feature="india_bias_flags"
                                requiredPlan="starter"
                                customPrompt="Unlock India-specific bias flags: caste signalling, regional discrimination, institution elitism, and colorism."
                              >
                                <div className="bg-white border-2 border-black rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.1)] space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Flag className="h-4 w-4 text-orange-600" />
                                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                                        India-Specific Context
                                      </span>
                                    </div>
                                    {q.india_analysis.verdict && (
                                      <span className={cn(
                                        "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2",
                                        q.india_analysis.verdict === "SEVERELY_BIASED" ? "bg-red-50 text-red-700 border-red-200" :
                                        "bg-orange-50 text-orange-700 border-orange-200"
                                      )}>
                                        {q.india_analysis.verdict.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {q.india_analysis.categories?.map((cat, ci) => (
                                      <span key={ci} className="text-[10px] px-3 py-1 rounded-xl font-black border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tight">
                                        {cat.replace(/_/g, " ")}
                                      </span>
                                    ))}
                                  </div>

                                  {q.india_analysis.explanation && (
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed border-l-2 border-orange-200 pl-4">
                                      {q.india_analysis.explanation}
                                    </p>
                                  )}
                                </div>
                              </FeatureGate>
                            )}
                          </div>

                          {/* Right: Recommended Rewrite */}
                          <div className="space-y-6">
                            <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(16,185,129,0.05)]">
                              <div className="p-6 border-b-2 border-black/[0.04] bg-emerald-50/[0.3]">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fairness Reconstruction</p>
                                </div>
                              </div>
                              <BlurredRewritePreview
                                rewrittenQuestion={q.improved_question}
                                originalQuestion={q.original}
                                questionIndex={idx}
                                onCopy={handleCopy}
                                copiedId={copiedId}
                              />
                            </div>

                            {/* Signals / Tags */}
                            {signals.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {signals.map((sig, si) => (
                                  <span key={si} className="text-[9px] font-black px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-widest">
                                    # {sig}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
