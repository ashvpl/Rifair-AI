import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomingToken = extractBearerToken(request);
    const token = await getBackendToken("WORKFLOWS_GENERATE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await request.json();
    console.log(`[Proxy] Generating workflow via: ${BACKEND_URL}/api/workflows/generate`);

    const response = await fetch(`${BACKEND_URL}/api/workflows/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy] Backend returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend generate workflow error:", data);
      return NextResponse.json({ error: data.error || "Failed to generate workflow", details: data.details, code: data.code, upgradeUrl: data.upgradeUrl }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Workflows generate Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
