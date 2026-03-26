"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
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
            <RiskIndicator level={report.risk_level} />
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
          <BiasScoreCard score={report.bias_score} />
          
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-4 tracking-wider">Bias Distribution</h4>
                <div className="space-y-4">
                  {Object.entries(report.categories || {})
                    .filter(([key, value]) => 
                      !['is_fallback', 'explanation', 'detailed_analysis'].includes(key) && 
                      typeof value === 'number'
                    )
                    .map(([key, value]) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-slate-600">{key.replace("_", " ")}</span>
                        <span className="font-semibold text-slate-900">{(value as number)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
              originalText={report.input_text} 
              flaggedPhrases={report.flagged_phrases} 
            />
            
            {report.diversity_impact && (
              <Card className="border-none bg-indigo-50/50 shadow-none border-l-4 border-indigo-400">
                <CardContent className="p-6">
                  <h4 className="text-indigo-900 font-bold mb-2 text-sm uppercase tracking-wide">Diversity Impact Assessment</h4>
                  <p className="text-indigo-800 leading-relaxed italic">
                    &quot;{report.diversity_impact}&quot;
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Improved Inclusiveness Alternatives</h3>
            <RewritePanel 
              original={report.input_text} 
              rewritten={report.rewritten_output} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
