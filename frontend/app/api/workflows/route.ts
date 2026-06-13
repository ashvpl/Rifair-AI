import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomingToken = extractBearerToken(request);
    const token = await getBackendToken("WORKFLOWS_GET", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    console.log(`[Proxy] Fetching workflows from: ${BACKEND_URL}/api/workflows`);

    const response = await fetch(`${BACKEND_URL}/api/workflows`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
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
      console.error("Backend list workflows error:", data);
      return NextResponse.json({ error: data.error || "Failed to fetch workflows" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Workflows GET Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomingToken = extractBearerToken(request);
    const token = await getBackendToken("WORKFLOWS_POST", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await request.json();
    console.log(`[Proxy] Saving workflow via: ${BACKEND_URL}/api/workflows`);

    const response = await fetch(`${BACKEND_URL}/api/workflows`, {
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
      console.error("Backend save workflow error:", data);
      return NextResponse.json({ error: data.error || "Failed to save workflow" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Workflows POST Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
