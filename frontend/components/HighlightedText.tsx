"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FlaggedPhrase {
  text: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

interface HighlightedTextProps {
  originalText: string;
  flaggedPhrases: FlaggedPhrase[];
}

export function HighlightedText({ originalText, flaggedPhrases }: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!flaggedPhrases.length) return [originalText];

    // Sort phrases by length descending to match longer ones first
    const sortedPhrases = [...flaggedPhrases].sort((a, b) => b.text.length - a.text.length);
    
    // Create a regex to find all phrases
    const regexSource = sortedPhrases
      .map(p => p.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex
      .join('|');
    
    if (!regexSource) return [originalText];
    
    const regex = new RegExp(`(${regexSource})`, 'gi');
    return originalText.split(regex);
  }, [originalText, flaggedPhrases]);

  const getSeverityStyle = (phrase: string) => {
    const found = flaggedPhrases.find(p => p.text.toLowerCase() === phrase.toLowerCase());
    if (!found) return "";

    switch (found.severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200 decoration-red-400";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200 decoration-amber-400";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200 decoration-blue-400";
      default: return "";
    }
  };

  const getReason = (phrase: string) => {
    const found = flaggedPhrases.find(p => p.text.toLowerCase() === phrase.toLowerCase());
    return found?.reason || "";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm leading-loose text-lg text-slate-700 whitespace-pre-wrap">
      {parts.map((part, i) => {
        const style = getSeverityStyle(part);
        if (style) {
          return (
            <span
              key={i}
              className={cn("px-1 py-0.5 rounded cursor-help border-b-2 font-medium transition-all group relative", style)}
              title={getReason(part)}
            >
              {part}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {getReason(part)}
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
