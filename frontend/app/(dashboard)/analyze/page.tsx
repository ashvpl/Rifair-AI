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
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-surface border border-border rounded-full">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Analysis Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Hybrid Bias Detection</h2>
          <p className="text-muted-foreground max-w-2xl">
            Analyze interview questions using our 3-layer engine: Lexicon, Patterns, and Semantic AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 relative">
          
          <QuestionInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
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
              className="space-y-8 pt-6 border-t border-border/50 mt-8"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                  Bias Analysis Results
                </h3>
              </div>
              
              <div className="space-y-6">
                {report.categories?.questions?.map((q: any, idx: number) => {
                  const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
                  
                  return (
                    <motion.div variants={itemVariants} key={idx} className="glass-panel overflow-hidden group">
                      {isNeutral ? (
                        <div className="p-6 flex items-center justify-between gap-6 bg-success/5 border-l-4 border-l-success">
                          <div className="text-base text-foreground/90 leading-relaxed font-medium">
                            {q.original}
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full border border-success/20 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Neutral
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-warning to-danger" />
                          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                              Original & Flags
                            </h4>
                            <div 
                              className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap highlight-container"
                              dangerouslySetInnerHTML={{ __html: q.highlighted }}
                            />
                            {q.flags.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2">
                                {q.flags.map((f: any, fIdx: number) => (
                                  <span key={fIdx} className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border ${
                                    f.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' : 
                                    f.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                                    'bg-primary/10 text-primary border-primary/20'
                                  }`}>
                                    {f.category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6 bg-surface/30 relative">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex justify-between items-center">
                              Suggested Rewrite
                              <button 
                                onClick={() => handleCopy(q.rewrite, idx)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                title="Copy rewrite"
                              >
                                {copiedId === idx ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </h4>
                            <div className="relative">
                              <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-primary opacity-50" />
                              <p className="text-base text-primary/90 font-medium italic pl-3 border-l-2 border-primary/20">
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

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 sticky top-24"
              >
                {!report.categories?.aiUsed && (
                  <div className="p-3 bg-warning/10 border border-warning/20 text-warning text-xs rounded-xl flex items-center gap-2 animate-pulse font-medium">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    Deterministic Engine Active (AI Fallback)
                  </div>
                )}
                
                <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
                
                <div className="glass-panel p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Risk Assessment</span>
                    <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
                  </div>
                  
                  {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                    <div className="pt-6 border-t border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 block">
                        Detection Insights
                      </span>
                      <div className="space-y-3">
                        {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => {
                          // Calculate percentage for visual bar (max out at 5 for visual scale)
                          const percentage = Math.min((count / 5) * 100, 100);
                          return (
                            <div key={cat} className="space-y-1 group">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="capitalize text-foreground/80">{cat}</span>
                                <span className="text-foreground">{count}</span>
                              </div>
                              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className="h-full bg-gradient-to-r from-primary to-secondary group-hover:opacity-80 transition-opacity" 
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
                className="glass-panel p-10 flex flex-col items-center justify-center text-center space-y-4 sticky top-24 h-[400px]"
              >
                <div className="h-16 w-16 bg-surface rounded-full flex items-center justify-center border border-border shadow-inner">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Awaiting Input</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                  Submit interview questions to generate a comprehensive 3-layer bias score report.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

