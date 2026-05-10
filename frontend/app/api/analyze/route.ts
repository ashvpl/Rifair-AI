import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL, validateBackendConfig } from "@/lib/server-config";
import {
  getPersonalisedPromptAdjustments,
  serialiseAdjustments,
} from "@/lib/intelligence/personalisation-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    validateBackendConfig();
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, name } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    const token = await getToken({ template: "backend" });

    // ── Layer 3: Fetch personalisation adjustments (non-blocking on failure) ──
    const adjustments = await getPersonalisedPromptAdjustments(userId);
    const personalisationHeader = serialiseAdjustments(adjustments);

    console.log(`Proxying request to backend: ${BACKEND_URL}/api/analyze`);

    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
    if (personalisationHeader) {
      backendHeaders["X-Personalisation"] = personalisationHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: backendHeaders,
      body: JSON.stringify({ text, name }),
    });

    let data;
    const rawText = await response.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Backend error (non-JSON):", rawText.substring(0, 300));
      return NextResponse.json(
        { error: `Backend Error (${response.status}): ${rawText.substring(0, 100)}` },
        { status: response.status || 502 }
      );
    }

    if (!response.ok) {
      console.error("Backend error:", data);
      return NextResponse.json(
        { error: data.error || data.message || "Backend analysis failed" },
        { status: response.status }
      );
    }

    // ── Layer 1: Track completion event (fire-and-forget) ──────────────────
    fetch("/api/intelligence/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event: "analysis.completed",
        properties: {
          overall_score:    data.report?.bias_score ?? 0,
          has_personalisation: !!personalisationHeader,
        },
      }),
    }).catch(() => {});

    // ── Layer 2: Async profile rebuild (fire-and-forget) ───────────────────
    fetch("/api/intelligence/rebuild-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});

    return NextResponse.json({ report: data.report }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analyze API Proxy error:", error);
    return NextResponse.json(
      { error: `Connection failed: ${errorMessage}. Check backend URL configuration.` },
      { status: 500 }
    );
  }
}
