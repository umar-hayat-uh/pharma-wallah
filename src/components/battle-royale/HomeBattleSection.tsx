/**
 * Battle Royale on the home page, under the hero: the live top three on a
 * podium and the two ways in. Server component (service client via the
 * leaderboard module) — rendered inside <Suspense> by src/app/page.tsx so a
 * slow read never holds up the hero.
 *
 * It retires itself: nothing renders when the event isn't set up (tables
 * missing, read failed) or when the event date is more than RETIRE_DAYS past,
 * so the home page doesn't advertise a finished event forever.
 */
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Podium } from "./Podium";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { EVENT_TZ } from "@/lib/battle-royale/format";
import { readLeaderboard } from "@/lib/battle-royale/leaderboard";
import { getPublicSettings } from "@/lib/battle-royale/server";

const RETIRE_DAYS = 14;

function retired(eventDate: string | null): boolean {
  if (!eventDate) return false;
  const end = Date.parse(`${eventDate}T23:59:59+05:00`);
  return Number.isFinite(end) && Date.now() > end + RETIRE_DAYS * 86_400_000;
}

export async function HomeBattleSection() {
  let settings, board;
  try {
    settings = await getPublicSettings();
    if (!settings || retired(settings.eventDate)) return null;
    board = await readLeaderboard(20, null);
  } catch (err) {
    console.error("[battle-royale] home section unavailable", err);
    return null;
  }
  const rows = board?.rows ?? [];
  const status = board?.finalized ? "Final results" : board?.frozenAt ? "Results being verified" : rows.length ? "Live now" : "Starting soon";
  const date = settings.eventDate
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: EVENT_TZ }).format(new Date(`${settings.eventDate}T12:00:00+05:00`))
    : null;

  return (
    <section className="wrap py-14 sm:py-20" aria-labelledby="pw-br-home-title">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7BD9]">
            <span className="relative flex h-2 w-2">
              {!board?.frozenAt && rows.length > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#21B67A] opacity-70 motion-reduce:hidden" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#21B67A]" />
            </span>
            Battle Royale · {status}
          </p>
          <h2 id="pw-br-home-title" className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {rows.length ? "Who's on top right now" : "The podium is empty. For now."}
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[#16181d]/65">
            Three timed rounds of pharmacy — Word Search, Column Matching and a Final Quiz.
            {date ? ` ${date} · ${settings.venue}.` : ""} The Top {settings.winnersCount} win a Goodie Hamper and every
            player gets an e-certificate.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!board?.finalized && (
            <Link
              href={`${BR_BASE}/register`}
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110"
              style={{ background: "linear-gradient(rgba(6,18,36,.3),rgba(6,18,36,.3)), linear-gradient(120deg,#1C7BD9,#21B67A)" }}
            >
              Join the battle <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={`${BR_BASE}/leaderboard`}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[#16181d]/20 bg-white px-6 text-[15px] font-semibold text-[#16181d] hover:border-[#16181d]/40"
          >
            <Trophy className="h-4 w-4 text-[#b98500]" /> Full leaderboard
          </Link>
        </div>
      </div>
      <Podium rows={rows} className="mt-10" />
    </section>
  );
}
