// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const RECIPIENT_EMAIL = "shayanhusein@gmail.com";   

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await resend.emails.send({
      from: "PharmaWallah Contact <noreply@pharmawallah.com>",  
      to: [RECIPIENT_EMAIL],
      replyTo: email,
      subject: `[PharmaWallah] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#16a34a);padding:24px 32px;text-align:center;">
                      <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">💊 PharmaWallah</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Contact Message Received</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;width:80px;">Name</td>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#475569;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;">Email</td>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#475569;">${email}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;">Subject</td>
                          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#475569;">${subject}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:12px 0;">
                            <p style="margin:0 0 8px;font-weight:600;color:#1e293b;">Message</p>
                            <p style="margin:0;color:#475569;white-space:pre-wrap;line-height:1.6;">${message}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 32px;background:#f1f5f9;text-align:center;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;">Sent from PharmaWallah Contact Form · Pakistan's #1 Pharmacy eLearning Platform</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send" }, { status: 500 });
  }
}