import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    
    console.log(`[Proxy] Fetching reports from: ${backendUrl}/api/reports`);

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
      return NextResponse.json({ error: data.error || "Failed to fetch reports" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Reports API Proxy error:", error);
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";

    console.log(`[Proxy] Deleting all reports via: ${backendUrl}/api/reports`);

    const response = await fetch(`${backendUrl}/api/reports`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend delete history error:", data);
      return NextResponse.json({ error: data.error || "Failed to delete reports" }, { status: response.status });
    }

    return NextResponse.json({ message: "All reports deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Reports Delete API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
