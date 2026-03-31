import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    const token = await getToken();
    const backendUrl = API_BASE_URL;
    console.log(`Proxying request to backend: ${backendUrl}/api/analyze`);

    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error:", data);
      return NextResponse.json({ error: data.error || "Backend analysis failed" }, { status: response.status });
    }

    return NextResponse.json({ report: data.report }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analyze API Proxy error:", error);
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}
