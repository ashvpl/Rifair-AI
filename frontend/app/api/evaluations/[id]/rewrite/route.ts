import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { BACKEND_URL } from '@/lib/server-config';
import { getBackendToken, extractBearerToken } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const supabase = getSupabaseAdmin();
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

    // Forward client token if present; fall back to server-side auth()
    const incomingToken = extractBearerToken(req);
    const token = await getBackendToken("EVAL_REWRITE", incomingToken);

    if (!token) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const backendUrl = BACKEND_URL;
    
    // Call backend AI Gateway
    const aiResponse = await fetch(`${backendUrl}/api/ai/rewrite-question`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, previousRewrite }),
    });

    if (!aiResponse.ok) throw new Error("AI Rewrite failed on backend");
    const data = await aiResponse.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[AUTH API] EVAL REWRITE PROXY Error:", error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
