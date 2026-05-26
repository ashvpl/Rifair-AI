import React from "react";
import { cn } from "@/lib/utils";

interface ResultSectionProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function ResultSection({
  title,
  icon: Icon,
  children,
  className,
  titleClassName,
}: ResultSectionProps) {
  return (
    <div className={cn("space-y-3 w-full max-w-full break-words", className)}>
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-neutral-500 flex-shrink-0" />}
          <h3
            className={cn(
              "font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400",
              titleClassName
            )}
          >
            {title}
          </h3>
        </div>
      )}
      <div className="font-sans text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
        {children}
      </div>
    </div>
  );
}
