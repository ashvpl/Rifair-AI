"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { analyzeQuestions } from "@/lib/api";
import { QuestionInput } from "@/components/QuestionInput";
import { BiasScoreCard } from "@/components/BiasScoreCard";
import { RiskIndicator } from "@/components/RiskIndicator";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Info, AlertTriangle } from "lucide-react";

export default function AnalyzePage() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Hybrid Bias Detection</h2>
            <p className="text-slate-500">Analyze interview questions using our 3-layer engine (Lexicon, Patterns, Semantic AI).</p>
          </div>
          <QuestionInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="pt-8">
              <LoadingState />
            </div>
          ) : report ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Bias Analysis Results
                  <ShieldCheck className="h-5 w-5 text-indigo-500" />
                </h3>
                
                {report.categories?.questions?.map((q: any, idx: number) => {
                  const isNeutral = (q.biasScore || 0) <= 20 && (q.flags?.length || 0) === 0;
                  
                  return (
                    <Card key={idx} className="overflow-hidden border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
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
                          <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Original & Flags</h4>
                              <div 
                                className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap highlight-container"
                                dangerouslySetInnerHTML={{ __html: q.highlighted }}
                              />
                              {q.flags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
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
                            <div className="p-6 bg-slate-50/50">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested Rewrite</h4>
                              <p className="text-lg text-indigo-900 font-medium italic">
                                "{q.rewrite}"
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {report ? (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Analysis Result</h3>
              {!report.categories?.aiUsed && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-lg flex items-center gap-2 mb-4 animate-pulse">
                  <Info className="h-4 w-4" />
                  Deterministic Engine Active (AI Fallback)
                </div>
              )}
              <BiasScoreCard score={report.categories?.overallScore || report.bias_score} />
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Risk Assessment</span>
                  <RiskIndicator level={report.categories?.riskLevel || report.risk_level} />
                </div>
                {report.categories?.categoryBreakdown && Object.keys(report.categories.categoryBreakdown).length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Detection Insights</span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(report.categories.categoryBreakdown).map(([cat, count]: [any, any]) => (
                        <div key={cat} className="text-xs text-slate-600 flex justify-between bg-slate-50 p-1.5 rounded">
                          <span className="capitalize">{cat}</span>
                          <span className="font-bold text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <p className="text-sm text-slate-500">Submit questions to see your 3-layer bias score.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

