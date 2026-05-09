'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Check, Copy, SkipForward, ChevronDown,
  Loader2, RotateCcw, Zap
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
        "group bg-white rounded-2xl border overflow-hidden transition-all duration-200 relative",
        isExpanded
          ? "border-[#10b981]/30 shadow-[0_2px_20px_rgba(16,185,129,0.06)] ring-1 ring-[#1D9E75]/20"
          : "border-neutral-200 hover:border-black/[0.1]"
      )}
    >
      <div 
        onClick={() => onToggleExpand(index)}
        className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer active:bg-neutral-50 transition-colors"
      >
        {/* Question Number */}
        <div className="shrink-0 relative">
          <span className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 transition-all duration-200",
            question.regenerated ? "bg-[#1D9E75] text-white shadow-sm" : 
            isExpanded ? "bg-[#10b981] text-white shadow-sm" : "bg-[#F5F5F7] text-[#86868B]"
          )}>
            {question.id ?? (index + 1)}
          </span>
          {question.regenerated && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <Zap className="w-2.5 h-2.5 text-white fill-white" />
            </motion.div>
          )}
        </div>

        {/* Question Content */}
        <div className="min-w-0 flex-1">
          {/* Tags row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize tracking-wide",
              typeStyle.bg, typeStyle.text, typeStyle.border
            )}>
              {String(question.type) || 'Unknown'}
            </span>
            <span className="text-[11px] text-[#86868B] tracking-wider hidden sm:inline-block">
              {DIFFICULTY_DOTS[question.difficulty || 'intermediate'] || '●○○'}
            </span>
            <span className="text-[11px] text-[#86868B] font-medium hidden sm:inline-block">
              {question.time_minutes || 10} min
            </span>
            <span className="hidden sm:inline text-[11px] text-[#86868B] font-medium">
              · {question.competency}
            </span>
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
            <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-black/[0.04] pt-5 ml-11 md:ml-12">
              {/* Error */}
              <AnimatePresence>
                {regenError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 rounded-xl border border-red-100 mb-4"
                  >
                    <p className="text-sm text-red-700">{regenError}</p>
                    {isFree && (
                      <a href="/pricing?reason=kit_regen" className="text-xs font-semibold text-[#10b981] mt-1 inline-block">
                        Upgrade for unlimited regenerations →
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Original Version (if regenerated) */}
              {question.originalVersion && (
                <div className="p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-100 mb-4">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Original Version</p>
                  <p className="text-[13px] text-neutral-500 line-through leading-relaxed">{question.originalVersion}</p>
                </div>
              )}

              {/* AI Modification Templates */}
              {!isLimitReached && (
                <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                  <p className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest mb-2">Refine Question</p>
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
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-emerald-200/60 rounded-lg text-xs font-medium text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-sm"
                      >
                        <span>{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-600/70 font-medium">
                    {remaining} regenerations remaining
                  </div>
                </div>
              )}

              {/* Metadata */}
              {!isLocked ? (
                <>
                  {question.why_this_question && (
                    <div>
                      <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-1.5">Why this question</p>
                      <p className="text-[13px] text-[#424245] leading-relaxed">{question.why_this_question}</p>
                    </div>
                  )}
                  {question.strong_answer_includes && question.strong_answer_includes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-2">Strong answer includes</p>
                      <div className="space-y-1.5">
                        {question.strong_answer_includes.map((point, i) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <span className="text-emerald-500 flex-shrink-0 mt-0.5 text-sm">✓</span>
                            <p className="text-[13px] text-[#424245] leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {question.red_flags && (
                    <div className="bg-red-50/70 border border-red-100 rounded-xl p-3.5 mt-4">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.1em] mb-1">Red flags</p>
                      <p className="text-[13px] text-red-700 leading-relaxed">{question.red_flags}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Free user lock */
                <div className="p-6 sm:p-8 bg-[#F5F5F7] border border-black/[0.05] rounded-[1.5rem] flex flex-col items-center justify-center text-center mt-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl border border-black/[0.05] shadow-sm">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-[#1D1D1F] mb-3">
                    Unlock Professional Analysis
                  </h3>
                  <p className="text-[13px] font-medium text-[#86868B] mb-6 max-w-[280px] mx-auto leading-relaxed">
                    Upgrade to Starter to see why each question is asked, what a strong answer sounds like, and red flags.
                  </p>
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full max-w-[240px] bg-[#1D1D1F] text-white py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    GET STARTER PLAN →
                  </button>
                </div>
              )}

              {/* Bottom actions */}
              <div className="flex gap-2 pt-3 mt-4 border-t border-black/[0.04]">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRegenerate(); // default regenerate without focus
                  }}
                  disabled={isRegenerating || isLimitReached}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-black/[0.06] text-[12px] font-medium text-[#424245] hover:bg-[#F5F5F7] active:bg-neutral-100 transition-colors touch-target"
                >
                  {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Regenerate
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCopy(question.question); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-black/[0.06] text-[12px] font-medium text-[#424245] hover:bg-[#F5F5F7] active:bg-neutral-100 transition-colors touch-target"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSkip(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-black/[0.06] text-[12px] font-medium text-[#424245] hover:bg-[#F5F5F7] active:bg-neutral-100 transition-colors touch-target"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
