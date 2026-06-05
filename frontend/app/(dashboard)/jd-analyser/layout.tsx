import type { Metadata } from "next";

/**
 * Metadata for the Job Description Analyser tool page.
 * Page is behind authentication — robots: noindex is inherited from parent dashboard layout.
 * Title is provided for browser tab and logged-in user experience.
 */
export const metadata: Metadata = {
  title: "Job Description Analyzer | Rifair AI",
  description:
    "Analyze job descriptions for clarity, bias, inclusivity, and hiring effectiveness with Rifair AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JDAnalyserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
