import React from "react";
import { cn } from "@/lib/utils";

interface ResultHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export default function ResultHeader({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  className,
}: ResultHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.08] w-full max-w-full",
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-neutral-700 dark:text-neutral-300 flex-shrink-0" />}
          <h2 className="font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
            {title}
          </h2>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
