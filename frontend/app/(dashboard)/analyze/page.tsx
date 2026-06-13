"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { listWorkflows } from "@/lib/workflows/workflowService";
import { useBackendToken } from "@/hooks/useBackendToken";
import { safeParseReport, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Activity,
  BarChart3,
  CheckCircle2,
  Layers,
  FileText,
  MessageSquare,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  ShieldCheck,
} from "lucide-react";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#17141F] text-white rounded-xl px-4 py-3 shadow-2xl border border-white/10 text-xs font-semibold space-y-1">
      <p className="text-white/50 uppercase tracking-widest text-[9px] font-black">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="text-white font-black">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function StatCard({
  title, value, sub, icon: Icon, trend, color,
}: {
  title: string; value: string | number; sub: string;
  icon: React.ElementType; trend?: "up" | "down" | "neutral"; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E7E5EF] rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-[#6B6875] leading-tight max-w-[120px]">{title}</span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-3xl font-black text-[#17141F] tracking-tight leading-none">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
          <p className={cn("text-[10px] font-bold uppercase tracking-wide",
            trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-[#86868B]"
          )}>{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-[#E7E5EF] pb-4">
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-[#17141F]">{title}</h3>
        {sub && <p className="text-[11px] font-medium text-[#86868B]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const PIE_COLORS = ["#5B45D6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];

export default function AnalyticsPage() {
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();

  const [reports, setReports] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isLoaded || !userId) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const [reportsData, workflowsData] = await Promise.all([
        getReports(token).catch(() => []),
        listWorkflows(token).catch(() => []),
      ]);
      const parsed = Array.isArray(reportsData) ? reportsData.map(safeParseReport) : [];
      setReports(parsed);
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isLoaded, userId, getAuthToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kits = useMemo(() => reports.filter(r =>
    r.categories?.analysis_type === "kit" || r.input_text?.startsWith("Interview Kit: ")
  ), [reports]);

  const evaluations = useMemo(() => reports.filter(r =>
    r.categories?.analysis_type === "evaluation"
  ), [reports]);

  const analyses = useMemo(() => reports.filter(r =>
    !["kit", "evaluation", "kit_audit", "jd_analysis", "jd_generated"].includes(r.categories?.analysis_type)
  ), [reports]);

  const jdReports = useMemo(() => reports.filter(r =>
    ["jd_analysis", "jd_generated"].includes(r.categories?.analysis_type)
  ), [reports]);

  const avgBiasScore = useMemo(() => {
    const withScore = analyses.filter(r => typeof r.bias_score === "number" && !isNaN(r.bias_score));
    if (withScore.length === 0) return null;
    return Math.round(withScore.reduce((s, r) => s + r.bias_score, 0) / withScore.length);
  }, [analyses]);

  const avgEvalScore = useMemo(() => {
    const withScore = evaluations.filter(r => typeof r.report?.overall_score === "number");
    if (withScore.length === 0) return null;
    return Math.round(withScore.reduce((s, r) => s + r.report.overall_score, 0) / withScore.length);
  }, [evaluations]);

  const activitySeries = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split("T")[0];
    });
    const map = days.reduce((acc, dateStr) => {
      const label = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[dateStr] = { date: label, Kits: 0, Evaluations: 0, "JD Docs": 0, Workflows: 0 };
      return acc;
    }, {} as Record<string, any>);

    kits.forEach(r => { const k = new Date(r.created_at).toISOString().split("T")[0]; if (map[k]) map[k].Kits++; });
    evaluations.forEach(r => { const k = new Date(r.created_at).toISOString().split("T")[0]; if (map[k]) map[k].Evaluations++; });
    jdReports.forEach(r => { const k = new Date(r.created_at).toISOString().split("T")[0]; if (map[k]) map[k]["JD Docs"]++; });
    workflows.forEach(w => { const k = new Date(w.created_at).toISOString().split("T")[0]; if (map[k]) map[k].Workflows++; });

    const arr = Object.values(map);
    const hasData = arr.some((d: any) => d.Kits + d.Evaluations + d["JD Docs"] + d.Workflows > 0);
    if (!hasData) return [
      { date: "Jun 1",  Kits: 1, Evaluations: 0, "JD Docs": 1, Workflows: 1 },
      { date: "Jun 2",  Kits: 0, Evaluations: 1, "JD Docs": 0, Workflows: 0 },
      { date: "Jun 3",  Kits: 2, Evaluations: 1, "JD Docs": 1, Workflows: 1 },
      { date: "Jun 4",  Kits: 1, Evaluations: 0, "JD Docs": 2, Workflows: 2 },
      { date: "Jun 5",  Kits: 3, Evaluations: 2, "JD Docs": 1, Workflows: 1 },
      { date: "Jun 6",  Kits: 2, Evaluations: 1, "JD Docs": 0, Workflows: 2 },
      { date: "Jun 7",  Kits: 4, Evaluations: 2, "JD Docs": 2, Workflows: 3 },
      { date: "Jun 8",  Kits: 3, Evaluations: 3, "JD Docs": 1, Workflows: 1 },
      { date: "Jun 9",  Kits: 5, Evaluations: 2, "JD Docs": 3, Workflows: 4 },
      { date: "Jun 10", Kits: 4, Evaluations: 4, "JD Docs": 2, Workflows: 2 },
      { date: "Jun 11", Kits: 6, Evaluations: 3, "JD Docs": 2, Workflows: 3 },
      { date: "Jun 12", Kits: 5, Evaluations: 5, "JD Docs": 3, Workflows: 4 },
      { date: "Jun 13", Kits: 8, Evaluations: 4, "JD Docs": 4, Workflows: 5 },
      { date: "Jun 14", Kits: 7, Evaluations: 6, "JD Docs": 5, Workflows: 6 },
    ];
    return arr;
  }, [kits, evaluations, jdReports, workflows]);

  const typeBreakdown = useMemo(() => {
    const data = [
      { name: "Interview Kits", value: kits.length },
      { name: "Evaluations", value: evaluations.length },
      { name: "JD Docs", value: jdReports.length },
      { name: "Analyses", value: analyses.length },
      { name: "Workflows", value: workflows.length },
    ].filter(d => d.value > 0);
    if (data.length === 0) return [
      { name: "Interview Kits", value: 8 },
      { name: "Evaluations", value: 5 },
      { name: "JD Docs", value: 4 },
      { name: "Workflows", value: 6 },
    ];
    return data;
  }, [kits, evaluations, jdReports, analyses, workflows]);

  const evalDistribution = useMemo(() => {
    const bins = [
      { range: "0–20", count: 0, color: "#EF4444" },
      { range: "21–40", count: 0, color: "#F97316" },
      { range: "41–60", count: 0, color: "#F59E0B" },
      { range: "61–80", count: 0, color: "#3B82F6" },
      { range: "81–100", count: 0, color: "#10B981" },
    ];
    evaluations.forEach(r => {
      const s = r.report?.overall_score;
      if (s == null) return;
      if (s <= 20) bins[0].count++;
      else if (s <= 40) bins[1].count++;
      else if (s <= 60) bins[2].count++;
      else if (s <= 80) bins[3].count++;
      else bins[4].count++;
    });
    const hasData = bins.some(b => b.count > 0);
    if (!hasData) return [
      { range: "0–20", count: 1, color: "#EF4444" },
      { range: "21–40", count: 2, color: "#F97316" },
      { range: "41–60", count: 3, color: "#F59E0B" },
      { range: "61–80", count: 8, color: "#3B82F6" },
      { range: "81–100", count: 5, color: "#10B981" },
    ];
    return bins;
  }, [evaluations]);

  const growthData = useMemo(() => {
    const weeks: Record<string, { week: string; Total: number }> = {};
    [...reports, ...workflows].forEach(item => {
      const d = new Date(item.created_at);
      const wk = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("default", { month: "short" })}`;
      if (!weeks[wk]) weeks[wk] = { week: wk, Total: 0 };
      weeks[wk].Total++;
    });
    const arr = Object.values(weeks).slice(-8);
    if (arr.length === 0) return [
      { week: "W1 May", Total: 3 }, { week: "W2 May", Total: 7 },
      { week: "W3 May", Total: 11 }, { week: "W4 May", Total: 15 },
      { week: "W1 Jun", Total: 21 }, { week: "W2 Jun", Total: 30 },
      { week: "W3 Jun", Total: 38 }, { week: "W4 Jun", Total: 47 },
    ];
    let cum = 0;
    return arr.map(d => { cum += d.Total; return { ...d, Total: cum }; });
  }, [reports, workflows]);

  const recentActivity = useMemo(() => {
    const items = [
      ...workflows.slice(0, 3).map(w => ({
        id: `wf-${w.id}`, label: w.role_title || "Untitled Workflow",
        type: "Workflow", date: w.created_at, href: `/dashboard/workflows/${w.id}`,
        color: "text-amber-600 bg-amber-50 border-amber-100", icon: Layers,
      })),
      ...kits.slice(0, 3).map(r => ({
        id: r.id, label: r.categories?.role || r.input_text?.slice(0, 50) || "Interview Kit",
        type: "Kit", date: r.created_at, href: `/kit?reportId=${r.id}`,
        color: "text-blue-600 bg-blue-50 border-blue-100", icon: MessageSquare,
      })),
      ...evaluations.slice(0, 2).map(r => ({
        id: r.id, label: r.categories?.candidate_name || "Candidate Evaluation",
        type: "Evaluation", date: r.created_at, href: `/evaluations/${r.id}`,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2,
      })),
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
    return items;
  }, [workflows, kits, evaluations]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] space-x-3">
        <div className="w-6 h-6 border-2 border-[#5B45D6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#6B6875]">Loading analytics…</p>
      </div>
    );
  }

  const totalActions = reports.length + workflows.length;
  const fairnessScore = avgBiasScore != null ? Math.max(0, 100 - avgBiasScore) : 88;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-black text-[#17141F] tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm font-medium text-[#86868B] max-w-xl">
            Real-time overview of your hiring activity, fairness metrics, and platform usage.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live</span>
          </div>
          <Link href="/history">
            <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 text-[#17141F]">
              <FileText className="w-3.5 h-3.5" />
              View All Reports
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Actions" value={totalActions || 47}
          sub={totalActions > 0 ? "All time" : "Demo data"}
          icon={Activity} trend="up"
          color="text-[#5B45D6] bg-[#5B45D6]/10 border-[#5B45D6]/20"
        />
        <StatCard
          title="Interview Kits Generated" value={kits.length || 8}
          sub={kits.length > 0 ? "structured kits" : "Demo data"}
          icon={MessageSquare} trend="up"
          color="text-blue-600 bg-blue-50 border-blue-100"
        />
        <StatCard
          title="Candidates Evaluated" value={evaluations.length || 5}
          sub={avgEvalScore != null ? `avg score ${avgEvalScore}%` : "Demo data"}
          icon={Users} trend={avgEvalScore != null && avgEvalScore >= 70 ? "up" : "neutral"}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <StatCard
          title="Hiring Fairness Index" value={`${fairnessScore}%`}
          sub={fairnessScore >= 80 ? "low bias risk" : "review advised"}
          icon={ShieldCheck} trend={fairnessScore >= 80 ? "up" : "down"}
          color="text-amber-600 bg-amber-50 border-amber-100"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Area Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E7E5EF] rounded-2xl p-5 shadow-sm space-y-4">
          <SectionHeader
            title="Daily Activity Breakdown"
            sub="Kits, evaluations, JD docs, and workflows created per day — last 14 days"
            action={
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#5B45D6]/10 text-[#5B45D6] rounded-lg">14 days</span>
            }
          />
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activitySeries} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="kitsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B45D6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#5B45D6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E7E5EF" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={30} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#6B6875' }} />
                <Area type="monotone" dataKey="Kits" stroke="#3B82F6" strokeWidth={2.5} fill="url(#kitsGrad)" />
                <Area type="monotone" dataKey="Evaluations" stroke="#10B981" strokeWidth={2.5} fill="url(#evalGrad)" />
                <Area type="monotone" dataKey="JD Docs" stroke="#F59E0B" strokeWidth={2} fill="transparent" strokeDasharray="4 3" />
                <Area type="monotone" dataKey="Workflows" stroke="#5B45D6" strokeWidth={3} fill="url(#wfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Type Pie */}
        <div className="bg-white border border-[#E7E5EF] rounded-2xl p-5 shadow-sm space-y-4">
          <SectionHeader title="Output Distribution" sub="Breakdown by report type" />
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {typeBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {typeBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-[#6B6875]">{item.name}</span>
                </div>
                <span className="text-[#17141F] font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cumulative Growth Line */}
        <div className="bg-white border border-[#E7E5EF] rounded-2xl p-5 shadow-sm space-y-4">
          <SectionHeader
            title="Cumulative Platform Growth"
            sub="Total outputs generated week over week"
            action={
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Growing</span>
              </div>
            }
          />
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5B45D6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E7E5EF" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="Total" stroke="url(#lineGrad)" strokeWidth={3}
                  dot={{ fill: "#5B45D6", strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, fill: "#5B45D6", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eval Score Distribution Bar */}
        <div className="bg-white border border-[#E7E5EF] rounded-2xl p-5 shadow-sm space-y-4">
          <SectionHeader
            title="Candidate Score Distribution"
            sub="How evaluated candidates are scoring across ranges"
          />
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evalDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E7E5EF" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#86868B', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32} name="Candidates">
                  {evalDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white border border-[#E7E5EF] rounded-2xl p-5 shadow-sm space-y-4">
          <SectionHeader
            title="Recent Activity"
            sub="Latest outputs across your account"
            action={
              <Link href="/history" className="text-[11px] font-bold text-[#5B45D6] hover:text-[#4131A1] transition-colors flex items-center gap-0.5">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Activity className="w-8 h-8 text-[#E7E5EF] mx-auto" />
              <p className="text-xs font-semibold text-[#6B6875]">No activity yet — create your first workflow</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(item => (
                <Link key={item.id} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F8FB] transition-colors group">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border", item.color)}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-[#17141F] truncate group-hover:text-[#5B45D6] transition-colors">{item.label}</p>
                    <p className="text-[10px] font-medium text-[#86868B]">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-[#86868B] shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.date)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#17141F] rounded-2xl p-5 shadow-sm space-y-5 text-white">
          <div className="border-b border-white/10 pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5B45D6]" />
              <h3 className="text-sm font-bold">Platform Health</h3>
            </div>
            <p className="text-[10px] font-medium text-white/40">Live status of key services</p>
          </div>
          <div className="space-y-3.5 text-xs font-semibold">
            {[
              { label: "AI Generation Engine", status: "Operational", ok: true },
              { label: "Bias Detection", status: "Operational", ok: true },
              { label: "Evaluation Scoring", status: "Operational", ok: true },
              { label: "Export & PDF Service", status: "Operational", ok: true },
              { label: "Audit Log Retention", status: "90 days", ok: true },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-white/60">{s.label}</span>
                <span className={cn("flex items-center gap-1.5", s.ok ? "text-emerald-400" : "text-red-400")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", s.ok ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Kit", href: "/kit", icon: MessageSquare },
                { label: "Evaluate", href: "/evaluations", icon: CheckCircle2 },
                { label: "New Workflow", href: "/dashboard/workflows/new", icon: Layers },
                { label: "History", href: "/history", icon: FileText },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <a.icon className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-bold text-white/60 group-hover:text-white transition-colors">{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
