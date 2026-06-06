"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";

interface HiringHealthScoreCardProps {
  /** Overall score 0-100. Omit to show empty/demo state. */
  score?: number | undefined;
  interviewQuality?: number | undefined;
  biasRisk?: number | undefined;
  jdQuality?: number | undefined;
  evaluationConsistency?: number | undefined;
  /** If true, shows labelled example preview — use for new users with no data. */
  isDemo?: boolean | undefined;
  /** If true, shows upgrade prompt instead of score. */
  isLocked?: boolean | undefined;
}

const DEMO_VALUES = {
  score: 87,
  interviewQuality: 90,
  biasRisk: 85,
  jdQuality: 82,
  evaluationConsistency: 91,
};

function ScoreArc({ score, color = "#10b981" }: { score: number; color?: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-32 h-32 mx-auto" aria-label={`Hiring health score: ${score} out of 100`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F5F5F7" strokeWidth="8" />
        {/* Progress */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ willChange: 'stroke-dashoffset' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-black text-[#1D1D1F] tracking-tighter tabular-nums">
          {score}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#86868B]">/ 100</span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-[#1D1D1F]">{label}</span>
        <span className="text-[11px] font-black text-[#86868B] tabular-nums" aria-label={`${label}: ${value}`}>{value}</span>
      </div>
      <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, willChange: 'transform' }}
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
}

export function HiringHealthScoreCard({
  score,
  interviewQuality,
  biasRisk,
  jdQuality,
  evaluationConsistency,
  isDemo = false,
  isLocked = false,
}: HiringHealthScoreCardProps) {
  const hasData = typeof score === "number";
  const displayScore = hasData ? score! : isDemo ? DEMO_VALUES.score : null;
  const iq = interviewQuality ?? (isDemo ? DEMO_VALUES.interviewQuality : null);
  const br = biasRisk ?? (isDemo ? DEMO_VALUES.biasRisk : null);
  const jd = jdQuality ?? (isDemo ? DEMO_VALUES.jdQuality : null);
  const ec = evaluationConsistency ?? (isDemo ? DEMO_VALUES.evaluationConsistency : null);

  const subScores = [
    { label: "Interview Quality", value: iq, color: "#10b981" },
    { label: "Bias Risk (lower = better)", value: br, color: "#f59e0b" },
    { label: "JD Quality", value: jd, color: "#6366f1" },
    { label: "Evaluation Consistency", value: ec, color: "#3b82f6" },
  ];

  return (
    <div
      className="bg-white border-2 border-black rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-5"
      role="region"
      aria-labelledby="hiring-health-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 id="hiring-health-heading" className="text-xs sm:text-base lg:text-xl font-black text-[#1D1D1F] tracking-tight">
          Hiring Health Score
        </h3>
        {isDemo && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[#86868B]">
            Example Preview
          </span>
        )}
        {isLocked && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
            <Lock className="w-2.5 h-2.5" /> Locked
          </span>
        )}
      </div>

      {/* Locked state */}
      {isLocked ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F7] border-2 border-black/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#86868B]" />
          </div>
          <p className="text-sm font-black text-[#1D1D1F]">Upgrade to unlock detailed hiring health insights</p>
          <Link
            href="/pricing?highlight=growth"
            style={{ touchAction: 'manipulation' }}
            className="px-5 py-2 bg-[#1D1D1F] text-white rounded-full text-xs font-black hover:bg-black/80 active:scale-[0.97] transition-all duration-150"
          >
            View Pricing
          </Link>
        </div>
      ) : displayScore === null ? (
        // No data empty state
        <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#E5E7EB] flex items-center justify-center">
            <span className="font-mono text-2xl font-black text-[#D1D5DB]">—</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-[#1D1D1F]">Not enough data yet</p>
            <p className="text-xs font-medium text-[#86868B]">Run your first workflow to generate a hiring health score.</p>
          </div>
        </div>
      ) : (
        // Score display
        <div className="space-y-5">
          <ScoreArc score={displayScore} />

          {/* Recommendation */}
          {isDemo && (
            <p className="text-xs font-medium text-[#86868B] text-center leading-relaxed">
              Your workflow is strong, but job description clarity can improve.
            </p>
          )}

          {/* Sub-scores */}
          <div className="space-y-3 pt-2 border-t border-black/[0.05]">
            {subScores.map((s) =>
              s.value !== null ? (
                <SubScoreBar key={s.label} label={s.label} value={s.value!} color={s.color} />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
