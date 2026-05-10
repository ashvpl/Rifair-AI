import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

/**
 * POST /api/custom-eval
 * Proxy to backend: creates a custom evaluation session.
 * Accepts { title, questions: string[], candidateName?, role? }
 * Returns { id, questions (enriched), biasResults, hasHighBias, planId, remaining }
 */
export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body  = await req.json();
    const token = await getToken({ template: "backend" });

    const response = await fetch(`${BACKEND_URL}/api/custom-eval`, {
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
          error: data.error || "Failed to create evaluation session",
          message: data.message,
          flaggedQuestions: data.flaggedQuestions,
          ...data
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[CUSTOM-EVAL] Proxy error:", msg);
    return NextResponse.json({ error: `Connection failed: ${msg}` }, { status: 500 });
  }
}
