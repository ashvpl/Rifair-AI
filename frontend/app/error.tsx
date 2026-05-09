"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04]"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#1D1D1F] mb-3 tracking-tight">
          Something went wrong
        </h2>
        
        <p className="text-sm text-[#1D1D1F]/60 mb-8 leading-relaxed">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>

        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-[#1D1D1F] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-black transition-colors active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </motion.div>
    </div>
  );
}
