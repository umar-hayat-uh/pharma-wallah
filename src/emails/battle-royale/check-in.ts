import { detailsTable, headerSafe, paragraph, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

/** Sent when the desk approves the payment. It deliberately does NOT contain the Game Code. */
export function checkInConfirmation(ctx: EmailContext): RenderedEmail {
  return {
    subject: headerSafe("Battle Royale — Payment approved"),
    html: shell({
      ctx,
      preheader: "Your entry is confirmed. Collect your Game Code at the desk.",
      heading: "Payment approved",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph("Your entry fee is confirmed. The desk has your single-use Game Code — type it at any free gaming station to start your battle.") +
        detailsTable([
          ["Player ID", ctx.code],
          ["Battle slot", ctx.slotLabel],
          ["Venue", ctx.venue],
        ]) +
        paragraph("") +
        paragraph("Three rounds: Word Search, Column Matching and the Final Pharma Quiz. Good luck!"),
      cta: { label: "Read the rules", href: `${ctx.siteUrl}/battle-royale/instructions` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      "Your entry fee is confirmed. The desk has your single-use Game Code — type it at any free gaming station to start your battle.",
      `Player ID: ${ctx.code}`,
      `Battle slot: ${ctx.slotLabel}`,
    ]),
  };
}
