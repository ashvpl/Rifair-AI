import { NextResponse } from "next/server";
import { runRealTimePipeline } from "@/lib/engine";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    // Run extremely fast rule-based only pipeline
    const fastResponse = runRealTimePipeline(text);

    return NextResponse.json({ result: fastResponse }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}
