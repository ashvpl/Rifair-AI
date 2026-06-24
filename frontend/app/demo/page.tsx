import { Metadata } from "next";
import DemoPageClient from "./DemoPageClient";

export const metadata: Metadata = {
  title: "Candidate Intelligence Engine Demo | Rifair AI",
  description: "Experience the Candidate Intelligence Engine. Rank 100,000 candidates semantically, detect keyword stuffers, and identify product builders.",
  alternates: {
    canonical: "https://rifairai.com/demo",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DemoPage() {
  return <DemoPageClient />;
}
