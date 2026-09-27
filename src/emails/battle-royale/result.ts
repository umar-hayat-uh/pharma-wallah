import { detailsTable, headerSafe, paragraph, shell, textVersion, type EmailContext, type RenderedEmail } from "./layout";

function scoreRows(ctx: EmailContext): [string, string][] {
  const s = ctx.score!;
  return [
    ["Player ID", ctx.code],
    ["Round 1 — Word Block", String(s.rounds[0])],
    ["Round 2 — Column Matching", String(s.rounds[1])],
    ["Round 3 — Final Quiz", String(s.rounds[2])],
    ["Total score", String(s.total)],
    ["Correct answers", `${s.correct} of ${s.questions}`],
    ["Answering time", s.time],
    ["Final rank", s.rank ? `#${s.rank}` : "—"],
    ["Status", s.finalStatus],
  ];
}

/** Final result for everyone who completed a battle. */
export function finalResult(ctx: EmailContext): RenderedEmail {
  const s = ctx.score!;
  const won = s.finalStatus === "Winner";
  return {
    subject: headerSafe(won ? "Battle Royale — You're in the Top 10! 🏆" : "Battle Royale — Your final result"),
    html: shell({
      ctx,
      preheader: `Final score ${s.total}${s.rank ? `, rank #${s.rank}` : ""}.`,
      heading: won ? "Congratulations — you're a winner!" : "Your final result",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph(
          won
            ? `You finished in the Top ${s.winnersCount} of ${ctx.eventTitle}. Collect your PharmaWallah Goodie Hamper at the stall.`
            : `Thank you for competing in ${ctx.eventTitle}. The leaderboard has been verified and your final result is below.`,
        ) +
        detailsTable(scoreRows(ctx)),
      cta: { label: "View the leaderboard", href: `${ctx.siteUrl}/battle-royale/leaderboard?code=${encodeURIComponent(ctx.code)}` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      won ? `You finished in the Top ${s.winnersCount}! Collect your hamper at the stall.` : "Your final result:",
      ...scoreRows(ctx).map(([k, v]) => `${k}: ${v}`),
    ]),
  };
}

/** Sent when an admin marks a participant Qualified (e.g. for a playoff). */
export function qualificationNotice(ctx: EmailContext): RenderedEmail {
  const s = ctx.score!;
  const qualified = s.finalStatus === "Qualified" || s.finalStatus === "Winner";
  return {
    subject: headerSafe(qualified ? "Battle Royale — You've qualified!" : "Battle Royale — Qualification update"),
    html: shell({
      ctx,
      preheader: qualified ? "You've qualified." : "Your qualification status.",
      heading: qualified ? "You've qualified!" : "Qualification update",
      body:
        paragraph(`Hi ${ctx.name},`) +
        paragraph(
          qualified
            ? "Your score has qualified you for the next stage. A coordinator will tell you what happens next — keep your Player ID and Game Code with you."
            : "Thank you for competing. Your score did not reach the qualifying cut-off this time.",
        ) +
        detailsTable(scoreRows(ctx)),
      cta: { label: "View the leaderboard", href: `${ctx.siteUrl}/battle-royale/leaderboard?code=${encodeURIComponent(ctx.code)}` },
    }),
    text: textVersion([
      `Hi ${ctx.name},`,
      "",
      qualified ? "You've qualified for the next stage." : "Your score did not reach the qualifying cut-off.",
      ...scoreRows(ctx).map(([k, v]) => `${k}: ${v}`),
    ]),
  };
}
