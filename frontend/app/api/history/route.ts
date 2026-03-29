import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    
    console.log(`Proxying history request to: ${backendUrl}/api/reports`);

    const response = await fetch(`${backendUrl}/api/reports`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend history error:", data);
      return NextResponse.json({ error: data.error || "Failed to fetch history" }, { status: response.status });
    }

    // Dashboard expects the array under the 'history' key
    return NextResponse.json({ history: data }, { status: 200 });
  } catch (error: unknown) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
