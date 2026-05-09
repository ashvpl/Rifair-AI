"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** Max height fraction of viewport, default 0.85 */
  maxHeightFraction?: number;
  /** If true, clicking backdrop doesn't close. Useful for destructive confirmations */
  disableBackdropClose?: boolean;
  className?: string;
}

/**
 * Premium mobile bottom sheet with spring animation.
 * On md+ screens renders as a centered dialog instead.
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  maxHeightFraction = 0.85,
  disableBackdropClose = false,
  className,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bs-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={disableBackdropClose ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[200] md:flex md:items-center md:justify-center"
          >
            {/* Desktop: centered card */}
            <motion.div
              key="bs-desktop-card"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "hidden md:block bg-white rounded-[2rem] shadow-[0_32px_80px_rgba(0,0,0,0.18)] w-full max-w-[440px] mx-4 overflow-hidden",
                className
              )}
            >
              {title && (
                <div className="px-7 pt-7 pb-0">
                  <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">{title}</h2>
                </div>
              )}
              <div className="px-7 py-6">{children}</div>
            </motion.div>
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            key="bs-panel"
            ref={panelRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: `${maxHeightFraction * 100}dvh` }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[201] md:hidden",
              "bg-white rounded-t-[28px]",
              "shadow-[0_-8px_40px_rgba(0,0,0,0.15)]",
              "overflow-y-auto overscroll-contain",
              "-webkit-overflow-scrolling: touch",
              className
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
              <div className="w-10 h-1.5 bg-neutral-200 rounded-full" />
            </div>

            {title && (
              <div className="px-6 pt-3 pb-0">
                <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">{title}</h2>
              </div>
            )}

            <div className="px-6 py-5" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
