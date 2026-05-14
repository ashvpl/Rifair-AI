"use client";

import { Scale } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";

interface LawViolationBadgeProps {
  violation?: string | null | undefined;
  indiaLawViolation?: string | null | undefined;
}

export function LawViolationBadge({ violation, indiaLawViolation }: LawViolationBadgeProps) {
  const { canUse } = useSubscription();
  const router = useRouter();
  const isUnlocked = canUse("law_violation");

  const lawText = indiaLawViolation || violation;

  // Only render if there's a law violation to show
  if (!lawText && isUnlocked) return null;

  // For free users, show a teaser if we know there's a violation
  const teaserText = "Potential Indian employment law violation detected";

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 p-4 bg-red-50 border-2 border-black rounded-2xl cursor-pointer group shadow-[4px_4px_0px_0px_rgba(220,38,38,0.1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-300"
        onClick={() => router.push("/pricing?highlight=starter&feature=law_violation")}
      >
        <div className="w-10 h-10 bg-red-100 border-2 border-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Scale className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">
            ⚖️ Risk Detection Locked
          </p>
          <p className="text-sm text-red-600/80 font-bold blur-[4px] select-none leading-tight">
            {teaserText}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Starter</span>
            <p className="text-[10px] text-red-500 font-bold group-hover:underline">
              Unlock citation →
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!lawText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-start gap-4 p-5 bg-red-50 border-2 border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(220,38,38,0.08)]"
    >
      <div className="w-12 h-12 bg-red-100 border-2 border-red-200 rounded-2xl flex items-center justify-center flex-shrink-0">
        <Scale className="h-6 w-6 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">
            ⚖️ Legal Compliance Risk
          </p>
          <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded tracking-tighter">INDIAN LAW</span>
        </div>
        <p className="text-sm text-red-900 font-black leading-relaxed italic border-l-4 border-red-200 pl-4">
          "{lawText}"
        </p>
      </div>
    </motion.div>
  );
}
