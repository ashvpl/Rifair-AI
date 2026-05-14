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
        "group bg-white rounded-[2rem] border-2 border-black overflow-hidden transition-all duration-300 relative",
        isExpanded
          ? "shadow-none translate-x-1 translate-y-1"
          : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
      )}
    >
      <div 
        onClick={() => onToggleExpand(index)}
        className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer active:bg-neutral-50 transition-colors"
      >
        {/* Question Number */}
        <div className="shrink-0 relative">
          <span className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black mt-0.5 transition-all duration-300 border-2 border-black",
            isExpanded
              ? "bg-[#10b981] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          )}>
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={cn(
              "text-[10px] font-black px-2.5 py-1 rounded-lg border-2 uppercase tracking-widest",
              typeStyle.bg, typeStyle.text, typeStyle.border
            )}>
              {question.type}
            </span>
            {question.difficulty && (
              <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-black/20" />
                {question.difficulty}
              </span>
            )}
          </div>

          <p className={cn(
            "text-[15px] font-semibold leading-relaxed tracking-[-0.01em]",
            question.regenerated ? "text-[#10b981]" : "text-[#1D1D1F]"
          )}>
            {question.question}
          </p>
          
          {question.regenerated && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#1D9E75] uppercase tracking-wide"
            >
              <RotateCcw className="w-3 h-3" /> AI Regenerated
              {question.focusUsed && (
                <span className="text-neutral-400">• {question.focusUsed.replace('_', ' ')}</span>
              )}
            </motion.span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Regenerate Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRegenerate(); // default regenerate without focus
            }}
            disabled={isRegenerating || isLimitReached}
            className={cn(
              "h-9 px-2.5 flex items-center justify-center gap-1.5 rounded-lg transition-colors touch-target",
              isRegenerating ? "text-neutral-300" :
              isLimitReached ? "text-neutral-200 cursor-not-allowed" :
              question.regenerated ? "bg-emerald-50 text-[#1D9E75] hover:bg-emerald-100" :
              "text-neutral-500 hover:text-[#10b981] hover:bg-neutral-100 border border-neutral-200 bg-white"
            )}
            title={isLimitReached ? 'Limit reached' : 'Regenerate question'}
          >
            {isRegenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className={cn("w-3.5 h-3.5", question.regenerated && "text-[#1D9E75]")} />
            )}
            <span className="text-xs font-semibold hidden sm:inline-block">Regenerate</span>
          </button>

          {/* Expand */}
          <button 
            onClick={() => onToggleExpand(index)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ChevronDown className={cn("w-5 h-5 text-[#86868B] transition-transform duration-300", isExpanded && "rotate-180")} />
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
            <div className="px-5 md:px-6 pb-8 space-y-6 border-t border-black/[0.04] pt-8 ml-11 md:ml-12">
              {/* Error */}
              <AnimatePresence>
                {regenError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 rounded-xl border-2 border-red-100 mb-4"
                  >
                    <p className="text-sm text-red-700 font-bold">{regenError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Modification Templates (only if not limit reached) */}
              {!isLimitReached && (
                <div className="bg-emerald-50/30 border-2 border-emerald-100/50 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.05)]">
                  <p className="text-[10px] font-black text-[#1D9E75] uppercase tracking-widest mb-4">Refine with AI</p>
                  <div className="flex flex-wrap gap-2">
                    {focusOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRegenerate(opt.key);
                        }}
                        disabled={isRegenerating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-100 rounded-xl text-xs font-black text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-[2px_2px_0px_0px_rgba(16,185,129,0.1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span className="text-base">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked state for Free users */}
              {isLocked ? (
                <div className="bg-neutral-50 border-2 border-black/5 rounded-[2rem] p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-white rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black">Unlock Expert Analysis</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                      Upgrade to Starter to see why this question matters, red flags to watch for, and strategic follow-ups.
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="px-8 py-3 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    View Pricing →
                  </button>
                </div>
              ) : (
                <>
                  {/* Rationale */}
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-indigo-600" />
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Why ask this?</p>
                    </div>
                    <p className="text-sm text-[#1D1D1F] font-medium leading-relaxed">
                      {question.why_this_question || "This question assesses the candidate's core competencies and behavioral alignment with the role requirements."}
                    </p>
                  </div>

                  {/* Answer Guide */}
                  <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Strong Answer Indicators</p>
                    </div>
                    <ul className="space-y-3">
                      {question.strong_answer_includes?.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-900 font-bold leading-relaxed">
                          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Red Flags */}
                    <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(239,68,68,0.05)]">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-red-600" />
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Red Flags</p>
                      </div>
                      <p className="text-sm text-red-900 font-medium leading-relaxed">
                        {question.red_flags || "Generic answers, lack of specific examples, or inability to articulate the 'how' behind their actions."}
                      </p>
                    </div>

                    {/* Follow ups */}
                    <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.05)]">
                      <div className="flex items-center gap-2 mb-4">
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Strategic Follow-ups</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-blue-900 font-bold leading-relaxed border-b border-blue-100 pb-2">
                          "Can you walk me through the specific impact of that decision?"
                        </p>
                        <p className="text-sm text-blue-900 font-bold leading-relaxed">
                          "If you had to do it again, what would you change?"
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action row */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.04]">
                <button 
                  onClick={() => onCopy(question.question)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Question
                </button>
                <button 
                  onClick={onSkip}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black/10 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-all"
                >
                  Skip <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
