import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body  = await req.json();
    const token = await getToken({ template: "backend" });
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
    console.error("[KIT-AUDIT REWRITE] Proxy error:", msg);
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 500 }
    );
  }
}
