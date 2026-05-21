"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number; 
  text?: string | undefined;
}

export const AILoader: React.FC<LoaderProps> = ({ size = 180, text = "Loading" }) => {
  // Split into words to properly handle spaces, then re-flatten to characters
  const letters = text.split("");

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
      // No backdrop-blur on mobile — it's extremely GPU-intensive on Android.
      // Use a solid translucent background instead for smooth performance.
      "fixed inset-0 z-[100] flex items-center justify-center ai-loader-overlay",
      isDashboardRoute && "lg:left-72"
    )}>
      <div
        className="relative flex items-center justify-center font-sans select-none"
        style={{ width: size, height: size }}
      >
       
        {letters.map((letter, index) => (
          <span
            key={index}
            className="inline-block text-zinc-900 dark:text-white opacity-60 animate-loaderLetter z-10 font-black tracking-tight"
            style={{
              animationDelay: `${index * 0.1}s`,
              // Explicit width for space characters — inline-block collapses them to 0
              ...(letter === ' ' ? { width: '0.35em', minWidth: '0.35em' } : {}),
            }}
          >
            {/* Replace space with non-breaking space so inline-block renders it */}
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}

        <div
          className="absolute inset-0 rounded-full animate-loaderCircle"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes loaderCircle {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 6px 12px 0 #38bdf8 inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.5),
              0 0 6px 1.8px rgba(0, 93, 255, 0.3);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 6px 12px 0 #60a5fa inset,
              0 12px 6px 0 #0284c7 inset,
              0 24px 36px 0 #005dff inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.5),
              0 0 6px 1.8px rgba(0, 93, 255, 0.3);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 6px 12px 0 #4dc8fd inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.5),
              0 0 6px 1.8px rgba(0, 93, 255, 0.3);
          }
        }

        @keyframes loaderLetter {
          0%,
          100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.2);
          }
          40% {
            opacity: 0.7;
            transform: translateY(0);
          }
        }

        .animate-loaderCircle {
          animation: loaderCircle 5s linear infinite;
        }

        .animate-loaderLetter {
          animation: loaderLetter 3s infinite;
        }
      `}</style>
    </div>
  );
};
