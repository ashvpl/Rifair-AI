"use client";

import Link from "next/link";
import { HiringWorkflowRow, HiringWorkflowOutput } from "@/lib/workflows/types";
import { format } from "date-fns";
import { Users, Briefcase, Building2, Calendar, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowOverviewProps {
  config: HiringWorkflowRow;
  outputs: HiringWorkflowOutput | null;
  evaluationCount?: number;
}

export function WorkflowOverview({ config, outputs, evaluationCount = 0 }: WorkflowOverviewProps) {
  const score = config.hiring_health_score ?? outputs?.hiring_health_score ?? null;

  const scoreColor =
    score === null ? "text-gray-400" :
    score >= 80 ? "text-emerald-600" :
    score >= 60 ? "text-amber-500" :
    "text-red-500";

  const scoreBorderColor =
    score === null ? "border-gray-200" :
    score >= 80 ? "border-emerald-200" :
    score >= 60 ? "border-amber-200" :
    "border-red-200";

  const scoreBgColor =
    score === null ? "bg-gray-50" :
    score >= 80 ? "bg-emerald-50" :
    score >= 60 ? "bg-amber-50" :
    "bg-red-50";

  const scoreLabel =
    score === null ? "Not scored" :
    score >= 80 ? "Strong Workflow" :
    score >= 60 ? "Good Foundation" :
    "Needs Improvement";

  const scoreBarColor =
    score === null ? "bg-gray-300" :
    score >= 80 ? "bg-emerald-500" :
    score >= 60 ? "bg-amber-400" :
    "bg-red-500";

  const chips = [
    config.seniority_level,
    config.department,
    config.employment_type,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Health Score Hero */}
      <div className={cn("p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center gap-5", scoreBorderColor, scoreBgColor)}>
        <div className="shrink-0 text-center">
          <div className="relative inline-flex">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke={
                  score === null ? "#D1D5DB" :
                  score >= 80 ? "#10b981" :
                  score >= 60 ? "#f59e0b" : "#ef4444"
                }
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - (score ?? 0) / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-black", scoreColor)}>{score ?? "–"}</span>
              <span className="text-[8px] font-black text-[#86868B] uppercase">/100</span>
            </div>
          </div>
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Heart className={cn("w-4 h-4", scoreColor)} />
            <p className="text-[10px] font-black uppercase tracking-wider text-[#86868B]">Hiring Health Score</p>
          </div>
          <p className={cn("text-xl font-black", scoreColor)}>{scoreLabel}</p>
          <p className="text-xs font-medium text-[#86868B] max-w-xs">
            {score === null ? "Generate this workflow to compute the health score." :
             score >= 80 ? "This workflow is structured, bias-free, and evaluation-ready." :
             score >= 60 ? "Good structure — a few improvements can optimize candidate conversion." :
             "Consider revising job requirements, adding evaluation criteria, or reviewing bias."}
          </p>
          <div className="w-full max-w-xs h-1.5 rounded-full bg-black/10 overflow-hidden mt-2 mx-auto sm:mx-0">
            <div className={cn("h-full rounded-full transition-all duration-700", scoreBarColor)} style={{ width: `${score ?? 0}%` }} />
          </div>
        </div>
      </div>

      {/* Role metadata */}
      <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-[#1D1D1F] tracking-tight">{config.role_title}</h2>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {chips.map((chip) => (
              <span key={chip} className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[#86868B] uppercase tracking-wider">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetaItem icon={<Building2 className="w-3.5 h-3.5" />} label="Department" value={config.department || "General"} />
          <MetaItem icon={<Briefcase className="w-3.5 h-3.5" />} label="Type" value={config.employment_type || "Full-time"} />
          <MetaItem icon={<Users className="w-3.5 h-3.5" />} label="Evaluations" value={`${evaluationCount} candidate${evaluationCount !== 1 ? "s" : ""}`} />
          <MetaItem icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={format(new Date(config.created_at), "MMM d, yyyy")} />
        </div>
      </div>

      {/* Skills */}
      {(config.must_have_skills?.length > 0 || config.nice_to_have_skills?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-3">
          {config.must_have_skills?.length > 0 && (
            <SkillsBlock title="Must Have Skills" skills={config.must_have_skills} variant="strong" />
          )}
          {config.nice_to_have_skills?.length > 0 && (
            <SkillsBlock title="Nice to Have" skills={config.nice_to_have_skills} variant="soft" />
          )}
        </div>
      )}

      {/* CTA: Evaluate a candidate */}
      <Link href={`/dashboard/workflows/${config.id}/evaluate`}>
        <div className="group flex items-center justify-between p-5 rounded-2xl border-2 border-black/80 bg-[#1D1D1F] text-white hover:bg-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:scale-[0.99]">
          <div className="space-y-0.5">
            <p className="text-sm font-black">Evaluate a Candidate</p>
            <p className="text-[11px] font-medium text-white/60">Score candidates using the auto-generated scorecard</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </Link>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-[#F5F5F7]/60 border border-black/[0.04] space-y-1">
      <div className="flex items-center gap-1 text-[#86868B]">{icon}<span className="text-[9px] font-black uppercase tracking-wider">{label}</span></div>
      <p className="text-xs font-bold text-[#1D1D1F] truncate">{value}</p>
    </div>
  );
}

function SkillsBlock({ title, skills, variant }: { title: string; skills: string[]; variant: "strong" | "soft" }) {
  return (
    <div className="p-4 rounded-2xl border border-black/[0.06] bg-white space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B]">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className={cn(
            "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
            variant === "strong"
              ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
              : "bg-[#F5F5F7] text-[#86868B] border-black/[0.06]"
          )}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
