import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import {
  getPersonalisedPromptAdjustments,
  serialiseAdjustments,
} from "@/lib/intelligence/personalisation-engine";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    console.log(`[FRONTEND KIT] User: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const token = await getToken({ template: "backend" }).catch(() => getToken());

    // ── Layer 3: Fetch personalisation adjustments (non-blocking on failure) ──
    const adjustments = await getPersonalisedPromptAdjustments(userId);
    const personalisationHeader = serialiseAdjustments(adjustments);

    console.log(`[Proxy] Generating kit via: ${BACKEND_URL}/api/generate-kit`);

    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
    if (personalisationHeader) {
      backendHeaders["X-Personalisation"] = personalisationHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/generate-kit`, {
      method: "POST",
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    let data;
    const rawText = await response.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[FRONTEND KIT] Backend error (non-JSON):", rawText.substring(0, 300));
      return NextResponse.json(
        { error: `Backend Error (${response.status}): ${rawText.substring(0, 100)}` },
        { status: response.status || 502 }
      );
    }

    if (!response.ok) {
      console.error("[FRONTEND KIT] Backend Error:", data);
      return NextResponse.json(
        { error: data.error || data.message || "Failed... backend responded with error" },
        { status: response.status }
      );
    }

    console.log("[FRONTEND KIT] Success!");

    // ── Layer 1: Track kit generated event (fire-and-forget) ───────────────
    fetch("/api/intelligence/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event: "kit.generated",
        properties: {
          role:             body.role ?? null,
          experience_level: body.experience_level ?? null,
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

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[FRONTEND KIT] Proxy error:", errorMessage);
    return NextResponse.json(
      { error: `Connection failed: ${errorMessage}. Check backend URL configuration.` },
      { status: 500 }
    );
  }
}
