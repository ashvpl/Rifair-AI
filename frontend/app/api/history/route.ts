import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    
    console.log(`[Proxy] Fetching history from: ${BACKEND_URL}/api/reports`);

    const response = await fetch(`${BACKEND_URL}/api/reports`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });

    // Safely parse JSON — guard against HTML error pages (502, 504, etc.)
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy/history] Backend returned non-JSON (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend history error:", data);
      return NextResponse.json({ error: data.error || "Failed to fetch history" }, { status: response.status });
    }

    // Dashboard expects the array under the 'history' key
    return NextResponse.json({ history: data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("History API error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
