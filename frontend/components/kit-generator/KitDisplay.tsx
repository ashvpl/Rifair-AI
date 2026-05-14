'use client'

import { useState, useEffect } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { CandidateEvaluator } from '../evaluation/CandidateEvaluator'
import QuestionCard from './QuestionCard'
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
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => {
              if (evaluateParam) {
                router.push(`/kit?reportId=${searchParams.get('reportId')}`)
              } else {
                setShowEvaluator(false)
              }
            }}
            className="w-10 h-10 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all active:scale-95"
          >
            ←
          </button>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Evaluation Mode</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D1D1F]">
              {kit.role || 'Candidate'} Evaluation
            </h2>
          </div>
        </div>
        <CandidateEvaluator kit={kit} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
 
      {/* ── Branded Header ────────────────────────────────────────────── */}
      <div className="bg-[#10b981] border-2 border-black rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {kit.kit_title || `${kit.role} Interview Kit`}
                </h1>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  Structured Hiring Framework
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                Bias Verified
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
                <Clock className="w-4 h-4 text-white/80" />
                {kit.estimated_duration_minutes || '45'} Min Session
              </div>
            </div>
 
            <p className="text-sm text-white/80 leading-relaxed max-w-xl font-medium">
              {kit.kit_summary}
            </p>
          </div>
 
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Questions</div>
                <div className="text-5xl font-black text-white tracking-tighter">
                  {questions.length}<span className="text-xl text-white/40"> pts</span>
                </div>
              </div>
              <div className={cn(
                "px-6 py-4 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center min-w-[160px] bg-white text-black"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Session Duration</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#10b981]">{kit.estimated_duration_minutes || '—'} MIN</span>
              </div>
            </div>
            
            <ExportButton 
              type="kit" 
              id={searchParams.get('reportId') || ''} 
              planTier={planId} 
              variant="secondary"
              className="w-full h-14"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mt-10 pt-8 border-t border-white/10 relative z-10 overflow-x-auto no-scrollbar pb-1">
          {types.filter(t => t !== 'all').map((type, index) => (
            <div key={String(type) || `type-${index}`} className="shrink-0">
              <div className="text-xl font-bold tabular-nums">
                {questions.filter(q => q.type === type).length}
              </div>
              <div className="text-[10px] font-black text-emerald-300/70 uppercase tracking-widest capitalize whitespace-nowrap">
                {String(type) || 'Undefined'}
              </div>
            </div>
          ))}
          <div className="ml-auto shrink-0 pr-4">
            <div className="text-xl font-bold tabular-nums">
              {questions.length}
            </div>
            <div className="text-[10px] font-black text-emerald-300/70 uppercase tracking-widest">
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
          className="bg-white border border-black/[0.05] rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-[#1D1D1F] mb-5 uppercase tracking-[0.05em]">
            Evaluation Scorecard
          </h3>
          <div className="space-y-4">
            {kit.scorecard.competencies.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#1D1D1F]">{c.name}</span>
                  <span className="font-bold text-[#86868B] tabular-nums">{c.weight_percent}%</span>
                </div>
                <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.weight_percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full"
                  />
                </div>
                <p className="text-[11px] text-[#86868B] mt-1 font-medium">
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
          className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-[#1D1D1F] mb-4 uppercase tracking-[0.05em]">
            Interviewer Guide
          </h3>
          <div className="space-y-4">
            {Object.entries(kit.interviewer_guide).map(([key, value]) => (
              <div key={key}>
                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.1em] mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-[13px] text-[#424245] leading-relaxed">
                  {value as string}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Candidate Evaluator CTA ──────────────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-black/[0.05]">
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
    <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full blur-[60px]" />
      
      <div className="relative z-10 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          📋
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">
            Ready to interview?
          </h3>
          <p className="text-sm font-medium text-[#86868B] leading-relaxed">
            After conducting the interview, evaluate the candidate here. Score their answers and get an AI-powered hiring recommendation.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => setShowEvaluator(true)}
            className="w-full bg-[#10b981] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#059669] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-black transition-all"
          >
            Evaluate Candidate ↗
          </button>
        </div>
      </div>
    </div>
  )
}
