"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  level: "Low" | "Medium" | "High";
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const configs = {
    Low: {
      color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      icon: ShieldCheck,
      label: "Low bias risk",
    },
    Medium: {
      color: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      icon: AlertCircle,
      label: "Potential bias detected",
    },
    High: {
      color: "bg-red-100 text-red-700 hover:bg-red-100",
      icon: AlertTriangle,
      label: "High bias risk in interview design",
    },
  };

  const config = configs[level] || configs.Low;
  const Icon = config.icon;

  return (
    <Badge className={cn("px-3 py-1 text-sm font-semibold flex items-center gap-1.5 rounded-full shadow-sm border-none", config.color)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  );
}
