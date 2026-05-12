import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    console.log(`[FRONTEND EVALUATE] User: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("EVALUATE_CANDIDATE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    console.log(`[Proxy] Evaluating candidate via: ${BACKEND_URL}/api/evaluate-candidate`);

    const response = await fetch(`${BACKEND_URL}/api/evaluate-candidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    let data;
    const rawText = await response.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[FRONTEND EVALUATE] Backend error (non-JSON):", rawText.substring(0, 300));
      return NextResponse.json(
        { error: `Backend Error (${response.status}): ${rawText.substring(0, 100)}` },
        { status: response.status || 502 }
      );
    }

    if (!response.ok) {
      console.error("[FRONTEND EVALUATE] Backend Error:", data);
      return NextResponse.json(
        { error: data.error || data.message || "Failed... backend responded with error" },
        { status: response.status }
      );
    }

    console.log("[FRONTEND EVALUATE] Success!");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[AUTH API] Evaluate Candidate Proxy error:", errorMessage);
    return NextResponse.json(
      { error: `Connection failed: ${errorMessage}. Check backend URL configuration.` },
      { status: 500 }
    );
  }
}
