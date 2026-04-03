"use client";
import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const SpotlightBackground = () => {
  const [isMoving, setIsMoving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery movement
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 150 });

  useEffect(() => {
    setIsHydrated(true);
    let moveTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsMoving(true);

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(moveTimeout);
    };
  }, [mouseX, mouseY]);

  if (!isHydrated) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Outer Glow - Neutral */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: isMoving ? "400px" : "600px",
          height: isMoving ? "400px" : "600px",
          background: "radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 50%, transparent 80%)",
          filter: "blur(90px)",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />
      {/* Intense Core - Neutral */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: isMoving ? "150px" : "200px",
          height: isMoving ? "150px" : "200px",
          background: "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
    </div>
  );
};

export default SpotlightBackground;
