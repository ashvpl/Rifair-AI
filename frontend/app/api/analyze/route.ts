import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, name } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    const token = await getToken();
    console.log(`Proxying request to backend: ${BACKEND_URL}/api/analyze`);

    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
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
