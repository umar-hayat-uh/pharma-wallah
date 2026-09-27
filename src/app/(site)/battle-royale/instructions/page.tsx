import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-kit";
import { EventFooter, RoundVisual } from "@/components/battle-royale/sections";
import { ARRIVAL_POINTS } from "@/components/battle-royale/copy";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { formatEventDate } from "@/lib/battle-royale/format";
import { getPublicSettings } from "@/lib/battle-royale/server";

export const metadata: Metadata = {
  title: "Instructions & Rules — Battle Royale | PharmaWallah",
  description:
    "How PharmaWallah Battle Royale works: registration, check-in, the three timed rounds, scoring, tie-breakers, disqualification and prizes.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale/instructions" },
};

const SECTIONS = [
  ["about", "About"],
  ["eligibility", "Eligibility"],
  ["registration", "Registration"],
  ["reporting", "Reporting"],
  ["check-in", "Check-in"],
  ["format", "Battle format"],
  ["scoring", "Scoring"],
  ["rules", "Rules"],
  ["disqualification", "Disqualification"],
  ["technical", "Technical issues"],
  ["prizes", "Prizes"],
  ["contact", "Contact"],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-[#16181d]/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#16181d]/75">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C7BD9]" aria-hidden="true" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function InstructionsPage() {
  const s = await getPublicSettings();
  const fee = s?.entryFee ?? 100;
  const winners = s?.winnersCount ?? 10;
  const [r1, r2, r3] = s?.roundCounts ?? [5, 1, 10];

  return (
    <>
      <PageHero
        eyebrow="Battle Royale · Instructions"
        title="Instructions & rules"
        lead="Everything you need to know before you sit down at a station. The organisers may update these details — this page always shows the current version."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "Instructions" }]}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 text-sm">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-lg px-3 py-1.5 text-[#16181d]/60 hover:bg-[#16181d]/[0.04] hover:text-[#16181d]">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 max-w-3xl">
          <Section id="about" title="About Battle Royale">
            <p>
              Battle Royale is PharmaWallah&apos;s individual pharmacy gaming competition at the Pharma Fest Gaming
              Arena. Each participant plays three timed rounds at a gaming station; the combined score goes onto a
              live leaderboard, and the Top {winners} at closing win a PharmaWallah Goodie Hamper.
            </p>
          </Section>

          <Section id="eligibility" title="Eligibility">
            <Bullets
              items={[
                "Open to pharmacy students (Pharm-D and related programmes) from any university.",
                "Individual participation only — one player per station, no teams.",
                "One registration and one official attempt per person.",
              ]}
            />
          </Section>

          <Section id="registration" title="Registration">
            <p>
              Register <Link href={`${BR_BASE}/register`} className="font-semibold text-[#1C7BD9] underline-offset-4 hover:underline">online</Link> or
              in person at the PharmaWallah desk. You receive a <strong>Player ID</strong> (for example BR-2026-0007)
              and a private six-character <strong>Game Code</strong>. The entry fee is <strong>Rs. {fee}</strong>, paid
              at the desk.
            </p>
          </Section>

          <Section id="reporting" title="Reporting">
            {s && (
              <p>
                <strong>{formatEventDate(s.eventDate)}</strong>
                {s.reportingTime ? ` · reporting ${s.reportingTime}` : ""} · {s.venue}
              </p>
            )}
            <Bullets items={ARRIVAL_POINTS} />
          </Section>

          <Section id="check-in" title="Check-in">
            <p>
              Pay the entry fee at the desk, where staff will check you in. If you have already paid, you can also
              check yourself in on the <Link href={`${BR_BASE}/check-in`} className="font-semibold text-[#1C7BD9] underline-offset-4 hover:underline">check-in page</Link> with
              your Player ID (or email) and Game Code. You cannot start a battle until you are checked in.
            </p>
          </Section>

          <Section id="format" title="Battle format">
            <p>
              At a station, enter your Player ID and Game Code. The battle then runs in order — you cannot go back to
              an earlier question or round.
            </p>
            <ol className="mt-4 grid gap-4">
              {ROUNDS.map((r, i) => (
                <li key={r.no} className="grid gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-center">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Round {r.no}</p>
                    <p className="mt-1 text-lg font-bold text-[#16181d]">{r.name}</p>
                    <p className="mt-1 text-sm">{r.how}</p>
                    <p className="mt-2 text-sm font-medium text-[#16181d]">
                      {i === 0 && `${r1} ${r1 === 1 ? "word" : "words"}`}
                      {i === 1 && `${r2} ${r2 === 1 ? "board" : "boards"} of matching pairs`}
                      {i === 2 && `${r3} questions`}
                      {" · each with its own timer"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f4f7fb] p-4"><RoundVisual round={r.no} /></div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="scoring" title="Scoring">
            <Bullets
              items={[
                "Each correct word or quiz answer earns the question's points (usually 10). A wrong or unanswered question earns 0.",
                "In Column Matching, every correct pair earns its points — a board is not all-or-nothing.",
                s?.speedBonusEnabled
                  ? `Speed bonus: a fully correct answer earns up to ${s.speedBonusMax} extra points, falling to 0 as its timer runs out.`
                  : "There is no speed bonus in this event.",
                "An answer submitted after its timer ends scores 0.",
                "Final score = Round 1 + Round 2 + Round 3, calculated by the system.",
                "Ties are broken by the higher Round 3 score, then by the faster total answering time.",
              ]}
            />
          </Section>

          <Section id="rules" title="Rules">
            {s && s.rules.length > 0 ? (
              <ol className="space-y-2">
                {s.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 shrink-0 font-mono text-sm font-semibold text-[#1C7BD9]">{i + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p>The rules will be published here before the event.</p>
            )}
          </Section>

          <Section id="disqualification" title="Disqualification">
            <Bullets
              items={[
                "Playing with someone else's Player ID or Game Code, or letting someone else play with yours.",
                "Receiving help from another person, a phone, notes or the internet during your battle.",
                "Tampering with a gaming station or attempting to manipulate the system.",
                "Disruptive behaviour towards other participants or coordinators.",
              ]}
            />
            <p>A disqualified participant is removed from the leaderboard and is not eligible for prizes.</p>
          </Section>

          <Section id="technical" title="Technical issues">
            <p>
              If a station freezes or loses connection, <strong>don&apos;t close anything</strong> — call a game
              operator. Your battle is saved on the server after every answer; entering your Player ID and Game Code
              on another station continues exactly where you stopped, with the same question and timer. If a fault
              has genuinely cost you your attempt, an event administrator can verify it and reset your attempt.
            </p>
          </Section>

          <Section id="prizes" title="Prizes">
            <p>
              When the competition closes, the leaderboard is frozen and verified. The Top {winners} participants by
              final score each receive a <strong>PharmaWallah Goodie Hamper</strong> — a PharmaWallah notebook and
              pen. Only verified scores in the official system are eligible.
            </p>
          </Section>

          <Section id="contact" title="Contact">
            <p>{s?.contactText || "Ask any PharmaWallah coordinator at the stall."}</p>
            <p>
              Before the event, you can also reach us through the{" "}
              <Link href="/contact" className="font-semibold text-[#1C7BD9] underline-offset-4 hover:underline">contact page</Link>.
            </p>
          </Section>
        </article>
      </div>
      <EventFooter />
    </>
  );
}
