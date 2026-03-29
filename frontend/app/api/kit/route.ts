import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    console.log(`[FRONTEND KIT] User: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const token = await getToken();
    
    if (!token) {
      console.error("[FRONTEND KIT] Failed to retrieve Clerk token.");
      return NextResponse.json({ error: "Failed to authenticate with backend." }, { status: 401 });
    }

    // Proxy to Backend Express Server
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    console.log(`[FRONTEND KIT] Proxying to: ${backendUrl}/api/kit`);

    const response = await fetch(`${backendUrl}/api/kit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[FRONTEND KIT] Backend Error:", data);
      return NextResponse.json({ error: data.error || "Failed... backend responded with error" }, { status: response.status });
    }

    console.log("[FRONTEND KIT] Success!");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[FRONTEND KIT] Proxy error:", error.message || error);
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}
