'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Check, Copy, SkipForward, ChevronDown,
  Loader2, RotateCcw, Zap, Lock, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id?: number;
  question: string;
  type: string;
  competency: string;
  why_this_question?: string | null;
  strong_answer_includes?: string[] | null;
  red_flags?: string | null;
  time_minutes?: number;
  difficulty?: string;
  regenerated?: boolean;
  originalVersion?: string;
  regenerationCount?: number;
  focusUsed?: string;
}

interface Props {
  question: Question;
  index: number;
  kitId: string;
  planTier: string;
  regenerationCount: number;
  maxRegenerations: number;
  isLocked: boolean; // metadata locked for free
  onRegenerate: (index: number, newQuestion: Question) => void;
  onCopy: (text: string) => void;
  isExpanded: boolean;
  onToggleExpand: (index: number) => void;
  onSkip: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  behavioral:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  technical:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  situational: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  leadership:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const DIFFICULTY_DOTS: Record<string, string> = {
  foundation:   '●○○',
  intermediate: '●●○',
  advanced:     '●●●',
};

export default function QuestionCard({
  question,
  index,
  kitId,
  planTier,
  regenerationCount,
  maxRegenerations,
  isLocked,
  onRegenerate,
  onCopy,
  isExpanded,
  onToggleExpand,
  onSkip
}: Props) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const [regenError, setRegenError] = useState('');
  const [justRegenerated, setJustRegenerated] = useState(false);

  const remaining = maxRegenerations - regenerationCount;
  const isLimitReached = remaining <= 0;
  const isFree = planTier === 'free';

  const typeStyle = TYPE_STYLES[question.type] ?? TYPE_STYLES.behavioral;

  const handleRegenerate = async (focus?: string) => {
    if (isLimitReached) {
      setRegenError('Regeneration limit reached');
      return;
    }

    setIsRegenerating(true);
    setShowFocusMenu(false);
    setRegenError('');

    try {
      const res = await fetch(`/api/kits/${kitId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex: index,
          action: 'single',
          focus
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'REGEN_LIMIT_EXCEEDED') {
          setRegenError(`Limit reached: ${data.regenerationCount}/${maxRegenerations}`);
        } else {
          setRegenError('Failed to regenerate');
        }
        return;
      }

      onRegenerate(index, data.question);
      setJustRegenerated(true);
      setTimeout(() => setJustRegenerated(false), 2000);
    } catch (e) {
      setRegenError('Something went wrong');
    } finally {
      setIsRegenerating(false);
    }
  };

  const focusOptions = [
    { key: 'technical', label: 'More technical', icon: '⚡' },
    { key: 'behavioral', label: 'More behavioral', icon: '🎯' },
    { key: 'simplified', label: 'Simpler', icon: '✂️' },
    { key: 'probing', label: 'Add follow-up', icon: '🔍' },
    { key: 'role_specific', label: 'Role-specific', icon: '💼' },
  ];

  return (
    <motion.div
      layout
      initial={justRegenerated ? { scale: 0.98, borderColor: '#1D9E75' } : false}
      animate={justRegenerated ? { scale: 1, borderColor: '#e5e5e5' } : false}
      transition={{ duration: 0.3 }}
      className={cn(
        "group bg-white rounded-xl border border-black overflow-hidden transition-all duration-300 relative",
        isExpanded
          ? "shadow-none translate-x-0.5 translate-y-0.5"
          : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
      )}
    >
      <div 
        onClick={() => onToggleExpand(index)}
        className="flex items-start justify-between gap-1.5 p-2 sm:p-3 lg:p-4 xl:p-5 cursor-pointer active:bg-neutral-50 transition-colors"
      >
        <div className="flex items-start gap-1.5 sm:gap-2.5 lg:gap-3 min-w-0 flex-1">
          {/* Question Number */}
          <div className="shrink-0 relative">
            <span className={cn(
              "w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md flex items-center justify-center text-[9px] sm:text-xs lg:text-sm font-black mt-0.5 transition-all duration-300 border border-black",
              isExpanded
                ? "bg-[#10b981] text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            )}>
              {index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 lg:gap-2 mb-0.5 flex-wrap">
              <span className={cn(
                "text-[7px] sm:text-[9px] lg:text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider",
                typeStyle.bg, typeStyle.text, typeStyle.border
              )}>
                {question.type}
              </span>
              {question.difficulty && (
                <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-black text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-black/20" />
                  {question.difficulty}
                </span>
              )}
            </div>

            <p className={cn(
              "text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-semibold leading-snug tracking-[-0.01em] mt-0.5",
              question.regenerated ? "text-[#10b981]" : "text-[#1D1D1F]"
            )}>
              {question.question}
            </p>
            
            {question.regenerated && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-1 mt-0.5 text-[8px] font-bold text-[#1D9E75] uppercase tracking-wide"
              >
                <RotateCcw className="w-2 h-2" /> AI Regenerated
                {question.focusUsed && (
                  <span className="text-neutral-400">• {question.focusUsed.replace('_', ' ')}</span>
                )}
              </motion.span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 self-start mt-0.5" onClick={(e) => e.stopPropagation()}>
          {/* Regenerate Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRegenerate(); // default regenerate without focus
            }}
            disabled={isRegenerating || isLimitReached}
            className={cn(
              "h-5 sm:h-7 lg:h-9 px-1 lg:px-3 flex items-center justify-center gap-0.5 lg:gap-1.5 rounded-md transition-colors touch-target",
              isRegenerating ? "text-neutral-300" :
              isLimitReached ? "text-neutral-200 cursor-not-allowed" :
              question.regenerated ? "bg-emerald-50 text-[#1D9E75] hover:bg-emerald-100" :
              "text-neutral-500 hover:text-[#10b981] hover:bg-neutral-100 border border-neutral-200 bg-white"
            )}
            title={isLimitReached ? 'Limit reached' : 'Regenerate question'}
          >
            {isRegenerating ? (
              <Loader2 className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 animate-spin" />
            ) : (
              <RefreshCw className={cn("w-2.5 h-2.5 lg:w-3.5 lg:h-3.5", question.regenerated && "text-[#1D9E75]")} />
            )}
            <span className="text-[9px] sm:text-xs lg:text-sm font-semibold hidden sm:inline-block">Regenerate</span>
          </button>

          {/* Expand */}
          <button 
            onClick={() => onToggleExpand(index)}
            className="w-5 h-5 sm:w-7 sm:h-7 lg:w-9 lg:h-9 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#86868B] transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-2 lg:px-5 lg:pb-5 space-y-1.5 lg:space-y-3 border-t border-black/[0.04] pt-1.5 lg:pt-4 ml-0 sm:ml-8 lg:ml-11">
              {/* Error */}
              <AnimatePresence>
                {regenError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 bg-red-50 rounded border border-red-100 mb-2"
                  >
                    <p className="text-xs text-red-700 font-bold">{regenError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Modification Templates (only if not limit reached) */}
              {!isLimitReached && (
                <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-lg p-1.5 lg:p-3">
                  <p className="text-[7px] lg:text-[9px] font-black text-[#1D9E75] uppercase tracking-widest mb-1 lg:mb-2">Refine with AI</p>
                  <div className="flex gap-1 lg:gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    {focusOptions.map(opt => (
                      <button
                          key={opt.key}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRegenerate(opt.key);
                          }}
                          disabled={isRegenerating}
                          className="flex items-center gap-0.5 lg:gap-1 px-2 lg:px-3 py-0.5 lg:py-1.5 bg-white border border-emerald-100 rounded text-[7px] sm:text-[8px] lg:text-[10px] font-black text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all whitespace-nowrap shrink-0 shadow-[1px_1px_0px_0px_rgba(16,185,129,0.05)]"
                      >
                        <span className="text-[10px] lg:text-xs">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked state for Free users */}
              {isLocked ? (
                <div className="bg-neutral-50 border border-black/5 rounded-xl p-2.5 sm:p-4 text-center space-y-2">
                  <div className="w-7 h-7 bg-white rounded-lg border border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                    <Lock className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-black">Unlock Expert Analysis</h3>
                    <p className="text-[10px] text-slate-500 font-medium max-w-xs mx-auto">
                      Upgrade to Starter to see why this question matters, red flags to watch for, and strategic follow-ups.
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="px-4 py-1.5 bg-black text-white rounded-full font-black text-[8px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    View Pricing →
                  </button>
                </div>
              ) : (
                <>
                  {/* Rationale */}
                  <div className="bg-white border border-black rounded-lg p-1.5 lg:p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Info className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-indigo-600" />
                      <p className="text-[7px] lg:text-[9px] font-black text-indigo-600 uppercase tracking-widest">Why ask this?</p>
                    </div>
                    <p className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm text-[#1D1D1F] font-medium leading-snug">
                      {question.why_this_question || "This question assesses the candidate's core competencies and behavioral alignment with the role requirements."}
                    </p>
                  </div>

                  {/* Answer Guide */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-1.5 lg:p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Check className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-emerald-600" />
                      <p className="text-[7px] lg:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Strong Answer Indicators</p>
                    </div>
                    <ul className="space-y-0.5 lg:space-y-1.5">
                      {question.strong_answer_includes?.map((item, i) => (
                        <li key={i} className="flex gap-1 text-[10px] sm:text-[11px] lg:text-xs xl:text-sm text-emerald-900 font-bold leading-snug">
                          <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 lg:gap-3">
                    {/* Red Flags */}
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-1.5 lg:p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-red-600" />
                        <p className="text-[7px] lg:text-[9px] font-black text-red-600 uppercase tracking-widest">Red Flags</p>
                      </div>
                      <p className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm text-red-900 font-medium leading-snug">
                        {question.red_flags || "Generic answers, lack of specific examples."}
                      </p>
                    </div>

                    {/* Follow ups */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-1.5 lg:p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <RefreshCw className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-blue-600" />
                        <p className="text-[7px] lg:text-[9px] font-black text-blue-600 uppercase tracking-widest">Follow-ups</p>
                      </div>
                      <div className="space-y-0.5 lg:space-y-2">
                        <p className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm text-blue-900 font-bold leading-snug border-b border-blue-100 pb-0.5">
                          "Walk me through the specific impact?"
                        </p>
                        <p className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm text-blue-900 font-bold leading-snug">
                          "What would you do differently?"
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action row */}
              <div className="flex items-center justify-end gap-1.5 lg:gap-3 pt-1.5 lg:pt-3 border-t border-black/[0.04]">
                <button 
                  onClick={() => onCopy(question.question)}
                  className="flex items-center gap-1 px-2.5 py-1 lg:px-4 lg:py-2 rounded-full border border-black font-black text-[7px] sm:text-[8px] lg:text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Copy className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" /> Copy
                </button>
                <button 
                  onClick={onSkip}
                  className="flex items-center gap-1 px-2.5 py-1 lg:px-4 lg:py-2 rounded-full border border-black/10 font-black text-[7px] sm:text-[8px] lg:text-xs uppercase tracking-widest hover:bg-neutral-100 transition-all"
                >
                  Skip <SkipForward className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
