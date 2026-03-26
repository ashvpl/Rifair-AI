"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";

interface QuestionInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function QuestionInput({ onAnalyze, isLoading }: QuestionInputProps) {
  const [text, setText] = useState("");
  const [realtimeScore, setRealtimeScore] = useState<number | null>(null);
  const [realtimeRisk, setRealtimeRisk] = useState<"low" | "medium" | "high" | null>(null);
  const [realtimeInsights, setRealtimeInsights] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onAnalyze(text);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (text.trim().length < 10) {
      setRealtimeScore(null);
      setRealtimeRisk(null);
      setRealtimeInsights([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/realtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          const data = await res.json();
          setRealtimeScore(data.result.overall_bias_score);
          setRealtimeRisk(data.result.risk_level);
          setRealtimeInsights(data.result.questions.map((q: any) => q.issue));
        }
      } catch (err) {
        console.error("Realtime check failed", err);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  const riskColor = 
    realtimeRisk === "high" ? "text-red-600 bg-red-50 border-red-200" :
    realtimeRisk === "medium" ? "text-amber-600 bg-amber-50 border-amber-200" :
    realtimeRisk === "low" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    "text-slate-500 bg-slate-50 border-slate-200";

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Paste your interview questions here (e.g., 'Are you planning to start a family soon?' or 'We need someone young and energetic for this role')..."
          className={`min-h-[200px] text-lg p-6 transition-all resize-none shadow-sm rounded-xl border-2 \${
            realtimeRisk === "high" ? "border-red-300 focus-visible:ring-red-500" :
            realtimeRisk === "medium" ? "border-amber-300 focus-visible:ring-amber-500" :
            "bg-slate-50 border-slate-200 focus:bg-white"
          }`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
          {text.length} / 5000 chars
        </div>
        
        {/* Real-Time Widget */}
        {realtimeRisk && (
          <div className={`absolute -bottom-3 left-6 right-6 px-4 py-2 rounded-lg border shadow-sm flex items-center justify-between text-xs font-semibold \${riskColor}`}>
            <div className="flex items-center gap-2">
              {realtimeRisk === "low" ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>Live Check: {realtimeRisk.toUpperCase()} RISK</span>
            </div>
            {realtimeInsights.length > 0 && (
              <span className="truncate max-w-[200px] opacity-80">
                Flags: {realtimeInsights.join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={realtimeRisk ? "pt-4" : ""}>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 rounded-xl shadow-md transition-all group"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI is Deep Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Run Deep AI Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
