'use client'

import { useState, useEffect } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { CandidateEvaluator } from '../evaluation/CandidateEvaluator'
import QuestionCard from './QuestionCard'
import { SectionLimitLock } from '@/components/pricing/FeatureGate'
import ExportButton from '@/components/pdf/ExportButton'

interface KitQuestion {
  id: number
  question: string
  type: string
  competency: string
  time_minutes: number
  difficulty: string
  bias_score: number
  bias_verified?: boolean
  why_this_question: string | null
  strong_answer_includes: string[] | null
  red_flags: string | null
  follow_up_1: string | null
  follow_up_2: string | null
}

interface KitData {
  kit_title?: string
  kit_summary?: string
  role?: string
  experience_level?: string
  company_type?: string
  estimated_duration_minutes?: number
  questions?: KitQuestion[]
  scorecard?: {
    competencies?: Array<{
      name: string
      weight_percent: number
      question_ids: number[]
    }>
  }
  interviewer_guide?: {
    opening?: string
    pacing?: string
    closing?: string
  }
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  behavioral:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-400' },
  technical:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
  situational: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400' },
  leadership:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
}

const DIFFICULTY_DOTS: Record<string, string> = {
  foundation:   '●○○',
  intermediate: '●●○',
  advanced:     '●●●',
}

import { FileText, Clock, CheckCircle2, ShieldCheck, Briefcase, Zap, Info, ArrowRight, Download, Filter } from 'lucide-react'

export function KitDisplay({ kit }: { kit: KitData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const evaluateParam = searchParams.get('evaluate') === 'true'
  
  const [showEvaluator, setShowEvaluator] = useState(evaluateParam)
  const [expanded, setExpanded] = useState<number | null>(1)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const { planId } = useSubscription()

  const [questions, setQuestions] = useState<KitQuestion[]>((kit.questions ?? []) as KitQuestion[]);
  const [regenerationCount, setRegenerationCount] = useState((kit as any).regeneration_count || 0);

  const isPaid   = ['starter', 'growth', 'enterprise'].includes(planId)
  const isGrowth = ['growth', 'enterprise'].includes(planId)

  const filtered = activeFilter === 'all'
    ? questions
    : questions.filter(q => q.type === activeFilter)

  const types = ['all', ...Array.from(new Set(questions.map(q => q.type)))]

  const handleRegenerate = (index: number, newQuestion: any) => {
    const updated = [...questions];
    updated[index] = newQuestion;
    setQuestions(updated);
    setRegenerationCount((prev: number) => prev + 1);
  };

  if (showEvaluator) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
          <button 
            onClick={() => {
              const evaluateParam = searchParams.get('evaluate')
              if (evaluateParam) {
                router.push(`/kit?reportId=${searchParams.get('reportId')}`)
              } else {
                setShowEvaluator(false)
              }
            }}
            className="w-8 h-8 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all active:scale-95 text-xs font-bold"
          >
            ←
          </button>
          <div>
            <p className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Evaluation Mode</p>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#1D1D1F]">
              {kit.role || 'Candidate'} Evaluation
            </h2>
          </div>
        </div>
        <SectionLimitLock type="evaluations" serviceLabel="candidate evaluations">
          <CandidateEvaluator kit={kit} />
        </SectionLimitLock>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
 
      {/* ── Branded Header ────────────────────────────────────────────── */}
      <div className="bg-[#10b981] border-2 border-black rounded-xl p-3.5 sm:p-5 text-white relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2.5 w-full md:max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                  {kit.kit_title || `${kit.role} Interview Kit`}
                </h1>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3" />
                  Structured Hiring Framework
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                Bias Verified
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5 text-white/80" />
                {kit.estimated_duration_minutes || '45'} Min Session
              </div>
            </div>
 
            <p className="text-xs text-white/80 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
              {kit.kit_summary}
            </p>
          </div>
 
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 justify-between w-full md:w-auto border-t border-white/10 pt-2.5 md:border-t-0 md:pt-0">
            <div className="text-left md:text-right">
              <div className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-0.5">Total Questions</div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                {questions.length}<span className="text-xs text-white/40"> pts</span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center bg-white text-black min-w-[100px]">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">Duration</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">{kit.estimated_duration_minutes || '—'} MIN</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="hidden sm:flex gap-4 mt-3 pt-3 border-t border-white/10 relative z-10 overflow-x-auto no-scrollbar pb-0.5">
          {types.filter(t => t !== 'all').map((type, index) => (
            <div key={String(type) || `type-${index}`} className="shrink-0">
              <div className="text-sm font-bold tabular-nums">
                {questions.filter(q => q.type === type).length}
              </div>
              <div className="text-[8px] font-black text-emerald-300/70 uppercase tracking-widest capitalize whitespace-nowrap">
                {String(type) || 'Undefined'}
              </div>
            </div>
          ))}
          <div className="ml-auto shrink-0 pr-2">
            <div className="text-sm font-bold tabular-nums">
              {questions.length}
            </div>
            <div className="text-[8px] font-black text-emerald-300/70 uppercase tracking-widest">
              Total
            </div>
          </div>
        </div>
      </div>
 
      {/* ── Filter Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {types.map((type, index) => (
          <button
            key={String(type) || `tab-${index}`}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "text-[10px] font-black px-6 py-3 rounded-full border-2 transition-all duration-200 capitalize whitespace-nowrap uppercase tracking-widest",
              activeFilter === type
                ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-[#86868B] border-black/10 hover:border-black/20 hover:bg-[#F5F5F7]"
            )}
          >
            {type === 'all'
              ? `All (${questions.length})`
              : `${String(type) || 'Undefined'} (${questions.filter(q => q.type === type).length})`
            }
          </button>
        ))}
      </div>
 
      {/* ── Questions ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((q, index) => {
            const originalIndex = questions.findIndex(item => item === q);
            return (
              <QuestionCard
                key={q.id ?? `q-${originalIndex}`}
                question={q as any}
                index={originalIndex}
                kitId={searchParams.get('reportId') || (kit as any).reportId || ''}
                planTier={planId || 'free'}
                regenerationCount={regenerationCount}
                maxRegenerations={(kit as any).max_regenerations || 3}
                isLocked={!isPaid}
                onRegenerate={handleRegenerate}
                onCopy={(text) => navigator.clipboard.writeText(text)}
                isExpanded={expanded === (q.id ?? originalIndex)}
                onToggleExpand={(idx) => setExpanded(expanded === (q.id ?? idx) ? null : (q.id ?? idx))}
                onSkip={() => {
                  const nextQ = filtered[index + 1];
                  if (nextQ) {
                    const nextOriginalIndex = questions.findIndex(item => item === nextQ);
                    setExpanded(nextQ.id ?? nextOriginalIndex);
                  } else {
                    setExpanded(null); // Close if it was the last one
                  }
                }}
              />
            )
          })}
        </AnimatePresence>
 
        {/* Regeneration counter */}
        <div className="mt-8 text-center pb-8">
          <div className="inline-flex items-center gap-3 bg-white border border-black/10 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">
              {regenerationCount}/{(kit as any).max_regenerations || 3} regenerations used
            </p>
            {!isPaid && (
              <a href="/pricing" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Upgrade Plan</a>
            )}
          </div>
        </div>
      </div>

      {/* ── Growth Nudge for Starter Users ───────────────────────────── */}
      {isPaid && !isGrowth && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative border border-dashed border-[#0a3d2e]/20 rounded-3xl overflow-hidden group p-8 md:p-12 text-center bg-emerald-50/30 mt-8"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl border border-emerald-100 shadow-sm">
              ✨
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#10b981]">
                Take your hiring to the next level
              </h3>
              <p className="text-base font-medium text-emerald-800/60 leading-relaxed">
                Upgrade to Growth for AI-powered follow-up probes, personalized interview guides, and structured evaluation scorecards for every competency.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/pricing'}
              className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-[#10b981] text-white font-black text-sm uppercase tracking-widest hover:bg-[#059669] transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
            >
              UPGRADE TO GROWTH
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Scorecard — Growth+ ─────────────────────────────────────── */}
      {isGrowth && kit.scorecard && kit.scorecard.competencies && kit.scorecard.competencies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/[0.05] rounded-xl p-3 sm:p-4"
        >
          <h3 className="text-xs font-black text-[#1D1D1F] mb-3 uppercase tracking-[0.05em]">
            Evaluation Scorecard
          </h3>
          <div className="space-y-2">
            {kit.scorecard.competencies.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                  <span className="font-semibold text-[#1D1D1F]">{c.name}</span>
                  <span className="font-bold text-[#86868B] tabular-nums">{c.weight_percent}%</span>
                </div>
                <div className="h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.weight_percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full"
                  />
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#86868B] mt-0.5 font-medium">
                  Q{c.question_ids?.join(', Q')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Interviewer Guide — Growth+ ─────────────────────────────── */}
      {isGrowth && kit.interviewer_guide && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/60 rounded-xl p-3 sm:p-4"
        >
          <h3 className="text-xs font-black text-[#1D1D1F] mb-2.5 uppercase tracking-[0.05em]">
            Interviewer Guide
          </h3>
          <div className="space-y-2.5">
            {Object.entries(kit.interviewer_guide).map(([key, value]) => (
              <div key={key}>
                <p className="text-[8px] sm:text-[9px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-0.5 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#424245] leading-snug font-medium">
                  {value as string}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Candidate Evaluator CTA ──────────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-black/[0.05]">
        <KitActions kit={kit} isPaid={isPaid} setShowEvaluator={setShowEvaluator} />
      </div>
    </div>
  )
}

function KitActions({ 
  kit, 
  isPaid, 
  setShowEvaluator 
}: { 
  kit: any, 
  isPaid: boolean,
  setShowEvaluator: (val: boolean) => void 
}) {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-300 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full blur-[60px]" />
      
      <div className="relative z-10 max-w-md mx-auto space-y-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-1 text-lg sm:text-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
          📋
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] mb-1">
            Ready to interview?
          </h3>
          <p className="text-[10px] sm:text-xs font-medium text-[#86868B] leading-normal">
            After conducting the interview, evaluate the candidate here. Score their answers and get an AI-powered hiring recommendation.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setShowEvaluator(true)}
            className="w-full bg-[#10b981] text-white py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-black transition-all"
          >
            Evaluate Candidate ↗
          </button>
        </div>
      </div>
    </div>
  )
}
