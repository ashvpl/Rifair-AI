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
        className="bg-white border border-black/[0.05] rounded-[2rem] p-6 cursor-pointer group hover:shadow-md transition-shadow"
        onClick={() => router.push("/pricing?highlight=growth&feature=bias_dna")}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
            <Dna className="h-4.5 w-4.5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">🧬 Bias DNA</p>
            <p className="text-[10px] text-slate-400 font-medium">Your monthly bias pattern</p>
          </div>
          <div className="ml-auto">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Blurred mockup bars */}
        <div className="space-y-3 blur-[5px] opacity-60 pointer-events-none select-none mb-4">
          {[
            { type: "Gender Bias", pct: 80 },
            { type: "Age Bias", pct: 55 },
            { type: "Regional Bias", pct: 30 },
          ].map((b) => (
            <div key={b.type} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{b.type}</span>
                <span className="text-slate-800">{b.pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${b.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-bold text-violet-600 group-hover:underline flex items-center gap-1">
          Unlock Bias DNA → Growth plan
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-black/[0.05] rounded-[2rem] p-6 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (!data || !data.dominant_bias_types.length) {
    return (
      <div className="bg-white border border-black/[0.05] rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
            <Dna className="h-4 w-4 text-violet-600" />
          </div>
          <p className="text-sm font-black text-slate-800">🧬 Bias DNA</p>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Not enough data yet. Run more analyses to see your bias patterns over time.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.dominant_bias_types.map((b) => b.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-black/[0.05] rounded-[2rem] p-6 shadow-[0_4px_24_rgba(0,0,0,0.02)] space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
          <Dna className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">🧬 Your Bias DNA</p>
          <p className="text-[10px] text-slate-400 font-medium">30-day pattern analysis</p>
        </div>
        <div className={`ml-auto flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest capitalize">{data.fairness_trend}</span>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-violet-50/50 rounded-xl p-3 border border-violet-100">
        {data.narrative}
      </p>

      {/* Bias type bars */}
      <div className="space-y-3">
        {data.dominant_bias_types.map((b, i) => (
          <motion.div
            key={b.type}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">{b.type}</span>
              <span className="text-slate-800">{b.count}×</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.count / maxCount) * 100}%` }}
                transition={{ duration: 1.2, ease: "circOut", delay: 0.2 + i * 0.08 }}
                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
        <div className="text-center">
          <p className="text-lg font-black text-slate-800">{data.total_questions_analyzed}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-amber-600">{data.total_biased_questions}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Biased</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-emerald-600">
            {data.total_questions_analyzed > 0
              ? Math.round(100 - (data.total_biased_questions / data.total_questions_analyzed) * 100)
              : 0}%
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fair</p>
        </div>
      </div>
    </motion.div>
  );
}
