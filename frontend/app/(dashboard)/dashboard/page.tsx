"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardHistory = async () => {
      try {
        const token = await getToken();
        const data = await getReports(token);
        setHistory(data || []);
      } catch (err) {
        console.error("Dashboard history error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardHistory();
  }, [getToken]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-400 font-medium animate-pulse">Loading dashboard insights...</p>
      </div>
    );
  }

  // Deduplicate history by input_text to ensure unique counts and results
  const uniqueHistory = Array.from(new Map(history.map(item => [item.input_text, item])).values());

  // Calculate Metrics safely using uniqueHistory
  const totalScans = uniqueHistory.length;
  const avgScore = totalScans ? Math.round(uniqueHistory.reduce((sum, r) => sum + (r.bias_score || 0), 0) / totalScans) : 0;
  const highRiskScans = uniqueHistory.filter(r => r.risk_level?.toLowerCase() === "high").length;
  const cleanScans = uniqueHistory.filter(r => r.risk_level?.toLowerCase() === "low").length;

  // Aggregate Category Bias is no longer needed since Heatmap is removed


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

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity List */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uniqueHistory.slice(0, 10).map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => window.location.href = `/report/${report.id}`}>
                  <div className="truncate max-w-[500px] font-medium text-slate-700">
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
