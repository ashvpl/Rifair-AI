"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { simulateBias } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SimulatePage() {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setError(null);
    setSimulation(null);

    try {
      const token = await getToken();
      const data = await simulateBias(question, token);
      setSimulation(data.simulation);
    } catch (err: any) {
      setError(err.message || "AI service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="relative text-center space-y-6 max-w-3xl mx-auto py-10">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10 rounded-full" />
        <div className="mx-auto w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-6 border border-border shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] relative z-10" />
        </div>
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full">
            <Sparkles className="h-3 w-3 text-secondary" />
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Injection Engine</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter uppercase italic">
            Bias <span className="text-primary">Simulator</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Test the robustness of your recruiting process by injecting artificial bias vectors into neutral questions.
          </p>
        </div>
      </div>

      <div className="glass-panel p-1 rounded-3xl group overflow-hidden shadow-2xl transition-all hover:bg-surface/10">
        <div className="p-8 space-y-6 bg-background/50 rounded-[inherit]">
          <div className="space-y-4">
            <div className="relative">
              <Textarea 
                placeholder="e.g. Can you describe a time you overcame a professional challenge?"
                className="text-lg min-h-[160px] p-6 resize-none border-border bg-surface/30 focus:bg-surface/50 text-foreground transition-all rounded-2xl focus:ring-2 focus:ring-primary/20"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
              />
              <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles className="w-4 h-4 text-primary opacity-30" />
              </div>
            </div>
            
            <Button
              onClick={handleSimulate}
              disabled={isLoading || !question.trim()}
              className="w-full h-16 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-black text-lg rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] group"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Loader2 className="w-6 h-6 animate-spin" /> 
                    <span className="uppercase tracking-widest">Synthesizing Variants...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Zap className="w-6 h-6 group-hover:animate-pulse" /> 
                    <span className="uppercase tracking-widest">Run Simulation</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 flex items-center gap-3 font-bold"
                >
                  <AlertTriangle className="w-5 h-5" /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {simulation && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pt-10"
          >
            <div className="glass-panel p-10 relative overflow-hidden bg-surface/20 border-border/50 group">
              <div className="absolute right-0 top-0 h-full w-32 bg-primary/5 blur-[60px]" />
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Original Entry Point</h3>
              <p className="text-2xl font-black text-foreground/90 tracking-tight leading-tight transition-colors group-hover:text-foreground">
                "{simulation.original}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {simulation.variants?.map((v: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-6 flex flex-col gap-6 relative group overflow-hidden hover:border-danger/40 transition-all border-border/30 bg-surface/5"
                >
                  <div className="absolute inset-0 bg-danger/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-3 py-1 bg-danger/10 text-danger rounded-full text-[10px] font-black uppercase tracking-widest border border-danger/20">
                      {v.category} Injection
                    </span>
                    <AlertTriangle className="h-4 w-4 text-danger opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-lg text-foreground font-bold leading-tight flex-1 relative z-10 transition-colors group-hover:text-white">
                    "{v.biased_question}"
                  </p>
                  
                  <div className="pt-6 border-t border-border/30 mt-auto relative z-10">
                    <div className="flex gap-3">
                      <ArrowRight className="w-4 h-4 shrink-0 text-primary mt-1" />
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic">
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
