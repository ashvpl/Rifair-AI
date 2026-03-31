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
      color: "bg-success/20 text-success border-success/30 hover:bg-success/30",
      icon: ShieldCheck,
      label: "Low bias risk",
    },
    Medium: {
      color: "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
      icon: AlertCircle,
      label: "Potential bias detected",
    },
    High: {
      color: "bg-danger/20 text-danger border-danger/30 hover:bg-danger/30",
      icon: AlertTriangle,
      label: "High bias risk in interview",
    },
  };

  const config = configs[normalizedLevel] || configs.Low;
  const Icon = config.icon;

  return (
    <Badge className={cn("px-3 py-1 text-xs font-bold flex items-center gap-2 rounded-full border", config.color)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  );
}
