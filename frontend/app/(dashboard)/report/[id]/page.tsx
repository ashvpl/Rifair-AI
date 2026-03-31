"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReportById } from "@/lib/api";
import Link from "next/link";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { ArrowLeft, Calendar, Loader2, Info, ChevronRight, Share2, Download, ShieldCheck, Sparkles, Copy, Check, FileText } from "lucide-react";
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <ArrowLeft className="h-3 w-3" />
                History
              </Link>
              <span className="opacity-30">/</span>
              <span className="text-muted-foreground">Report Reference {params.id.slice(0, 8)}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {report.input_text.startsWith("Interview Kit") ? "Interview Kit" : "Deep Analysis Report"}
              </h2>
              <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground font-semibold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-2 px-3 py-1 bg-surface rounded-full border border-border/50">
                <Calendar className="h-3.5 w-3.5 opacity-60" />
                {format(new Date(report.created_at), "PPPP")}
              </span>
              <span className="opacity-30">•</span>
              <span>{format(new Date(report.created_at), "h:mm a")}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-surface/50 border-border/50 h-10 px-5 rounded-xl hover:bg-background transition-all" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2 text-primary" /> 
              {copied ? "Copied!" : "Share Analysis"}
            </Button>
            <Button variant="outline" size="sm" className="bg-surface/50 border-border/50 h-10 px-5 rounded-xl hover:bg-background transition-all" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2 text-secondary" /> Save PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Sidebar Col (Scores) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
          
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Audit Summary</h4>
              <ShieldCheck className={report.categories?.aiUsed ? "h-4 w-4 text-success" : "h-4 w-4 text-warning"} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/30">
                <div className={`w-2 h-2 rounded-full ${report.categories?.aiUsed ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                <span className="text-xs font-bold text-foreground">
                  {report.categories?.aiUsed ? "Deep Semantic AI Applied" : "Pattern Matcher Active"}
                </span>
              </div>
              
              {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                <div className="pt-4 border-t border-border/30 space-y-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Bias Vectors detected</span>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => (
                      <div key={cat} className="flex items-center justify-between px-3 py-2 bg-surface/50 rounded-lg border border-border/30">
                        <span className="text-[11px] font-bold capitalize text-muted-foreground">{cat}</span>
                        <span className="text-[11px] font-black text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content Col (Highlights) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Semantic Breakdown</h3>
          </div>
          
          <div className="space-y-6">
            {(report.categories?.questions || []).map((q: any, idx: number) => {
              const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
              
              return (
                <div key={idx} className="glass-panel overflow-hidden transition-all duration-300">
                  {isNeutral ? (
                    <div className="p-6 flex items-center justify-between gap-6 border-l-4 border-l-success bg-success/5">
                      <div className="text-base text-foreground/90 leading-relaxed font-medium">
                        {q.original}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full border border-success/20 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Validated
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-6 border-b md:border-b-0 md:border-r border-border/50 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-warning/50 to-danger/50" />
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Problematic Segments</h4>
                        <div 
                          className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap highlight-container"
                          dangerouslySetInnerHTML={{ __html: q.highlighted }}
                        />
                        {q.flags && q.flags.length > 0 && (
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
                      <div className="p-6 bg-surface/30 relative group">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Inclusive suggestion
                          </h4>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(q.rewrite);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-all p-1"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-base text-primary/90 font-medium italic pl-4 border-l-2 border-primary/30 py-1">
                          "{q.rewrite}"
                        </p>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 pt-10 border-t border-border/50 mt-10"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">Structured Interview Kit</h3>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Generated AI Evaluation Framework</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-primary/30"></span> Recommended Questions
                  </h4>
                  <div className="space-y-4">
                    {report.categories.kit_data.questions?.map((q: string, idx: number) => (
                      <div key={idx} className="glass-panel p-5 relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest block mb-2">Requirement {idx + 1}</span>
                        <p className="text-sm text-foreground/90 leading-relaxed font-semibold">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {report.categories.kit_data.role_summary && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-secondary/30"></span> Model interpretation
                    </h4>
                    <div className="glass-panel p-8 bg-[#0B0F19]/80 border-primary/20 space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Domain</span>
                          <p className="text-sm font-bold text-foreground">{report.categories.kit_data.role_summary.domain}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role Type</span>
                          <p className="text-sm font-bold text-foreground">{report.categories.kit_data.role_summary.role_type}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Environment</span>
                          <p className="text-sm font-bold text-foreground">{report.categories.kit_data.role_summary.work_environment}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scored Skillset</span>
                          <p className="text-sm font-bold text-primary">{report.categories.kit_data.role_summary.tools_used?.slice(0, 3).join(", ")}</p>
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
