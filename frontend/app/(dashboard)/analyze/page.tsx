"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { analyzeQuestions } from "@/lib/api";
import { QuestionInput } from "@/components/QuestionInput";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { LoadingState } from "@/components/LoadingState";
import { ShieldCheck, Info, AlertTriangle, Sparkles, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyzePage() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const token = await getToken();
      const data = await analyzeQuestions(text, token);
      setReport(data.report);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI service temporarily unavailable";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#F5F5F7] border border-black/[0.03] rounded-full">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Analysis Engine</span>
          </div>
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Hybrid Bias Detection</h2>
          <p className="text-[#86868B] max-w-2xl text-lg font-medium">
            Analyze interview questions using our 3-layer engine: Lexicon, Patterns, and Semantic AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 relative">
          
          <QuestionInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-danger/5 border border-danger/10 text-danger rounded-2xl flex items-center gap-4 shadow-sm">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-bold tracking-tight">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="pt-8">
              <LoadingState />
            </div>
          )}

          {!isLoading && report && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-10 pt-10 border-t border-black/[0.05] mt-10"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                   <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Bias Analysis Results
                </h3>
              </div>
              
              <div className="space-y-8">
                {report.categories?.questions?.map((q: any, idx: number) => {
                  const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
                  
                  return (
                    <motion.div variants={itemVariants} key={idx} className="bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group">
                      {isNeutral ? (
                        <div className="p-8 flex items-center justify-between gap-8 bg-success/5 border-l-[6px] border-l-success">
                          <div className="text-xl text-foreground font-semibold tracking-tight">
                            {q.original}
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full border border-success/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck className="h-4 w-4" />
                            Neutral
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 relative h-full">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-warning to-danger" />
                          <div className="p-8 border-b md:border-b-0 md:border-r border-black/[0.03]">
                            <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                              Original & Flags
                            </h4>
                            <div 
                              className="text-lg text-foreground font-semibold leading-relaxed tracking-tight whitespace-pre-wrap highlight-container"
                              dangerouslySetInnerHTML={{ __html: q.highlighted }}
                            />
                            {q.flags.length > 0 && (
                              <div className="mt-8 flex flex-wrap gap-2">
                                {q.flags.map((f: any, fIdx: number) => (
                                  <span key={fIdx} className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider border ${
                                    f.severity === 'high' ? 'bg-danger/5 text-danger border-danger/10 shadow-sm' : 
                                    f.severity === 'medium' ? 'bg-warning/5 text-warning border-warning/10 shadow-sm' : 
                                    'bg-primary/5 text-primary border-primary/10 shadow-sm'
                                  }`}>
                                    {f.category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-8 bg-[#F5F5F7]/30 relative flex flex-col h-full">
                            <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                              Strategic Recommendation
                              <button 
                                onClick={() => handleCopy(q.rewrite, idx)}
                                className="text-[#86868B] hover:text-foreground transition-all duration-300 p-1 bg-white border border-black/5 rounded-lg shadow-sm"
                                title="Copy rewrite"
                              >
                                {copiedId === idx ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </h4>
                            <div className="relative flex-1 flex flex-col justify-center">
                              <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-primary opacity-20" />
                              <p className="text-xl text-primary font-bold italic pl-6 border-l-4 border-primary/10">
                                "{q.rewrite}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 sticky top-28"
              >
                {!report.categories?.aiUsed && (
                  <div className="p-4 bg-warning/5 border border-warning/10 text-warning text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 shadow-sm italic overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                    AI Fallback Mode Active
                  </div>
                )}
                
                <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
                
                <div className="bg-white border border-black/[0.05] p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em]">Risk Profile</span>
                    <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
                  </div>
                  
                  {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                    <div className="pt-8 border-t border-black/[0.03]">
                      <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 block">
                        Detection Clusters
                      </span>
                      <div className="space-y-5">
                        {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => {
                          const percentage = Math.min((count / 5) * 100, 100);
                          return (
                            <div key={cat} className="space-y-2 group">
                              <div className="flex justify-between text-xs font-bold tracking-tight">
                                <span className="capitalize text-foreground/70">{cat}</span>
                                <span className="text-foreground">{count}</span>
                              </div>
                              <div className="h-2 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1.5, ease: "circOut" }}
                                  className="h-full bg-black rounded-full" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-black/[0.05] p-12 flex flex-col items-center justify-center text-center space-y-6 sticky top-28 h-[500px] rounded-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
              >
                <div className="h-24 w-24 bg-[#F5F5F7] rounded-full flex items-center justify-center border border-black/[0.03] shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
                  <ShieldCheck className="h-10 w-10 text-black/10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">System Ready</h3>
                  <p className="text-sm font-medium text-[#86868B] leading-relaxed max-w-[240px]">
                    Analysis engine idling. Enter professional queries to generate deep intelligence reports.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

  );
}

