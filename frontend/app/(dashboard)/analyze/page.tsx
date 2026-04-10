"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { analyzeQuestions, getReportById } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { QuestionInput } from "@/components/QuestionInput";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { LoadingState } from "@/components/LoadingState";
import HolographicCard from "@/components/ui/holographic-card";
import { ShieldCheck, Info, AlertTriangle, Sparkles, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";

export default function AnalyzePage() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await getReportById(reportId, token);
        let fetchedReport = data.report;
        
        if (!fetchedReport) throw new Error("Report data missing");

        // Robust parsing of JSONB fields
        if (typeof fetchedReport.categories === "string") {
          try {
            fetchedReport.categories = JSON.parse(fetchedReport.categories);
          } catch (e) {
            console.error("Failed to parse report categories", e);
          }
        }
        
        // Ensure categories is at least an empty object to avoid crashes
        if (!fetchedReport.categories) fetchedReport.categories = {};
        
        // Reliability fallback for questions
        if (!fetchedReport.categories.questions && Array.isArray(fetchedReport.flagged_phrases)) {
           fetchedReport.categories.questions = fetchedReport.flagged_phrases;
        }

        setReport(fetchedReport); 
      } catch (err: any) {
        console.error("[ANALYZE] Load error:", err);
        setError(err.message || "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [reportId, getToken]);

  const handleAnalyze = async (text: string, name: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
 
    try {
      const token = await getToken();
      const data = await analyzeQuestions(text, token, name);
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
    <div className="space-y-6 animate-in fade-in duration-1000 pb-20 pt-0">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">

          <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Smarter Bias Detection</h2>
          <p className="text-[#86868B] max-w-2xl text-lg font-medium">
            Analyze interview questions with AI that understands language, structure, and intent—so nothing slips through.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 relative">
          
          <QuestionInput 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            initialText={
              report?.categories?.original_input || 
              (report?.input_text?.startsWith("Analysis -") ? "" : report?.input_text) || 
              ""
            }
            initialName={
              report?.input_text?.startsWith("Analysis - '") 
                ? report.input_text.replace(/^Analysis - '(.*)'$/, "$1") 
                : ""
            }
          />
          
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
                  const hasHighFlag = q.flags?.some((f: any) => f.severity === 'high');
                  const biasLevel = isNeutral ? 'neutral' : hasHighFlag || (q.biasScore || 0) > 60 ? 'high' : 'medium';
                  
                  return (
                    <motion.div variants={itemVariants} key={idx}>
                      <HolographicCard
                        intensity={isNeutral ? 40 : 30}
                        biasLevel={biasLevel as 'high' | 'medium' | 'neutral'}
                      >
                        {isNeutral ? (
                          <div className="p-8 flex items-center justify-between gap-8">
                            <div className="text-xl text-foreground font-semibold tracking-tight">
                              {q.original}
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full border border-success/20 text-[10px] font-black uppercase tracking-[0.2em]">
                              <ShieldCheck className="h-4 w-4" />
                              Neutral
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 relative">
                            {/* Gradient severity stripe */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] bg-gradient-to-b from-warning to-danger z-10" />
                            <div className="p-8 border-b md:border-b-0 md:border-r border-black/[0.04] pl-10">
                              <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-danger" />
                                Original &amp; Flags
                              </h4>
                              <div 
                                className="text-lg text-foreground font-semibold leading-relaxed tracking-tight whitespace-pre-wrap highlight-container"
                                dangerouslySetInnerHTML={{ __html: q.highlighted }}
                              />
                              {q.flags.length > 0 && (
                                <div className="mt-8 flex flex-wrap gap-2">
                                  {q.flags.map((f: any, fIdx: number) => (
                                    <span key={fIdx} className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider border ${
                                      f.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' : 
                                      f.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                                      'bg-primary/5 text-primary border-primary/10'
                                    }`}>
                                      {f.category}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="p-8 bg-[#FAFAFA]/60 relative flex flex-col">
                              <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                  <Sparkles className="h-3 w-3 text-primary" />
                                  Strategic Recommendation
                                </span>
                                <button 
                                  onClick={() => handleCopy(q.rewrite, idx)}
                                  className="text-[#86868B] hover:text-foreground transition-all duration-300 p-1.5 bg-white border border-black/5 rounded-lg shadow-sm hover:shadow hover:scale-110 active:scale-95"
                                  title="Copy rewrite"
                                >
                                  {copiedId === idx ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </h4>
                              <div className="relative flex-1 flex flex-col justify-center">
                                <p className="text-xl text-primary font-bold italic pl-6 border-l-4 border-primary/20 leading-relaxed min-h-[3rem]">
                                  &ldquo;<Typewriter text={q.rewrite} speed={50} />&rdquo;
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </HolographicCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {report && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 sticky top-28"
              >

                
                <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
                
                <div className="bg-white border border-black/[0.05] p-8 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-black text-[#86868B] uppercase tracking-[0.25em] leading-[1.3] flex flex-col">
                      <span>Risk</span>
                      <span>Profile</span>
                    </div>
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

  );
}

