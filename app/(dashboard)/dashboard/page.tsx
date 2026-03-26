"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Calculate Metrics
  const totalScans = history.length;
  const avgScore = totalScans ? Math.round(history.reduce((sum, r) => sum + r.bias_score, 0) / totalScans) : 0;
  const highRiskScans = history.filter(r => r.risk_level.toLowerCase() === "high").length;
  const cleanScans = history.filter(r => r.risk_level.toLowerCase() === "low").length;

  // Aggregate Category Bias
  const categoryCounts: Record<string, number> = {
    Gender: 0, Age: 0, Cultural: 0, "Work Life": 0, Tone: 0
  };

  history.forEach(r => {
    const cats = r.categories || {};
    if (cats.gender_bias > 0) categoryCounts.Gender++;
    if (cats.age_bias > 0) categoryCounts.Age++;
    if (cats.cultural_bias > 0) categoryCounts.Cultural++;
    if (cats.work_life_bias > 0) categoryCounts["Work Life"]++;
    if (cats.tone_bias > 0) categoryCounts.Tone++;
  });

  const maxCatCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">High-level metrics and bias heatmaps across your hiring pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm shadow-indigo-100 bg-white">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Scans</p>
            <p className="text-4xl font-extrabold text-slate-900">{totalScans}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-indigo-100 bg-white">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg Bias Score</p>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-extrabold text-indigo-600">{avgScore}</p>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-red-100 bg-red-50">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> High Risk
            </p>
            <p className="text-4xl font-extrabold text-red-600">{highRiskScans}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-emerald-100 bg-emerald-50">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Clean
            </p>
            <p className="text-4xl font-extrabold text-emerald-600">{cleanScans}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Heatmap */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Bias Category Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-4">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const perc = Math.round((count / maxCatCount) * 100);
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700">{cat} Bias</span>
                      <span className="text-slate-500">{count} occurrences</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000 rounded-full" 
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => window.location.href = `/report/${report.id}`}>
                  <div className="truncate max-w-[250px] font-medium text-slate-700">
                    {report.input_text}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${report.risk_level.toLowerCase() === 'high' ? 'bg-red-100 text-red-600' : report.risk_level.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {report.risk_level}
                    </span>
                    <span className="font-bold text-slate-900">{report.bias_score}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center text-slate-500 py-8">No recent activity.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
