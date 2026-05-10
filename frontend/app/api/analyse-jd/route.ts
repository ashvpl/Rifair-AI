import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const token = await getToken({ template: "backend" });

    console.log(`[FRONTEND JD-ANALYSER] Proxying for userId: ${userId}`);

    const response = await fetch(`${BACKEND_URL}/api/analyze/jd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let data: any;
    const rawText = await response.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[FRONTEND JD-ANALYSER] Non-JSON backend response:", rawText.substring(0, 300));
      return NextResponse.json(
        { error: `Backend error (${response.status}): ${rawText.substring(0, 120)}` },
        { status: response.status || 502 }
      );
    }

    if (!response.ok) {
      console.error("[FRONTEND JD-ANALYSER] Backend error:", data);
      return NextResponse.json(
        { error: data.error || data.message || "Analysis failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[FRONTEND JD-ANALYSER] Proxy error:", msg);
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 500 }
    );
  }
}
