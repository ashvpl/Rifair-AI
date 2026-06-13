import { Metadata } from "next";
import DemoPageClient from "./DemoPageClient";

export const metadata: Metadata = {
  title: "Try Rifair AI Demo | Structured Hiring Workflow Preview",
  description: "Try Rifair AI without signup. Generate a preview hiring workflow with a job description, interview kit, scorecard, bias-aware review, and evaluation guide.",
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
