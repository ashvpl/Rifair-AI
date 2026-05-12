import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";
import { BACKEND_URL } from "@/lib/server-config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Pre-check: ensure user is authenticated before attempting token retrieval
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        error: "Unauthenticated",
        details: "No active session found."
      }, { status: 401 });
    }

    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("BIAS_SESSION", incomingToken);

    if (!token) {
      return NextResponse.json({ 
        error: "Unauthenticated", 
        details: "Your session could not be verified. Please sign in again." 
      }, { status: 401 });
    }
    
    console.log(`[Proxy] Fetching bias session from: ${BACKEND_URL}/api/bias-session`);

    const response = await fetch(`${BACKEND_URL}/api/bias-session`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
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
      console.error("Backend bias-session error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[AUTH API] Bias Session API Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
