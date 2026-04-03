"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Sparkles, BadgeCheck, SendHorizontal, Zap, ZapOff, Scale } from "lucide-react";
import { Loader2 } from "lucide-react";

const TRANSFORM_OPTIONS = [
  {
    label: "Extreme Bias (Stress Test)",
    icon: Zap,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    label: "Subtle Microaggressions",
    icon: Sparkles,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Neutral Benchmark",
    icon: Scale,
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
];

interface RuixenPromptBoxProps {
  onSubmit: (input: string, option: string | null) => void;
  isLoading: boolean;
}

export default function RuixenPromptBox({ onSubmit, isLoading }: RuixenPromptBoxProps) {
  const [input, setInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const currentOption = TRANSFORM_OPTIONS.find((o) => o.label === selectedOption);

  const handleSend = () => {
    if (!input.trim() && !selectedOption) return;
    onSubmit(input, selectedOption);
    // Don't clear input instantly so user sees what they submitted during loading
    if (!isLoading) {
      adjustHeight(true);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="relative rounded-2xl bg-muted/10 border border-border/50 p-4 shadow-sm focus-within:border-black/10 focus-within:ring-4 focus-within:ring-black/5 transition-all">
          {currentOption && (
            <div
              className={cn(
                "absolute -top-3 left-4 px-3 py-1 text-xs font-bold rounded-full",
                currentOption.bg,
                currentOption.color,
                "shadow-sm"
              )}
            >
              <currentOption.icon className="inline-block w-3.5 h-3.5 mr-1.5" />
              {currentOption.label}
            </div>
          )}

          <Textarea
            ref={textareaRef}
            placeholder="e.g. Can you describe a strategic initiative you spearheaded?"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className={cn(
              "w-full resize-none bg-transparent border-none text-foreground text-base font-medium",
              "focus:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/50",
              "min-h-[60px] max-h-[200px]"
            )}
          />

          <div className="absolute bottom-3 right-4">
            <button
              onClick={handleSend}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                (input || selectedOption) && !isLoading
                  ? "bg-black text-white hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
              disabled={(!input && !selectedOption) || isLoading}
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SendHorizontal className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Transform Options */}
        <div className="flex flex-wrap gap-2 justify-start px-1 pt-1">
          {TRANSFORM_OPTIONS.map(({ label, icon: Icon, color }) => {
            const isSelected = label === selectedOption;
            return (
              <button
                key={label}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  setSelectedOption(isSelected ? null : label)
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300",
                  isSelected
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                    : "bg-transparent border-border/50 text-muted-foreground hover:bg-muted/10 hover:border-black/5"
                )}
              >
                <Icon className={cn("w-4 h-4", color)} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
