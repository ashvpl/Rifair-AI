import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { neutral_question } = await req.json();

    if (!neutral_question) {
      return NextResponse.json({ error: "neutral_question is required." }, { status: 400 });
    }

    const token = await getToken();
    const backendUrl = API_BASE_URL;

    console.log(`[Proxy] Simulating bias via: ${backendUrl}/api/simulate`);

    const response = await fetch(`${backendUrl}/api/simulate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ neutral_question }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend Simulation Error:", data);
      return NextResponse.json({ error: data.error || "Simulation failed" }, { status: response.status });
    }

    return NextResponse.json({ simulation: data.simulation }, { status: 200 });
    
  } catch (error: any) {
    console.error("Simulation API Error:", error);
    return NextResponse.json({ error: "Failed to run simulation." }, { status: 500 });
  }
}
