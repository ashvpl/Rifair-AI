import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBackendToken } from "@/lib/server-auth";
import { BACKEND_URL } from "@/lib/server-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/kit-audit
 * Proxy to backend: runs full bias + structural audit on uploaded questions.
 * Accepts { title?, questions: string[], source?, role? }
 * Returns { id, overallScore, biasBreakdown, structuralAnalysis, ... }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body  = await req.json();
    const token = await getBackendToken("KIT_AUDIT");

    const response = await fetch(`${BACKEND_URL}/api/kit-audit`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: `Backend error (${response.status})` },
        { status: response.status || 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:      data.error      || "Audit failed",
          message:    data.message,
          allowed:    data.allowed,
          currentCount: data.currentCount,
          planId:     data.planId,
          upgradeUrl: data.upgradeUrl,
          flaggedQuestions: data.flaggedQuestions,
          ...data,
        },
        { status: response.status }
      );
    }

    // Fire-and-forget intelligence tracking
    fetch("/api/intelligence/track", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event: "kit_audit.completed",
        properties: {
          question_count: data.questionCount ?? 0,
          flagged_count:  data.flaggedCount  ?? 0,
          overall_score:  data.overallScore  ?? 0,
          plan_tier:      data.planTier      ?? "free",
        },
      }),
    }).catch(() => {});

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[KIT-AUDIT] Proxy error:", msg);
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 500 }
    );
  }
}
