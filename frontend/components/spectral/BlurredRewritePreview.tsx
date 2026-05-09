"use client";

import { useRouter } from "next/navigation";
import { Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";

interface BlurredRewritePreviewProps {
  rewrittenQuestion?: string | undefined;
  originalQuestion?: string | undefined;
  questionIndex: number;
  onCopy?: (text: string, idx: number) => void;
  copiedId?: number | null | undefined;
}

export function BlurredRewritePreview({
  rewrittenQuestion,
  questionIndex,
  onCopy,
  copiedId,
}: BlurredRewritePreviewProps) {
  const { canUse } = useSubscription();
  const router = useRouter();
  const isUnlocked = canUse("rewrite_full");

  const previewText =
    rewrittenQuestion ||
    "Describe a specific situation where you had to adapt your approach to meet a team goal. What steps did you take and what was the result?";

  if (isUnlocked) {
    return (
      <div className="p-5 md:p-8 bg-[#f0f9f1]/60 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
            ✓ Bias-Free Rewrite
          </span>
          <button
            onClick={() => onCopy?.(previewText, questionIndex)}
            className="text-[10px] font-black text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 hover:border-black/20 bg-white"
          >
            {copiedId === questionIndex ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-sm md:text-base text-emerald-800 font-semibold italic leading-relaxed border-l-4 border-emerald-300 pl-4">
          &ldquo;{previewText}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Blurred preview text */}
      <div className="p-5 md:p-8 bg-[#f0f9f1]/60 select-none pointer-events-none">
        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">
          Bias-Free Rewrite
        </div>
        <p
          className="text-sm md:text-base text-emerald-800 font-semibold italic leading-relaxed blur-[7px] opacity-70"
          aria-hidden="true"
        >
          &ldquo;{previewText}&rdquo;
        </p>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />

      {/* Lock CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl px-5 py-4 text-center shadow-xl max-w-[240px]"
        >
          <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-800 mb-1 leading-tight">
            Bias-free rewrite available
          </p>
          <p className="text-[10px] text-slate-500 mb-3 leading-tight">
            The fixed version is right there. Unlock it with Starter.
          </p>
          <button
            onClick={() =>
              router.push("/pricing?highlight=starter&feature=rewrite_full")
            }
            className="text-[10px] font-black text-white bg-gradient-to-r from-[#dc2626] to-red-700 px-4 py-2 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-sm flex items-center gap-1.5 mx-auto"
          >
            <Crown className="h-3 w-3" />
            Unlock — ₹999/mo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
