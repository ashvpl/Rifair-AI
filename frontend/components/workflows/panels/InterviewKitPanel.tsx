"use client";

import { InterviewKitOutput, InterviewKitQuestion } from "@/lib/workflows/types";
import { Clock, Brain, Gauge, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InterviewKitPanelProps {
  kit: InterviewKitOutput;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600 border-emerald-100",
  intermediate: "bg-amber-50 text-amber-600 border-amber-100",
  hard: "bg-red-50 text-red-600 border-red-100",
  advanced: "bg-red-50 text-red-600 border-red-100",
};

const TYPE_COLOR: Record<string, string> = {
  behavioral: "bg-blue-50 text-blue-600 border-blue-100",
  technical: "bg-violet-50 text-violet-600 border-violet-100",
  situational: "bg-orange-50 text-orange-600 border-orange-100",
};

export function InterviewKitPanel({ kit }: InterviewKitPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!kit) return <EmptyState />;

  const totalMins = kit.questions?.reduce((acc, q) => acc + (q.time_minutes || 0), 0) || kit.estimated_duration_minutes;

  return (
    <div className="space-y-6">
      {/* Kit Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5F5F7] to-white border border-black/[0.06] space-y-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h3 className="text-base font-black text-[#1D1D1F]">{kit.kit_title}</h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#86868B]">
            <Clock className="w-3.5 h-3.5" />
            <span>~{totalMins} mins total</span>
          </div>
        </div>
        {kit.kit_summary && (
          <p className="text-sm font-medium text-[#86868B] leading-relaxed">{kit.kit_summary}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from(new Set(kit.questions?.map(q => q.type))).map(type => (
            <span key={type} className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider", TYPE_COLOR[type] || "bg-gray-50 text-gray-600 border-gray-100")}>
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Question count stats */}
      {kit.questions?.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Questions" value={kit.questions.length} icon={<Brain className="w-4 h-4" />} />
          <StatCard label="Estimated Time" value={`${totalMins}m`} icon={<Clock className="w-4 h-4" />} />
          <StatCard label="Competencies" value={new Set(kit.questions.map(q => q.competency)).size} icon={<Gauge className="w-4 h-4" />} />
        </div>
      )}

      {/* Questions Accordion */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Interview Questions</p>
        {kit.questions?.map((q, idx) => (
          <QuestionCard
            key={q.id || idx}
            question={q}
            index={idx}
            isExpanded={expandedId === (q.id || idx)}
            onToggle={() => setExpandedId(expandedId === (q.id || idx) ? null : (q.id || idx))}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
}: {
  question: InterviewKitQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border-2 rounded-2xl overflow-hidden transition-all duration-200",
        isExpanded ? "border-black/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-black/[0.08] hover:border-black/20"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-4 md:p-5 text-left bg-white"
      >
        {/* Index badge */}
        <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-[#1D1D1F]">Q{index + 1}</span>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <p className="text-sm font-bold text-[#1D1D1F] leading-snug">{question.question}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider", TYPE_COLOR[question.type] || "bg-gray-50 text-gray-600 border-gray-100")}>
              {question.type}
            </span>
            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider", DIFFICULTY_COLOR[question.difficulty?.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-100")}>
              {question.difficulty}
            </span>
            <span className="text-[10px] font-bold text-[#86868B]">· {question.time_minutes}m · {question.competency}</span>
          </div>
        </div>

        <div className="shrink-0 text-[#86868B] mt-0.5">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && question.expected_answer && (
        <div className="px-5 pb-5 bg-[#F5F5F7]/50 border-t border-black/[0.05]">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#86868B] mt-4 mb-2">Expected Answer / Signals to Look For</p>
          <p className="text-sm font-medium text-[#1D1D1F] leading-relaxed">{question.expected_answer}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-black/[0.06] bg-white flex flex-col gap-2">
      <div className="w-7 h-7 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
        {icon}
      </div>
      <div>
        <p className="text-lg md:text-2xl font-black text-[#1D1D1F]">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-wider text-[#86868B]">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-[#86868B] text-sm font-medium">No interview kit generated.</p>
    </div>
  );
}
