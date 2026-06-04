"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReportById } from "@/lib/api";
import { safeParseReport } from "@/lib/utils";
import { JDAnalysisResult } from "@/components/jd/JDAnalysisResult";
import { JDGeneratorResult } from "@/components/jd/JDGeneratorResult";
import { LoadingState } from "@/components/LoadingState";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackendToken } from "@/hooks/useBackendToken";

export default function JDReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoaded, userId } = useAuth();
  const { getAuthToken } = useBackendToken();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReport() {
      if (!isLoaded || !userId) return;
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) return;
        const data = await getReportById(id, token);
        if (data.report) {
          const rawReport = data.report;
          const parsed = safeParseReport(rawReport);
          const categories = parsed.categories || {};

          // Reliably detect analysis_type from all possible storage locations:
          // 1. Inside the categories JSON blob (new reports)
          // 2. At the top-level DB row (some older reports)
          // 3. From input_text prefix (fallback for legacy reports)
          const analysisType =
            categories.analysis_type ||
            rawReport.analysis_type ||
            (rawReport.input_text?.startsWith('JD Generated') ? 'jd_generated' : null) ||
            (rawReport.input_text?.startsWith('JD Analysis') ? 'jd_analysis' : null) ||
            (rawReport.input_text?.startsWith('Job Description Analysis') ? 'jd_analysis' : null);

          setResult({ ...categories, analysis_type: analysisType });
        } else {
          setError("Report not found");
        }
      } catch (err) {
        console.error("Failed to load JD report:", err);
        setError("Failed to load report details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [id, isLoaded, userId, getAuthToken]);

  if (isLoading) return <div className="py-20"><LoadingState text="Loading" /></div>;
  if (error || !result) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertTriangle className="w-12 h-12 text-red-500 opacity-50" />
      <h2 className="text-xl font-bold">{error || "Report not found"}</h2>
      <Link href="/jd-analyser" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Job Descriptions
      </Link>
    </div>
  );

  const isGenerated = result.analysis_type === 'jd_generated';

  return (
    <div className="max-w-5xl mx-auto pt-2 pb-20 px-0 animate-in fade-in duration-700">
      {isGenerated ? (
        <JDGeneratorResult
          result={result}
          reportId={id}
          onReset={() => router.push('/jd-analyser')}
        />
      ) : (
        <JDAnalysisResult
          result={result}
          reportId={id}
          onReset={() => router.push('/jd-analyser')}
        />
      )}
    </div>
  );
}
