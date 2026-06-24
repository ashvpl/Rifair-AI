"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import {
  DemoHeader,
  JobUnderstandingPanel,
  PipelineVisualization,
  CandidateLeaderboard,
  RankingMethodology,
  HoneypotDetection,
  ScaleAndArchitecture,
  SubmissionOutput,
  DatasetDisclosure
} from "./demo-components";
import { Candidate } from "@/lib/demo-data";

export default function DemoPageClient() {
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [progress, setProgress] = useState(0);

  // #region agent log
  useEffect(() => {
    const payload = {
      sessionId: "33be9b",
      location: "DemoPageClient.tsx:CIE_Demo",
      message: "CIE Demo mounted",
      data: { mountMs: Math.round(performance.now()) },
      hypothesisId: "E",
      timestamp: Date.now(),
      runId: "initial",
    };
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, []);
  // #endregion

  const runEngine = async () => {
    setProcessingState('processing');
    setProgress(0);
    // Scroll to architecture/pipeline section to watch it run
    window.scrollTo({ top: 300, behavior: 'smooth' });

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return p;
        return p + Math.random() * 15;
      });
    }, 400);
    
    try {
      const res = await fetch('/api/run-engine', { method: 'POST' });
      const json = await res.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        if (json.success && json.data) {
          setCandidates(json.data);
          setProcessingState('complete');
        } else {
          setProcessingState('idle');
        }
      }, 400);
    } catch (e) {
      clearInterval(progressInterval);
      console.error(e);
      setProcessingState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20">
      {/* Light minimalist navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Rifair AI
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="#architecture" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Architecture
            </Link>
            <Link href="/sign-up" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Start Building
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <DemoHeader />
        <DatasetDisclosure />
        
        <div className="max-w-3xl mx-auto mb-16 text-center">
          {processingState === 'idle' && (
            <button 
              onClick={runEngine}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 text-lg"
            >
              <Play className="w-5 h-5 fill-white" />
              Screen 100,000 Candidates
            </button>
          )}
          
          {processingState === 'processing' && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-indigo-600 font-bold rounded-full shadow-lg text-lg w-full justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing candidate profiles...
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-slate-500 font-medium">Processing {Math.min(Math.round((progress / 100) * 100000), 100000).toLocaleString()} profiles...</span>
            </div>
          )}

          {processingState === 'complete' && (
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full shadow-lg text-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Screening complete in 2.45s
            </div>
          )}
        </div>

        <JobUnderstandingPanel />
        
        <PipelineVisualization isProcessing={processingState === 'processing'} />
        
        {processingState === 'complete' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-backwards">
            <CandidateLeaderboard candidates={candidates} />
            <RankingMethodology />
            <HoneypotDetection />
            <ScaleAndArchitecture />
            <SubmissionOutput />
          </div>
        )}
      </main>
    </div>
  );
}
