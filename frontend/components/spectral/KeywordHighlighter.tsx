"use client";

import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";
import { Highlighter } from "lucide-react";

interface KeywordHighlighterProps {
  originalQuestion: string;
  signals?: string[];          // exact keywords from backend base.signals
  flags?: { category: string; severity: string }[];
}

// Colour per severity
const SEVERITY_STYLE: Record<string, string> = {
  high:   "bg-red-100 text-red-800 border-b-2 border-red-400",
  medium: "bg-amber-100 text-amber-800 border-b-2 border-amber-400",
  low:    "bg-blue-100 text-blue-800 border-b-2 border-blue-300",
};

function highlightWords(text: string, words: string[], severity: string): React.ReactNode[] {
  if (!words.length) return [text];

  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      return (
        <mark key={i} className={`px-0.5 rounded-sm font-bold ${SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.low}`}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function KeywordHighlighter({ originalQuestion, signals = [], flags = [] }: KeywordHighlighterProps) {
  const { canUse } = useSubscription();
  const router = useRouter();
  const isUnlocked = canUse("keyword_highlighter");

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 cursor-pointer group"
        onClick={() => router.push("/pricing?highlight=growth&feature=keyword_highlighter")}
      >
        <div className="flex items-center gap-2 mb-2">
          <Highlighter className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Keyword Evidence Highlighter
          </p>
          <span className="ml-auto text-[9px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Growth
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          See exactly which words triggered each bias flag — like Track Changes in Word.
        </p>
      </motion.div>
    );
  }

  const severity = flags[0]?.severity || "medium";
  const highlighted = highlightWords(originalQuestion, signals, severity);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <Highlighter className="h-3.5 w-3.5 text-slate-500" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Keyword Evidence
        </p>
      </div>
      <p className="text-sm text-slate-700 font-medium leading-relaxed">{highlighted}</p>
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {signals.slice(0, 6).map((sig, i) => (
            <span key={i} className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase tracking-wider">
              {sig}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
