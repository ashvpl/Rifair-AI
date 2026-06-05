import type { Metadata } from "next";

/**
 * Metadata for the Bias Analysis tool page.
 * Page is behind authentication — robots: noindex is inherited from parent dashboard layout.
 * Title is provided for browser tab and logged-in user experience.
 */
export const metadata: Metadata = {
  title: "AI Hiring Analysis Tool | Rifair AI",
  description:
    "Analyze interview questions, job descriptions, and hiring workflows for bias, structure, clarity, and recruitment quality using Rifair AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
