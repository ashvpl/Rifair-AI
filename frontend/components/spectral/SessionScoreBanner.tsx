"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldAlert, TrendingUp, X, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

interface SessionScoreBannerProps {
  funnelState: 1 | 2 | 3;
  sessionFairnessScore: number | null;
  biasedUnrewrittenCount: number;
  planId: string;
}

export function SessionScoreBanner({
  funnelState,
  sessionFairnessScore,
  biasedUnrewrittenCount,
  planId,
}: SessionScoreBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const isPaid = planId === "starter" || planId === "growth" || planId === "enterprise";

  // Don't show for paid users
  if (isPaid) return null;
  if (funnelState < 2) return null;
  if (dismissed) return null;

  // State 2: Legal risk warning
  if (funnelState === 2) {
    const score = sessionFairnessScore;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative rounded-[2rem] border-2 border-black bg-white p-6 md:p-8 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ShieldAlert className="h-6 w-6 text-zinc-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-black text-zinc-900 tracking-tight">
                  {score !== null ? `Fairness Score: ${score}/100` : "Fairness Risk Detected"}
                </p>
                <button onClick={() => setDismissed(true)} className="text-zinc-400 hover:text-black transition-colors ml-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-600 font-medium mb-6 leading-relaxed">
                Your questions may violate anti-discrimination laws. Upgrade to Starter to unlock the full legal risk report and fix these issues instantly.
              </p>
              <button
                onClick={() => router.push("/pricing?highlight=starter")}
                className="text-[10px] font-black text-white bg-black hover:bg-black/90 px-6 py-3 rounded-full transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none uppercase tracking-widest"
              >
                Unlock Legal Report <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // State 3+: Scarcity trigger
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative rounded-[2rem] border-2 border-black bg-white p-6 md:p-8 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <p className="text-base font-black text-red-900 tracking-tight">
                  {sessionFairnessScore !== null
                    ? `Interview Fairness: ${sessionFairnessScore}/100`
                    : "Fairness Alert"}
                </p>
                {biasedUnrewrittenCount > 0 && (
                  <span className="text-[9px] font-black text-red-600 bg-red-50 border-2 border-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {biasedUnrewrittenCount} unfixed
                  </span>
                )}
              </div>
              <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-red-800 font-medium mb-6 leading-relaxed">
              {biasedUnrewrittenCount > 0
                ? `You have ${biasedUnrewrittenCount} biased ${biasedUnrewrittenCount === 1 ? "question" : "questions"} with no fix. Upgrade to fix them before your next interview.`
                : "Upgrade to Starter to unlock bias-free rewrites and full organizational compliance reports."}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => router.push("/pricing?highlight=starter")}
                className="text-[10px] font-black text-white bg-black hover:opacity-90 px-6 py-3 rounded-full transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none uppercase tracking-widest"
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade to Starter
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-[10px] text-red-600 font-black uppercase tracking-widest hover:underline transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
