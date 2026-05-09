import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { scores, notes } = body;

    // We try to update custom_evaluations
    const { error: customError } = await supabase
      .from("custom_evaluations")
      .update({
        draft_scores: scores,
        draft_notes: notes,
        current_step: "scoring",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (customError) {
      console.error("[AUTOSAVE] Custom eval update failed:", customError);
      return NextResponse.json({ error: "Failed to autosave" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[AUTOSAVE] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
