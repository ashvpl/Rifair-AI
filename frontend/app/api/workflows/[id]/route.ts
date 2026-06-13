import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BACKEND_URL } from "@/lib/server-config";
import { getBackendToken, extractBearerToken } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomingToken = extractBearerToken(request);
    const token = await getBackendToken("WORKFLOW_GET_BY_ID", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    console.log(`[Proxy] Fetching workflow detail from: ${BACKEND_URL}/api/workflows/${id}`);

    const response = await fetch(`${BACKEND_URL}/api/workflows/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[Proxy] Backend returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend fetch workflow detail error:", data);
      return NextResponse.json({ error: data.error || "Failed to fetch workflow details" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Workflow details GET Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomingToken = extractBearerToken(request);
    const token = await getBackendToken("WORKFLOW_DELETE_BY_ID", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    console.log(`[Proxy] Deleting workflow via: ${BACKEND_URL}/api/workflows/${id}`);

    const response = await fetch(`${BACKEND_URL}/api/workflows/${id}`, {
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
      console.error(`[Proxy] Backend returned non-JSON response (${response.status}):`, text.slice(0, 200));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` }, 
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend delete workflow error:", data);
      return NextResponse.json({ error: data.error || "Failed to delete workflow" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Workflow DELETE Proxy error:", errorMessage);
    return NextResponse.json({ error: `Internal Proxy Error: ${errorMessage}` }, { status: 500 });
  }
}
