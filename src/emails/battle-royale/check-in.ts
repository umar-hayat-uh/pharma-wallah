import { detailsTable, headerSafe, paragraph, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

export function checkInConfirmation(ctx: EmailContext): RenderedEmail {
  return {
    subject: headerSafe("Battle Royale — You're checked in"),
    html: shell({
      ctx,
      preheader: "Head to an available gaming station.",
      heading: "Check-in successful",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph("You are checked in. Head to any available gaming station and enter your Player ID and Game Code to begin.") +
        detailsTable([
          ["Player ID", ctx.code],
          ["Battle slot", ctx.slotLabel],
          ["Venue", ctx.venue],
        ]) +
        paragraph("") +
        paragraph("Three rounds: Word Block, Column Matching and the Final Pharma Quiz. Every question has its own timer. Good luck!"),
      cta: { label: "Read the rules", href: `${ctx.siteUrl}/battle-royale/instructions` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      "You are checked in. Head to any available gaming station and enter your Player ID and Game Code to begin.",
      `Player ID: ${ctx.code}`,
      `Battle slot: ${ctx.slotLabel}`,
    ]),
  };
}
