"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { 
  Loader2, 
  Activity, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BiasTrendChart } from "@/components/ui/bias-trend-chart";
import { format } from "date-fns";
import { cn, safeParseReport } from "@/lib/utils";

export default function DashboardPage() {
  const { getToken, isLoaded, userId } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardHistory = async () => {
      if (!isLoaded || !userId) return;
      try {
        const token = await getToken();
        const data = await getReports(token);
        const parsedData = Array.isArray(data) ? data.map(safeParseReport) : [];
        setHistory(parsedData);
      } catch (err) {
        console.error("Dashboard history error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardHistory();
  }, [isLoaded, userId, getToken]);

  // Stop showing the spinner if Clerk is loaded but there's no session
  useEffect(() => {
    if (isLoaded && !userId) {
      setIsLoading(false);
    }
  }, [isLoaded, userId]);

  const stats = useMemo(() => {
    if (!history.length) return {
      analysisCount: 0,
      avgBiasScore: 0,
      highBiasFlags: 0,
      fairnessScore: 100,
      trendData: [],
      categoryBreakdown: {},
      flaggedQuestions: []
    };

    const uniqueHistory = Array.from(new Map(history.map(item => [item.id, item])).values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const analyses = uniqueHistory.filter(item => {
      const isKit = item.categories?.analysis_type === 'kit' || item.input_text?.startsWith("Interview Kit: ");
      return !isKit;
    });

    const analysisCount = analyses.length;
    
    // Avg Bias Score
    const avgBiasScore = analysisCount ? Math.round(analyses.reduce((sum, r) => sum + (r.bias_score || 0), 0) / analysisCount) : 0;
    
    // High Bias Flags
    let highBiasFlags = 0;
    const categoryBreakdown: Record<string, number> = {};
    const flaggedQuestions: any[] = [];

    uniqueHistory.forEach(item => {
      const questions = item.categories?.questions || [];
      if (questions.length > 0) {
        questions.forEach((q: any) => {
          if (q.bias_score >= 40) {
            highBiasFlags++;
            flaggedQuestions.push({
              text: q.original,
              score: q.bias_score,
              type: q.bias_types?.[0] || 'Uncategorized',
              date: item.created_at
            });
          }
          (q.bias_types || []).forEach((t: string) => {
            categoryBreakdown[t] = (categoryBreakdown[t] || 0) + 1;
          });
        });
      } else if (item.bias_score >= 55) {
        highBiasFlags++;
        flaggedQuestions.push({
          text: item.input_text,
          score: item.bias_score,
          type: item.categories?.bias_types?.[0] || 'General',
          date: item.created_at
        });
      }
    });

    const lowBiasScans = analyses.filter(r => (r.bias_score || 0) < 40).length;
    const fairnessScore = analysisCount > 0 ? Math.round((lowBiasScans / analysisCount) * 100) : 100;

    const groupedData = uniqueHistory.reduce((acc: any, item) => {
      const dateLabel = format(new Date(item.created_at), "MMM d");
      if (!acc[dateLabel]) {
        acc[dateLabel] = { date: dateLabel, sum: 0, count: 0 };
      }
      acc[dateLabel].sum += (item.bias_score || 0);
      acc[dateLabel].count += 1;
      return acc;
    }, {});

    const trendData = Object.values(groupedData)
      .map((d: any) => ({
        date: d.date,
        score: Math.round(d.sum / d.count)
      }))
      .reverse()
      .slice(-10);

    return {
      analysisCount,
      avgBiasScore,
      highBiasFlags,
      fairnessScore,
      trendData,
      categoryBreakdown,
      flaggedQuestions: flaggedQuestions.slice(0, 5)
    };
  }, [history]);

  const heroContent = useMemo(() => {
    if (stats.analysisCount === 0) {
      return {
        bg: 'bg-[#f0f9ff]',
        border: 'border-blue-100',
        titleColor: 'text-blue-900',
        subtitleColor: 'text-blue-800/70',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        title: "Welcome to Rifair AI",
        subtitle: "Paste your first set of interview questions to get a bias score instantly.",
        cta: "Run your first analysis",
        ctaLink: '/analyze'
      };
    }
    
    if (stats.highBiasFlags === 0 && stats.avgBiasScore < 40) {
      return {
        bg: 'bg-[#f0fdf4]',
        border: 'border-green-100',
        titleColor: 'text-green-900',
        subtitleColor: 'text-green-800/70',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        title: "Your hiring looks clean",
        subtitle: `Avg bias score ${stats.avgBiasScore}/100 across ${stats.analysisCount} analyses. Keep it up.`,
        cta: "Generate an interview kit",
        ctaLink: '/kit'
      };
    }

    return {
      bg: 'bg-[#fff5f5]',
      border: 'border-red-100',
      titleColor: 'text-red-900',
      subtitleColor: 'text-red-800/70',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      title: `${stats.highBiasFlags} high-risk question${stats.highBiasFlags > 1 ? 's' : ''} need your attention`,
      subtitle: `Avg bias score is ${stats.avgBiasScore}/100 — review flagged questions before your next round.`,
      cta: "View flagged questions",
      ctaLink: '/history'
    };
  }, [stats]);

  const subtexts = useMemo(() => ({
    bias: stats.analysisCount === 0 ? "No analyses yet" :
          stats.avgBiasScore === 0 ? "Perfectly clean" :
          stats.avgBiasScore < 40 ? "Looking good" :
          stats.avgBiasScore < 65 ? "Moderate — review recommended" :
          "High — action required",
    flags: stats.analysisCount === 0 ? "Run an analysis to begin" :
           stats.highBiasFlags === 0 ? "No issues detected" :
           stats.highBiasFlags <= 2 ? "Review recommended" :
           "Requires immediate fix",
    fairness: stats.analysisCount === 0 ? "—" :
              stats.fairnessScore === 100 ? "Perfect score" :
              stats.fairnessScore >= 80 ? "Strong — minor gaps remain" :
              stats.fairnessScore >= 60 ? "Improving — keep going" :
              "Needs significant work",
  }), [stats]);

  const flagCardStyle = useMemo(() => {
    if (stats.analysisCount === 0) return { bg: 'bg-[#F5F5F7]', border: 'border-black/[0.03]', text: 'text-[#86868B]', label: 'text-[#86868B]' };
    if (stats.highBiasFlags === 0) return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', label: 'text-emerald-900/40' };
    if (stats.highBiasFlags <= 2) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', label: 'text-amber-900/40' };
    return { bg: 'bg-[#FEF2F2]', border: 'border-red-100', text: 'text-red-600', label: 'text-red-950/40' };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium tracking-wide">Syncing data...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-5 md:space-y-8 pb-4 pt-4 px-0 lg:px-6">
      
      {/* Dashboard Title Row — stacks vertically on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1D1D1F] tracking-tight">Hiring intelligence dashboard</h1>
        <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider whitespace-nowrap">Last updated: today</p>
      </div>

      {/* Hero Banner Strip */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden border rounded-[2rem] p-8 lg:p-12 shadow-sm transition-colors duration-500",
          heroContent.bg,
          heroContent.border
        )}
      >
        {/* Hero banner: keep-row flex — text left, button right. Shrinks gracefully */}
        <div className="relative z-10 flex flex-row items-center justify-between gap-3 md:gap-8">
          <div className="space-y-1.5 md:space-y-3 flex-1 min-w-0">
            <h2
              className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight", heroContent.titleColor)}
            >
              {heroContent.title}
            </h2>
            <p className={cn("text-sm md:text-lg font-medium", heroContent.subtitleColor)}>
              {heroContent.subtitle}
            </p>
          </div>
          <Link href={heroContent.ctaLink} className="flex-shrink-0">
            <button className={cn(
              "w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 transition-all rounded-full text-white font-bold shadow-md hover:shadow-lg group active:scale-95 text-sm md:text-base min-h-[44px]",
              heroContent.buttonBg
            )}>
              {heroContent.cta} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* 4-Metric Grid */}
      {/* Mobile: 2x2 grid | Tablet: 2x2 grid | Desktop: 1x4 grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
      >
        {/* TOTAL ANALYSES */}
        <motion.div variants={itemVariants} className="bg-[#F5F5F7] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-black/[0.03] shadow-sm snap-start shrink-0">
          <div className="space-y-3 md:space-y-6">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">TOTAL ANALYSES</p>
            <div className="space-y-1">
              <p className="text-3xl md:text-5xl font-bold text-[#1D1D1F] tracking-tighter">{stats.analysisCount}</p>
              {stats.analysisCount > 0 && (
                <p className="text-sm font-bold text-[#86868B] flex items-center gap-1">
                  <span className="text-[#059669]">+2</span> this week
                </p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* AVG BIAS SCORE */}
        <motion.div variants={itemVariants} className="bg-[#F5F5F7] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-black/[0.03] shadow-sm snap-start shrink-0">
          <div className="space-y-3 md:space-y-6">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">AVG BIAS SCORE</p>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <p className={cn(
                  "text-3xl md:text-5xl font-bold tracking-tighter",
                  stats.analysisCount === 0 ? "text-[#1D1D1F]" :
                  stats.avgBiasScore < 40 ? "text-[#059669]" :
                  stats.avgBiasScore < 65 ? "text-amber-600" :
                  "text-red-600"
                )}>
                  {stats.analysisCount === 0 ? "—" : stats.avgBiasScore}
                </p>
                <span className="text-lg font-bold text-[#86868B]">/100</span>
              </div>
              <p className={cn(
                "text-sm font-bold capitalize",
                stats.analysisCount === 0 ? "text-[#86868B]" :
                stats.avgBiasScore < 40 ? "text-[#059669]" :
                stats.avgBiasScore < 65 ? "text-amber-600" :
                "text-red-600"
              )}>
                {subtexts.bias}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* HIGH BIAS FLAGS */}
        <motion.div variants={itemVariants} className={cn("p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border shadow-sm transition-colors duration-500 snap-start shrink-0", flagCardStyle.bg, flagCardStyle.border)}>
          <div className="space-y-3 md:space-y-6">
            <p className={cn("text-[10px] font-black uppercase tracking-[0.15em]", flagCardStyle.label)}>HIGH BIAS FLAGS</p>
            <div className="space-y-1">
              <p className={cn("tracking-tighter font-bold", stats.analysisCount === 0 ? "text-xl text-[#86868B]" : "text-3xl md:text-5xl " + flagCardStyle.text)}>
                {stats.analysisCount === 0 ? "No data yet" : stats.highBiasFlags}
              </p>
              <p className={cn("text-sm font-black uppercase", flagCardStyle.text)}>{subtexts.flags}</p>
            </div>
          </div>
        </motion.div>
        
        {/* FAIRNESS SCORE */}
        <motion.div variants={itemVariants} className="bg-[#F5F5F7] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-black/[0.03] shadow-sm snap-start shrink-0">
          <div className="space-y-3 md:space-y-6">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.15em]">FAIRNESS SCORE</p>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <p className={cn(
                  "text-3xl md:text-5xl font-bold tracking-tighter",
                  stats.analysisCount === 0 ? "text-[#1D1D1F]" :
                  stats.fairnessScore >= 80 ? "text-[#059669]" :
                  stats.fairnessScore >= 60 ? "text-amber-500" :
                  "text-red-500"
                )}>
                  {stats.analysisCount === 0 ? "—" : stats.fairnessScore}
                </p>
                <span className={cn(
                  "font-bold",
                  stats.analysisCount === 0 ? "text-lg text-[#86868B]" : "text-2xl text-[#059669]"
                )}>{stats.analysisCount === 0 ? "" : "%"}</span>
              </div>
              <p className={cn(
                "text-sm font-bold capitalize",
                stats.fairnessScore >= 80 ? "text-[#059669]/80" : stats.fairnessScore >= 60 ? "text-amber-500/80" : stats.analysisCount === 0 ? "text-[#86868B]" : "text-red-500/80"
              )}>
                {subtexts.fairness}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/[0.03] shadow-sm space-y-6 md:space-y-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg md:text-2xl font-bold text-[#1D1D1F] tracking-tight">Bias Trend Analysis</h3>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                 <span className="text-xs font-bold text-[#86868B]">Fairness</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                 <span className="text-xs font-bold text-[#86868B]">Daily Score</span>
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <BiasTrendChart data={stats.trendData} />
          </div>
        </motion.div>

        {/* Category Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/[0.03] shadow-sm space-y-6 md:space-y-10"
        >
          <h3 className="text-lg md:text-2xl font-bold text-[#1D1D1F] tracking-tight">Bias by category</h3>
          <div className="space-y-6">
            {Object.entries(stats.categoryBreakdown).length > 0 ? (
              Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count], idx) => (
                <div key={cat} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-[#1D1D1F] uppercase tracking-[0.1em]">{cat.replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-[#86868B]">{count} hits</span>
                  </div>
                  <div className="h-3 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / Math.max(1, stats.highBiasFlags)) * 100)}%` }}
                      className={cn(
                        "h-full rounded-full",
                        idx === 0 ? "bg-[#EF4444]" : idx === 1 ? "bg-[#F59E0B]" : "bg-[#10B981]"
                      )}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <p className="text-[#86868B] text-sm font-medium">No activity data yet.</p>
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-slate-100">
             <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] text-center">
               D&I Intelligence Core Active
             </p>
          </div>
        </motion.div>
      </div>

      {/* Flagged Questions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/[0.03] shadow-sm space-y-5 md:space-y-8"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg md:text-2xl font-bold text-[#1D1D1F] tracking-tight">Recently flagged questions</h3>
          <Link href="/history" className="text-sm font-bold text-[#059669] hover:text-[#047857] transition-colors flex items-center gap-1">
            View full log <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          {stats.flaggedQuestions.length > 0 ? (
            stats.flaggedQuestions.map((q, i) => (
              <div key={i} className={cn(
                "py-4 md:py-6 px-3 md:px-4 flex flex-row items-center justify-between gap-2 sm:gap-4 md:gap-8 group transition-colors rounded-2xl",
                i % 2 === 0 ? "bg-transparent" : "bg-[#F5F5F7]/30"
              )}>
                <div className="space-y-1.5 md:space-y-2 min-w-0 flex-1">
                  <p className="text-[#1D1D1F] font-bold text-sm md:text-xl leading-tight group-hover:text-[#059669] transition-colors">
                    &ldquo;{q.text.slice(0, 80)}{q.text.length > 80 ? '...' : ''}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">
                      {q.type} BIAS
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
                      {format(new Date(q.date), "MMM d")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[50px] sm:min-w-[60px] md:min-w-[100px]">
                  <span className="text-2xl md:text-4xl font-bold text-[#1D1D1F] tracking-tighter">
                    {q.score}
                  </span>
                  <span className="text-[8px] md:text-[10px] font-black text-[#86868B] uppercase tracking-widest">
                    BIAS
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center bg-[#F5F5F7] rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-[#86868B] font-bold text-lg">Your recent analyses are bias-free.</p>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
