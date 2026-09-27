import { bullets, codeCard, detailsTable, eventRows, headerSafe, paragraph, sectionTitle, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

export const ARRIVAL_INSTRUCTIONS = [
  "Arrive 15–20 minutes before your reporting time.",
  "Bring this confirmation (on your phone is fine).",
  "Keep your Player ID and Game Code with you — you need both to check in and to play.",
  "Follow the instructions of the Battle Royale coordinators.",
  "Your score is recorded by the system during the competition.",
];

export function registrationConfirmation(ctx: EmailContext): RenderedEmail {
  const feeLine =
    ctx.paymentStatus === "unpaid"
      ? `Please pay the Rs. ${ctx.entryFee} entry fee at the PharmaWallah desk when you arrive — you can't start your battle until it is confirmed.`
      : "Your entry fee is confirmed.";
  return {
    subject: headerSafe(`${ctx.eventTitle.replace(/^PharmaWallah\s+/i, "")} — Registration Confirmed 👑`),
    html: shell({
      ctx,
      preheader: `Your Player ID is ${ctx.code}. Keep your Game Code private.`,
      heading: "Registration Confirmed!",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph(`Your registration for ${ctx.eventTitle} has been successfully confirmed.`) +
        codeCard(ctx.code, ctx.gameCode) +
        detailsTable(eventRows(ctx)) +
        paragraph("") +
        paragraph(feeLine) +
        sectionTitle("Important instructions") +
        bullets(ARRIVAL_INSTRUCTIONS) +
        paragraph("") +
        paragraph("Get ready to compete!"),
      cta: { label: "View Battle Instructions", href: `${ctx.siteUrl}/battle-royale/instructions` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      `Your registration for ${ctx.eventTitle} has been successfully confirmed.`,
      "",
      `Player ID: ${ctx.code}`,
      `Game Code (keep it private): ${ctx.gameCode}`,
      `Battle slot: ${ctx.slotLabel}`,
      `Date: ${ctx.eventDate}`,
      `Reporting time: ${ctx.reportingTime || "Any time the stall is open"}`,
      `Venue: ${ctx.venue}`,
      "",
      feeLine,
      "",
      "Important instructions:",
      ...ARRIVAL_INSTRUCTIONS.map((i) => `• ${i}`),
      "",
      `Battle instructions: ${ctx.siteUrl}/battle-royale/instructions`,
      "",
      "Get ready to compete!",
    ]),
  };
}
