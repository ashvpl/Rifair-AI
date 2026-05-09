import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { z } from 'zod';
import { BACKEND_URL } from '@/lib/server-config';

const regenerateSchema = z.object({
  questionIndex: z.number().min(0).max(19),
  action: z.enum(['single', 'full']),
  focus: z.enum(['technical', 'behavioral', 'simplified', 'probing', 'role_specific']).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: kitId } = await params;
    const body = await req.json();
    const parsed = regenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { questionIndex, action, focus } = parsed.data;

    // 1. Get kit and verify ownership
    const { data: report, error: kitErr } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('id', kitId)
      .eq('user_id', userId)
      .single();

    if (kitErr || !report) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    const categories = typeof report.categories === 'string' ? JSON.parse(report.categories) : report.categories;
    const kit = categories.kit_data;

    if (action === 'single') {
      const questions = kit.questions;
      const targetQ = questions[questionIndex];

      if (!targetQ) {
        return NextResponse.json({ error: 'Question not found' }, { status: 400 });
      }

      const backendUrl = BACKEND_URL;
      
      // Call backend AI Gateway
      const aiResponse = await fetch(`${backendUrl}/api/ai/kit/regenerate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: categories.inputs?.role || 'Candidate',
          experience: categories.inputs?.experience_level || 'mid',
          companyType: categories.inputs?.company_type || 'tech',
          industry: categories.inputs?.industry || 'general',
          originalQuestion: targetQ,
          focus,
          exclude: questions.map((q: any) => q.question)
        }),
      });

      if (!aiResponse.ok) throw new Error("AI Regeneration failed on backend");
      const newQuestion = await aiResponse.json();

      // Update questions array
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex] = {
        ...newQuestion,
        id: targetQ.id || questionIndex + 1,
        regenerated: true,
        originalVersion: targetQ.question,
        regenerationCount: (targetQ.regenerationCount || 0) + 1,
        focusUsed: focus || null
      };

      // Save to DB
      kit.questions = updatedQuestions;
      kit.regeneration_count = (kit.regeneration_count || 0) + 1;
      categories.kit_data = kit;

      await supabase.from('analysis_reports').update({ categories }).eq('id', kitId);

      return NextResponse.json({
        question: updatedQuestions[questionIndex],
        questionIndex,
        regenerationCount: kit.regeneration_count,
        focus
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("[KIT REGEN PROXY] Error:", error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
