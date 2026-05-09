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
        className="flex items-start gap-2.5 p-3 bg-red-50/60 rounded-xl border border-red-200/50 cursor-pointer group"
        onClick={() => router.push("/pricing?highlight=starter&feature=law_violation")}
      >
        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Scale className="h-3.5 w-3.5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-0.5">
            ⚖️ Law Violation Detected
          </p>
          <p className="text-xs text-red-600/80 font-medium blur-[4px] select-none">
            {teaserText}
          </p>
          <p className="text-[10px] text-red-500 font-bold mt-1 group-hover:underline">
            Unlock citation → Starter plan
          </p>
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
      className="flex items-start gap-2.5 p-3 bg-red-50/80 rounded-xl border border-red-200/60"
    >
      <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Scale className="h-3.5 w-3.5 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">
          ⚖️ Indian Law Violation
        </p>
        <p className="text-xs text-red-700 font-semibold leading-snug">{lawText}</p>
      </div>
    </motion.div>
  );
}
