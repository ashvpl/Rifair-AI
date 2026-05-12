import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { neutral_question } = await req.json();

    if (!neutral_question) {
      return NextResponse.json({ error: "neutral_question is required." }, { status: 400 });
    }

    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("SIMULATE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/ai/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ neutral_question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Backend simulation failed" }));
      throw new Error(errorData.error || "Backend simulation failed");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error: any) {
    console.error("[AUTH API] Simulation Proxy Error:", error.message);
    return NextResponse.json({ error: "Failed to run simulation." }, { status: 500 });
  }
}
