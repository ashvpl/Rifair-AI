"use client";

import { useEffect, useState } from "react";
import { getBiasDna } from "@/lib/api";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dna, TrendingUp, TrendingDown, Minus, Lock } from "lucide-react";
import { useBackendToken } from "@/hooks/useBackendToken";

interface BiasDnaData {
  dominant_bias_types: { type: string; count: number }[];
  total_questions_analyzed: number;
  total_biased_questions: number;
  fairness_trend: "improving" | "worsening" | "stable";
  narrative: string;
  weekly_scores: { week: string; avg: number | null }[];
}

export function BiasDnaPanel() {
  const { canUse } = useSubscription();
  const { getAuthToken } = useBackendToken();
  const router = useRouter();
  const isUnlocked = canUse("bias_dna");
  const [data, setData] = useState<BiasDnaData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUnlocked) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) return;
        const result = await getBiasDna(token);
        setData(result);
      } catch (e) {
        console.error("[BiasDNA]", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isUnlocked, getAuthToken]);

  const TrendIcon = data?.fairness_trend === "improving"
    ? TrendingDown
    : data?.fairness_trend === "worsening"
    ? TrendingUp
    : Minus;

  const trendColor = data?.fairness_trend === "improving"
    ? "text-emerald-600"
    : data?.fairness_trend === "worsening"
    ? "text-red-500"
    : "text-slate-400";

  if (!isUnlocked) {
    return (
      <div
        className="bg-white border border-black rounded-2xl p-4 lg:p-5 xl:p-6 cursor-pointer group hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        onClick={() => router.push("/pricing?highlight=growth&feature=bias_dna")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 lg:gap-6 xl:gap-8 items-center">
          {/* Left: Info */}
          <div className="sm:col-span-2 space-y-2 lg:space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-violet-50 border border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <Dna className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm lg:text-base font-black text-black tracking-tight">Bias DNA</p>
                <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest">Growth Feature</p>
              </div>
              <Lock className="h-3.5 w-3.5 text-slate-400 ml-auto sm:hidden" />
            </div>
            <p className="text-[10px] lg:text-xs text-slate-500 font-medium leading-normal">
              Unlock long-term pattern tracking to identify and root out systemic bias types.
            </p>
            <button className="hidden sm:block w-full py-1.5 lg:py-2.5 rounded-lg border border-black font-black text-[8px] lg:text-[10px] uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] lg:shadow-[3px_3px_0px_rgba(0,0,0,1)] group-hover:shadow-none">
              Unlock DNA →
            </button>
          </div>

          {/* Right: Mockups */}
          <div className="sm:col-span-3 space-y-2 lg:space-y-3.5 border-t sm:border-t-0 sm:border-l border-black/5 pt-2 sm:pt-0 sm:pl-3.5 lg:pl-6">
            <div className="space-y-1.5 lg:space-y-3 blur-[2.5px] opacity-40 pointer-events-none select-none">
              {[
                { type: "Gender Bias", pct: 80 },
                { type: "Age Bias", pct: 55 },
                { type: "Regional Bias", pct: 30 },
              ].map((b) => (
                <div key={b.type} className="space-y-0.5 lg:space-y-1.5">
                  <div className="flex justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-500">{b.type}</span>
                    <span className="text-slate-800">{b.pct}%</span>
                  </div>
                  <div className="h-2 lg:h-2.5 bg-slate-100 rounded-full border border-black/5" />
                </div>
              ))}
            </div>
            <button className="sm:hidden w-full py-2 rounded-lg border border-black font-black text-[9px] uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none mt-2">
              Unlock DNA Patterns →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-black rounded-2xl p-4 lg:p-6 animate-pulse shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4 lg:space-y-6">
        <div className="h-6 bg-slate-100 rounded w-1/3" />
        <div className="space-y-2 lg:space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-8 lg:h-12 bg-slate-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!data || !data.dominant_bias_types.length) {
    return (
      <div className="bg-white border border-black rounded-2xl p-4 lg:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-2 lg:mb-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-violet-50 border border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <Dna className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-violet-600" />
          </div>
          <p className="text-xs sm:text-sm lg:text-base font-black text-black tracking-tight">Bias DNA</p>
        </div>
        <p className="text-[10px] lg:text-xs text-slate-500 font-medium leading-normal">
          Not enough data yet. Run more analyses to see your organization's bias patterns over time.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.dominant_bias_types.map((b) => b.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-black rounded-2xl p-4 lg:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] lg:shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-3 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-50 border border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          <Dna className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-xs font-black text-black tracking-tight">Your Bias DNA</p>
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">30-day pattern analysis</p>
        </div>
        <div className={`ml-auto flex items-center gap-1 ${trendColor} bg-white border border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
          <TrendIcon className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-wider">{data.fairness_trend}</span>
        </div>
      </div>

      {/* ── Mobile: stacked  |  Desktop (lg+): horizontal 3-col ── */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0 min-w-0">

        {/* 1 ── Narrative */}
        <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-2.5 lg:p-3 lg:w-[200px] lg:shrink-0 lg:self-center shadow-[1px_1px_0px_0px_rgba(139,92,246,0.04)]">
          <p className="text-[10px] lg:text-[10px] text-slate-700 font-medium leading-snug italic">
            {data.narrative}
          </p>
        </div>

        {/* 2 ── Progress Bars */}
        <div className="flex-1 flex flex-col justify-center gap-2 lg:gap-2 border-t lg:border-t-0 lg:border-l border-black/5 pt-3 lg:pt-0 lg:px-4">
          {data.dominant_bias_types.map((b, i) => (
            <motion.div
              key={b.type}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="space-y-0.5"
            >
              <div className="flex justify-between items-end">
                <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-wider">{b.type}</span>
                <span className="text-[9px] lg:text-[10px] font-black text-black">{b.count}×</span>
              </div>
              <div className="h-1.5 lg:h-2 bg-[#F5F5F7] border border-black/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.count / maxCount) * 100}%` }}
                  transition={{ duration: 1.2, ease: "circOut", delay: 0.2 + i * 0.08 }}
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3 ── Stats */}
        <div className="flex lg:flex-col items-center justify-around lg:justify-center lg:gap-3 lg:shrink-0 lg:w-16 lg:min-w-[64px] lg:pl-3 lg:border-l border-black/5 border-t lg:border-t-0 pt-2.5 lg:pt-0 overflow-hidden">
          <div className="text-center">
            <p className="text-base lg:text-base font-black text-black tracking-tighter leading-none">{data.total_questions_analyzed}</p>
            <p className="text-[6px] lg:text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Qs</p>
          </div>
          <div className="text-center">
            <p className="text-base lg:text-base font-black text-red-600 tracking-tighter leading-none">{data.total_biased_questions}</p>
            <p className="text-[6px] lg:text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Biased</p>
          </div>
          <div className="text-center">
            <p className="text-base lg:text-base font-black text-emerald-600 tracking-tighter leading-none">
              {data.total_questions_analyzed > 0
                ? Math.round(100 - (data.total_biased_questions / data.total_questions_analyzed) * 100)
                : 0}%
            </p>
            <p className="text-[6px] lg:text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Fair</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
