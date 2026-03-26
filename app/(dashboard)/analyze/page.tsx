"use client";

import { useState } from "react";
import { QuestionInput } from "@/components/QuestionInput";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { HighlightedText } from "@/components/HighlightedText";
import { RewritePanel } from "@/components/RewritePanel";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Info, AlertTriangle } from "lucide-react";

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setReport(data.report);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Start Analysis</h2>
            <p className="text-slate-500">Enter your interview questions below to detect hidden biases and risks.</p>
          </div>
          <QuestionInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Analysis Overview</h3>
          </div>
          {report ? (
            <>
              {report.categories?.is_fallback && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-lg flex items-center gap-2 mb-4 animate-pulse">
                  <Info className="h-4 w-4" />
                  Limited insights due to AI availability.
                </div>
              )}
              <BiasScoreCard score={report.bias_score} />
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Risk Assessment</span>
                  <RiskIndicator level={report.risk_level} />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Category Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(report.categories || {})
                      .filter(([key, value]) => 
                        !['is_fallback', 'explanation', 'detailed_analysis', 'top_risk_insights'].includes(key) && 
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
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500">Submit questions to see your bias score and risk assessment.</p>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="pt-8 mb-12">
          <LoadingState />
        </div>
      ) : report ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Top Risk Insights - PREMIUM FEATURE */}
          {report.categories?.top_risk_insights && report.categories.top_risk_insights.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Top Risk Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.categories.top_risk_insights.map((insight: string, idx: number) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex gap-3">
                    <span className="text-indigo-200 font-bold">0{idx + 1}</span>
                    <p className="text-sm font-medium leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Original with Risk Highlights
                <Info className="h-4 w-4 text-slate-400" />
              </h3>
              <HighlightedText 
                originalText={report.input_text} 
                flaggedPhrases={report.flagged_phrases} 
              />
              
              <Card className="border-none bg-indigo-50 shadow-none mt-6">
                <CardContent className="p-6">
                  <h4 className="text-indigo-900 font-bold mb-2">Diversity Impact</h4>
                  <p className="text-indigo-800 text-sm leading-relaxed">
                    {report.diversity_impact}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Improved Versions</h3>
              <RewritePanel 
                original={report.input_text} 
                rewritten={report.rewritten_output} 
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
