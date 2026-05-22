'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/useSubscription'
import ExportButton from '@/components/pdf/ExportButton'
import { FileText, Briefcase, CheckCircle2, ShieldCheck, AlertCircle, Info, TrendingUp, Users, Scale, Edit3 } from 'lucide-react'


const verdictConfig = {
  INCLUSIVE:       { bg: 'bg-emerald-900', label: 'Inclusive',        badge: 'bg-emerald-100 text-emerald-800' },
  MILD_BIAS:       { bg: 'bg-amber-800',   label: 'Mild Bias',        badge: 'bg-amber-100 text-amber-800' },
  BIASED:          { bg: 'bg-orange-900',  label: 'Biased',           badge: 'bg-orange-100 text-orange-800' },
  SEVERELY_BIASED: { bg: 'bg-red-900',     label: 'Severely Biased',  badge: 'bg-red-100 text-red-800' },
} as const

const severityColors: Record<string, string> = {
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
  HIGH:     'text-orange-700 bg-orange-50 border-orange-200',
  MODERATE: 'text-amber-700 bg-amber-50 border-amber-200',
  LOW:      'text-gray-600 bg-gray-50 border-gray-200',
}

type TabId = 'overview' | 'sections' | 'coded' | 'rewrite' | 'legal' | 'impact'

export function JDAnalysisResult({ result, onReset, reportId }: { result: any; onReset: () => void; reportId?: string }) {
  const { planId } = useSubscription()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const [copied, setCopied] = useState(false)

  const config = verdictConfig[result.overall_verdict as keyof typeof verdictConfig] ?? verdictConfig.BIASED

  const copyRewrite = () => {
    navigator.clipboard.writeText(result.rewritten_jd ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'impact',    label: '📊 Business Impact' },
    { id: 'sections',  label: 'Sections',        count: result.section_analysis?.length },
    { id: 'coded',     label: 'Coded Language',  count: result.coded_language?.length },
    { id: 'rewrite',   label: 'Rewritten JD' },
    { id: 'legal',     label: 'Legal Risk',      count: result.legal_risks?.length },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* ── Hero card ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-white transition-colors duration-500',
          result.overall_verdict === 'INCLUSIVE' ? 'bg-emerald-600' :
          result.overall_verdict === 'MILD_BIAS' ? 'bg-amber-600' :
          result.overall_verdict === 'BIASED' ? 'bg-[#f59e0b]' : 'bg-red-600'
        )}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4 w-full lg:max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {result.headline || "Job Description Analysis"}
                </h1>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Bias-Free Talent Acquisition
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                Language Audit Verified
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  (result.legal_risk_level === 'HIGH' || result.legal_risk_level === 'CRITICAL') ? 'bg-red-400' : 'bg-emerald-400'
                )} />
                {result.legal_risk_level} Legal Risk
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between w-full lg:w-auto">
              <div className="text-left lg:text-right">
                <div className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Inclusivity Score</div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
                  {result.overall_inclusivity_score}<span className="text-xl text-white/40">/100</span>
                </div>
              </div>
              <div className={cn(
                "px-6 py-4 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center min-w-[140px] sm:min-w-[160px] bg-white text-black"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Analysis Verdict</span>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  result.overall_verdict === 'INCLUSIVE' ? 'text-emerald-600' :
                  result.overall_verdict === 'MILD_BIAS' ? 'text-amber-600' :
                  result.overall_verdict === 'BIASED' ? 'text-[#f59e0b]' : 'text-red-600'
                )}>{config.label}</span>
              </div>
            </div>
            
            <ExportButton 
              type="jd" 
              id={reportId || ''} 
              planTier={planId} 
              variant="secondary"
              className="w-full h-14"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Top 3 fixes ──────────────────────────────────────────── */}
      {result.top_3_fixes?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Top 3 fixes — highest impact</p>
          </div>
          <div className="space-y-4">
            {result.top_3_fixes.map((fix: string, i: number) => (
              <div key={i} className="flex gap-4 items-start bg-[#F5F5F7] border border-black/5 rounded-2xl p-4 transition-all hover:border-black/10">
                <span className="w-6 h-6 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-[#1D1D1F] font-medium leading-relaxed">{fix}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Tab nav ───────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`jd-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-[10px] font-black px-6 py-3 rounded-full border-2 transition-all flex items-center gap-2 uppercase tracking-widest',
              activeTab === tab.id
                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-[#86868B] border-black/10 hover:bg-[#F5F5F7] hover:border-black/20'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center font-black',
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────── */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {result.gender_language_analysis && (
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-[#86868B]" />
                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Gender language balance</p>
              </div>
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">{result.gender_language_analysis.masculine_coded_count}</div>
                  <div className="text-[10px] text-[#86868B] font-black uppercase tracking-tighter">Masculine</div>
                </div>
                <div className="flex-1 h-3 bg-[#F5F5F7] rounded-full overflow-hidden border border-black/5">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (result.gender_language_analysis.masculine_coded_count /
                        Math.max(1, result.gender_language_analysis.masculine_coded_count + result.gender_language_analysis.feminine_coded_count)) * 100)}%`
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-500">{result.gender_language_analysis.feminine_coded_count}</div>
                  <div className="text-[10px] text-[#86868B] font-black uppercase tracking-tighter">Feminine</div>
                </div>
              </div>
              <span className={cn(
                'text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest inline-block border-2',
                result.gender_language_analysis.balance === 'BALANCED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)]' : 'bg-amber-50 text-amber-700 border-amber-100 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.2)]'
              )}>
                {result.gender_language_analysis.balance.replace(/_/g, ' ')}
              </span>
              {result.gender_language_analysis.flagged_words?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {result.gender_language_analysis.flagged_words.map((w: string) => (
                    <span key={w} className="text-[10px] font-bold bg-[#F5F5F7] border border-black/5 text-[#1D1D1F] px-3 py-1 rounded-full uppercase tracking-tighter">{w}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-[#424245] font-medium mt-4 leading-relaxed">{result.gender_language_analysis.recommendation}</p>
            </div>
          )}

          {result.requirement_inflation?.length > 0 && (
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="rotate-90 w-4 h-4 text-[#86868B]" />
                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Requirement inflation</p>
              </div>
              <div className="space-y-4">
                {result.requirement_inflation.map((item: any, i: number) => (
                  <div key={i} className="border-2 border-black/5 bg-amber-50/50 rounded-2xl p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                    <p className="text-sm font-black text-amber-900 mb-2">"{item.requirement}"</p>
                    <p className="text-xs text-amber-800/80 font-medium mb-3 leading-relaxed">{item.issue}</p>
                    <div className="flex gap-2 items-start bg-white/80 border border-amber-200 rounded-xl p-3">
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                      <span className="text-xs text-[#1D1D1F] font-bold">{item.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.positive_observations?.length > 0 && (
            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">What this JD does well</p>
              </div>
              <div className="space-y-4">
                {result.positive_observations.map((obs: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs bg-emerald-500 text-white w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">✓</span>
                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">{obs}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {/* Talent pool visual */}
          <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-4 h-4 text-[#86868B]" />
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Talent pool reach analysis</p>
            </div>
 
            {/* Funnel visualization */}
            <div className="space-y-6 max-w-2xl">
              {[
                { label: 'Total Available Talent', value: 100, color: 'bg-gray-200' },
                { label: 'After Title Bias Filters', value: result.talent_pool_impact?.after_title_bias, color: 'bg-amber-200' },
                { label: 'After Requirement Inflation', value: result.talent_pool_impact?.after_requirements, color: 'bg-orange-300' },
                { label: 'After Cultural Exclusivity', value: result.talent_pool_impact?.after_culture_section, color: 'bg-red-300' },
                { label: 'Current Maximum Reach', value: result.talent_pool_impact?.final_reach_percent, color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>{item.label}</span>
                    <span className="text-gray-900">{item.value ?? 0}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-black/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value ?? 0}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.color} rounded-full transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>
 
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(239,68,68,0.1)]">
                <p className="text-sm font-black text-red-900 mb-2">
                  You're reaching {result.talent_pool_impact?.final_reach_percent ?? 0}% of available talent
                </p>
                <p className="text-xs text-red-800/70 font-medium leading-relaxed">
                  {result.talent_pool_impact?.interpretation}
                </p>
              </div>
 
              <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.1)]">
                <p className="text-sm font-black text-emerald-900 mb-2">
                  Projected Reach After Rewrite: {result.talent_pool_impact?.after_rifair_rewrite ?? 0}%
                </p>
                <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">
                  {(result.talent_pool_impact?.after_rifair_rewrite ?? 0) - (result.talent_pool_impact?.final_reach_percent ?? 0)}% expansion in qualified candidate volume.
                </p>
              </div>
            </div>
          </div>

          {/* Business cost card */}
          <div className="bg-[#1D1D1F] border-2 border-black rounded-[2rem] p-8 text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="flex items-center gap-2 mb-8 relative z-10">
              <Scale className="w-4 h-4 text-white/60" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em]">Economic impact of bias</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 relative z-10">
              <div>
                <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                  +{result.business_impact?.estimated_extra_days ?? 0}
                  <span className="text-lg font-bold text-white/40 uppercase tracking-widest">Days</span>
                </div>
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-relaxed max-w-[180px]">
                  Estimated delay in Time-to-Fill due to pool restriction.
                </p>
              </div>
              <div>
                <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                  ₹{((result.business_impact?.estimated_cost_of_bias_inr ?? 0) / 100000).toFixed(1)}L
                  <span className="text-lg font-bold text-white/40 uppercase tracking-widest">INR</span>
                </div>
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-relaxed max-w-[180px]">
                  Projected vacancy cost and lost productivity.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/10 relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Rifair ROI</p>
                  <p className="text-2xl font-black">{result.business_impact?.rifair_roi} Return</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  High Yield
                </div>
              </div>
              <p className="text-sm font-medium text-white/80 leading-relaxed">
                {result.business_impact?.key_insight}
              </p>
            </div>
          </div>

          {/* Industry benchmark */}
          <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-8">
              <Users className="w-4 h-4 text-[#86868B]" />
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Market Competitiveness</p>
            </div>
            
            <div className="space-y-8">
              {[
                {
                  label: 'Bias score',
                  yours: result.industry_benchmark?.your_bias_score,
                  industry: result.industry_benchmark?.industry_avg_bias_score,
                  lowerBetter: true
                },
                {
                  label: 'Inclusivity score',
                  yours: result.industry_benchmark?.your_inclusivity_score,
                  industry: result.industry_benchmark?.industry_avg_inclusivity_score,
                  lowerBetter: false
                }
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                    <span>{metric.label}</span>
                    <div className="flex gap-6">
                      <span>
                        Your Score: <span className={cn(
                          "font-black",
                          metric.lowerBetter
                            ? (metric.yours ?? 0) > (metric.industry ?? 0)
                              ? 'text-red-600' : 'text-emerald-600'
                            : (metric.yours ?? 0) < (metric.industry ?? 0)
                              ? 'text-red-600' : 'text-emerald-600'
                        )}>{metric.yours ?? 0}</span>
                      </span>
                      <span>Industry Avg: <span className="text-black font-black">{metric.industry ?? 0}</span></span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative border border-black/5">
                    <div
                      className="h-full bg-gray-200 rounded-full absolute"
                      style={{ width: `${metric.industry ?? 0}%` }}
                    />
                    <div
                      className={`h-full rounded-full absolute transition-all duration-1000 ${
                        metric.lowerBetter
                          ? (metric.yours ?? 0) > (metric.industry ?? 0)
                            ? 'bg-red-500' : 'bg-emerald-500'
                          : (metric.yours ?? 0) < (metric.industry ?? 0)
                            ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${metric.yours ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={cn(
              "mt-10 text-xs font-black px-6 py-4 rounded-2xl border-2 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]",
              (result.industry_benchmark?.competitive_position || '').toLowerCase().includes('strong')
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            )}>
              {result.industry_benchmark?.competitive_position}
            </div>
          </div>

          {/* Candidate persona projection */}
          <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-8">
              <Users className="w-4 h-4 text-[#86868B]" />
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Candidate Persona Projection</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(239,68,68,0.05)]">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6 border-b border-red-200 pb-2">
                  Current Profile Attraction
                </p>
                <div className="space-y-6">
                  {Object.entries(result.candidate_persona?.current_jd ?? {}).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.1em] mb-1">
                        {key.replace('_skew', '')}
                      </p>
                      <p className="text-sm text-red-900 font-bold leading-relaxed">
                        {val as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.05)]">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 border-b border-emerald-200 pb-2">
                  Post-Rifair Expansion
                </p>
                <div className="space-y-6">
                  {Object.entries(result.candidate_persona?.after_rewrite ?? {}).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.1em] mb-1">
                        {key.replace('_skew', '')}
                      </p>
                      <p className="text-sm text-emerald-900 font-bold leading-relaxed">
                        {val as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {(result.section_analysis ?? []).map((section: any, i: number) => (
            <div key={i} className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-[#1D1D1F] tracking-tight">{section.section}</h3>
                <div className={cn(
                  'px-4 py-2 rounded-2xl border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase tracking-widest',
                  section.bias_score >= 60 ? 'bg-red-50 text-red-600 border-red-200' :
                  section.bias_score >= 30 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                )}>
                  Score: {section.bias_score}/100
                </div>
              </div>
              <p className="text-sm text-[#424245] font-medium mb-8 leading-relaxed">{section.section_verdict}</p>
              
              {section.issues_found?.length > 0 ? (
                <div className="space-y-4">
                  {section.issues_found.map((issue: any, j: number) => (
                    <div key={j} className={cn('border-2 rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]', severityColors[issue.severity])}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className="text-xs font-black bg-white/60 px-3 py-1.5 rounded-xl border border-black/5">"{issue.phrase}"</span>
                        <span className="text-[10px] font-black flex-shrink-0 uppercase tracking-widest bg-black/10 px-2 py-1 rounded-lg">{issue.severity}</span>
                      </div>
                      <p className="text-sm mb-4 leading-relaxed font-medium opacity-90">{issue.explanation}</p>
                      {issue.fixed_phrase && (
                        <div className="flex gap-3 items-center bg-white border border-black/5 rounded-xl p-4 shadow-sm">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-black text-[#1D1D1F]">"{issue.fixed_phrase}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4" />
                  Compliance Verified: No issues found
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CODED LANGUAGE */}
      {activeTab === 'coded' && (
        <div className="space-y-4">
          {result.coded_language?.length === 0 ? (
            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[2rem] p-12 text-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-black text-emerald-700 uppercase tracking-widest">Compliance Verified</p>
              <p className="text-sm text-emerald-600/80 font-medium mt-2">No coded language detected in this job description.</p>
            </div>
          ) : (
            (result.coded_language ?? []).map((item: any, i: number) => (
              <div key={i} className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center border border-black/5 flex-shrink-0">
                    <Info className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-[#1D1D1F] mb-4 tracking-tight">"{item.phrase}"</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-5">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Psychological Signal</p>
                        <p className="text-sm text-red-900 font-medium leading-relaxed">{item.decoded_meaning}</p>
                      </div>
                      <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-5">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Exclusion Risk</p>
                        <p className="text-sm text-amber-900 font-medium leading-relaxed">{item.who_it_deters}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-5 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.1)]">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Inclusive Alternative</p>
                      <p className="text-sm text-emerald-900 font-black">"{item.replacement}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REWRITE */}
      {activeTab === 'rewrite' && (
        <div className="space-y-6">
          <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-[#1D1D1F] tracking-tight">Optimized Job Description</p>
                  <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">AI Refined & Inclusive</p>
                </div>
              </div>
              <button
                id="jd-copy-rewrite-button"
                onClick={copyRewrite}
                className={cn(
                  'text-[10px] font-black px-6 py-3 rounded-full transition-all uppercase tracking-widest border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                  copied ? 'bg-emerald-500 text-white border-black shadow-none translate-x-0.5 translate-y-0.5' : 'bg-black text-white border-black hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                )}
              >
                {copied ? '✓ Copied' : 'Copy Full JD'}
              </button>
            </div>
            <div className="text-base text-[#1D1D1F] font-medium leading-relaxed whitespace-pre-wrap bg-[#F5F5F7] border border-black/5 rounded-2xl p-8 max-h-[32rem] overflow-y-auto custom-scrollbar">
              {result.rewritten_jd}
            </div>
          </div>

          {result.rewrite_changelog?.length > 0 && (
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-8">
                <Info className="w-4 h-4 text-[#86868B]" />
                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">Refinement Changelog</p>
              </div>
              <div className="space-y-4">
                {result.rewrite_changelog.map((change: any, i: number) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-black/[0.04] pb-6 last:border-0">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                      <p className="font-black text-red-600 uppercase text-[9px] tracking-widest mb-2">Original Context</p>
                      <p className="text-red-900 text-xs font-bold leading-relaxed">"{change.original}"</p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                      <p className="font-black text-emerald-600 uppercase text-[9px] tracking-widest mb-2">Optimized Revision</p>
                      <p className="text-emerald-900 text-xs font-black leading-relaxed">"{change.replacement}"</p>
                    </div>
                    <div className="bg-[#F5F5F7] rounded-xl p-4">
                      <p className="font-black text-[#86868B] uppercase text-[9px] tracking-widest mb-2">Strategic Rationale</p>
                      <p className="text-[#1D1D1F] text-xs font-medium leading-relaxed">{change.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEGAL */}
      {activeTab === 'legal' && (
        <div className="space-y-4">
          {result.legal_risks?.length === 0 ? (
            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[2rem] p-12 text-center shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-black text-emerald-700 uppercase tracking-widest">Compliance Secured</p>
              <p className="text-sm text-emerald-600/80 font-medium mt-2">No direct legal risks or discriminatory language detected ✓</p>
            </div>
          ) : (
            (result.legal_risks ?? []).map((risk: any, i: number) => (
              <div key={i} className={cn(
                'border-2 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all',
                risk.severity === 'HIGH' ? 'bg-red-50/50 border-red-200' :
                risk.severity === 'MEDIUM' ? 'bg-amber-50/50 border-amber-200' :
                'bg-white border-black/10'
              )}>
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 shadow-sm",
                    risk.severity === 'HIGH' ? 'bg-red-100 border-red-200' : 'bg-amber-100 border-amber-200'
                  )}>
                    <Scale className={cn("w-6 h-6", risk.severity === 'HIGH' ? 'text-red-600' : 'text-amber-600')} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <p className={cn(
                        'text-lg font-black tracking-tight',
                        risk.severity === 'HIGH' ? 'text-red-900' : risk.severity === 'MEDIUM' ? 'text-amber-900' : 'text-[#1D1D1F]'
                      )}>
                        {risk.issue}
                      </p>
                      <span className={cn(
                        'text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border-2',
                        risk.severity === 'HIGH' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'
                      )}>
                        {risk.severity} Risk
                      </span>
                    </div>
                    <p className={cn(
                      'text-xs font-black uppercase tracking-widest mb-4 opacity-70',
                      risk.severity === 'HIGH' ? 'text-red-700' : 'text-amber-700'
                    )}>
                      Reference: {risk.applicable_law}
                    </p>
                    <div className="bg-white/50 rounded-2xl p-6 border border-black/5">
                      <p className="text-sm font-medium text-[#424245] leading-relaxed">
                        {risk.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-10">
        <button
          id="jd-analyse-another-button"
          onClick={onReset}
          className="w-full sm:flex-1 h-14 bg-white border-2 border-black text-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          Analyse Another JD
        </button>
        <ExportButton 
          type="jd" 
          id={reportId || result.reportId || result.id} 
          planTier={planId} 
          label="Export JD Report"
          className="w-full sm:flex-1"
        />
      </div>
    </div>
  )
}
