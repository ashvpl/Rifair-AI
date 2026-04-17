import { NextResponse } from "next/server";
import { runRealTimePipeline } from "@/lib/engine";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    const fastResponse = runRealTimePipeline(text);

    return NextResponse.json({ result: fastResponse }, { status: 200 });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Realtime proxy error:", error);
    return NextResponse.json(
      { error: `Connection failed: ${errorMessage}. Check backend URL configuration.` },
      { status: 500 }
    );
  }
}
