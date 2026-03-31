import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const token = await getToken();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    console.log(`[Proxy] Fetching report ${id} from: ${backendUrl}/api/reports/${id}`);

    const response = await fetch(`${backendUrl}/api/reports/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend single report fetch error:", data);
      return NextResponse.json({ error: data.error || "Report not found" }, { status: response.status });
    }

    return NextResponse.json({ report: data }, { status: 200 });
  } catch (error: unknown) {
    console.error("Report API Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const token = await getToken();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    console.log(`[Proxy] Deleting report ${id} via: ${backendUrl}/api/reports/${id}`);

    const response = await fetch(`${backendUrl}/api/reports/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend report delete error:", data);
      return NextResponse.json({ error: data.error || "Failed to delete report" }, { status: response.status });
    }

    return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Report Delete Proxy API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
