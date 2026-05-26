import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveResultCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveResultCard({ children, className }: ResponsiveResultCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-full rounded-xl sm:rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
