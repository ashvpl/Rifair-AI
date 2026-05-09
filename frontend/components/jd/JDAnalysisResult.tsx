'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/useSubscription'
import ExportButton from '@/components/pdf/ExportButton'


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
    <div className="max-w-3xl mx-auto space-y-4">

      {/* ── Hero card ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-[2rem] p-6 text-white', config.bg)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.15em] mb-2">JD Analysis Complete</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={cn('text-xs font-bold px-3 py-1 rounded-full', config.badge)}>{config.label}</span>
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-medium',
                (result.legal_risk_level === 'HIGH' || result.legal_risk_level === 'CRITICAL')
                  ? 'bg-red-900/50 text-red-200 border-red-700'
                  : 'bg-white/10 text-white/70 border-white/20'
              )}>
                {result.legal_risk_level} legal risk
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed max-w-lg">{result.summary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-4xl font-bold tracking-tighter">{result.overall_inclusivity_score}</div>
            <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.1em]">inclusivity</div>
            <div className="text-2xl font-semibold tracking-tight mt-2">{result.overall_bias_score}</div>
            <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.1em]">bias score</div>
          </div>
        </div>

        {/* Score breakdown */}
        {result.inclusivity_scores && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20">
            {Object.entries(result.inclusivity_scores)
              .filter(([k]) => k !== 'overall')
              .map(([key, val]) => (
                <div key={key}>
                  <div className="text-lg font-semibold">{val as number}</div>
                  <div className="text-[10px] opacity-60 capitalize">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
          </div>
        )}
      </motion.div>

      {/* ── Top 3 fixes ──────────────────────────────────────────── */}
      {result.top_3_fixes?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm"
        >
          <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-3">Top 3 fixes — highest impact</p>
          <div className="space-y-2">
            {result.top_3_fixes.map((fix: string, i: number) => (
              <div key={i} className="flex gap-3 items-start bg-[#F5F5F7] rounded-xl p-3">
                <span className="w-5 h-5 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-[#1D1D1F]">{fix}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Tab nav ───────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`jd-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-xs font-black px-4 py-2 rounded-full border whitespace-nowrap transition-all flex items-center gap-1.5 uppercase tracking-widest',
              activeTab === tab.id
                ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-md'
                : 'bg-white text-[#86868B] border-black/[0.08] hover:bg-[#F5F5F7]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'text-[10px] w-4 h-4 rounded-full inline-flex items-center justify-center font-black',
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
            <div className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-4">Gender language balance</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{result.gender_language_analysis.masculine_coded_count}</div>
                  <div className="text-xs text-[#86868B] font-medium">Masculine</div>
                </div>
                <div className="flex-1 h-2.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (result.gender_language_analysis.masculine_coded_count /
                        Math.max(1, result.gender_language_analysis.masculine_coded_count + result.gender_language_analysis.feminine_coded_count)) * 100)}%`
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-500">{result.gender_language_analysis.feminine_coded_count}</div>
                  <div className="text-xs text-[#86868B] font-medium">Feminine</div>
                </div>
              </div>
              <span className={cn(
                'text-xs px-3 py-1 rounded-lg font-bold inline-block',
                result.gender_language_analysis.balance === 'BALANCED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              )}>
                {result.gender_language_analysis.balance.replace(/_/g, ' ')}
              </span>
              {result.gender_language_analysis.flagged_words?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.gender_language_analysis.flagged_words.map((w: string) => (
                    <span key={w} className="text-xs bg-[#F5F5F7] text-[#1D1D1F] px-2 py-0.5 rounded-full font-medium">{w}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-[#86868B] mt-2 leading-relaxed">{result.gender_language_analysis.recommendation}</p>
            </div>
          )}

          {result.requirement_inflation?.length > 0 && (
            <div className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-3">Requirement inflation</p>
              <div className="space-y-3">
                {result.requirement_inflation.map((item: any, i: number) => (
                  <div key={i} className="border border-amber-200 bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-mono font-bold text-amber-800 mb-1">"{item.requirement}"</p>
                    <p className="text-xs text-amber-700 mb-2">{item.issue}</p>
                    <div className="flex gap-1.5 items-start bg-white/60 rounded-lg p-2">
                      <span className="text-xs font-bold text-blue-700 flex-shrink-0">Fix:</span>
                      <span className="text-xs text-[#1D1D1F] font-medium">{item.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.positive_observations?.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-2">What this JD does well</p>
              {result.positive_observations.map((obs: string, i: number) => (
                <div key={i} className="flex gap-2 items-start mb-1.5">
                  <span className="text-xs bg-emerald-500 text-white w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0">✓</span>
                  <p className="text-sm text-emerald-800">{obs}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          {/* Talent pool visual */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-4">
              Talent pool reach
            </p>

            {/* Funnel visualization */}
            <div className="space-y-2">
              {[
                { label: 'Available talent', value: 100, color: 'bg-gray-200' },
                { label: 'After title', value: result.talent_pool_impact?.after_title_bias, color: 'bg-amber-200' },
                { label: 'After requirements', value: result.talent_pool_impact?.after_requirements, color: 'bg-orange-300' },
                { label: 'After culture', value: result.talent_pool_impact?.after_culture_section, color: 'bg-red-300' },
                { label: 'Your actual reach', value: result.talent_pool_impact?.final_reach_percent, color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.value ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-sm font-semibold text-red-800">
                You're reaching {result.talent_pool_impact?.final_reach_percent ?? 0}% of available talent
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {result.talent_pool_impact?.interpretation}
              </p>
            </div>

            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-sm font-semibold text-blue-900">
                After Rifair rewrite: {result.talent_pool_impact?.after_rifair_rewrite ?? 0}% reach
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {(result.talent_pool_impact?.after_rifair_rewrite ?? 0) - (result.talent_pool_impact?.final_reach_percent ?? 0)}% more qualified candidates will see and apply
              </p>
            </div>
          </div>

          {/* Business cost card */}
          <div className="bg-[#f59e0b] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl" />
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.15em] mb-3 relative z-10">
              Business cost of this JD
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
              <div>
                <div className="text-2xl font-bold">
                  +{result.business_impact?.estimated_extra_days ?? 0}
                </div>
                <div className="text-xs opacity-60 font-medium uppercase tracking-tighter">
                  extra days to fill
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ₹{((result.business_impact?.estimated_cost_of_bias_inr ?? 0) / 100000).toFixed(1)}L
                </div>
                <div className="text-xs opacity-60 font-medium uppercase tracking-tighter">
                  estimated vacancy cost
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/5 relative z-10">
              <p className="text-xs font-bold opacity-70 mb-1 uppercase tracking-widest">
                Rifair ROI
              </p>
              <p className="text-lg font-black text-white">
                {result.business_impact?.rifair_roi} return
              </p>
              <p className="text-xs opacity-70 mt-1 leading-relaxed">
                {result.business_impact?.key_insight}
              </p>
            </div>
          </div>

          {/* Industry benchmark */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-3">
              vs industry benchmark
            </p>
            <div className="space-y-3">
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
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                    <span>{metric.label}</span>
                    <div className="flex gap-4">
                      <span>
                        You: <strong className={
                          metric.lowerBetter
                            ? (metric.yours ?? 0) > (metric.industry ?? 0)
                              ? 'text-red-600' : 'text-emerald-600'
                            : (metric.yours ?? 0) < (metric.industry ?? 0)
                              ? 'text-red-600' : 'text-emerald-600'
                        }>{metric.yours ?? 0}</strong>
                      </span>
                      <span>Avg: <strong>{metric.industry ?? 0}</strong></span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gray-300 rounded-full absolute"
                      style={{ width: `${metric.industry ?? 0}%` }}
                    />
                    <div
                      className={`h-full rounded-full absolute ${
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
            <div className={`mt-4 text-xs font-medium px-3 py-2.5 rounded-xl border ${
              result.industry_benchmark?.competitive_position === 'LEADING'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                : result.industry_benchmark?.competitive_position === 'CRITICAL'
                ? 'bg-red-50 text-red-800 border-red-100'
                : 'bg-amber-50 text-amber-800 border-amber-100'
            }`}>
              {result.industry_benchmark?.insight}
            </div>
          </div>

          {/* Candidate persona */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-3">
              Who will apply
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 border border-red-100/50 rounded-xl p-3">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">
                  Current JD attracts
                </p>
                {Object.entries(
                  result.candidate_persona?.current_jd ?? {}
                ).map(([key, val]) => (
                  <div key={key} className="mb-2.5 last:mb-0">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                      {key.replace('_skew', '')}
                    </p>
                    <p className="text-xs text-red-900 font-medium mt-0.5">
                      {val as string}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                  After rewrite attracts
                </p>
                {Object.entries(
                  result.candidate_persona?.after_rewrite ?? {}
                ).map(([key, val]) => (
                  <div key={key} className="mb-2.5 last:mb-0">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                      {key.replace('_skew', '')}
                    </p>
                    <p className="text-xs text-emerald-900 font-medium mt-0.5">
                      {val as string}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-3">
          {(result.section_analysis ?? []).map((section: any, i: number) => (
            <div key={i} className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#1D1D1F]">{section.section}</h3>
                <span className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full',
                  section.bias_score >= 60 ? 'bg-red-50 text-red-600' :
                  section.bias_score >= 30 ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                )}>
                  {section.bias_score}/100
                </span>
              </div>
              <p className="text-xs text-[#86868B] mb-3 leading-relaxed">{section.section_verdict}</p>
              {section.issues_found?.length > 0 ? (
                <div className="space-y-2">
                  {section.issues_found.map((issue: any, j: number) => (
                    <div key={j} className={cn('border rounded-xl p-3', severityColors[issue.severity])}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold bg-white/60 px-2 py-0.5 rounded">"{issue.phrase}"</span>
                        <span className="text-[10px] font-black flex-shrink-0 uppercase">{issue.severity}</span>
                      </div>
                      <p className="text-xs mb-2 leading-relaxed">{issue.explanation}</p>
                      {issue.fixed_phrase && (
                        <div className="flex gap-2 items-center bg-white/60 rounded-lg px-2 py-1.5">
                          <span className="text-xs font-bold opacity-60">Fix:</span>
                          <span className="text-xs font-semibold">"{issue.fixed_phrase}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">✓ No issues found in this section</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CODED LANGUAGE */}
      {activeTab === 'coded' && (
        <div className="space-y-3">
          {result.coded_language?.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
              <p className="text-sm font-semibold text-emerald-700">No coded language detected ✓</p>
            </div>
          ) : (
            (result.coded_language ?? []).map((item: any, i: number) => (
              <div key={i} className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">🔍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold text-[#1D1D1F] mb-2">"{item.phrase}"</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Signals</p>
                        <p className="text-xs text-red-700 leading-relaxed">{item.decoded_meaning}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Deters</p>
                        <p className="text-xs text-amber-700 leading-relaxed">{item.who_it_deters}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Replace with</p>
                      <p className="text-xs text-emerald-700 leading-relaxed">{item.replacement}</p>
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
        <div className="space-y-3">
          <div className="bg-white border border-primary/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#1D1D1F]">Rewritten job description</p>
              <button
                id="jd-copy-rewrite-button"
                onClick={copyRewrite}
                className={cn(
                  'text-xs font-bold px-4 py-2 rounded-full transition-all',
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-[#1D1D1F] text-white hover:bg-black'
                )}
              >
                {copied ? '✓ Copied' : 'Copy full JD'}
              </button>
            </div>
            <div className="text-sm text-[#1D1D1F]/80 leading-relaxed whitespace-pre-wrap bg-[#F5F5F7] rounded-xl p-4 max-h-[28rem] overflow-y-auto">
              {result.rewritten_jd}
            </div>
          </div>

          {result.rewrite_changelog?.length > 0 && (
            <div className="bg-white border border-black/[0.05] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em] mb-3">What changed and why</p>
              <div className="space-y-2">
                {result.rewrite_changelog.map((change: any, i: number) => (
                  <div key={i} className="grid grid-cols-3 gap-2 text-xs border-b border-black/[0.04] pb-2 last:border-0">
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="font-black text-red-600 uppercase text-[10px] mb-1">Removed</p>
                      <p className="text-red-700 leading-relaxed">{change.original}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="font-black text-emerald-600 uppercase text-[10px] mb-1">Replaced</p>
                      <p className="text-emerald-700 leading-relaxed">{change.replacement}</p>
                    </div>
                    <div className="bg-[#F5F5F7] rounded-lg p-2">
                      <p className="font-black text-[#86868B] uppercase text-[10px] mb-1">Why</p>
                      <p className="text-[#1D1D1F]/70 leading-relaxed">{change.reason}</p>
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
        <div className="space-y-3">
          {result.legal_risks?.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
              <p className="text-sm font-semibold text-emerald-700">No legal risks detected ✓</p>
            </div>
          ) : (
            (result.legal_risks ?? []).map((risk: any, i: number) => (
              <div key={i} className={cn(
                'border rounded-2xl p-5',
                risk.severity === 'HIGH' ? 'bg-red-50 border-red-200' :
                risk.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-200' :
                'bg-[#F5F5F7] border-black/[0.05]'
              )}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">⚖️</span>
                  <div>
                    <p className={cn(
                      'text-sm font-bold mb-1',
                      risk.severity === 'HIGH' ? 'text-red-800' : risk.severity === 'MEDIUM' ? 'text-amber-800' : 'text-[#1D1D1F]'
                    )}>
                      {risk.issue}
                    </p>
                    <p className={cn(
                      'text-xs font-semibold mb-2',
                      risk.severity === 'HIGH' ? 'text-red-600' : risk.severity === 'MEDIUM' ? 'text-amber-600' : 'text-[#86868B]'
                    )}>
                      {risk.applicable_law}
                    </p>
                    <span className={cn(
                      'text-[10px] font-black px-2 py-0.5 rounded-full uppercase',
                      risk.severity === 'HIGH' ? 'bg-red-200 text-red-800' :
                      risk.severity === 'MEDIUM' ? 'bg-amber-200 text-amber-800' :
                      'bg-black/10 text-[#1D1D1F]'
                    )}>
                      {risk.severity} severity
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-4">
        <button
          id="jd-analyse-another-button"
          onClick={onReset}
          className="flex-1 py-3 border border-black/[0.08] text-[#1D1D1F] rounded-2xl text-sm font-bold hover:bg-[#F5F5F7] transition-all"
        >
          Analyse another JD
        </button>
        <ExportButton 
          type="jd" 
          id={reportId || result.reportId || result.id} 
          planTier={planId} 
          label="Export JD Report"
          className="flex-1 h-12"
        />

      </div>
    </div>
  )
}
