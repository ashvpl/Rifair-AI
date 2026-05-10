import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

/**
 * GET /api/kit-audit/[id]
 * Proxy to backend: fetches a saved kit audit report.
 * Returns full audit data; paid-only fields are null for free users.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "backend" });
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/kit-audit/${id}`, {
      method:  "GET",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
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
        { error: data.error || "Failed to load audit" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[KIT-AUDIT GET] Proxy error:", msg);
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 500 }
    );
  }
}
