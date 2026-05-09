"use client";

import { AILoader } from "@/components/ui/ai-loader";

interface LoadingStateProps {
  text?: string | undefined;
}

export function LoadingState({ text }: LoadingStateProps) {
  return <AILoader text={text} />;
}
