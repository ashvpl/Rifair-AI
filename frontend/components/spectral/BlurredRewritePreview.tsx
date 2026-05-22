"use client";

import { useRouter } from "next/navigation";
import { Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

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
      <div className="p-4 sm:p-6 md:p-8 bg-emerald-50/30 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
            ✓ Neutral Reconstruction
          </span>
          <button
            onClick={() => onCopy?.(previewText, questionIndex)}
            className={cn(
              "text-[10px] font-black px-4 py-2 rounded-xl border-2 border-black transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2",
              copiedId === questionIndex 
                ? "bg-emerald-500 text-white shadow-none translate-x-0.5 translate-y-0.5" 
                : "bg-white text-black hover:bg-slate-50"
            )}
          >
            {copiedId === questionIndex ? "✓ Copied!" : "Copy Text"}
          </button>
        </div>
        <p className="text-sm md:text-base text-emerald-900 font-black italic leading-relaxed border-l-4 border-emerald-400 pl-6">
          &ldquo;{previewText}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-[220px] flex flex-col">
      {/* Blurred preview text */}
      <div className="p-4 sm:p-6 md:p-8 bg-emerald-50/20 select-none pointer-events-none blur-[4px] opacity-40 flex-1">
        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">
          Neutral Reconstruction
        </div>
        <p className="text-sm md:text-base text-emerald-900 font-black italic leading-relaxed border-l-4 border-emerald-200 pl-6">
          &ldquo;{previewText}&rdquo;
        </p>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      />

      {/* Lock CTA */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-2 border-black rounded-2xl md:rounded-[2rem] p-4 sm:p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] max-w-[280px]"
        >
          <div className="w-10 h-10 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xs font-black text-black mb-1 uppercase tracking-tight">
            AI Correction Available
          </p>
          <p className="text-[10px] text-slate-500 mb-4 font-medium leading-relaxed">
            Get the exact bias-free version of this question instantly.
          </p>
          <button
            onClick={() =>
              router.push("/pricing?highlight=starter&feature=rewrite_full")
            }
            className="w-full text-[10px] font-black text-white bg-[#dc2626] border-2 border-black px-4 py-3 rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Crown className="h-3.5 w-3.5" />
            UNLOCK REWRITES
          </button>
        </motion.div>
      </div>
    </div>
  );
}
