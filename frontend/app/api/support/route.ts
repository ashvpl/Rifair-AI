import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  try {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('[Support] RESEND_API_KEY is missing in environment variables.')
      return NextResponse.json(
        { error: 'Email service configuration missing. Please contact support@rifairai.com directly.' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const resend = new Resend(resendApiKey)

    const {
      full_name,
      work_email,
      company,
      subject,
      message
    } = await req.json()

    // Basic validation
    if (!full_name || !work_email || !subject || !message) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // 1. Save to Supabase for record keeping
    const { data: ticket, error: dbError } = await supabase
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

    if (dbError) throw dbError

    const logoUrl = 'https://rifairai.com/rifair-logo.png'

    // 2. Send notification email to your team
    await resend.emails.send({
      from: 'Rifair AI <support@rifairai.com>',
      to: 'rifairaiteam@gmail.com',
      subject: `[Support Ticket] ${subject} — ${full_name}`,
      html: `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; color: #1f2937;">
          <div style="background:#000000; padding:32px 24px; border-radius:12px 12px 0 0; text-align: center;">
            <img src="${logoUrl}" alt="Rifair AI" style="height: 40px; margin-bottom: 16px;">
            <h2 style="color:white; margin:0; font-size: 24px; letter-spacing: -0.025em;">New Support Request</h2>
            <p style="color:rgba(255,255,255,0.7); margin:8px 0 0; font-size:14px">
              Ticket ID: ${ticket.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div style="background:#ffffff; padding:32px 24px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <table style="width:100%; border-collapse:collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding:12px 0; color:#6b7280; font-size:13px; width:100px; border-bottom: 1px solid #f3f4f6;">From</td>
                <td style="padding:12px 0; font-weight:600; border-bottom: 1px solid #f3f4f6;">${full_name}</td>
              </tr>
              <tr>
                <td style="padding:12px 0; color:#6b7280; font-size:13px; border-bottom: 1px solid #f3f4f6;">Email</td>
                <td style="padding:12px 0; border-bottom: 1px solid #f3f4f6;">
                  <a href="mailto:${work_email}" style="color: #000000; text-decoration: none; font-weight: 500;">${work_email}</a>
                </td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding:12px 0; color:#6b7280; font-size:13px; border-bottom: 1px solid #f3f4f6;">Company</td>
                <td style="padding:12px 0; border-bottom: 1px solid #f3f4f6;">${company}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0; color:#6b7280; font-size:13px; border-bottom: 1px solid #f3f4f6;">Subject</td>
                <td style="padding:12px 0; font-weight:600; border-bottom: 1px solid #f3f4f6;">${subject}</td>
              </tr>
            </table>
            
            <div style="padding:20px; background:#f9fafb; border-radius:8px; margin-bottom: 24px;">
              <p style="font-size:12px; font-weight: 700; color:#9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin:0 0 12px">Message Content</p>
              <p style="margin:0; line-height:1.6; color:#374151; font-size: 15px;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>

            <div style="text-align: center;">
              <a href="mailto:${work_email}?subject=Re: ${subject}"
                 style="display: inline-block; background:#000000; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-size:15px; font-weight:600; transition: background 0.2s;">
                Reply to Client
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Rifair AI. Sent via Internal Support System.
          </div>
        </div>
      `
    })

    // 3. Send confirmation to user (the premium feel)
    await resend.emails.send({
      from: 'Rifair AI Support <support@rifairai.com>',
      to: work_email,
      subject: `We've received your message — Rifair AI`,
      html: `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; color: #1f2937;">
          <div style="background:#000000; padding:40px 24px; border-radius:12px 12px 0 0; text-align: center;">
            <img src="${logoUrl}" alt="Rifair AI" style="height: 40px; margin-bottom: 20px;">
            <h2 style="color:white; margin:0; font-size: 24px; letter-spacing: -0.025em;">Request Received</h2>
          </div>
          <div style="background:#ffffff; padding:40px 32px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 12px 12px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
              Hi ${full_name.split(' ')[0]},
            </p>
            <p style="font-size: 16px; line-height:1.6; color:#4b5563; margin-bottom: 32px;">
              Thank you for reaching out to Rifair AI. We've received your inquiry regarding <strong>${subject}</strong> and our technical team is already reviewing it.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
              <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 600;">
                Expect a response from us within 24 hours.
              </p>
            </div>
            <p style="font-size: 14px; color:#9ca3af; margin-bottom: 8px;">
              Best regards,
            </p>
            <p style="font-size: 16px; font-weight: 700; color:#000000; margin: 0;">
              The Rifair AI Team
            </p>
          </div>
          <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
            Rifair AI — Advanced Bias Analysis for the Future of Enterprise.<br>
            <a href="https://rifairai.com" style="color: #9ca3af; text-decoration: underline;">rifairai.com</a>
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
