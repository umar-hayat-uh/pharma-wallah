import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/page-kit";
import { EventFooter, RoundVisual } from "@/components/battle-royale/sections";
import { ARRIVAL_POINTS } from "@/components/battle-royale/copy";
import { BR_BASE, FAQ, ROUNDS } from "@/lib/battle-royale/constants";
import { formatEventDate } from "@/lib/battle-royale/format";
import { getPublicSettings } from "@/lib/battle-royale/server";
import { TITLES } from "@/lib/battle-royale/titles";

export const metadata: Metadata = {
  title: "How to play — Battle Royale | PharmaWallah",
  description:
    "How PharmaWallah Battle Royale works: register, pay at the desk for your Game Code, play three timed rounds, earn a title and download your e-certificate.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale/instructions" },
};

/*
 * Written for players who have never used anything like this: short
 * sections, plain words, the three steps first. Rewritten 2026-09-29 (it had
 * twelve sections and a side menu).
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#16181d]/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-[#16181d]/75">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C7BD9]" aria-hidden="true" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function InstructionsPage() {
  const s = await getPublicSettings();
  if (s?.eventClosed) redirect(BR_BASE);
  const fee = s?.entryFee ?? 100;
  const winners = s?.winnersCount ?? 10;
  const [r1, r2, r3] = s?.roundCounts ?? [5, 1, 10];

  const steps = [
    ["Register", <>Register <Link href={`${BR_BASE}/register`} className="font-semibold text-[#1C7BD9] hover:underline">online</Link> or at the PharmaWallah desk. Your <strong>Player ID</strong> (like BR-2026-0007) comes by email.</>],
    ["Pay and get your Game Code", <>Pay <strong>Rs. {fee}</strong> at the desk. They hand you a slip with a six-letter <strong>Game Code</strong>. Keep it private — it works once.</>],
    ["Play", <>Sit at any free station, press <strong>Start</strong>, type your Game Code and play the three rounds.</>],
    ["Get your certificate", <>Open <Link href={`${BR_BASE}/status`} className="font-semibold text-[#1C7BD9] hover:underline">My result</Link>, type your Player ID and email, and download your e-certificate.</>],
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Battle Royale · How to play"
        title="How to play"
        lead="Four steps, three rounds, one attempt. Read this once before you sit down at a station."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "How to play" }]}
      />
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <Section title="Four steps">
          <ol className="grid gap-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C7BD9] font-extrabold text-white">{i + 1}</span>
                <div>
                  <p className="font-bold text-[#16181d]">{t}</p>
                  <p className="mt-0.5 text-[15px]">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          {s && (
            <p className="text-[15px]">
              <strong>{formatEventDate(s.eventDate)}</strong>
              {s.reportingTime ? ` · reporting ${s.reportingTime}` : ""} · {s.venue}
            </p>
          )}
          <Bullets items={ARRIVAL_POINTS} />
        </Section>

        <Section title="The three rounds">
          <p>The rounds come one after another. You can&apos;t go back to an earlier round.</p>
          <ol className="grid gap-3">
            {ROUNDS.map((r, i) => (
              <li key={r.no} className="grid gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7BD9]">Round {r.no}</p>
                  <p className="mt-1 text-lg font-bold text-[#16181d]">{r.name}</p>
                  <p className="mt-1 text-[15px]">{r.how}</p>
                  <p className="mt-2 text-sm font-semibold text-[#16181d]">
                    {i === 0 && `${r1} words · ${Math.round((s?.round1Seconds ?? 120) / 6) / 10} minutes`}
                    {i === 1 && `${r2} ${r2 === 1 ? "board" : "boards"} · a timer on each`}
                    {i === 2 && `${r3} questions · a timer on each`}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f4f7fb] p-4"><RoundVisual round={r.no} /></div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Scoring">
          <Bullets
            items={[
              "Every word you find, every correct pair and every correct answer earns points.",
              "Your score = Round 1 + Round 2 + Round 3. The system adds it up — you don't have to.",
              "If two players tie, the higher Round 3 score wins; then the faster battle.",
            ]}
          />
        </Section>

        <Section title="Prizes, certificates and titles">
          <p>
            The <strong>Top {winners}</strong> win a PharmaWallah Goodie Hamper and a gold <strong>Certificate of Achievement</strong> with
            their place, once results are final. <strong>Everyone</strong> who finishes gets a <strong>Certificate of Participation</strong>
            straight away. Every certificate shows your name, score, accuracy and the title you earned:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TITLES.map((t) => (
              <li key={t.id} className="rounded-xl border border-[#16181d]/10 bg-white px-4 py-3">
                <p className="font-bold text-[#16181d]">{t.name}</p>
                <p className="text-sm">{t.reason}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Rules">
          {s && s.rules.length > 0 && (
            <ol className="space-y-2">
              {s.rules.map((rule, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 shrink-0 font-mono text-sm font-semibold text-[#1C7BD9]">{i + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="font-semibold text-[#16181d]">You will be disqualified for:</p>
          <Bullets
            items={[
              "Using someone else's Player ID or Game Code, or letting someone play for you.",
              "Getting help from a person, a phone, notes or the internet during your battle.",
              "Tampering with a station, or being disruptive.",
            ]}
          />
        </Section>

        <Section title="If something goes wrong">
          <p>
            <strong>Don&apos;t close anything</strong> — call a coordinator. Your answers are saved on the station and sent
            automatically when the connection comes back. If the station itself stops working, the desk gives you a new
            Game Code that continues the same battle on another station.
          </p>
        </Section>

        <Section title="Questions">
          <div className="divide-y divide-[#16181d]/10 border-y border-[#16181d]/10">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#16181d] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl leading-none text-[#1C7BD9] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 pr-8 text-[15px]">{f.a}</p>
              </details>
            ))}
          </div>
          <p>{s?.contactText || "Ask any PharmaWallah coordinator at the stall."}</p>
        </Section>
      </article>
      <EventFooter />
    </>
  );
}
