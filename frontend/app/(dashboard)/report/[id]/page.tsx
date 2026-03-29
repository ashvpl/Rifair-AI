"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReportById } from "@/lib/api";
import Link from "next/link";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Loader2, Info, ChevronRight, Share2, Download, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <Info className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-slate-500 max-w-sm">
          We couldn&apos;t find the requested analysis report. It may have been deleted or you may not have permission.
        </p>
        <Link href="/history">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/history" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              History
            </Link>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <span className="truncate max-w-[200px]">Report {report.id.slice(0, 8)}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {report.input_text.startsWith("Interview Kit") ? "Interview Kit Generated" : "Analysis Report"}
            <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
          </h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar className="h-4 w-4" />
            {format(new Date(report.created_at), "PPPP • h:mm a")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white border-slate-200" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" /> {copied ? "Copied Link!" : "Share Link"}
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-slate-200" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print-content">
        <div className="lg:col-span-1 space-y-6">
          <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
          
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Summary</h4>
              {report.categories?.aiUsed ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Deep AI Analysis Applied
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <Info className="h-4 w-4" />
                  Deterministic Engine Active
                </div>
              )}
              
              {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Issue Distribution</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => (
                      <div key={cat} className="text-xs text-slate-600 flex justify-between bg-slate-50 p-2 rounded">
                        <span className="capitalize">{cat}</span>
                        <span className="font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Detailed Analysis & Highlighting</h3>
            
            {(report.categories?.questions || []).map((q: any, idx: number) => {
              const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
              
              return (
                <Card key={idx} className="overflow-hidden border-slate-200 shadow-sm group hover:shadow-md transition-all">
                  <CardContent className="p-0">
                    {isNeutral ? (
                      <div className="p-6 flex items-center justify-between gap-6">
                        <div className="text-lg text-slate-700 leading-relaxed font-medium">
                          {q.original}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Neutral
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 border-b border-slate-50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Original & Flags</h4>
                          <div 
                            className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap highlight-container"
                            dangerouslySetInnerHTML={{ __html: q.highlighted }}
                          />
                          {q.flags && q.flags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {q.flags.map((f: any, fIdx: number) => (
                                <span key={fIdx} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  f.severity === 'high' ? 'bg-red-100 text-red-700' : 
                                  f.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {f.category}: {f.word}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-slate-50/50 flex items-start gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="h-3 w-3 text-indigo-600" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Inclusiveness Rewrite</span>
                            <p className="text-md text-indigo-900 font-medium italic">"{q.rewrite}"</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Interview Kit Specific Section */}
          {report.categories?.kit_data && (
            <div className="space-y-8 border-t pt-10 mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Generated Kit Details</h3>
                  <p className="text-slate-500 text-sm">Full professional interview kit with evaluation criteria.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                      Recommended Questions
                    </h4>
                    <ul className="space-y-4">
                      {report.categories.kit_data.questions?.map((q: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-700 border-b border-slate-50 pb-3 last:border-0">
                          <span className="font-bold text-indigo-300 mr-2">Q{idx + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

              </div>

              {report.categories.kit_data.role_summary && (
                <Card className="bg-slate-900 text-slate-100 border-none">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-indigo-400 mb-4">AI Role Interpretation Context</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">Domain</span>
                        {report.categories.kit_data.role_summary.domain}
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Role Type</span>
                        {report.categories.kit_data.role_summary.role_type}
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Environment</span>
                        {report.categories.kit_data.role_summary.work_environment}
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Core Tech/Tools</span>
                        {report.categories.kit_data.role_summary.tools_used?.join(", ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
