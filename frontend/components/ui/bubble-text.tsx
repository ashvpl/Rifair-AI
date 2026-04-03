"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BubbleTextProps {
  text: string;
  className?: string;
  childClassName?: string;
  hoverClassName?: string;
  neighborClassName?: string;
}

export const BubbleText = ({ 
  text, 
  className,
  childClassName,
  hoverClassName = "font-black text-black scale-110",
  neighborClassName = "font-bold opacity-80 scale-105"
}: BubbleTextProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn("flex flex-wrap items-center justify-center cursor-default", className)}
    >
      {text.split("").map((char, idx) => {
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;
        
        let dynamicClasses = "";
        
        switch (distance) {
          case 0:
            dynamicClasses = hoverClassName;
            break;
          case 1:
            dynamicClasses = neighborClassName;
            break;
          case 2:
            dynamicClasses = "opacity-60";
            break;
          default:
            break;
        }

        return (
          <span
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            className={cn("transition-all duration-300 ease-in-out", childClassName, dynamicClasses)}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </div>
  );
};
