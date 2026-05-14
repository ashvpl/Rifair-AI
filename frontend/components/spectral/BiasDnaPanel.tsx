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
        className="bg-white border-2 border-black rounded-[2rem] p-8 cursor-pointer group hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={() => router.push("/pricing?highlight=growth&feature=bias_dna")}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-violet-50 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Dna className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-base font-black text-black tracking-tight">Bias DNA</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Growth Feature</p>
          </div>
          <div className="ml-auto">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Blurred mockup bars */}
        <div className="space-y-4 blur-[5px] opacity-40 pointer-events-none select-none mb-6">
          {[
            { type: "Gender Bias", pct: 80 },
            { type: "Age Bias", pct: 55 },
            { type: "Regional Bias", pct: 30 },
          ].map((b) => (
            <div key={b.type} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{b.type}</span>
                <span className="text-slate-800">{b.pct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full border border-black/5" />
            </div>
          ))}
        </div>

        <button className="w-full py-3 rounded-full border-2 border-black font-black text-[10px] uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none">
          Unlock DNA Patterns →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border-2 border-black rounded-[2rem] p-8 animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data || !data.dominant_bias_types.length) {
    return (
      <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-violet-50 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Dna className="h-6 w-6 text-violet-600" />
          </div>
          <p className="text-base font-black text-black tracking-tight">Bias DNA</p>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
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
      className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-violet-50 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Dna className="h-6 w-6 text-violet-600" />
        </div>
        <div>
          <p className="text-base font-black text-black tracking-tight">Your Bias DNA</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">30-day pattern analysis</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 ${trendColor} bg-white border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{data.fairness_trend}</span>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-violet-50/50 border-2 border-violet-100 rounded-2xl p-5 shadow-[2px_2px_0px_0px_rgba(139,92,246,0.05)]">
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          {data.narrative}
        </p>
      </div>

      {/* Bias type bars */}
      <div className="space-y-5">
        {data.dominant_bias_types.map((b, i) => (
          <motion.div
            key={b.type}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.type}</span>
              <span className="text-sm font-black text-black">{b.count}×</span>
            </div>
            <div className="h-3 bg-[#F5F5F7] border border-black/5 rounded-full overflow-hidden">
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

      <div className="flex items-center justify-between pt-6 border-t border-black/[0.04]">
        <div className="text-center">
          <p className="text-2xl font-black text-black tracking-tighter">{data.total_questions_analyzed}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-red-600 tracking-tighter">{data.total_biased_questions}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biased</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-600 tracking-tighter">
            {data.total_questions_analyzed > 0
              ? Math.round(100 - (data.total_biased_questions / data.total_questions_analyzed) * 100)
              : 0}%
          </p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fair</p>
        </div>
      </div>
    </motion.div>
  );
}
