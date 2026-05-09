import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { env } from '@/lib/env';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: evalId } = await params;
    const { question, previousRewrite } = await req.json();

    // Verify ownership
    const { data: evalRecord, error: fetchErr } = await supabase
      .from('custom_evaluations')
      .select('user_id, plan_tier')
      .eq('id', evalId)
      .single();

    if (fetchErr || !evalRecord) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    if (evalRecord.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const backendUrl = env.BACKEND_URL;
    
    // Call backend AI Gateway
    const aiResponse = await fetch(`${backendUrl}/api/ai/rewrite-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, previousRewrite }),
    });

    if (!aiResponse.ok) throw new Error("AI Rewrite failed on backend");
    const data = await aiResponse.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[REWRITE PROXY] Error:", error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
