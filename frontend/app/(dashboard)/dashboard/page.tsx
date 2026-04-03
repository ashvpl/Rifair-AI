"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReports } from "@/lib/api";
import { Loader2, AlertTriangle, CheckCircle2, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import MountainVistaParallax from "@/components/ui/mountain-vista-bg";


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
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      
      {/* Header section with Parallax */}
      <MountainVistaParallax 
        title="Dashboard Overview" 
        subtitle="Strategic insights and detailed telemetry from your automated hiring intelligence pipeline." 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.05] p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group">
          <div className="space-y-5 relative z-10">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> System Throughput
            </p>
            <p className="text-6xl font-extrabold text-foreground tracking-tighter">{totalScans}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.05] p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group">
          <div className="space-y-5 relative z-10">
            <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em]">Aggregate Bias Index</p>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-extrabold text-[#0071E3] tracking-tighter">{avgScore}</p>
              <span className="text-lg font-bold text-[#86868B]">/100</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.05] p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group">
          <div className="space-y-5 relative z-10">
            <p className="text-[10px] font-black text-danger uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Priority Alerts
            </p>
            <p className="text-6xl font-extrabold text-danger tracking-tighter">{highRiskScans}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.05] p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8_32px_rgba(0,0,0,0.04)] transition-all duration-500 group">
          <div className="space-y-5 relative z-10">
            <p className="text-[10px] font-black text-success uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Compliance Rate
            </p>
            <p className="text-6xl font-extrabold text-success tracking-tighter">{cleanScans}</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="space-y-8 pt-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Recent Activity Log</h2>
        </div>
        
        <div className="bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="p-0">
            <div className="flex flex-col">
              {uniqueHistory.slice(0, 10).map((report, idx) => {
                const isHigh = report.risk_level?.toLowerCase() === 'high';
                const isMedium = report.risk_level?.toLowerCase() === 'medium';
                const themeClass = isHigh ? 'text-danger bg-danger/5 border-danger/10' : 
                                   isMedium ? 'text-warning bg-warning/5 border-warning/10' : 
                                   'text-success bg-success/5 border-success/10';
                
                return (
                  <div 
                    key={report.id} 
                    className={`flex items-center justify-between p-8 ${idx !== 0 ? 'border-t border-black/[0.03]' : ''} hover:bg-black/[0.01] transition-all cursor-pointer group`} 
                    onClick={() => window.location.href = `/report/${report.id}`}
                  >
                    <div className="truncate max-w-[60%] lg:max-w-[70%] text-lg font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                      {report.input_text}
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border ${themeClass}`}>
                        {report.risk_level}
                      </span>
                      <div className="flex flex-col items-end min-w-[80px]">
                        <span className="font-extrabold text-2xl text-foreground tracking-tighter">{report.bias_score}</span>
                        <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-[0.1em]">Score</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {uniqueHistory.length === 0 && (
                <div className="text-center text-[#86868B] py-24 flex flex-col items-center">
                  <div className="bg-[#F5F5F7] p-8 rounded-full mb-6">
                    <Activity className="h-12 w-12 text-black/10" />
                  </div>
                  <p className="text-xl font-bold text-foreground">No recent activity detected.</p>
                  <p className="text-sm mt-2 font-medium">Initiate a broad analysis to populate your master dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>

  );
}
