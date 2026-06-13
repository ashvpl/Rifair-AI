"use client";

import React from "react";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

interface DemoLockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function DemoLockedFeatureModal({
  isOpen,
  onClose,
  featureName,
}: DemoLockedFeatureModalProps) {
  const { isSignedIn } = useAuth();

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white w-full max-w-md p-6 rounded-3xl border border-black/[0.08] shadow-2xl z-10 flex flex-col text-center items-center"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Lock Icon */}
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 mb-4 mt-2">
              <Lock className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">
              Unlock {featureName}
            </h3>

            <p className="text-sm font-semibold text-[#86868B] mb-6 max-w-xs leading-relaxed">
              {isSignedIn
                ? "Access all premium structured hiring features directly from your dashboard."
                : "Create a free account to save workflows, export reports, and evaluate candidates."}
            </p>

            <div className="flex flex-col gap-2 w-full">
              {isSignedIn ? (
                <Link href="/dashboard/workflows/new" className="w-full">
                  <Button className="w-full h-11 bg-black text-white hover:bg-black/90 font-bold rounded-full transition-transform active:scale-98">
                    Open Full Workflow Builder
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up?redirect=/dashboard/workflows/new" className="w-full">
                  <Button className="w-full h-11 bg-black text-white hover:bg-black/90 font-bold rounded-full transition-transform active:scale-98">
                    Create Free Account
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full h-11 text-[#86868B] hover:text-[#1D1D1F] font-bold rounded-full"
              >
                Go back to Demo
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
