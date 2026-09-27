import { codeCard, detailsTable, eventRows, headerSafe, paragraph, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

export function slotAssignment(ctx: EmailContext): RenderedEmail {
  return {
    subject: headerSafe(`Battle Royale — Your battle slot: ${ctx.slotLabel}`),
    html: shell({
      ctx,
      preheader: `You are in ${ctx.slotLabel}.`,
      heading: "Your battle slot is set",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph("A coordinator has assigned (or changed) your battle slot. Your details are below.") +
        detailsTable(eventRows(ctx)) +
        codeCard(ctx.code, ctx.gameCode) +
        paragraph("Please arrive 15–20 minutes before your reporting time."),
      cta: { label: "View Battle Instructions", href: `${ctx.siteUrl}/battle-royale/instructions` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      "A coordinator has assigned (or changed) your battle slot.",
      `Battle slot: ${ctx.slotLabel}`,
      `Date: ${ctx.eventDate}`,
      `Reporting time: ${ctx.reportingTime || "Any time the stall is open"}`,
      `Venue: ${ctx.venue}`,
      `Player ID: ${ctx.code} · Game Code: ${ctx.gameCode}`,
    ]),
  };
}
