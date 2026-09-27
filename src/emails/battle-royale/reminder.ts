import { ARRIVAL_INSTRUCTIONS } from "./registration-confirmation";
import { bullets, playerCard, detailsTable, eventRows, headerSafe, paragraph, sectionTitle, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

export function battleReminder(ctx: EmailContext): RenderedEmail {
  return {
    subject: headerSafe(`Reminder: Battle Royale — ${ctx.eventDate}`),
    html: shell({
      ctx,
      preheader: `Your battle: ${ctx.slotLabel}.`,
      heading: "Your battle is coming up",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph(`This is a reminder about your place in ${ctx.eventTitle}.`) +
        detailsTable(eventRows(ctx)) +
        playerCard(ctx.code, "Bring your Player ID. Pay at the desk (if you haven't) to receive your Game Code.") +
        (ctx.paymentStatus === "unpaid"
          ? paragraph(`Your Rs. ${ctx.entryFee} entry fee is still due — please pay at the desk on arrival.`)
          : "") +
        sectionTitle("Before you arrive") +
        bullets(ARRIVAL_INSTRUCTIONS),
      cta: { label: "View Battle Instructions", href: `${ctx.siteUrl}/battle-royale/instructions` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      `Reminder: ${ctx.eventTitle}`,
      `Battle slot: ${ctx.slotLabel}`,
      `Date: ${ctx.eventDate}`,
      `Reporting time: ${ctx.reportingTime || "Any time the stall is open"}`,
      `Venue: ${ctx.venue}`,
      `Player ID: ${ctx.code}`,
      ctx.paymentStatus === "unpaid" && `Your Rs. ${ctx.entryFee} entry fee is still due.`,
    ]),
  };
}
