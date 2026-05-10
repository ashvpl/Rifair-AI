import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PDFRenderService } from '@/lib/pdf-v2/services/PDFRenderService';
import { composeReport } from '@/lib/pdf-v2/services/ReportComposer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE_MAP: Record<string, string> = {
  analysis:   'analysis_reports',
  jd:         'analysis_reports',
  kit:        'analysis_reports',
  audit:      'kit_audits',
  evaluation: 'candidate_evaluations'
};

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const pdfService = new PDFRenderService();
    
    // 1. Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, id } = body as { type: string; id: string };

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    // 2. Subscription/Plan Enforcement
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .single();

    const planId = sub?.plan_id || 'free';
    const isPremium = ['growth', 'enterprise', 'starter'].includes(planId) || process.env.NODE_ENV === 'development';

    if (!isPremium) {
      return NextResponse.json({
        error: 'REQUIRES_PREMIUM',
        message: 'PDF export requires a Growth or Enterprise plan.',
        upgradeUrl: '/pricing?reason=pdf_export',
      }, { status: 403 });
    }

    // 3. Data Retrieval with Fallbacks
    const table = TABLE_MAP[type];
    if (!table) return NextResponse.json({ error: `Invalid report type: ${type}` }, { status: 400 });

    let { data: rawData, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    // Fallback logic for specialized reports (Audits, Evaluations)
    if ((fetchError || !rawData) && type === 'audit') {
      const { data: historyRow } = await supabase.from('analysis_reports').select('*').eq('id', id).single();
      if (historyRow) {
        // Option A: It's an AI-generated kit with internal bias check
        if (historyRow.categories?.analysis_type === 'kit') {
          rawData = historyRow;
          fetchError = null;
        } 
        // Option B: It's a history record pointing to a standalone audit
        else if (historyRow.categories?.audit_id) {
          const { data: realAudit } = await supabase.from('kit_audits').select('*').eq('id', historyRow.categories.audit_id).single();
          if (realAudit) { rawData = realAudit; fetchError = null; }
        }
      }
    }

    if ((fetchError || !rawData) && type === 'evaluation') {
      const { data: customData } = await supabase.from('custom_evaluations').select('*').eq('id', id).single();
      if (customData) { rawData = customData; fetchError = null; }
      else {
        const { data: analysisData } = await supabase.from('analysis_reports').select('*').eq('id', id).single();
        if (analysisData) { rawData = { ...analysisData, ...analysisData.categories }; fetchError = null; }
      }
    }

    if (fetchError || !rawData) {
      return NextResponse.json({ error: 'Report data not found' }, { status: 404 });
    }

    // 4. Fetch User Profile for Branding
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, organization_name, company_name')
      .eq('clerk_user_id', userId)
      .single();

    // 5. Orchestrate: Normalization → Validation → Composition
    const composition = await composeReport(type, rawData, profile || {});

    if (!composition.canRender) {
      console.error('[PDF Orchestrator] Composition failed:', composition.errors);
      return NextResponse.json({ 
        error: 'COMPOSITION_FAILED', 
        message: 'Report content is insufficient for PDF generation.',
        details: composition.errors 
      }, { status: 422 });
    }

    // 6. Execute Render (Headless Browser)
    const result = await pdfService.render({
      templateName: composition.templateName,
      data: composition.schema,
      quality: 'premium'
    });

        const formalType = type === 'jd' ? 'JD Audit' : 
                         type === 'analysis' ? 'Bias Analysis' :
                         type === 'kit' ? 'Interview Kit' :
                         type === 'audit' ? 'Kit Audit' :
                         type === 'evaluation' ? 'Candidate Evaluation' :
                         type.charAt(0).toUpperCase() + type.slice(1);
        
        const filename = `Rifair ${formalType} Report ${composition.schema.meta.reportId.split('-')[1] || id.slice(0, 4)}.pdf`;

        return new NextResponse(new Uint8Array(result.buffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Report-ID': composition.schema.meta.reportId,
        'X-Page-Count': result.pageCount.toString(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (err: any) {
    console.error('[PDF API] Unhandled Exception:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
