"use client";

import { BiasReviewOutput } from "@/lib/workflows/types";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiasReviewPanelProps {
  biasReview: BiasReviewOutput;
  jdBias?: {
    bias_score: number;
    verified_clean: boolean;
    inclusive_language_used: string[];
    requirements_calibration: string;
  };
}

const SEVERITY_CONFIG = {
  low: {
    label: "Low",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  },
  medium: {
    label: "Medium",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  },
  high: {
    label: "High",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
  },
};

export function BiasReviewPanel({ biasReview, jdBias }: BiasReviewPanelProps) {
  if (!biasReview) return <EmptyState />;

  const score = biasReview.score ?? null;
  const isClean = !biasReview.issues?.length || biasReview.issues.every(i => i.severity === "low");

  const scoreColor =
    score === null ? "text-gray-400" :
    score <= 15 ? "text-emerald-600" :
    score <= 40 ? "text-amber-500" :
    "text-red-500";

  const scoreBg =
    score === null ? "bg-gray-100" :
    score <= 15 ? "bg-emerald-500" :
    score <= 40 ? "bg-amber-400" :
    "bg-red-500";

  const highCount = biasReview.issues?.filter(i => i.severity === "high").length || 0;
  const medCount = biasReview.issues?.filter(i => i.severity === "medium").length || 0;
  const lowCount = biasReview.issues?.filter(i => i.severity === "low").length || 0;

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <div className="p-6 rounded-2xl border-2 border-black/[0.06] bg-white flex flex-col sm:flex-row items-center gap-6">
        {/* Score circle */}
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F5F5F7" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={score === null ? "#E5E7EB" : score <= 15 ? "#10b981" : score <= 40 ? "#f59e0b" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - (score ?? 0) / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-black", scoreColor)}>{score ?? "–"}</span>
            <span className="text-[9px] font-black text-[#86868B] uppercase tracking-wider">/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-black text-[#1D1D1F]">
              {isClean ? "Bias-Clean Workflow" : "Bias Issues Detected"}
            </h3>
            <p className="text-sm font-medium text-[#86868B] mt-0.5">
              {score === null ? "Score unavailable." :
               score <= 15 ? "Excellent — very low bias indicators detected." :
               score <= 40 ? "Moderate — review flagged items for refinement." :
               "Action needed — significant bias patterns identified."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {highCount > 0 && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600">
                {highCount} High
              </span>
            )}
            {medCount > 0 && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600">
                {medCount} Medium
              </span>
            )}
            {lowCount > 0 && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600">
                {lowCount} Low
              </span>
            )}
            {isClean && (
              <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Clean
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      {biasReview.issues?.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Flagged Issues</p>
          {biasReview.issues.map((issue, idx) => {
            const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.low;
            return (
              <div key={idx} className={cn("p-4 rounded-2xl border", cfg.bg, cfg.border)}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", cfg.bg, cfg.border, cfg.text)}>
                        {cfg.label} Severity
                      </span>
                      <span className="text-[10px] font-bold text-[#86868B]">{issue.category}</span>
                    </div>
                    <p className="text-sm font-bold text-[#1D1D1F]">&ldquo;{issue.text}&rdquo;</p>
                    {issue.suggestion && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 shrink-0">Suggestion:</span>
                        <p className="text-xs font-medium text-[#1D1D1F] leading-relaxed">{issue.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-700">No bias issues detected</p>
            <p className="text-xs font-medium text-emerald-600 mt-0.5">
              This workflow uses inclusive, skill-based language throughout.
            </p>
          </div>
        </div>
      )}

      {/* JD Bias cross-reference */}
      {jdBias && (
        <div className="p-5 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/50 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B]">JD Bias Cross-Reference</p>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black">
              <span className={jdBias.bias_score <= 15 ? "text-emerald-600" : jdBias.bias_score <= 35 ? "text-amber-500" : "text-red-500"}>
                {jdBias.bias_score}
              </span>
              <span className="text-sm font-bold text-[#86868B]">/100</span>
            </div>
            <div className="flex-1">
              <div className="w-full h-2 rounded-full bg-white border border-black/[0.04] overflow-hidden">
                <div
                  className={cn("h-full rounded-full", jdBias.bias_score <= 15 ? "bg-emerald-500" : jdBias.bias_score <= 35 ? "bg-amber-400" : "bg-red-500")}
                  style={{ width: `${jdBias.bias_score}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-[#86868B] mt-1">JD Bias Score (lower is better)</p>
            </div>
          </div>
          {jdBias.inclusive_language_used?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {jdBias.inclusive_language_used.map((term, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-black/[0.06] text-[#86868B]">
                  {term}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-[#86868B] text-sm font-medium">No bias review data available.</p>
    </div>
  );
}
