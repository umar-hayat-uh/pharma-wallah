// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkLimit, contactLimiter } from "@/lib/rateLimit";
import { clientIpFrom } from "@/lib/ai-guide/pure";

const resend = new Resend(process.env.RESEND_API_KEY!);
const RECIPIENT_EMAIL = "shayanhusein@gmail.com";

/*
 * Used by /contact and /careers. Until 2026-09-23 neither form called it — both
 * faked a success message after a timeout and discarded what the visitor typed.
 * Wiring them up made this route public-facing, so it now validates, clamps,
 * rate-limits, and HTML-escapes every field: the values are interpolated into
 * the email's HTML, and unescaped they let anyone send arbitrary markup, under
 * our domain, to the recipient's inbox.
 */
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 150;
const MAX_MESSAGE = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function field(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const { success } = await checkLimit(contactLimiter, clientIpFrom(req.headers));
  if (!success) {
    return errorResponse("Too many messages from this connection. Please try again in a few minutes.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  const rawName = field(body?.name, MAX_NAME);
  const rawEmail = field(body?.email, MAX_EMAIL);
  const rawSubject = field(body?.subject, MAX_SUBJECT);
  const rawMessage = field(body?.message, MAX_MESSAGE);

  if (!rawName || !rawEmail || !rawSubject || !rawMessage) {
    return errorResponse("All fields are required, and each must be within its length limit.", 400);
  }
  if (!EMAIL_RE.test(rawEmail)) {
    return errorResponse("Please enter a valid email address.", 400);
  }

  const name = escapeHtml(rawName);
  const email = escapeHtml(rawEmail);
  const subject = escapeHtml(rawSubject);
  const message = escapeHtml(rawMessage);

  try {
    const { error: sendError } = await resend.emails.send({
      from: "PharmaWallah Contact <noreply@pharmawallah.com>",  
      to: [RECIPIENT_EMAIL],
      replyTo: rawEmail,
      // A header, not HTML: send the raw text, with line breaks removed so it
      // cannot inject further headers.
      subject: `[PharmaWallah] ${rawSubject.replace(/[\r\n]+/g, " ")}`,
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
                      <p style="margin:0;color:#94a3b8;font-size:12px;">Sent from PharmaWallah Contact Form · pharmawallah.com</p>
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

    // Resend reports API failures in the result rather than by throwing.
    if (sendError) throw sendError;

    return NextResponse.json({ success: true });
  } catch (error) {
    // Resend's error text is for us, not the visitor.
    console.error("[contact] send failed", error);
    return errorResponse("We couldn't send your message just now. Please email us instead.", 500);
  }
}