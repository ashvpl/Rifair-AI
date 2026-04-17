"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LiquidLoader } from "@/components/ui/LiquidLoader";
import { cn } from "@/lib/utils";

interface QuestionInputProps {
  onAnalyze: (text: string, name: string) => Promise<void>;
  isLoading: boolean;
  initialText?: string;
  initialName?: string;
}

export function QuestionInput({ onAnalyze, isLoading, initialText = "", initialName = "" }: QuestionInputProps) {
  const [text, setText] = useState(initialText);
  const [name, setName] = useState(initialName);

  // Sync with initial values when they change (e.g. from history load)
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onAnalyze(text, name);
  };

  return (
    <div className={cn("space-y-4 animate-in fade-in zoom-in-95 duration-500", isLoading && "hidden")}>
      <div className="relative group">
        <Input 
          placeholder="Name this analysis (e.g. Frontend Team Questions)"
          className="h-14 min-h-[44px] mb-4 text-base md:text-lg px-4 md:px-6 rounded-2xl bg-surface border-border text-foreground transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary/50 shadow-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <Textarea
          placeholder="Paste your interview questions here..."
          className="min-h-[200px] md:min-h-[220px] text-base md:text-lg p-4 md:p-6 transition-all resize-none rounded-2xl bg-surface border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground shadow-md group-hover:shadow-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-[10px] md:text-xs text-muted-foreground font-medium bg-background/50 px-3 py-1 rounded-full backdrop-blur-md border border-border">
          {text.length} / 5000 chars
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="w-full relative p-0.5 inline-flex overflow-hidden rounded-2xl group shadow-md hover:shadow-lg active:scale-95 transition-all min-h-[44px] disabled:opacity-50"
        >
          <span
            className={cn(
              "absolute inset-[-300%] animate-[spin_3s_linear_infinite]",
              "bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,#fff_50%,var(--primary)_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,#000_50%,var(--primary)_100%)]"
            )}
          />
          <span
            className={cn(
              "inline-flex size-full min-h-[44px] items-center text-black justify-center rounded-2xl px-4 py-3 backdrop-blur-3xl font-semibold transition-all bg-white/90 group-hover:bg-white"
            )}
          >
            <span className="relative z-10">Analyse</span>
          </span>
        </Button>
      </div>
    </div>
  );
}
