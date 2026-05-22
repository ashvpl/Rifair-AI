"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number; 
  text?: string | undefined;
}

export const AILoader: React.FC<LoaderProps> = ({ size = 32, text = "Loading" }) => {
  const pathname = usePathname();
  
  // Routes that have the dashboard sidebar (offset required on lg screens)
  const isDashboardRoute = 
    pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/kit") || 
    pathname?.startsWith("/analyze") || 
    pathname?.startsWith("/evaluations") || 
    pathname?.startsWith("/history") || 
    pathname?.startsWith("/jd") || 
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/report") ||
    pathname?.startsWith("/simulate");

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm ai-loader-overlay",
      isDashboardRoute && "lg:left-72"
    )}>
      <Loader2 
        className="animate-spin text-blue-600 dark:text-blue-500 mb-4" 
        size={size} 
      />
      {text && (
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {text}
        </p>
      )}
    </div>
  );
};
