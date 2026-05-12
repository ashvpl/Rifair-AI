import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";
import { BACKEND_URL } from "@/lib/server-config";

/**
 * POST /api/kit-audit/[id]/rewrite
 * Proxy to backend: generates an AI rewrite for a single flagged question.
 * Paid users (Starter+) only.
 * Accepts { questionIndex: number, previousRewrites?: string[], role?: string }
 * Returns { rewrite, competency, type, changeRationale, questionIndex }
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
    const token = await getBackendToken("KIT_AUDIT_REWRITE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/kit-audit/${id}/rewrite`, {
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
          error:      data.error   || "Rewrite failed",
          message:    data.message,
          upgradeUrl: data.upgradeUrl,
          ...data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[AUTH API] KIT-AUDIT REWRITE Proxy error:", msg);
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 500 }
    );
  }
}
