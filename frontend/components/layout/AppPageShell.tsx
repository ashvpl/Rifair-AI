import React from "react";

interface AppPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppPageShell({ children, className = "" }: AppPageShellProps) {
  return (
    <div
      className={`w-full max-w-screen overflow-x-hidden px-4 pt-[calc(56px+env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+16px)] lg:px-8 lg:pt-6 lg:pb-8 ${className}`}
    >
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
