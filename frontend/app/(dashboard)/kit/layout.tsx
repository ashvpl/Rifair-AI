import type { Metadata } from "next";

/**
 * Metadata for the Interview Kit Generator tool page.
 * Page is behind authentication — robots: noindex is inherited from parent dashboard layout.
 * Title is provided for browser tab and logged-in user experience.
 */
export const metadata: Metadata = {
  title: "Interview Kit Generator | Rifair AI",
  description:
    "Generate complete interview kits with questions, rubrics, evaluation criteria, and scorecards for any role.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
