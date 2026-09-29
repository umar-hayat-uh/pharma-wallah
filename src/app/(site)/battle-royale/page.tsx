import type { Metadata } from "next";
import Link from "next/link";
import { Award, ChevronRight, Gamepad2, Gift, ScrollText, Trophy, UserPlus } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest } from "@/components/battle-royale/ui";
import { Podium } from "@/components/battle-royale/Podium";
import { EventFooter, RoundVisual } from "@/components/battle-royale/sections";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { formatEventDate } from "@/lib/battle-royale/format";
import { readLeaderboard } from "@/lib/battle-royale/leaderboard";
import { getPublicSettings } from "@/lib/battle-royale/server";
import { TITLES } from "@/lib/battle-royale/titles";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Battle Royale | PharmaWallah",
  description:
    "PharmaWallah Battle Royale — a three-round pharmacy challenge at Pharma Fest. Register, play, earn a title and download your e-certificate. Top 10 win a Goodie Hamper.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale" },
  openGraph: {
    title: "Battle Royale | PharmaWallah",
    description: "Register. Play. Score. Dominate. A three-round pharmacy challenge at Pharma Fest.",
    url: "https://www.pharmawallah.com/battle-royale",
    siteName: "PharmaWallah",
    type: "website",
  },
};

/*
 * A game's main menu, not a website: players are non-technical and arrive
 * wanting one of three things — sign up, play, or see how they did. Those are
 * the three big buttons; everything else (rules, FAQ) is one link away on the
 * instructions page. Simplified at the user's request, 2026-09-29.
 */
export default async function BattleRoyaleLanding() {
  const [settings, board] = await Promise.all([getPublicSettings(), readLeaderboard(20, null).catch(() => null)]);
  const fee = settings?.entryFee ?? 100;
  const winners = settings?.winnersCount ?? 10;

  // "Close tournament" (admin): the event is over — only the results remain.
  if (settings?.eventClosed) {
    return (
      <>
        <header className="relative overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
          <div className="br-grid" aria-hidden="true" />
          <div className="br-sheen" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-14">
            <Crest size={64} className="mx-auto" />
            <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">Tournament closed</p>
            <h1 className="mt-2 text-[clamp(3rem,11vw,6.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">Battle Royale</h1>
            <p className="mt-4 text-xl font-semibold sm:text-2xl">Thanks for playing. Here are the results.</p>
            <nav aria-label="Battle Royale results" className="mx-auto mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                { href: `${BR_BASE}/leaderboard`, icon: Trophy, title: "Leaderboard", sub: board?.finalized ? "The final standings." : "The standings, being verified." },
                { href: `${BR_BASE}/status`, icon: Award, title: "My result", sub: "Your score, titles and e-certificate." },
              ].map(({ href, icon: Icon, title, sub }, i) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    i === 0
                      ? "group flex items-center gap-4 rounded-2xl bg-white p-5 text-left text-[#16181d] shadow-[0_18px_36px_-18px_rgba(6,18,36,.7)] transition-transform duration-300 ease-out-expo hover:-translate-y-1"
                      : "group flex items-center gap-4 rounded-2xl border-2 border-white/40 bg-white/10 p-5 text-left transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-1 hover:bg-white/20"
                  }
                >
                  <span className={i === 0 ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C7BD9] text-white" : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0f4f8f]"}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-xl font-extrabold">
                      {title} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className={i === 0 ? "mt-0.5 block text-sm text-[#16181d]/65" : "mt-0.5 block text-sm text-white/85"}>{sub}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{board?.finalized ? "The winners" : "Top 3"}</h2>
          <Podium rows={board?.rows ?? []} className="mt-6" />
        </div>
        <EventFooter closed />
      </>
    );
  }

  const menu = [
    { href: `${BR_BASE}/register`, icon: UserPlus, title: "Register", sub: "New here? Get your Player ID." },
    { href: `${BR_BASE}/battle`, icon: Gamepad2, title: "Play", sub: "Have a Game Code? Start your battle." },
    { href: `${BR_BASE}/status`, icon: Award, title: "My result", sub: "See your score and get your certificate." },
  ];

  const steps = [
    { n: 1, t: "Register", d: "Online here, or at the PharmaWallah desk. Your Player ID comes by email." },
    { n: 2, t: "Pay at the desk", d: `Pay Rs. ${fee}. The desk gives you a Game Code on a slip.` },
    { n: 3, t: "Play", d: "At any free station, type your Game Code and play three rounds." },
  ];

  return (
    <>
      {/* ── Main menu ────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
        <div className="br-grid" aria-hidden="true" />
        <div className="br-sheen" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-14">
          <Crest size={64} className="mx-auto" />
          <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">Pharma Fest · Gaming Arena</p>
          <h1 className="mt-2 text-[clamp(3rem,11vw,6.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">Battle Royale</h1>
          <p className="mt-4 text-xl font-semibold sm:text-2xl">{settings?.tagline || "Register. Play. Score. Dominate."}</p>
          <p className="mt-3 text-[15px] text-white/85">
            {formatEventDate(settings?.eventDate ?? null)} · {settings?.venue || "PharmaWallah stall"} · Entry Rs. {fee}
          </p>

          <nav aria-label="Battle Royale menu" className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
            {menu.map(({ href, icon: Icon, title, sub }, i) => (
              <Link
                key={href}
                href={href}
                className={
                  i === 0
                    ? "group flex items-center gap-4 rounded-2xl bg-white p-4 text-left text-[#16181d] shadow-[0_18px_36px_-18px_rgba(6,18,36,.7)] transition-transform duration-300 ease-out-expo hover:-translate-y-1 sm:flex-col sm:items-start sm:p-5"
                    : "group flex items-center gap-4 rounded-2xl border-2 border-white/40 bg-white/10 p-4 text-left transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-1 hover:bg-white/20 sm:flex-col sm:items-start sm:p-5"
                }
              >
                <span className={i === 0 ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C7BD9] text-white" : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0f4f8f]"}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-xl font-extrabold">
                    {title} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className={i === 0 ? "mt-0.5 block text-sm text-[#16181d]/65" : "mt-0.5 block text-sm text-white/85"}>{sub}</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href={`${BR_BASE}/leaderboard`} className="inline-flex items-center gap-1.5 text-white/90 underline-offset-4 hover:underline">
              <Trophy className="h-4 w-4" /> Leaderboard
            </Link>
            <Link href={`${BR_BASE}/instructions`} className="inline-flex items-center gap-1.5 text-white/90 underline-offset-4 hover:underline">
              <ScrollText className="h-4 w-4" /> How to play
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        {/* ── Podium ──────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16" aria-labelledby="br-top">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="br-top" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {board?.finalized ? "The winners" : "Top 3 right now"}
            </h2>
            <Link href={`${BR_BASE}/leaderboard`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C7BD9] hover:underline">
              Full leaderboard <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <Podium rows={board?.rows ?? []} className="mt-6" />
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-12 sm:py-16" aria-labelledby="br-how">
          <h2 id="br-how" className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="rounded-3xl border border-[#16181d]/10 bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1C7BD9] text-lg font-extrabold text-white">{s.n}</span>
                <p className="mt-4 text-xl font-bold">{s.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#16181d]/65">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Rounds ──────────────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-12 sm:py-16" aria-labelledby="br-rounds">
          <h2 id="br-rounds" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Three rounds</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {ROUNDS.map((r) => (
              <li key={r.no} className="overflow-hidden rounded-3xl border border-[#16181d]/10 bg-white">
                <div className="bg-[#f4f7fb] p-5"><RoundVisual round={r.no} /></div>
                <div className="p-5">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7BD9]">Round {r.no}</p>
                  <p className="mt-1 text-xl font-bold">{r.name}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#16181d]/65">{r.short}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Rewards ─────────────────────────────────────────────────────── */}
        <section className="border-t border-[#16181d]/10 py-12 sm:py-16" aria-labelledby="br-win">
          <h2 id="br-win" className="text-3xl font-extrabold tracking-tight sm:text-4xl">What you can win</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#f5b301]/50 bg-[#f5b301]/[0.07] p-6">
              <Gift className="h-7 w-7 text-[#b98500]" />
              <p className="mt-3 text-xl font-bold">Top {winners}: Goodie Hamper + gold certificate</p>
              <p className="mt-1.5 text-[15px] text-[#16181d]/65">A PharmaWallah notebook and pen, and a Certificate of Achievement with your place on it.</p>
            </div>
            <div className="rounded-3xl border border-[#1C7BD9]/25 bg-[#1C7BD9]/[0.05] p-6">
              <Award className="h-7 w-7 text-[#1C7BD9]" />
              <p className="mt-3 text-xl font-bold">Everyone: an e-certificate</p>
              <p className="mt-1.5 text-[15px] text-[#16181d]/65">Download it from <strong>My result</strong> with your name, score and the title you earned.</p>
            </div>
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-[#16181d]/55">Titles you can earn</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TITLES.map((t) => (
              <li key={t.id} title={t.reason} className="rounded-full border border-[#16181d]/12 bg-white px-3.5 py-1.5 text-sm font-semibold">
                {t.name}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <EventFooter />
    </>
  );
}
