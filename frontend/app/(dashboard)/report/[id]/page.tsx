"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReportById } from "@/lib/api";
import Link from "next/link";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { ArrowLeft, Calendar, Loader2, Info, ChevronRight, Share2, Download, ShieldCheck, Sparkles, Copy, Check, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportPage({ params }: { params: { id: string } }) {
  const { getToken } = useAuth();
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    window.print();
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await getToken();
        const data = await getReportById(params.id, token);
        setReport(data.report);
      } catch (err: any) {
        setError(err.message || "Report not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [params.id, getToken]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground font-medium tracking-wide mt-6">Retrieving secure analysis report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="h-20 w-20 bg-danger/10 rounded-full flex items-center justify-center text-danger border border-danger/20 shadow-lg">
          <Info className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Report Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            We couldn't find the requested analysis report. It may have been deleted or archived.
          </p>
        </div>
        <Link href="/history">
          <Button variant="outline" className="px-8 h-12 rounded-xl bg-surface border-border hover:bg-background transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Header section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
              <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                History Archive
              </Link>
              <span className="opacity-20 text-lg font-light">/</span>
              <span className="text-[#1D1D1F]">Reference {params.id.slice(0, 12)}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1D1D1F] tracking-tight">
                {report.input_text.startsWith("Interview Kit") ? "Strategy Framework" : "Intelligence Audit"}
              </h1>
              <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
            </div>
            
            <div className="flex items-center gap-5 text-[#86868B] font-bold text-xs uppercase tracking-[0.1em]">
              <span className="flex items-center gap-2.5 px-4 py-2 bg-[#F5F5F7] rounded-full border border-black/[0.03]">
                <Calendar className="h-4 w-4 opacity-50" />
                {format(new Date(report.created_at), "PPPP")}
              </span>
              <span className="opacity-20 h-4 w-[1px] bg-black" />
              <span className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full border border-black/[0.03]">
                <Loader2 className="h-3.5 w-3.5 opacity-40" />
                {format(new Date(report.created_at), "h:mm a")} EST
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="bg-white border-black/[0.05] h-12 px-8 rounded-full hover:bg-[#F5F5F7] transition-all font-bold shadow-sm active:scale-95" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-3 text-primary" /> 
              {copied ? "Copied!" : "Dispatch Report"}
            </Button>
            <Button variant="default" size="sm" className="bg-black text-white h-12 px-8 rounded-full hover:bg-black/90 transition-all font-heavy shadow-xl active:scale-95" onClick={handleExport}>
              <Download className="h-4 w-4 mr-3 text-white/80" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Sidebar Col (Scores) */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
          
          <div className="bg-white border border-black/[0.05] p-10 rounded-[3rem] shadow-[0_4px_32px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-full blur-2xl" />
            <div className="flex items-center justify-between relative z-10">
              <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em]">Audit Configuration</h4>
              <ShieldCheck className={report.categories?.aiUsed ? "h-5 w-5 text-success" : "h-5 w-5 text-warning"} />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 p-5 bg-[#F5F5F7]/50 rounded-[1.5rem] border border-black/[0.02] shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
                <div className={`w-3 h-3 rounded-full ${report.categories?.aiUsed ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.3)]' : 'bg-warning shadow-[0_0_12px_rgba(245,158,11,0.3)]'}`} />
                <span className="text-[13px] font-extrabold text-[#1D1D1F]">
                  {report.categories?.aiUsed ? "Semantic Intelligence Engine" : "Pattern Recognition Matrix"}
                </span>
              </div>
              
              {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                <div className="pt-8 border-t border-black/[0.03] space-y-4">
                  <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] block ml-1">Detection Logic</span>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => (
                      <div key={cat} className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-black/[0.03] shadow-sm hover:border-black/10 transition-all group">
                        <span className="text-xs font-bold capitalize text-[#1D1D1F] tracking-tight group-hover:text-primary transition-colors">{cat} Matrix</span>
                        <span className="text-xs font-black text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-lg border border-black/[0.01]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content Col (Highlights) */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">Intelligence Decomposition</h3>
          </div>
          
          <div className="space-y-8">
            {(report.categories?.questions || []).map((q: any, idx: number) => {
              const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
              
              return (
                <div key={idx} className="bg-white border border-black/[0.05] overflow-hidden transition-all duration-700 rounded-[2.5rem] shadow-[0_4px_32px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_48px_rgba(0,0,0,0.05)] hover:border-black/[0.08]">
                  {isNeutral ? (
                    <div className="p-8 flex items-center justify-between gap-10 border-l-[10px] border-l-success bg-success/[0.02]">
                      <div className="text-xl text-[#1D1D1F] leading-relaxed font-bold tracking-tight">
                        {q.original}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2 bg-success text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-success/20">
                        <ShieldCheck className="h-4 w-4" />
                        Validated
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="p-10 border-b lg:border-b-0 lg:border-r border-black/[0.03] relative bg-[#F5F5F7]/30">
                        <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-danger" /> Deviation Segments
                        </h4>
                        <div 
                          className="text-xl text-[#1D1D1F] leading-snug font-bold tracking-tight whitespace-pre-wrap highlight-container"
                          dangerouslySetInnerHTML={{ __html: q.highlighted }}
                        />
                        {q.flags && q.flags.length > 0 && (
                          <div className="mt-8 flex flex-wrap gap-2.5">
                            {q.flags.map((f: any, fIdx: number) => (
                              <span key={fIdx} className={`text-[9px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider border shadow-sm ${
                                f.severity === 'high' ? 'bg-danger text-white border-danger' : 
                                f.severity === 'medium' ? 'bg-warning text-white border-warning' : 
                                'bg-primary text-white border-primary'
                              }`}>
                                {f.category} Vector
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-10 bg-white relative group">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2.5">
                            <Sparkles className="h-4 w-4" /> Inclusive Refactor
                          </h4>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(q.rewrite);
                            }}
                            className="text-[#86868B] hover:text-[#1D1D1F] transition-all p-2 bg-[#F5F5F7] rounded-xl border border-black/[0.03] hover:scale-110 active:scale-95"
                            title="Copy Suggestion"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-6 top-0 bottom-0 w-[3px] bg-primary/20 rounded-full" />
                          <p className="text-xl text-[#1D1D1F] font-bold italic tracking-tight leading-relaxed">
                            "{q.rewrite}"
                          </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-black/[0.02]">
                           <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest opacity-40">Optimization Protocol Completed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interview Kit Specific Section */}
          {report.categories?.kit_data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="space-y-12 pt-16 border-t border-black/[0.05] mt-16"
            >
              <div className="flex items-center gap-6 px-4">
                <div className="h-16 w-16 bg-black text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-all hover:rotate-12">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">Consolidated Protocol Kit</h3>
                  <p className="text-[#86868B] text-sm font-bold uppercase tracking-[0.2em] mt-1">Soverign AI Evaluation Matrix</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-7 space-y-8">
                  <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] flex items-center gap-4 ml-2">
                    <span className="w-12 h-[2px] bg-primary/20"></span> Primary Engagement Vectors
                  </h4>
                  <div className="grid gap-6">
                    {report.categories.kit_data.questions?.map((q: string, idx: number) => (
                      <div key={idx} className="bg-white border border-black/[0.05] p-8 rounded-[2rem] relative overflow-hidden group hover:border-primary transition-all shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 left-0 w-[4px] h-full bg-primary/10 group-hover:bg-primary transition-all duration-500" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block mb-4 opacity-40 group-hover:opacity-100 italic">Instruction {idx + 1}</span>
                        <p className="text-lg text-[#1D1D1F] leading-relaxed font-bold tracking-tight">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {report.categories.kit_data.role_summary && (
                  <div className="xl:col-span-5 space-y-8">
                    <h4 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] flex items-center gap-4 ml-2">
                      <span className="w-12 h-[2px] bg-secondary/20"></span> Model Core Thesis
                    </h4>
                    <div className="bg-black text-white p-12 rounded-[3.5rem] space-y-12 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[80px]" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-[80px]" />
                      
                      <div className="grid grid-cols-1 gap-10 relative z-10">
                        <div className="space-y-2 group/item">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] group-hover/item:text-primary transition-colors">Strategic Domain</span>
                          <p className="text-xl font-extrabold tracking-tight">{report.categories.kit_data.role_summary.domain}</p>
                        </div>
                        <div className="space-y-2 group/item">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] group-hover/item:text-secondary transition-colors">Operational Tier</span>
                          <p className="text-xl font-extrabold tracking-tight">{report.categories.kit_data.role_summary.role_type}</p>
                        </div>
                        <div className="space-y-2 group/item">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] group-hover/item:text-primary transition-colors">Deployment Context</span>
                          <p className="text-xl font-extrabold tracking-tight">{report.categories.kit_data.role_summary.work_environment}</p>
                        </div>
                        <div className="space-y-3 group/item">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] group-hover/item:text-secondary transition-colors">Primary Stack</span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {report.categories.kit_data.role_summary.tools_used?.slice(0, 5).map((tool: string, tIdx: number) => (
                              <span key={tIdx} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">{tool}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-10 border-t border-white/10 relative z-10">
                         <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-success" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">End of Strategic Briefing</p>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>

  );
}
