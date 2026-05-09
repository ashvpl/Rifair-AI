import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { neutral_question } = await req.json();

    if (!neutral_question) {
      return NextResponse.json({ error: "neutral_question is required." }, { status: 400 });
    }

    const backendUrl = BACKEND_URL;
    
    // Proxy to backend AI Gateway
    const response = await fetch(`${backendUrl}/api/ai/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass auth if needed (backend should verify token)
      },
      body: JSON.stringify({ neutral_question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Backend simulation failed");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error: any) {
    console.error("Simulation Proxy Error:", error.message);
    return NextResponse.json({ error: "Failed to run simulation." }, { status: 500 });
  }
}
