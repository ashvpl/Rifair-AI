"use client";

import { ScorecardOutput } from "@/lib/workflows/types";
import { cn } from "@/lib/utils";

interface ScorecardPanelProps {
  scorecard: ScorecardOutput;
}

export function ScorecardPanel({ scorecard }: ScorecardPanelProps) {
  if (!scorecard?.criteria?.length) {
    return <EmptyState />;
  }

  const totalWeight = scorecard.criteria.reduce((acc, c) => acc + (c.weight || 0), 0);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5F5F7] to-white border border-black/[0.06]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-1">Evaluation Scorecard</p>
        <p className="text-sm font-medium text-[#86868B]">
          Use this rubric to score candidates consistently across all {scorecard.criteria.length} competencies.
        </p>
      </div>

      {/* Criteria Cards */}
      <div className="space-y-3">
        {scorecard.criteria.map((criterion, idx) => {
          const pct = totalWeight > 0 ? Math.round((criterion.weight / totalWeight) * 100) : 0;
          const colors = [
            { bar: "bg-blue-500", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" },
            { bar: "bg-violet-500", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600" },
            { bar: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600" },
            { bar: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
            { bar: "bg-rose-500", bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600" },
          ];
          const c = colors[idx % colors.length];

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border-2 border-black/[0.06] bg-white space-y-3 hover:border-black/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider", c.bg, c.border, c.text)}>
                      Criterion {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#1D1D1F]">{criterion.name}</h4>
                  <p className="text-xs font-medium text-[#86868B] leading-relaxed">{criterion.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-2xl font-black text-[#1D1D1F]">{pct}%</span>
                  <p className="text-[9px] font-black text-[#86868B] uppercase tracking-wider">Weight</p>
                </div>
              </div>

              {/* Weight bar */}
              <div className="w-full h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", c.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Score scale labels */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <div
                    key={score}
                    className="text-center py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.04] cursor-default"
                  >
                    <span className="text-xs font-black text-[#86868B]">{score}</span>
                    <p className="text-[8px] font-bold text-[#86868B]/60 mt-0.5 hidden sm:block">
                      {score === 1 ? "Poor" : score === 2 ? "Below" : score === 3 ? "Meets" : score === 4 ? "Exceeds" : "Stellar"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight distribution summary */}
      <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/40">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B] mb-3">Weight Distribution</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {scorecard.criteria.map((criterion, idx) => {
            const pct = totalWeight > 0 ? Math.round((criterion.weight / totalWeight) * 100) : 0;
            const barColors = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
            return (
              <div
                key={idx}
                className={cn("h-full transition-all", barColors[idx % barColors.length])}
                style={{ width: `${pct}%` }}
                title={`${criterion.name}: ${pct}%`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {scorecard.criteria.map((criterion, idx) => {
            const dotColors = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", dotColors[idx % dotColors.length])} />
                <span className="text-[10px] font-bold text-[#86868B]">{criterion.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-[#86868B] text-sm font-medium">No scorecard criteria generated.</p>
    </div>
  );
}
