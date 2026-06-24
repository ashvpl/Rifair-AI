"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Download,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Activity,
  FileText,
  AlertTriangle,
  X,
  Info,
  Database,
  Server,
  FileJson,
  FileSpreadsheet,
  Briefcase,
  Building2,
  Users2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { DEMO_JD, DEMO_RANKING_METHODOLOGY, Candidate } from "@/lib/demo-data";

export function DemoHeader() {
  return (
    <div className="text-center space-y-4 mb-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900"
      >
        Candidate Intelligence Engine
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium"
      >
        Semantic candidate ranking powered by behavioral intelligence, authenticity detection, and recruiter-grade explainability.
      </motion.p>
    </div>
  );
}

export function JobUnderstandingPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl p-6 mb-12"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <Brain className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900">Job Understanding Panel</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Role</p>
          <p className="text-lg text-slate-900 font-medium">{DEMO_JD.role}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Experience</p>
          <p className="text-lg text-slate-900 font-medium">{DEMO_JD.experience}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-semibold">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_JD.requiredSkills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-rose-500 mb-2 uppercase tracking-wider font-semibold">Disqualifiers</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_JD.disqualifiers.map((dq) => (
              <span key={dq} className="px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded-md border border-rose-100 font-medium">
                {dq}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PipelineVisualization({ isProcessing }: { isProcessing?: boolean }) {
  const steps = [
    "Job Description",
    "Role Understanding Engine",
    "Semantic Matching",
    "Behavioral Intelligence",
    "Authenticity Engine",
    "Hybrid Ranking",
    "Candidate Shortlist"
  ];

  return (
    <div className="mb-20 overflow-hidden">
      <h3 className="text-slate-400 font-semibold mb-6 text-center tracking-widest uppercase text-sm">Screening Process</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 flex-wrap">
        {steps.map((step, idx) => {
          const isProcessingStep = isProcessing && idx > 0 && idx < steps.length - 1;
          return (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2 md:gap-4"
            >
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-300 ${
                idx === 0 || idx === steps.length - 1 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-md' 
                  : isProcessingStep
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-inner animate-pulse'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}>
                {step}
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className={`w-4 h-4 hidden md:block transition-colors ${isProcessingStep ? 'text-indigo-500' : 'text-slate-300'}`} />
              )}
              {idx < steps.length - 1 && (
                <ChevronRight className={`w-4 h-4 block md:hidden rotate-90 my-1 ${isProcessingStep ? 'text-indigo-500' : 'text-slate-300'}`} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function CandidateDetailsDrawer({ candidate, onClose }: { candidate: Candidate | null, onClose: () => void }) {
  return (
    <AnimatePresence>
      {candidate && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white border-l border-slate-200 z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-6 md:p-8">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    #{candidate.rank}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
                    <p className="text-slate-500 font-medium">{candidate.currentTitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {candidate.yearsExperience} Years Exp</div>
                  <div className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-500" /> {candidate.industry}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> {candidate.location}</div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Scoring Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Scoring Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(candidate.scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-slate-700 capitalize">{key}</span>
                          <span className="text-slate-900 font-mono font-bold">{value}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full shadow-sm ${
                              key === 'overall' ? 'bg-indigo-500' :
                              key === 'relevance' ? 'bg-blue-500' :
                              key === 'experience' ? 'bg-purple-500' :
                              key === 'behavior' ? 'bg-emerald-500' :
                              key === 'trust' ? 'bg-amber-500' :
                              key === 'shipper' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explainability Panel */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Explainability Insights</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Strengths</h4>
                      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 font-medium">
                        {candidate.explainability.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    {candidate.explainability.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-amber-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Weaknesses</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 font-medium">
                          {candidate.explainability.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                    {candidate.explainability.missingRequirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-2"><X className="w-4 h-4"/> Missing Requirements</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 font-medium">
                          {candidate.explainability.missingRequirements.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authenticity Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Authenticity</h3>
                    <div className="space-y-3 font-medium">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Timeline</span>
                        {candidate.authenticity.timelineValidation === 'Verified' ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Skills</span>
                        {candidate.authenticity.skillValidation === 'Verified' ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Honeypot Risk</span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                          candidate.authenticity.honeypotRisk === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>{candidate.authenticity.honeypotRisk}</span>
                      </div>
                    </div>
                  </div>

                  {/* Behavior Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Behavior Signals</h3>
                    <div className="space-y-3 font-medium">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Response Rate</span>
                        <span className="text-slate-900 font-bold">{candidate.behavior.recruiterResponseRate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Interview Completion</span>
                        <span className="text-slate-900 font-bold">{candidate.behavior.interviewCompletionRate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Status</span>
                        <span className="text-indigo-600 font-bold">{candidate.behavior.openToWorkStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CandidateLeaderboard({ candidates }: { candidates: Candidate[] }) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="mb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Top Candidates Leaderboard</h2>
        <span className="text-sm text-slate-500 font-medium">Showing top {candidates.length} of 100,000 processed</span>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="p-4 font-bold">Rank</th>
              <th className="p-4 font-bold">Candidate</th>
              <th className="p-4 font-bold text-right">Overall Score</th>
              <th className="p-4 font-bold hidden md:table-cell text-right">Relevance</th>
              <th className="p-4 font-bold hidden lg:table-cell text-right">Behavior</th>
              <th className="p-4 font-bold hidden sm:table-cell text-right">Trust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((candidate) => (
              <tr 
                key={candidate.id} 
                onClick={() => setSelectedCandidate(candidate)}
                className="group hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <span className="font-mono font-bold text-indigo-600">#{candidate.rank}</span>
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">{candidate.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{candidate.currentTitle}</div>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-sm font-bold border border-indigo-200 shadow-sm">
                    {candidate.scores.overall}
                  </span>
                </td>
                <td className="p-4 text-right hidden md:table-cell text-slate-600 font-mono text-sm font-bold">{candidate.scores.relevance}</td>
                <td className="p-4 text-right hidden lg:table-cell text-slate-600 font-mono text-sm font-bold">{candidate.scores.behavior}</td>
                <td className="p-4 text-right hidden sm:table-cell">
                  <div className="flex justify-end">
                    {candidate.scores.trust > 90 ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CandidateDetailsDrawer 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />
    </div>
  );
}

export function RankingMethodology() {
  return (
    <div className="mb-24">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Intelligent Ranking Methodology</h2>
      <div className="flex flex-col md:flex-row h-auto md:h-16 rounded-xl overflow-hidden border border-slate-200 mb-8 bg-white shadow-lg">
        {DEMO_RANKING_METHODOLOGY.map((metric) => {
          // Map dark mode color classes to light mode backgrounds
          const lightColorMap: Record<string, string> = {
            'bg-indigo-500': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'bg-blue-500': 'bg-blue-100 text-blue-700 border-blue-200',
            'bg-emerald-500': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'bg-amber-500': 'bg-amber-100 text-amber-700 border-amber-200',
            'bg-rose-500': 'bg-rose-100 text-rose-700 border-rose-200',
          };
          const styleClass = lightColorMap[metric.color] || 'bg-slate-100 text-slate-700 border-slate-200';
          
          return (
            <div 
              key={metric.name} 
              className={`${styleClass} flex flex-col md:flex-row items-center justify-center p-3 md:p-0 border-b md:border-b-0 md:border-r last:border-r-0`}
              style={{ flex: metric.weight }}
            >
              <div className="text-center md:text-left md:px-4">
                <span className="block font-bold">{metric.weight}%</span>
                <span className="text-xs font-semibold whitespace-nowrap opacity-80">{metric.name}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_RANKING_METHODOLOGY.map((metric) => {
          const dotColorMap: Record<string, string> = {
            'bg-indigo-500': 'bg-indigo-500',
            'bg-blue-500': 'bg-blue-500',
            'bg-emerald-500': 'bg-emerald-500',
            'bg-amber-500': 'bg-amber-500',
            'bg-rose-500': 'bg-rose-500',
          };
          return (
            <div key={metric.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full mb-3 ${dotColorMap[metric.color] || 'bg-slate-500'}`} />
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{metric.name}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{metric.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HoneypotDetection() {
  return (
    <div className="mb-24">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Why Traditional ATS Systems Fail</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-rose-700">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-bold">The Keyword Stuffer</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-rose-100 shadow-sm">
              <p className="text-sm text-slate-600 font-medium line-through">Matches 100% of keywords</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-rose-100 shadow-sm">
              <p className="text-sm text-slate-600 font-medium line-through">Exaggerated timelines</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-rose-100 shadow-sm">
              <p className="text-sm text-slate-600 font-medium line-through">Fake senior titles</p>
            </div>
            <p className="text-xs font-bold text-rose-600 mt-4">Traditional ATS ranks this #1.</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-32 bg-emerald-100 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 text-emerald-700 relative z-10">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold">Rifair AI Detection Engine</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-white rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">Semantic verification layer</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">Career timeline validation</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-100 shadow-sm flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">GitHub & Behavioral signals</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-4">Rifair AI flags the fraud and ranks them #98,401.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScaleAndArchitecture() {
  return (
    <div className="mb-24" id="architecture">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl text-center">
          <p className="text-3xl font-black text-slate-900 mb-1">100,000</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Candidates Processed</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl text-center">
          <p className="text-3xl font-black text-indigo-600 mb-1">23</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Behavior Signals</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl text-center">
          <p className="text-3xl font-black text-emerald-600 mb-1">50+</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Candidate Features</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl text-center">
          <p className="text-3xl font-black text-purple-600 mb-1">2.5s</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Processing Time</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Architecture Showcase</h2>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-4xl mx-auto overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="px-6 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-bold shadow-md">Candidate Dataset (100k)</div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <div className="px-6 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800 font-bold shadow-md w-64 text-center">Feature Extraction Engine</div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
          
          <div className="flex gap-4">
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 text-center w-40 shadow-sm">Semantic Layer</div>
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 text-center w-40 shadow-sm">Behavior Engine</div>
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 text-center w-40 shadow-sm">Authenticity Engine</div>
          </div>
          
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <div className="px-6 py-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 shadow-md w-64 text-center font-black">Hybrid Ranking Engine</div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <div className="px-6 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 shadow-md w-64 text-center font-bold">Explainability Engine</div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <div className="px-6 py-3 bg-slate-900 border border-slate-900 text-white rounded-lg text-sm font-black shadow-xl">Recruiter Shortlist (Top 100)</div>
        </div>
      </div>
    </div>
  );
}

export function SubmissionOutput() {
  return (
    <div className="mb-24 text-center border-t border-slate-200 pt-16 mt-16">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Export Results</h2>
      <p className="text-slate-600 font-medium mb-8 max-w-2xl mx-auto">
        The pipeline generates a fully formatted CSV ready for review, capturing the real data from the execution.
      </p>
      
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl max-w-3xl mx-auto overflow-hidden mb-8 text-left">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-mono font-bold text-slate-700">submission.csv</span>
        </div>
        <div className="p-4 overflow-x-auto bg-slate-50/50">
          <pre className="text-xs text-slate-700 font-mono font-medium">
{`candidate_id,rank,score,reasoning
CAND_0002025,1,0.7075,"Top-tier Senior AI Engineer with 5.9 years of experience..."
CAND_0071974,2,0.6840,"Top-tier Senior AI Engineer with 7.8 years of experience..."
CAND_0099806,3,0.6760,"Top-tier AI Engineer with 4.6 years of experience..."`}
          </pre>
        </div>
      </div>

      <a href="/api/download-csv" download="submission.csv" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg">
        <Download className="w-4 h-4" />
        Download Candidate List
      </a>
      <p className="text-xs font-bold text-slate-500 mt-4">Generated automatically by Rifair AI</p>
    </div>
  );
}

export function DatasetDisclosure() {
  const [isExpanded, setIsExpanded] = useState(false);

  const futureSources = [
    { name: "ATS Integrations", icon: <Briefcase className="w-5 h-5" /> },
    { name: "Resume Repositories", icon: <Database className="w-5 h-5" /> },
    { name: "Internal Talent Pools", icon: <Users2 className="w-5 h-5" /> },
    { name: "HRMS Systems", icon: <Building2 className="w-5 h-5" /> },
    { name: "CSV Candidate Imports", icon: <FileSpreadsheet className="w-5 h-5" /> },
    { name: "JSON Candidate Imports", icon: <FileJson className="w-5 h-5" /> },
    { name: "Enterprise Data Warehouses", icon: <Server className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-16 space-y-8">
      {/* Informational Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-100/50 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="bg-white/80 p-3 rounded-xl text-indigo-600 shrink-0 shadow-sm border border-indigo-100/50">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Official Hackathon Dataset Demo</h3>
            <div className="space-y-3 text-sm text-slate-700 font-medium leading-relaxed">
              <p>
                This demonstration is powered by the official Redrob AI Hackathon dataset containing approximately 100,000 candidate profiles.
              </p>
              <p>
                The Candidate Intelligence Engine, Behavioral Intelligence Layer, Authenticity Engine, and Hybrid Ranking System are designed to operate on arbitrary candidate datasets and can be integrated with ATS platforms, resume repositories, internal talent databases, or custom candidate sources in production environments.
              </p>
              <p>
                Current demo results are generated using the official challenge dataset to ensure reproducibility, transparency, and evaluation consistency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Data Sources */}
      <div className="space-y-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Future Data Sources</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {futureSources.map((source) => (
            <div key={source.name} className="flex flex-col items-center text-center bg-white border border-slate-200 rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity">
              <div className="text-slate-400 mb-3">{source.icon}</div>
              <span className="text-[10px] font-bold text-slate-600 mb-2 min-h-[28px] flex items-center justify-center leading-tight">{source.name}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">Planned</span>
            </div>
          ))}
        </div>
      </div>

      {/* How This Demo Works (Expandable) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100 transition-colors text-left"
        >
          <span className="font-bold text-slate-800 text-sm">How This Demo Works</span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-slate-200 bg-white">
                <ul className="space-y-4">
                  {[
                    "The engine processed the official challenge dataset.",
                    "Candidates were evaluated using semantic matching.",
                    "Behavioral signals were analyzed.",
                    "Authenticity and trust scores were generated.",
                    "Candidates were ranked using the Hybrid Ranking Engine.",
                    "Results displayed in the demo are generated from actual engine outputs."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
