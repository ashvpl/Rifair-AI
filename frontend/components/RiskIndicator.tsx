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
      color: "bg-success text-white border-success/10 shadow-lg shadow-success/20",
      icon: ShieldCheck,
      label: "Optimal Architecture",
    },
    Medium: {
      color: "bg-warning text-white border-warning/10 shadow-lg shadow-warning/20",
      icon: AlertCircle,
      label: "Pattern Deviation",
    },
    High: {
      color: "bg-danger text-white border-danger/10 shadow-lg shadow-danger/20",
      icon: AlertTriangle,
      label: "Critical Violation",
    },
  };

  const config = configs[normalizedLevel] || configs.Low;
  const Icon = config.icon;

  return (
    <div className={cn("px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 rounded-full border transition-all duration-300", config.color)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}

