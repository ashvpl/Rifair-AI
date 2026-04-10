"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidLoaderProps {
  text?: string;
  className?: string;
}

export function LiquidLoader({ className, text = "Loading..." }: LiquidLoaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [heights, setHeights] = React.useState([0, 0, 0, 0, 0, 0, 0]);
  const [droplets, setDroplets] = React.useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const colors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-purple-500",
    "from-cyan-400 to-blue-500",
    "from-green-400 to-cyan-400",
    "from-yellow-400 to-green-400",
    "from-orange-400 to-yellow-400",
    "from-red-500 to-orange-400",
  ];

  React.useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setHeights((prev) =>
        prev.map((height, index) => {
          const maxHeight = 80;
          const delay = index * 0.8;
          const time = Date.now() * 0.001;

          const primaryWave = Math.sin(time + delay);
          const bounceWave = Math.sin(time * 4 + delay) * 0.15;
          const ripple = Math.sin(time * 8 + delay) * 0.05;
          const combinedWave = primaryWave + bounceWave + ripple;

          return maxHeight * combinedWave;
        })
      );

      setDroplets((prev) =>
        prev.map((_, index) => {
          const delay = index * 0.8;
          const time = Date.now() * 0.001;
          const waveValue = Math.sin(time + delay);
          return waveValue > 0.8;
        })
      );
    }, 32);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="flex items-end space-x-4">
        {heights.map((height, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-gradient-to-r mb-3 transition-all duration-500 ease-out",
                colors[index],
                droplets[index] ? "opacity-100" : "opacity-0"
              )}
              style={{
                animationDelay: `${index * 0.2}s`,
                filter: "blur(0.5px)",
                transform: (mounted && droplets[index])
                  ? `translateY(${Math.sin(Date.now() * 0.008 + index * 0.5) * 3}px) scale(${0.8 + Math.sin(Date.now() * 0.006 + index * 0.3) * 0.4})`
                  : "translateY(10px) scale(0.5)",
              }}
            />

            <div
              className={cn(
                "w-10 bg-gradient-to-t rounded-full transition-all duration-200 ease-out relative overflow-hidden shadow-lg",
                colors[index]
              )}
              style={{
                height: `${Math.abs(height)}px`,
                transform: height < 0 ? "scaleY(-1)" : "scaleY(1)",
                transformOrigin: "bottom",
                filter: "blur(0.3px)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-full"
                style={{
                  transform: mounted 
                    ? `translateY(${Math.sin(Date.now() * 0.003 + index * 0.5) * 1}px) scaleY(${0.8 + Math.sin(Date.now() * 0.004 + index * 0.3) * 0.3})`
                    : "translateY(0px) scaleY(1)",
                }}
              />
            </div>

            <div
              className={cn(
                "w-3 h-3 rounded-full bg-gradient-to-r mt-2 transition-all duration-300",
                colors[index]
              )}
              style={{
                opacity: mounted 
                  ? Math.sin(Date.now() * 0.003 + index * 0.9) * 0.4 + 0.6
                  : 0.6,
                transform: mounted 
                  ? `scale(${0.6 + Math.sin(Date.now() * 0.002 + index * 0.6) * 0.4}) translateY(${Math.sin(Date.now() * 0.004 + index * 0.8) * 1}px)`
                  : "scale(0.6) translateY(0px)",
                filter: "blur(0.2px)",
              }}
            />
          </div>
        ))}
      </div>
      {text && (
        <p className="mt-8 text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
