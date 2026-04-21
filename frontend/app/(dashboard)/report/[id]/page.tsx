"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { HighlightedText } from "@/components/HighlightedText";
import { RewritePanel } from "@/components/RewritePanel";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Loader2, Info, ChevronRight, Share2, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function ReportPage({ params }: { params: { id: string } }) {
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
    fetch(`/api/report/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Report not found");
        return res.json();
      })
      .then((data) => {
        setReport(data.report);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.id]);

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
            Analysis Report
            <RiskIndicator level={report.risk} />
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
          <BiasScoreCard score={report.score} />
          
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4 tracking-wider">Executive Summary</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                  {report.categories?.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Original Input & Risk Highlights
            </h3>
            <HighlightedText 
              originalText={report.question} 
              flaggedPhrases={(report.categories?.detailed_analysis || [])
                .filter((q: any) => q.bias_score > 2)
                .map((q: any) => ({
                  text: q.issue,
                  reason: q.explanation,
                  severity: q.bias_score > 7 ? 'high' : 'medium',
                  impact: q.impact,
                  fix: q.rewrite
                }))
              } 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Improved Inclusiveness Alternatives</h3>
            <RewritePanel 
              original={report.question} 
              rewritten={(report.categories?.detailed_analysis || []).map((q: any) => q.rewrite)} 
            />
          </div>

          {report.categories?.top_insights && report.categories.top_insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-8 mt-8">
              {report.categories.top_insights.map((insight: string, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-indigo-600 text-xs font-bold block mb-1 uppercase tracking-tighter">Insight 0{idx + 1}</span>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
