import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    console.log(`[FRONTEND KIT] User: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const token = await getToken();
    console.log(`[Proxy] Generating kit via: ${BACKEND_URL}/api/generate-kit`);

    const response = await fetch(`${BACKEND_URL}/api/generate-kit`, {
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
