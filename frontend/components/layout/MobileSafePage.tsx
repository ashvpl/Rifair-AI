import React from "react";

interface MobileSafePageProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileSafePage({ children, className = "" }: MobileSafePageProps) {
  return (
    <div
      className={`w-full max-w-screen overflow-x-hidden px-4 sm:px-6 lg:px-8 xl:px-12 pt-[calc(56px+env(safe-area-inset-top)+12px)] pb-[calc(60px+env(safe-area-inset-bottom)+24px)] lg:pt-8 lg:pb-12 ${className}`}
    >
      <div className="w-full max-w-full lg:max-w-7xl xl:max-w-[1400px] mx-auto">
        {children}
      </div>
    </div>
  );
}
