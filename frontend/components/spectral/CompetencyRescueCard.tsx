"use client";

import { Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";

interface CompetencyRescueCardProps {
  competencyBeingAssessed?: string | null;
  rewriteRationale?: string | null;
}

const LOCKED_EXAMPLES = [
  {
    intent: "Assessing availability and commitment",
    better: "Can you walk me through how you manage priorities when multiple deadlines overlap?",
  },
  {
    intent: "Evaluating long-term dedication",
    better: "What does career growth look like for you in the next few years?",
  },
];

export function CompetencyRescueCard({
  competencyBeingAssessed,
  rewriteRationale,
}: CompetencyRescueCardProps) {
  const { canUse } = useSubscription();
  const router = useRouter();
  const isUnlocked = canUse("competency_rescue");

  if (!isUnlocked) {
    const example = LOCKED_EXAMPLES[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-emerald-200/60 overflow-hidden cursor-pointer group"
        onClick={() => router.push("/pricing?highlight=starter&feature=competency_rescue")}
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 flex items-center gap-2.5 border-b border-emerald-200/40">
          <Target className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            🎯 Competency Rescue
          </p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              This question was trying to assess:
            </p>
            <p className="text-xs font-bold text-slate-700 blur-[4px] select-none">
              {example.intent}
            </p>
          </div>
          <p className="text-[10px] font-black text-emerald-600 group-hover:underline flex items-center gap-1">
            Unlock with Starter <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </motion.div>
    );
  }

  if (!competencyBeingAssessed && !rewriteRationale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-emerald-200/60 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 flex items-center gap-2.5 border-b border-emerald-200/40">
        <Target className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
          🎯 Competency Rescue
        </p>
      </div>
      <div className="p-4 space-y-3">
        {competencyBeingAssessed && (
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              This question was trying to assess:
            </p>
            <p className="text-sm font-bold text-slate-800">{competencyBeingAssessed}</p>
          </div>
        )}
        {rewriteRationale && (
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            {rewriteRationale}
          </p>
        )}
      </div>
    </motion.div>
  );
}
