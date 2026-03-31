"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface QuestionInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function QuestionInput({ onAnalyze, isLoading }: QuestionInputProps) {
  const [text, setText] = useState("");
  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onAnalyze(text);
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Textarea
          placeholder="Paste your interview questions here..."
          className="min-h-[220px] text-lg p-6 transition-all resize-none rounded-2xl bg-surface border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground shadow-lg group-hover:shadow-primary/5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-medium bg-background/50 px-3 py-1 rounded-full backdrop-blur-md border border-border">
          {text.length} / 5000 chars
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold py-7 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all group overflow-hidden relative"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Core Semantics...
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">Run Deep AI Analysis</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
