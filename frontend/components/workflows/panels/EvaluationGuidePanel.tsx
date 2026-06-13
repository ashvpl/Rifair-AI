"use client";

import { EvaluationGuideOutput } from "@/lib/workflows/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface EvaluationGuidePanelProps {
  guide: EvaluationGuideOutput;
}

export function EvaluationGuidePanel({ guide }: EvaluationGuidePanelProps) {
  if (!guide) return <EmptyState />;

  return (
    <div className="space-y-6">
      {/* Overview */}
      {guide.overview && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#3a3a3c] text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Evaluation Overview</p>
          <p className="text-sm font-medium leading-relaxed text-white/90">{guide.overview}</p>
        </div>
      )}

      {/* Do's and Don'ts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Do's */}
        {guide.do_list?.length > 0 && (
          <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Do&rsquo;s</p>
            </div>
            <ul className="space-y-2.5">
              {guide.do_list.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black text-emerald-600">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-800 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Don'ts */}
        {guide.dont_list?.length > 0 && (
          <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50/40 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-red-600">Don&rsquo;ts</p>
            </div>
            <ul className="space-y-2.5">
              {guide.dont_list.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black text-red-500">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Reference Card */}
      <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/50">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B] mb-3">Quick Reference</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-center">
            <p className="text-xl font-black text-emerald-600">{guide.do_list?.length || 0}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-[#86868B]">Best Practices</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-center">
            <p className="text-xl font-black text-red-500">{guide.dont_list?.length || 0}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-[#86868B]">Pitfalls to Avoid</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-[#86868B] text-sm font-medium">No evaluation guide generated.</p>
    </div>
  );
}
