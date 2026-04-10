"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  level: "Low" | "Medium" | "High";
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const normalizedLevel = (level?.charAt(0).toUpperCase() + level?.slice(1).toLowerCase()) as "Low" | "Medium" | "High";

  const configs = {
    Low: {
      color: "bg-[#1D1D1F] text-white border-black/5 shadow-xl shadow-black/10",
      icon: ShieldCheck,
      label: "Optimal\nArchitecture",
    },
    Medium: {
      color: "bg-warning text-white border-warning/10 shadow-xl shadow-warning/20",
      icon: AlertCircle,
      label: "Pattern\nDeviation",
    },
    High: {
      color: "bg-danger text-white border-danger/10 shadow-xl shadow-danger/20",
      icon: AlertTriangle,
      label: "Critical\nViolation",
    },
  };

  const config = configs[normalizedLevel] || configs.Low;
  const Icon = config.icon;

  return (
    <div className={cn("px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 rounded-[2rem] border transition-all duration-300", config.color)}>
      <Icon className="h-5 w-5 opacity-80" />
      <div className="flex flex-col text-left leading-[1.4]">
        {config.label.split('\n').map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    </div>
  );
}

