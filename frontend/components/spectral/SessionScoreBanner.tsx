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
          className="relative rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 overflow-hidden"
        >
          {/* Animated bg stripe */}
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#F59E0B,#F59E0B_10px,transparent_10px,transparent_20px)]" />

          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-black text-amber-900">
                  {score !== null ? `Session Fairness Score: ${score}/100` : "Fairness Risk Detected"}
                </p>
                <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 transition-colors ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-amber-800 font-medium mb-3 leading-relaxed">
                Your questions may violate Indian employment law. Starter shows you which specific acts apply — before your next interview.
              </p>
              <button
                onClick={() => router.push("/pricing?highlight=starter")}
                className="text-xs font-black text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 w-fit shadow-sm"
              >
                See full legal risk report <ArrowRight className="h-3.5 w-3.5" />
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
        className="relative rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 p-5 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(135deg,#EF4444,#EF4444_10px,transparent_10px,transparent_20px)]" />

        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-red-900">
                  {sessionFairnessScore !== null
                    ? `Interview Fairness: ${sessionFairnessScore}/100`
                    : "Upgrade to fix your biased questions"}
                </p>
                {biasedUnrewrittenCount > 0 && (
                  <span className="text-[10px] font-black text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                    {biasedUnrewrittenCount} unfixed
                  </span>
                )}
              </div>
              <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-red-800 font-medium mb-3 leading-relaxed">
              {biasedUnrewrittenCount > 0
                ? `You have ${biasedUnrewrittenCount} biased ${biasedUnrewrittenCount === 1 ? "question" : "questions"} with no bias-free rewrite. Upgrade to Starter to fix them before your next interview round.`
                : "Upgrade to Starter to unlock bias-free rewrites, law violation flags, and your full session report."}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => router.push("/pricing?highlight=starter")}
                className="text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 px-5 py-2.5 rounded-full transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Upgrade to Starter — ₹999/mo
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
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
