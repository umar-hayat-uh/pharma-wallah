/**
 * Battle Royale — shared email chrome.
 *
 * Templates are plain HTML strings, not React Email components: rendering JSX
 * would need `react-dom/server` inside a route handler (which the App Router
 * refuses) or a new dependency (@react-email/render). Email HTML is tables and
 * inline styles either way.
 *
 * Every participant-supplied value goes through `esc()` — names are free text
 * typed by anyone on the public form, and they land inside HTML.
 */

export type EmailContext = {
  eventTitle: string;
  name: string;
  code: string;
  gameCode: string;
  slotLabel: string;
  eventDate: string;
  reportingTime: string;
  venue: string;
  entryFee: number;
  paymentStatus: "unpaid" | "paid" | "waived";
  siteUrl: string;
  score: null | {
    total: number;
    rounds: [number, number, number];
    correct: number;
    questions: number;
    time: string;
    rank: number | null;
    finalStatus: string;
    winnersCount: number;
  };
};

export type RenderedEmail = { subject: string; html: string; text: string };

const BLUE = "#1C7BD9";
const GREEN = "#21B67A";
const INK = "#16181d";
const MUTED = "#5b6270";

export function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A single-line value for a subject header: no line breaks, nothing to inject. */
export function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 150);
}

export function detailsTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">${rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e7e9ee;color:${MUTED};font-size:13px;width:42%;vertical-align:top;">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e7e9ee;color:${INK};font-size:14px;font-weight:600;vertical-align:top;">${esc(v)}</td>
      </tr>`,
    )
    .join("")}</table>`;
}

export function codeCard(code: string, gameCode: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:14px;background:#eef6ff;border:1px solid #cfe3fb;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0;color:${MUTED};font-size:11px;letter-spacing:.12em;text-transform:uppercase;">Player ID</p>
      <p style="margin:4px 0 14px;color:${BLUE};font-size:26px;font-weight:800;letter-spacing:.04em;font-family:'SFMono-Regular',Consolas,monospace;">${esc(code)}</p>
      <p style="margin:0;color:${MUTED};font-size:11px;letter-spacing:.12em;text-transform:uppercase;">Game Code — keep it private</p>
      <p style="margin:4px 0 0;color:${INK};font-size:22px;font-weight:800;letter-spacing:.2em;font-family:'SFMono-Regular',Consolas,monospace;">${esc(gameCode)}</p>
    </td></tr></table>`;
}

export function bullets(items: string[]): string {
  return `<ul style="margin:8px 0 0;padding-left:20px;color:${INK};font-size:14px;line-height:1.7;">${items
    .map((i) => `<li>${esc(i)}</li>`)
    .join("")}</ul>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:${INK};font-size:15px;line-height:1.65;">${esc(text)}</p>`;
}

export function sectionTitle(text: string): string {
  return `<p style="margin:22px 0 4px;color:${INK};font-size:15px;font-weight:700;">${esc(text)}</p>`;
}

export function shell(opts: {
  ctx: EmailContext;
  preheader: string;
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}): string {
  const { ctx, preheader, heading, body, cta } = opts;
  const logo = `${ctx.siteUrl}/icons/icon-192x192.png`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:32px 12px;">
<tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e3e7ee;">
    <tr><td style="background:${BLUE};background-image:linear-gradient(120deg,${BLUE},${GREEN});padding:26px 28px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="background:#ffffff;border-radius:12px;padding:6px;"><img src="${logo}" width="36" height="36" alt="PharmaWallah" style="display:block;border:0;" /></td>
        <td style="padding-left:14px;">
          <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;opacity:.92;">PharmaWallah</p>
          <p style="margin:2px 0 0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:.02em;">${esc(ctx.eventTitle.replace(/^PharmaWallah\s+/i, ""))} 👑</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 28px 8px;">
      <h1 style="margin:0 0 16px;color:${INK};font-size:24px;line-height:1.25;font-weight:800;">${esc(heading)}</h1>
      ${body}
      ${
        cta
          ? `<table cellpadding="0" cellspacing="0" style="margin:26px 0 8px;"><tr><td style="border-radius:12px;background:${BLUE};">
          <a href="${esc(cta.href)}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${esc(cta.label)}</a>
        </td></tr></table>`
          : ""
      }
      <p style="margin:26px 0 24px;color:${INK};font-size:15px;">— Team PharmaWallah</p>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f7f8fa;border-top:1px solid #e7e9ee;">
      <p style="margin:0;color:${INK};font-size:13px;font-weight:700;">PharmaWallah</p>
      <p style="margin:2px 0 0;color:${MUTED};font-size:12px;">Your Digital Pharmacy Learning Platform · <a href="https://www.pharmawallah.com" style="color:${BLUE};text-decoration:none;">PharmaWallah.com</a></p>
      <p style="margin:10px 0 0;color:#8a909c;font-size:11px;">You are receiving this because you registered for ${esc(ctx.eventTitle)}.</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** Plain-text alternative: some clients and spam filters read only this. */
export function textVersion(lines: (string | null | false)[]): string {
  return [...lines.filter(Boolean), "", "— Team PharmaWallah", "PharmaWallah · Your Digital Pharmacy Learning Platform · PharmaWallah.com"].join("\n");
}

export function eventRows(ctx: EmailContext): [string, string][] {
  return [
    ["Participant", ctx.name],
    ["Battle slot", ctx.slotLabel],
    ["Date", ctx.eventDate],
    ["Reporting time", ctx.reportingTime || "Any time the stall is open"],
    ["Venue", ctx.venue],
  ];
}
