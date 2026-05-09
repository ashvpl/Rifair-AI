"use client";

import { AILoader } from "@/components/ui/ai-loader";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <AILoader text="Loading" />
    </div>
  );
}
