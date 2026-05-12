import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { userId } = await auth()

  const {
    full_name,
    work_email,
    company,
    subject,
    message
  } = await req.json()

  // Basic validation
  if (!full_name || !work_email || 
      !subject || !message) {
    return NextResponse.json(
      { error: 'All required fields must be filled' },
      { status: 400 }
    )
  }

  try {
    // 1. Save to Supabase
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        full_name,
        work_email,
        company,
        subject,
        message,
        user_id: userId ?? null,
        status: 'open'
      })
      .select('id')
      .single()

    if (error) throw error

    // 2. Send notification email to team
    await resend.emails.send({
      from: 'Rifair AI <hello@rifairai.com>',
      to: 'rifairaiteam@gmail.com',
      subject: `[Support] ${subject} — from ${full_name}`,
      html: `
        <div style="font-family:sans-serif;
                    max-width:600px;margin:0 auto">
          <div style="background:#0a3d2e;padding:20px;
                      border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">
              New Support Ticket
            </h2>
            <p style="color:rgba(255,255,255,0.6);
                      margin:4px 0 0;font-size:13px">
              Ticket ID: ${ticket.id.slice(0, 8)}
            </p>
          </div>
          <div style="background:#f9fafb;padding:24px;
                      border:1px solid #e5e7eb;
                      border-top:none;
                      border-radius:0 0 8px 8px">
            <table style="width:100%;
                          border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;
                           color:#6b7280;
                           font-size:12px;
                           width:120px">Name</td>
                <td style="padding:8px 0;
                           font-weight:500">
                  ${full_name}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;
                           color:#6b7280;
                           font-size:12px">Email</td>
                <td style="padding:8px 0">
                  <a href="mailto:${work_email}">
                    ${work_email}
                  </a>
                </td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding:8px 0;
                           color:#6b7280;
                           font-size:12px">Company</td>
                <td style="padding:8px 0">
                  ${company}
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:8px 0;
                           color:#6b7280;
                           font-size:12px">Subject</td>
                <td style="padding:8px 0;
                           font-weight:500">
                  ${subject}
                </td>
              </tr>
            </table>
            <div style="margin-top:16px;
                        padding:16px;
                        background:white;
                        border:1px solid #e5e7eb;
                        border-radius:8px">
              <p style="font-size:12px;
                        color:#6b7280;
                        margin:0 0 8px">Message</p>
              <p style="margin:0;line-height:1.6;
                        color:#374151">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <div style="margin-top:16px">
              <a href="mailto:${work_email}?subject=Re: ${subject}"
                 style="background:#0a3d2e;
                        color:white;
                        padding:10px 20px;
                        border-radius:6px;
                        text-decoration:none;
                        font-size:13px;
                        font-weight:500">
                Reply to ${full_name} →
              </a>
            </div>
          </div>
        </div>
      `
    })

    // 3. Send confirmation to user
    await resend.emails.send({
      from: 'Rifair AI <hello@rifairai.com>',
      to: work_email,
      subject: `We received your message — Rifair AI`,
      html: `
        <div style="font-family:sans-serif;
                    max-width:600px;margin:0 auto">
          <div style="background:#0a3d2e;padding:20px;
                      border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">
              Got your message ✓
            </h2>
          </div>
          <div style="background:#f9fafb;padding:24px;
                      border:1px solid #e5e7eb;
                      border-top:none;
                      border-radius:0 0 8px 8px">
            <p style="color:#374151">
              Hi ${full_name},
            </p>
            <p style="color:#374151;line-height:1.6">
              Thanks for reaching out. We've received 
              your message about <strong>${subject}</strong>
              and will get back to you within 24 hours.
            </p>
            <p style="color:#374151;line-height:1.6">
              If your issue is urgent, you can also 
              reply directly to this email.
            </p>
            <p style="color:#6b7280;font-size:13px;
                      margin-top:24px">
              — Rifair AI Team<br>
              rifairaiteam@gmail.com
            </p>
          </div>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      ticketId: ticket.id.slice(0, 8)
    })

  } catch (err: any) {
    console.error('[Support ticket error]', err)
    return NextResponse.json(
      { error: 'Failed to submit. Please email us directly.' },
      { status: 500 }
    )
  }
}
