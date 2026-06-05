import type { Metadata } from "next";

/**
 * Metadata for the Candidate Evaluations page.
 * Page is behind authentication — robots: noindex is inherited from parent dashboard layout.
 * Title is provided for browser tab and logged-in user experience.
 */
export const metadata: Metadata = {
  title: "Candidate Evaluations | Rifair AI",
  description:
    "Create structured candidate evaluations and hiring scorecards to compare applicants fairly and consistently.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EvaluationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
