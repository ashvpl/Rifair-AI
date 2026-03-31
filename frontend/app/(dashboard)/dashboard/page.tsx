"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { Loader2, AlertTriangle, CheckCircle2, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="flex flex-col justify-center items-center py-40 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground font-medium tracking-wide">Synthesizing telemetry data...</p>
      </div>
    );
  }

  const uniqueHistory = Array.from(new Map(history.map(item => [item.input_text, item])).values());
  const totalScans = uniqueHistory.length;
  const avgScore = totalScans ? Math.round(uniqueHistory.reduce((sum, r) => sum + (r.bias_score || 0), 0) / totalScans) : 0;
  const highRiskScans = uniqueHistory.filter(r => r.risk_level?.toLowerCase() === "high").length;
  const cleanScans = uniqueHistory.filter(r => r.risk_level?.toLowerCase() === "low").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-surface border border-border rounded-full">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground max-w-2xl">
            High-level metrics and aggregate analysis across your entire hiring pipeline.
          </p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-4 relative z-10">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Total Scans
            </p>
            <p className="text-5xl font-black text-foreground">{totalScans}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group hover:border-secondary/50 transition-colors">
          <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-4 relative z-10">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Avg Bias Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-secondary">{avgScore}</p>
              <span className="text-sm font-bold text-muted-foreground">/100</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group hover:border-danger/50 transition-colors">
          <div className="absolute inset-0 bg-danger/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-4 relative z-10">
            <p className="text-xs font-black text-danger uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> High Risk
            </p>
            <p className="text-5xl font-black text-danger">{highRiskScans}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group hover:border-success/50 transition-colors">
          <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-4 relative z-10">
            <p className="text-xs font-black text-success uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Clean
            </p>
            <p className="text-5xl font-black text-success">{cleanScans}</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-6 pt-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Analyses</h2>
        </div>
        
        <div className="glass-panel overflow-hidden">
          <div className="p-0">
            <div className="flex flex-col">
              {uniqueHistory.slice(0, 10).map((report, idx) => {
                const isHigh = report.risk_level?.toLowerCase() === 'high';
                const isMedium = report.risk_level?.toLowerCase() === 'medium';
                const themeClass = isHigh ? 'text-danger bg-danger/10 border-danger/20' : 
                                   isMedium ? 'text-warning bg-warning/10 border-warning/20' : 
                                   'text-success bg-success/10 border-success/20';
                
                return (
                  <div 
                    key={report.id} 
                    className={`flex items-center justify-between p-6 ${idx !== 0 ? 'border-t border-border' : ''} hover:bg-surface/50 transition-colors cursor-pointer group`} 
                    onClick={() => window.location.href = `/report/${report.id}`}
                  >
                    <div className="truncate max-w-[60%] lg:max-w-[70%] font-medium text-foreground/90 group-hover:text-primary transition-colors">
                      {report.input_text}
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${themeClass}`}>
                        {report.risk_level}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-lg text-foreground">{report.bias_score}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {uniqueHistory.length === 0 && (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                  <Activity className="h-10 w-10 mb-4 text-border" />
                  <p className="font-medium">No recent activity found.</p>
                  <p className="text-sm mt-1">Run an analysis to populate your dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
