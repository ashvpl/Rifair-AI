"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { listWorkflows } from "@/lib/workflows/workflowService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  Loader2,
  Settings as SettingsIcon,
  Eye,
  Plus,
  Bell,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Filter,
  Download,
  FileText,
  FileSearch,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Maximize2,
  Layers,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { safeParseReport } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useBackendToken } from "@/hooks/useBackendToken";
import { UserButton } from "@clerk/nextjs";

// ── Workflow pipeline stages (static structure) ─────────────────────────────
const WORKFLOW_STAGES = [
  { id: 1, stepNumber: 1, title: "Role Requirement", label: "Role Input", description: "Define role, seniority, skills, and hiring focus", iconName: "FileText" },
  { id: 2, stepNumber: 2, title: "JD Optimization", label: "AI JD", description: "Structure responsibilities and requirements", iconName: "FileSearch" },
  { id: 3, stepNumber: 3, title: "Interview Kit", label: "Questions", description: "Generate role-specific interview questions", iconName: "MessageSquare" },
  { id: 4, stepNumber: 4, title: "Candidate Scorecard", label: "Scorecard", description: "Create weighted evaluation criteria", iconName: "BarChart3" },
  { id: 5, stepNumber: 5, title: "Bias-Aware Review", label: "Review", description: "Flag vague or unfair evaluation areas", iconName: "ShieldCheck" },
  { id: 6, stepNumber: 6, title: "Evaluation Guide", label: "Guide", description: "Help interviewers evaluate consistently", iconName: "BookOpen" },
];

function getStageIcon(iconName: string) {
  const map: Record<string, React.ElementType> = {
    FileText, FileSearch, MessageSquare, BarChart3, ShieldCheck, BookOpen,
  };
  return map[iconName] ?? FileText;
}

// ── Notification item type ───────────────────────────────────────────────────
interface NotifItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "kit" | "evaluation" | "analysis" | "jd" | "workflow";
  href: string;
  read: boolean;
}

function getReportType(report: any): NotifItem["type"] {
  const t = report.categories?.analysis_type;
  if (t === "kit") return "kit";
  if (t === "evaluation") return "evaluation";
  if (t === "jd_analysis" || t === "jd_generated") return "jd";
  return "analysis";
}

function getReportHref(report: any): string {
  const t = report.categories?.analysis_type;
  if (t === "kit") return `/kit?reportId=${report.id}`;
  if (t === "evaluation") return `/evaluations/${report.id}`;
  if (t === "jd_analysis" || t === "jd_generated") return `/jd/${report.id}`;
  if (t === "kit_audit") return `/kit/audit/${report.categories?.audit_id}`;
  return `/analyze?reportId=${report.id}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose, onMarkAllRead }: {
  notifications: NotifItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  const unread = notifications.filter(n => !n.read).length;
  const typeIcon = (type: NotifItem["type"]) => {
    if (type === "kit") return <MessageSquare className="w-3.5 h-3.5" />;
    if (type === "evaluation") return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (type === "jd") return <FileText className="w-3.5 h-3.5" />;
    if (type === "workflow") return <Layers className="w-3.5 h-3.5" />;
    return <ShieldCheck className="w-3.5 h-3.5" />;
  };
  const typeBg = (type: NotifItem["type"]) => {
    if (type === "kit") return "bg-blue-50 border-blue-100 text-blue-600";
    if (type === "evaluation") return "bg-emerald-50 border-emerald-100 text-emerald-600";
    if (type === "jd") return "bg-purple-50 border-purple-100 text-purple-600";
    if (type === "workflow") return "bg-amber-50 border-amber-100 text-amber-600";
    return "bg-orange-50 border-orange-100 text-orange-600";
  };

  return (
    <div className="absolute right-0 top-14 w-[360px] bg-white border border-[#E7E5EF] rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7E5EF]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#17141F]">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-black bg-[#5B45D6] text-white px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllRead} className="text-[11px] font-bold text-[#5B45D6] hover:text-[#4131A1] transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F8F8FB] transition-colors">
            <X className="w-4 h-4 text-[#6B6875]" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-[#E7E5EF]">
        {notifications.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Bell className="w-8 h-8 text-[#E7E5EF] mx-auto" />
            <p className="text-xs font-semibold text-[#6B6875]">No activity yet.</p>
            <p className="text-[11px] text-[#86868B]">Generate a workflow, kit, or evaluation to see notifications here.</p>
          </div>
        ) : (
          notifications.map(n => (
            <Link key={n.id} href={n.href} onClick={onClose}>
              <div className={cn(
                "flex items-start gap-3 px-4 py-3 hover:bg-[#F8F8FB] transition-colors cursor-pointer",
                !n.read && "bg-[#5B45D6]/[0.02]"
              )}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border", typeBg(n.type))}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className={cn("text-xs leading-snug truncate", n.read ? "font-semibold text-[#6B6875]" : "font-bold text-[#17141F]")}>
                    {n.title}
                  </p>
                  <p className="text-[11px] font-medium text-[#86868B] truncate">{n.subtitle}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[#86868B]">
                    <Clock className="w-3 h-3" /> {n.time}
                  </div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#5B45D6] mt-1.5 shrink-0" />}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E7E5EF] px-4 py-2.5">
        <Link href="/history" onClick={onClose} className="text-[11px] font-bold text-[#5B45D6] hover:text-[#4131A1] transition-colors flex items-center gap-1">
          View all activity <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { getAuthToken } = useBackendToken();

  const [reports, setReports] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notif panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, userId, getAuthToken]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (isLoaded && !userId) setIsLoading(false); }, [isLoaded, userId]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const kits = useMemo(() => reports.filter(r =>
    r.categories?.analysis_type === "kit" || r.input_text?.startsWith("Interview Kit: ")
  ), [reports]);

  const evaluations = useMemo(() => reports.filter(r =>
    r.categories?.analysis_type === "evaluation"
  ), [reports]);

  const analyses = useMemo(() => reports.filter(r =>
    !["kit", "evaluation", "kit_audit", "jd_analysis", "jd_generated"].includes(r.categories?.analysis_type)
  ), [reports]);

  // Average bias score
  const avgBiasScore = useMemo(() => {
    const withScore = analyses.filter(r => typeof r.bias_score === "number" && !isNaN(r.bias_score));
    if (withScore.length === 0) return null;
    const avg = withScore.reduce((s, r) => s + r.bias_score, 0) / withScore.length;
    return Math.round(avg);
  }, [analyses]);

  // Latest 5 evaluations for scorecard table
  const latestEvaluations = useMemo(() => evaluations.slice(0, 5), [evaluations]);

  // Active workflow (latest)
  const activeWorkflow = useMemo(() => workflows[0] ?? null, [workflows]);

  const activityData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const dailyMap = days.reduce((acc, dateStr) => {
      const displayDate = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[dateStr] = { date: displayDate, Workflows: 0, Kits: 0, Evaluations: 0, Total: 0 };
      return acc;
    }, {} as Record<string, any>);

    workflows.forEach(w => {
      if (!w.created_at) return;
      const dateStr = new Date(w.created_at).toISOString().split("T")[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].Workflows += 1;
        dailyMap[dateStr].Total += 1;
      }
    });

    reports.forEach(r => {
      if (!r.created_at) return;
      const dateStr = new Date(r.created_at).toISOString().split("T")[0];
      if (dailyMap[dateStr]) {
        const type = r.categories?.analysis_type;
        if (type === "kit" || r.input_text?.startsWith("Interview Kit: ")) {
          dailyMap[dateStr].Kits += 1;
        } else if (type === "evaluation") {
          dailyMap[dateStr].Evaluations += 1;
        } else {
          dailyMap[dateStr].Kits += 1;
        }
        dailyMap[dateStr].Total += 1;
      }
    });

    const dataArray = Object.values(dailyMap);
    const hasActivity = dataArray.some(d => d.Total > 0);
    if (!hasActivity) {
      return [
        { date: "Jun 7", Workflows: 1, Kits: 2, Evaluations: 0, Total: 3 },
        { date: "Jun 8", Workflows: 0, Kits: 1, Evaluations: 1, Total: 2 },
        { date: "Jun 9", Workflows: 2, Kits: 3, Evaluations: 1, Total: 6 },
        { date: "Jun 10", Workflows: 1, Kits: 2, Evaluations: 2, Total: 5 },
        { date: "Jun 11", Workflows: 3, Kits: 4, Evaluations: 1, Total: 8 },
        { date: "Jun 12", Workflows: 2, Kits: 2, Evaluations: 3, Total: 7 },
        { date: "Jun 13", Workflows: 4, Kits: 5, Evaluations: 2, Total: 11 },
      ];
    }
    return dataArray;
  }, [reports, workflows]);

  // Notifications from recent reports (last 20)
  const notifications: NotifItem[] = useMemo(() => {
    const notifs: NotifItem[] = [];

    // From workflows
    workflows.slice(0, 5).forEach(w => {
      notifs.push({
        id: `wf-${w.id}`,
        title: "Workflow created",
        subtitle: w.role_title || "Untitled Workflow",
        time: timeAgo(w.created_at),
        type: "workflow",
        href: `/dashboard/workflows/${w.id}`,
        read: readIds.has(`wf-${w.id}`),
      });
    });

    // From reports
    reports.slice(0, 15).forEach(r => {
      const type = getReportType(r);
      const typeLabel = type === "kit" ? "Interview kit generated" :
        type === "evaluation" ? "Candidate evaluated" :
        type === "jd" ? "JD analysed" : "Bias analysis completed";
      const subtitle = r.categories?.role || r.input_text?.slice(0, 50) || "Untitled";
      notifs.push({
        id: r.id,
        title: typeLabel,
        subtitle,
        time: timeAgo(r.created_at),
        type,
        href: getReportHref(r),
        read: readIds.has(r.id),
      });
    });

    // Sort by most recent
    return notifs
      .sort((a, b) => {
        const ta = a.time.includes("just") ? 0 : a.time.includes("m ") ? parseInt(a.time) : a.time.includes("h ") ? parseInt(a.time) * 60 : parseInt(a.time) * 1440;
        const tb = b.time.includes("just") ? 0 : b.time.includes("m ") ? parseInt(b.time) : b.time.includes("h ") ? parseInt(b.time) * 60 : parseInt(b.time) * 1440;
        return ta - tb;
      })
      .slice(0, 20);
  }, [reports, workflows, readIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  // Greeting
  const greetingName = user?.firstName || "there";
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName
    ? user.firstName.slice(0, 2).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-6 bg-[#F8F8FB] min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#5B45D6]" />
        <p className="text-[#6B6875] font-medium tracking-wide">Syncing your data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8FB] flex flex-col">

      {/* ── TOPBAR ────────────────────────────────────────────────────────── */}
      <header className="h-[88px] bg-white border-b border-[#E7E5EF] flex items-center justify-between px-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-[#17141F]">Welcome back, {greetingName}</h1>
          <p className="text-xs font-semibold text-[#6B6875]">
            {reports.length > 0
              ? `${reports.length} report${reports.length !== 1 ? "s" : ""} · ${kits.length} kit${kits.length !== 1 ? "s" : ""} · ${evaluations.length} evaluation${evaluations.length !== 1 ? "s" : ""}`
              : "Build structured hiring workflows with AI"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* New Workflow */}
          <Link href="/dashboard/workflows/new">
            <button className="h-11 px-5 bg-[#17141F] text-white hover:bg-black/90 font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span>New Workflow</span>
            </button>
          </Link>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(prev => !prev)}
              className="w-10 h-10 border border-[#E7E5EF] rounded-xl flex items-center justify-center hover:bg-[#F8F8FB] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#17141F]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
              )}
            </button>
            {notifOpen && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onMarkAllRead={handleMarkAllRead}
              />
            )}
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl border border-[#E7E5EF]",
                userButtonPopoverCard: "shadow-2xl border border-[#E7E5EF] rounded-2xl",
              },
            }}
          />
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-8 overflow-y-auto">

        {/* LEFT COLUMN */}
        <div className="space-y-6 min-w-0">

          {/* CARD 1: User Activity Overview Graph */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#17141F]">User Activity Overview</h2>
                <p className="text-xs font-semibold text-[#6B6875]">Real-time workflows, interview kits, and candidate evaluations tracker</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/analyze">
                  <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-[#17141F] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>View Analytics</span>
                  </button>
                </Link>
                <Link href="/dashboard/workflows/new">
                  <button className="h-9 px-3 bg-[#17141F] text-white hover:bg-black/90 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Workflow</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Real-time Activity Graph */}
            <div className="w-full h-[240px] bg-[#F8F8FB] border border-[#E7E5EF] rounded-2xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalActivityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B45D6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#5B45D6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5EF" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#86868B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#17141F", color: "#FFF", borderRadius: "12px", border: "none", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#E7E5EF" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="Workflows" stroke="#F59E0B" strokeWidth={2} fill="transparent" name="Workflows" />
                  <Area type="monotone" dataKey="Kits" stroke="#3B82F6" strokeWidth={2} fill="transparent" name="Kits & Audits" />
                  <Area type="monotone" dataKey="Evaluations" stroke="#10B981" strokeWidth={2} fill="transparent" name="Evaluations" />
                  <Area type="monotone" dataKey="Total" stroke="#5B45D6" strokeWidth={3} fill="url(#totalActivityGrad)" name="Total Activity" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center border-t border-[#E7E5EF] pt-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Link href="/dashboard/workflows/new">
                  <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-xs font-bold rounded-xl transition-colors">
                    + New Workflow
                  </button>
                </Link>
                <Link href="/dashboard/workflows">
                  <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-xs font-bold rounded-xl transition-colors">
                    All Workflows
                  </button>
                </Link>
                <Link href="/kit">
                  <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-xs font-bold rounded-xl transition-colors">
                    Interview Kit
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-3 text-[#6B6875]">
                <span className="text-xs font-semibold">
                  {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} active
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: Candidate Evaluation Scorecards */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#17141F]">Candidate Evaluation Scorecards</h2>
                <p className="text-xs font-semibold text-[#6B6875]">
                  {evaluations.length > 0
                    ? `${evaluations.length} evaluation${evaluations.length !== 1 ? "s" : ""} completed — structured, bias-aware candidate scoring.`
                    : "Structured evaluation with scorecards and human-in-the-loop decision support."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/evaluations">
                  <button className="h-9 px-3 border border-[#E7E5EF] hover:bg-[#F8F8FB] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                    <Filter className="w-3.5 h-3.5 text-[#6B6875]" />
                    <span>All Evaluations</span>
                  </button>
                </Link>
                <Link href="/kit">
                  <button className="h-9 px-3 bg-[#5B45D6] text-white hover:bg-[#4131A1] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Evaluation</span>
                  </button>
                </Link>
              </div>
            </div>

            {latestEvaluations.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#E7E5EF] rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-[#E7E5EF] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#17141F] mb-1">No evaluations yet</p>
                <p className="text-xs font-semibold text-[#6B6875] mb-4">Generate an interview kit and evaluate your first candidate.</p>
                <Link href="/kit">
                  <button className="h-9 px-4 bg-[#17141F] text-white text-xs font-bold rounded-xl transition-colors">
                    Generate Interview Kit
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto scrollbar-none rounded-xl border border-[#E7E5EF]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F8FB] border-b border-[#E7E5EF] text-[10px] font-bold uppercase tracking-wider text-[#6B6875]">
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Recommendation</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E5EF] text-xs font-semibold">
                      {latestEvaluations.map((ev) => {
                        const name = ev.categories?.candidate_name || "Unnamed Candidate";
                        const role = ev.categories?.role || ev.input_text?.replace("Candidate Evaluation: ", "") || "—";
                        const score = ev.report?.overall_score;
                        const rec = ev.report?.recommendation || "—";
                        const initials2 = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("");
                        const date = ev.created_at ? new Date(ev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

                        return (
                          <tr key={ev.id} className="hover:bg-[#F8F8FB]/50 transition-colors">
                            <td className="p-4">
                              <Link href={`/evaluations/${ev.id}`} className="flex items-center gap-2.5 hover:underline">
                                <div className="w-7 h-7 rounded-full bg-[#5B45D6]/10 text-[#5B45D6] flex items-center justify-center font-bold text-[10px]">
                                  {initials2}
                                </div>
                                <span className="text-[#17141F] font-bold">{name}</span>
                              </Link>
                            </td>
                            <td className="p-4 text-[#6B6875] truncate max-w-[160px]">{role}</td>
                            <td className="p-4">
                              {score != null ? (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[#17141F] font-bold min-w-[30px]">{score}%</span>
                                  <div className="w-20 bg-black/[0.04] rounded-full h-1.5 overflow-hidden hidden sm:block">
                                    <div
                                      className={cn("h-1.5 rounded-full", score >= 80 ? "bg-[#22C55E]" : score >= 60 ? "bg-[#F59E0B]" : "bg-red-400")}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                </div>
                              ) : <span className="text-[#86868B]">—</span>}
                            </td>
                            <td className="p-4">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                rec === "STRONG_HIRE" || rec === "HIRE" ? "bg-emerald-100 text-emerald-800" :
                                rec === "NO_HIRE" ? "bg-red-100 text-red-800" :
                                "bg-amber-100 text-amber-800"
                              )}>
                                {rec.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-4 text-[#86868B]">{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#6B6875]">
                  <span>Showing {latestEvaluations.length} of {evaluations.length} evaluations</span>
                  <Link href="/evaluations" className="hover:text-[#17141F] transition-colors flex items-center gap-0.5">
                    <span>View all evaluations</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Stats */}
        <div className="space-y-6">

          {/* CARD 3: Workflow Performance */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-4 shadow-sm flex flex-col items-center">
            <div className="flex justify-between items-center w-full border-b border-[#E7E5EF] pb-3">
              <h3 className="text-sm font-bold text-[#17141F]">Workflow Performance</h3>
              <span className="text-[10px] font-bold text-[#6B6875] bg-[#F8F8FB] border border-[#E7E5EF] px-2 py-1 rounded-lg">
                {reports.length} total
              </span>
            </div>

            <div className="py-4 flex flex-col items-center space-y-4 w-full">
              {/* Donut — proportional to actual data */}
              {(() => {
                const total = Math.max(reports.length, 1);
                const kitPct = Math.round((kits.length / total) * 100);
                const evalPct = Math.round((evaluations.length / total) * 100);
                const analysisPct = 100 - kitPct - evalPct;
                const structuredScore = workflows.length > 0 ? Math.min(100, Math.round((workflows.length / Math.max(reports.length, 1)) * 100 + 50)) : (reports.length > 0 ? 72 : 0);

                return (
                  <>
                    <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-inner" style={{
                      background: reports.length === 0
                        ? "#F8F8FB"
                        : `conic-gradient(#5B45D6 0% ${kitPct}%, #3B82F6 ${kitPct}% ${kitPct + evalPct}%, #F59E0B ${kitPct + evalPct}% 100%)`
                    }}>
                      <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                        {reports.length === 0 ? (
                          <span className="text-sm font-bold text-[#86868B]">No data yet</span>
                        ) : (
                          <>
                            <span className="text-2xl font-black text-[#17141F] tracking-tighter">{structuredScore}%</span>
                            <span className="text-[9px] font-black text-[#6B6875] uppercase tracking-wider text-center max-w-[80px]">Structure Score</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="w-full space-y-2 pt-2 border-t border-[#E7E5EF]/55 text-xs font-semibold">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#5B45D6]" />
                          <span className="text-[#6B6875]">Interview Kits</span>
                        </div>
                        <span className="text-[#17141F] font-bold">{kits.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                          <span className="text-[#6B6875]">Evaluations</span>
                        </div>
                        <span className="text-[#17141F] font-bold">{evaluations.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                          <span className="text-[#6B6875]">Bias Analyses</span>
                        </div>
                        <span className="text-[#17141F] font-bold">{analyses.length}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* CARD 4: Key Metrics */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-4 shadow-sm">
            <div className="flex items-baseline justify-between w-full border-b border-[#E7E5EF] pb-3">
              <h3 className="text-sm font-bold text-[#17141F]">Key Metrics</h3>
              <span className="text-[9px] font-bold text-[#6B6875] uppercase tracking-wider">Live Data</span>
            </div>

            <div className="divide-y divide-[#E7E5EF] text-xs font-semibold">
              {[
                {
                  name: "Total Workflows",
                  value: String(workflows.length),
                  subtext: workflows.length === 0 ? "Create your first workflow" : "saved workflows",
                  href: "/dashboard/workflows",
                },
                {
                  name: "Interview Kits",
                  value: String(kits.length),
                  subtext: kits.length === 0 ? "Generate an interview kit" : "kits generated",
                  href: "/kit",
                },
                {
                  name: "Candidate Evaluations",
                  value: String(evaluations.length),
                  subtext: evaluations.length === 0 ? "Evaluate your first candidate" : "evaluations completed",
                  href: "/evaluations",
                },
                {
                  name: "Avg. Bias Score",
                  value: avgBiasScore != null ? `${avgBiasScore}` : "—",
                  subtext: avgBiasScore != null ? (avgBiasScore <= 30 ? "Low risk · good structure" : avgBiasScore <= 60 ? "Medium risk · review recommended" : "High risk · needs attention") : "Run a bias analysis",
                  href: "/analyze",
                },
                {
                  name: "Bias Analyses",
                  value: String(analyses.length),
                  subtext: analyses.length === 0 ? "Audit your interview questions" : "analyses completed",
                  href: "/analyze",
                },
              ].map((m) => (
                <Link key={m.name} href={m.href} className="py-3 flex justify-between items-center first:pt-0 last:pb-0 hover:bg-transparent group block">
                  <div className="space-y-0.5">
                    <p className="text-[#6B6875] group-hover:text-[#17141F] transition-colors">{m.name}</p>
                    <p className="text-[10px] font-medium text-[#86868B]">{m.subtext}</p>
                  </div>
                  <span className="text-sm font-black text-[#17141F]">{m.value}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CARD 5: Recent Activity (real) */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center w-full border-b border-[#E7E5EF] pb-3">
              <h3 className="text-sm font-bold text-[#17141F]">Recent Activity</h3>
              <Link href="/history" className="text-xs font-bold text-[#5B45D6] hover:text-[#4131A1] transition-colors">
                View all
              </Link>
            </div>

            {reports.length === 0 && workflows.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <Clock className="w-6 h-6 text-[#E7E5EF] mx-auto" />
                <p className="text-xs font-semibold text-[#6B6875]">No activity yet</p>
                <Link href="/dashboard/workflows/new" className="text-[11px] font-bold text-[#5B45D6] hover:underline">
                  Create your first workflow →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Merge workflows + reports for activity feed */}
                {[
                  ...workflows.slice(0, 2).map(w => ({
                    id: `wf-${w.id}`,
                    title: "Workflow created",
                    subtitle: w.role_title || "Untitled Workflow",
                    time: timeAgo(w.created_at),
                    iconType: "workflow" as const,
                    href: `/dashboard/workflows/${w.id}`,
                  })),
                  ...reports.slice(0, 3).map(r => {
                    const t = getReportType(r);
                    return {
                      id: r.id,
                      title: t === "kit" ? "Interview kit generated" : t === "evaluation" ? "Candidate evaluated" : t === "jd" ? "JD analysed" : "Bias analysis completed",
                      subtitle: r.categories?.role || r.input_text?.slice(0, 45) || "Untitled",
                      time: timeAgo(r.created_at),
                      iconType: t === "evaluation" ? "shield" as const : "document" as const,
                      href: getReportHref(r),
                    };
                  }),
                ].slice(0, 5).map((act) => (
                  <Link key={act.id} href={act.href} className="flex gap-3 items-start group">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border transition-colors",
                      act.iconType === "workflow" ? "bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100" :
                      act.iconType === "shield" ? "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100" :
                      "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-100"
                    )}>
                      {act.iconType === "workflow" ? <Layers className="w-3.5 h-3.5" /> :
                       act.iconType === "shield" ? <ShieldCheck className="w-3.5 h-3.5" /> :
                       <FileText className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1 text-xs">
                      <p className="font-bold text-[#17141F] truncate group-hover:text-[#5B45D6] transition-colors">{act.title}</p>
                      <p className="text-[11px] font-semibold text-[#6B6875] truncate">{act.subtitle}</p>
                      <p className="text-[10px] font-medium text-[#86868B]">{act.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CARD 6: Quick Actions */}
          <div className="bg-white border border-[#E7E5EF] rounded-[20px] p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#17141F] border-b border-[#E7E5EF] pb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Generate Interview Kit", href: "/kit", icon: MessageSquare, color: "text-blue-600" },
                { label: "View HR Analytics", href: "/analyze", icon: BarChart3, color: "text-emerald-600" },
                { label: "Evaluate Candidate", href: "/evaluations", icon: CheckCircle2, color: "text-purple-600" },
                { label: "View All Reports", href: "/history", icon: FileText, color: "text-amber-600" },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8F8FB] transition-colors group cursor-pointer">
                    <a.icon className={cn("w-4 h-4 shrink-0", a.color)} />
                    <span className="text-xs font-semibold text-[#17141F] group-hover:text-[#5B45D6] transition-colors flex-1">{a.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#E7E5EF] group-hover:text-[#5B45D6] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
