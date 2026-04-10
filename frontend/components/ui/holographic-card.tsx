"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

type BiasLevel = "high" | "medium" | "neutral";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  biasLevel?: BiasLevel;
}

const biasGradients: Record<BiasLevel, string> = {
  high:    "linear-gradient(135deg, rgba(254,202,202,0.55) 0%, rgba(255,255,255,1) 65%)",
  medium:  "linear-gradient(135deg, rgba(253,230,138,0.50) 0%, rgba(255,255,255,1) 65%)",
  neutral: "linear-gradient(135deg, rgba(187,247,208,0.55) 0%, rgba(255,255,255,1) 65%)",
};

const HolographicCard = ({
  children,
  className,
  intensity = 10,
  biasLevel = "neutral",
}: HolographicCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / intensity;
    const rotateY = (centerX - x) / intensity;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
    card.style.setProperty("--bg-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--bg-y", `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    card.style.setProperty("--x", "50%");
    card.style.setProperty("--y", "50%");
    card.style.setProperty("--bg-x", "50%");
    card.style.setProperty("--bg-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("holo-card", className)}
      style={
        {
          "--x": "50%",
          "--y": "50%",
          "--bg-x": "50%",
          "--bg-y": "50%",
          background: biasGradients[biasLevel],
          transition: "transform 0.1s ease, box-shadow 0.3s ease",
          willChange: "transform",
          transformStyle: "preserve-3d",
        } as React.CSSProperties
      }
    >
      {/* Holographic shimmer overlay */}
      <div
        className="holo-shimmer"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(ellipse at var(--bg-x) var(--bg-y),
            rgba(255,150,150,0.30) 0%,
            rgba(150,200,255,0.25) 20%,
            rgba(255,255,180,0.25) 40%,
            rgba(180,255,180,0.25) 60%,
            rgba(255,255,255,0.40) 80%,
            transparent 100%)`,
          mixBlendMode: "screen",
          zIndex: 2,
          transition: "background 0.1s ease",
        }}
      />
      {/* Specular glint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.22) 0%, transparent 55%)`,
          zIndex: 3,
          transition: "background 0.1s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 4 }}>{children}</div>
    </div>
  );
};

export default HolographicCard;
