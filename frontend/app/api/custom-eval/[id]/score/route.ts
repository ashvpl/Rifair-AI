import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";
import { BACKEND_URL } from "@/lib/server-config";

/**
 * POST /api/custom-eval/[id]/score
 * Proxy to backend: submits scores and runs AI evaluation.
 * Accepts { scores, role, experience, companyType, candidateName? }
 * Returns { evaluation } — same shape as /api/evaluate-candidate
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body  = await req.json();
    
    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("CUSTOM_EVAL_SCORE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/custom-eval/${id}/score`, {
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
      console.error("Backend returned error:", data);
      return NextResponse.json(
        { error: data.error || "Evaluation failed", message: data.message },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[AUTH API] CUSTOM-EVAL SCORE Proxy error:", msg);
    return NextResponse.json({ error: `Connection failed: ${msg}` }, { status: 500 });
  }
}
