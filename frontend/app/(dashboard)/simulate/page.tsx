"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { simulateBias } from "@/lib/api";
import RuixenPromptBox from "@/components/ui/ruixen-prompt-box";
import { Loader2, Zap, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SimulatePage() {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (inputText: string, option: string | null) => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setSimulation(null);

    // Optionally attach the selected option context for the backend
    const finalQuestion = option ? `[${option}] ${inputText}` : inputText;

    try {
      const token = await getToken();
      const data = await simulateBias(finalQuestion, token);
      setSimulation(data.simulation);
    } catch (err: any) {
      setError(err.message || "AI service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Header section */}
      <div className="relative pb-6 pt-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#F5F5F7] border border-black/[0.03] rounded-full">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Injection Engine</span>
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Stress-Test Simulation</h1>
            <p className="text-[#86868B] max-w-xl text-lg font-medium">
              Test the structural integrity of your hiring framework by injecting artificial bias vectors into professional queries.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/[0.05] p-6 md:p-8 rounded-[2.5rem] shadow-[0_4px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-lg">
        <div className="space-y-6">
          <div className="space-y-4">
            <RuixenPromptBox 
              onSubmit={handleSimulate} 
              isLoading={isLoading} 
            />
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-danger/5 border border-danger/10 text-danger rounded-2xl p-6 flex items-center gap-4 font-bold shadow-sm"
                >
                  <AlertTriangle className="w-6 h-6" /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {simulation && (
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16 pt-16"
          >
            <div className="bg-[#F5F5F7]/40 border border-black/[0.02] p-12 rounded-[3rem] relative overflow-hidden group shadow-inner">
              <h3 className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.3em] mb-6">Master Reference Point</h3>
              <p className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight transition-colors">
                "{simulation.original}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {simulation.variants?.map((v: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.8, ease: "circOut" }}
                  className="bg-white p-10 flex flex-col gap-8 relative group overflow-hidden hover:border-danger/30 transition-all rounded-[3rem] border border-black/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_48px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-5 py-2 bg-danger/[0.03] text-danger rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-danger/10 shadow-sm">
                      {v.category} Probe
                    </span>
                    <AlertTriangle className="h-5 w-5 text-danger opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-2xl text-[#1D1D1F] font-bold leading-tight flex-1 relative z-10 tracking-tight">
                    "{v.biased_question}"
                  </p>
                  
                  <div className="pt-8 border-t border-black/[0.03] mt-auto relative z-10">
                    <div className="flex gap-4">
                      <ArrowRight className="w-5 h-5 shrink-0 text-primary mt-1" />
                      <p className="text-sm font-bold text-[#86868B] leading-relaxed italic pr-4">
                        {v.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
