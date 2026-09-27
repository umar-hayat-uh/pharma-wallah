import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Gift,
  Layers,
  MapPin,
  Radio,
  Ticket,
  Trophy,
  UserRound,
} from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit";
import { Crest, primaryButtonClass, secondaryButtonClass } from "@/components/battle-royale/ui";
import { EventFooter, RoundVisual } from "@/components/battle-royale/sections";
import { BR_BASE, FAQ, ROUNDS } from "@/lib/battle-royale/constants";
import { formatEventDate } from "@/lib/battle-royale/format";
import { getPublicSettings } from "@/lib/battle-royale/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Battle Royale | PharmaWallah",
  description:
    "PharmaWallah Battle Royale — a competitive pharmacy challenge testing knowledge, speed and accuracy across three timed rounds. Top 10 win a PharmaWallah Goodie Hamper.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale" },
  openGraph: {
    title: "Battle Royale | PharmaWallah",
    description: "Register. Play. Score. Dominate. A three-round pharmacy challenge at Pharma Fest.",
    url: "https://www.pharmawallah.com/battle-royale",
    siteName: "PharmaWallah",
    type: "website",
  },
};

const STEPS = [
  { t: "Register", d: "Online here, or in person at the PharmaWallah desk." },
  { t: "Receive confirmation", d: "Your Player ID arrives by email." },
  { t: "Pay at the desk", d: "Pay the entry fee; the desk approves it." },
  { t: "Get your Game Code", d: "The desk hands you a single-use code." },
  { t: "Battle", d: "At a free station, type the code and play three timed rounds." },
  { t: "See your score", d: "Your total goes straight onto the live leaderboard." },
];

export default async function BattleRoyaleLanding() {
  const settings = await getPublicSettings();
  const fee = settings?.entryFee ?? 100;
  const winners = settings?.winnersCount ?? 10;

  const cards = [
    { icon: Ticket, title: "Registration", body: `Register online or at the desk; pay Rs. ${fee} at the desk to get your Game Code.` },
    { icon: Layers, title: "Battle rounds", body: "Three rounds: Word Search, Column Matching and the Final Pharma Quiz." },
    { icon: UserRound, title: "Individual scoring", body: "One player per station. Your score is yours alone, calculated by the system." },
    { icon: Radio, title: "Live competition", body: "The leaderboard updates the moment each battle is verified." },
    { icon: Gift, title: "Prizes", body: `The Top ${winners} win a PharmaWallah Goodie Hamper — notebook and pen.` },
  ];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
        <div className="br-sheen" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:px-8">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              Pharma Fest · Gaming Arena
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Crest size={60} />
              <p className="text-lg font-semibold text-white/90">PharmaWallah</p>
            </div>
            <h1 className="mt-4 text-[clamp(2.75rem,9vw,5.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
              Battle
              <br />
              Royale
            </h1>
            <p className="mt-5 text-xl font-semibold tracking-wide text-white sm:text-2xl">
              {settings?.tagline || "Register. Play. Score. Dominate."}
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-base">
              A fast-paced pharmacy challenge designed to test your knowledge, speed, accuracy and
              problem-solving — three timed rounds, one attempt, and a live leaderboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${BR_BASE}/register`}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#0f4f8f] shadow-[0_12px_28px_-12px_rgba(6,18,36,.6)] transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Register Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`${BR_BASE}/instructions`}
                className="inline-flex h-12 items-center rounded-xl border border-white/45 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Instructions
              </Link>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/20 pt-6 text-sm sm:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-white/80"><CalendarDays className="h-4 w-4" /> Date</dt>
                <dd className="mt-1 font-semibold">{formatEventDate(settings?.eventDate ?? null)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-white/80"><MapPin className="h-4 w-4" /> Venue</dt>
                <dd className="mt-1 font-semibold">{settings?.venue || "PharmaWallah stall"}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-white/80"><Ticket className="h-4 w-4" /> Entry</dt>
                <dd className="mt-1 font-semibold">Rs. {fee}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-white/80"><Trophy className="h-4 w-4" /> Winners</dt>
                <dd className="mt-1 font-semibold">Top {winners}</dd>
              </div>
            </dl>
          </div>

          {/* The three rounds, stacked like cards in a hand. */}
          <ol className="relative hidden lg:block" aria-label="The three rounds">
            {ROUNDS.map((r, i) => (
              <li
                key={r.no}
                className="relative rounded-2xl border border-white/25 bg-white/[0.12] p-5 shadow-[0_24px_48px_-24px_rgba(6,18,36,.7)]"
                style={{ marginTop: i === 0 ? 0 : -8, marginLeft: i * 18, transform: `rotate(${(i - 1) * 1.6}deg)` }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">Round 0{r.no}</p>
                <p className="mt-1 text-xl font-bold">{r.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/85">{r.short}</p>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* ── Event information ────────────────────────────────────────── */}
        <section className="py-14 sm:py-20" aria-labelledby="br-info">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">The event</p>
          <h2 id="br-info" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything at a glance</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C7BD9]/10 text-[#1C7BD9]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#16181d]/65">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-14 sm:py-20" aria-labelledby="br-how">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">How it works</p>
          <h2 id="br-how" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From the desk to the leaderboard</h2>
          <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: BRAND_BUTTON }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#16181d]/65">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Battle rounds ────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-14 sm:py-20" aria-labelledby="br-rounds">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Battle rounds</p>
          <h2 id="br-rounds" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Three rounds. One total.</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#16181d]/65">
            Every word found and every correct match or answer scores. Your final score is Round 1 + Round 2 +
            Round 3; ties go to the higher Round 3, then the shorter battle time.
          </p>
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {ROUNDS.map((r) => (
              <li key={r.no} className="flex flex-col overflow-hidden rounded-3xl border border-[#16181d]/10 bg-white">
                <div className="border-b border-[#16181d]/10 bg-[#f4f7fb] p-6">
                  <RoundVisual round={r.no} />
                </div>
                <div className="p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Round {r.no}</p>
                  <p className="mt-1.5 text-xl font-bold">{r.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#16181d]/65">{r.how}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-14 sm:py-20" aria-labelledby="br-faq">
          <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">FAQ</p>
              <h2 id="br-faq" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions</h2>
            </div>
            <div className="divide-y divide-[#16181d]/10 border-y border-[#16181d]/10">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-xl leading-none text-[#1C7BD9] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 pr-8 text-sm leading-relaxed text-[#16181d]/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing call ─────────────────────────────────────────────── */}
        <section className="pb-16">
          <div className="relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10" style={{ background: BRAND_SURFACE }}>
            <div className="br-sheen" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-white/90"><BadgeCheck className="h-4 w-4" /> One official attempt</p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">Think you can make the Top {winners}?</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`${BR_BASE}/register`} className={secondaryButtonClass}>Register Now</Link>
                <Link href={`${BR_BASE}/leaderboard`} className={primaryButtonClass} style={{ background: "rgba(255,255,255,.14)" }}>
                  Live leaderboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <EventFooter />
    </>
  );
}
