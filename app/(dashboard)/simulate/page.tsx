"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SimulatePage() {
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
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ neutral_question: question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Simulation failed");

      setSimulation(data.simulation);
    } catch (err: any) {
      setError(err.message || "Failed to run simulation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bias Simulator</h1>
        <p className="text-lg text-slate-500">
          Enter a neutral interview question and see how subtle changes in phrasing introduce hidden biases.
        </p>
      </div>

      <Card className="border-2 border-slate-200 shadow-sm overflow-hidden rounded-2xl">
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="p-8">
          <div className="space-y-4">
            <Textarea 
              placeholder="e.g. Can you describe a time you overcame a professional challenge?"
              className="text-lg min-h-[120px] resize-none border-slate-200 bg-slate-50 focus:bg-white transition-colors"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleSimulate}
              disabled={isLoading || !question.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-lg"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Simulating Bias Injections...</>
              ) : (
                <><Zap className="w-5 h-5 mr-3" /> Run Simulation</>
              )}
            </Button>
            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2 mt-2 font-medium">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {simulation && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Original Neutral Question</h3>
            <p className="text-xl font-medium text-slate-900">{simulation.original}</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            <div className="space-y-6">
              {simulation.variants?.map((v: any, idx: number) => (
                <div key={idx} className="relative pl-20 group">
                  <div className="absolute left-6 top-6 w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm z-10 group-hover:scale-125 transition-transform" />
                  
                  <Card className="border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest">
                          {v.category} Bias
                        </span>
                      </div>
                      
                      <p className="text-lg text-slate-800 font-medium">"{v.biased_question}"</p>
                      
                      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100 flex gap-3">
                        <ArrowRight className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" />
                        <p>{v.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
