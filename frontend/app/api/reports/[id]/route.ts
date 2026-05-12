import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const token = await getToken({ template: "backend" }).catch(() => getToken());
    console.log(`[Proxy] Fetching report ${id} from: ${BACKEND_URL}/api/reports/${id}`);

    const response = await fetch(`${BACKEND_URL}/api/reports/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });

    // Safely attempt to parse JSON
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy] Backend single report returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend single report fetch error:", data);
      return NextResponse.json({ error: data.error || "Report not found" }, { status: response.status });
    }

    // Backend already returns { report: ... data ... }
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Report API Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const token = await getToken({ template: "backend" }).catch(() => getToken());
    console.log(`[Proxy] Deleting report ${id} via: ${BACKEND_URL}/api/reports/${id}`);

    const response = await fetch(`${BACKEND_URL}/api/reports/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy] Backend report delete returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend report delete error:", data);
      return NextResponse.json({ error: data.error || "Failed to delete report" }, { status: response.status });
    }

    return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Report Delete Proxy API error:", errorMessage);
    return NextResponse.json({ error: `Internal Delete Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const token = await getToken({ template: "backend" }).catch(() => getToken());

    const response = await fetch(`${BACKEND_URL}/api/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy] Backend report update returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to update report" }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Report Update Proxy API error:", errorMessage);
    return NextResponse.json({ error: `Internal Update Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
