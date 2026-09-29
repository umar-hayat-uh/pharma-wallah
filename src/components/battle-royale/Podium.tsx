/**
 * Battle Royale — the top three on a stage: spotlights, a trophy on each
 * block, blocks ordered 2 · 1 · 3. Server-component safe (CSS motion only),
 * so the home page, the event page and the leaderboard can all render it.
 *
 * Ground is the brand surface (navy scrim over the gradient), not black —
 * CLAUDE.md §6 rule 15. Empty places render as "Your name here" slots, so the
 * stage still reads before anyone has played.
 */
import type { LeaderboardRow } from "@/lib/battle-royale/types";
import { BRAND_SURFACE } from "@/components/page-kit";
import { cn } from "@/lib/utils";
import "./podium.css";

type Place = 1 | 2 | 3;

const METAL: Record<Place, { a: string; b: string; c: string; label: string }> = {
  1: { a: "#8a5d06", b: "#ffe08a", c: "#d4a019", label: "Gold" },
  2: { a: "#6b7280", b: "#f3f4f6", c: "#b6bcc6", label: "Silver" },
  3: { a: "#7a3f12", b: "#f6c79a", c: "#c07a3c", label: "Bronze" },
};

/** A cup, in the metal of its place. */
function Cup({ place, className }: { place: Place; className?: string }) {
  const m = METAL[place];
  const id = `br-cup-${place}`;
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={m.a} />
          <stop offset="0.35" stopColor={m.b} />
          <stop offset="0.6" stopColor={m.c} />
          <stop offset="1" stopColor={m.a} />
        </linearGradient>
      </defs>
      {/* handles */}
      <path d="M26 22 C4 22 4 62 36 66" fill="none" stroke={`url(#${id})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M94 22 C116 22 116 62 84 66" fill="none" stroke={`url(#${id})`} strokeWidth="7" strokeLinecap="round" />
      {/* bowl */}
      <path d="M22 12 H98 C98 58 84 80 60 84 C36 80 22 58 22 12 Z" fill={`url(#${id})`} />
      <path d="M34 18 C34 50 42 66 52 72" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="4" strokeLinecap="round" />
      {/* stem and base */}
      <path d="M52 84 H68 L66 102 H54 Z" fill={`url(#${id})`} />
      <rect x="38" y="102" width="44" height="10" rx="3" fill={`url(#${id})`} />
      <rect x="30" y="112" width="60" height="22" rx="4" fill="#16181d" />
      <rect x="44" y="118" width="32" height="10" rx="2" fill={`url(#${id})`} />
    </svg>
  );
}

const ORDER: Place[] = [2, 1, 3];
const BLOCK_H: Record<Place, string> = { 1: "h-36 sm:h-44", 2: "h-24 sm:h-32", 3: "h-16 sm:h-24" };
const CUP_W: Record<Place, string> = { 1: "w-20 sm:w-28", 2: "w-16 sm:w-20", 3: "w-14 sm:w-[4.5rem]" };

export function Podium({
  rows,
  highlightCode,
  size = "md",
  className,
}: {
  rows: LeaderboardRow[];
  highlightCode?: string | null;
  size?: "md" | "lg";
  className?: string;
}) {
  // Rank ties share a number; the stage shows the first three rows in board order.
  const top = rows.slice(0, 3);
  return (
    <div
      className={cn("br-podium relative overflow-hidden rounded-[2rem] px-3 pb-0 pt-10 text-white sm:px-8 sm:pt-14", className)}
      style={{ background: BRAND_SURFACE }}
    >
      {/* The lights sit in a layer the same width as the stage below, so each
          one is centred on its own column (2 · 1 · 3), whatever the panel width. */}
      <div className="pointer-events-none absolute inset-0 px-3 sm:px-8" aria-hidden="true">
        <div className="relative mx-auto h-full max-w-3xl">
          <span className="br-podium__beam br-podium__beam--side" style={{ left: "16.6667%" }} />
          <span className="br-podium__beam br-podium__beam--c" style={{ left: "50%" }} />
          <span className="br-podium__beam br-podium__beam--side" style={{ left: "83.3333%" }} />
        </div>
      </div>

      <ol className="relative mx-auto grid max-w-3xl grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Top three">
        {ORDER.map((place, i) => {
          const r = top[place - 1];
          const mine = Boolean(r && highlightCode && r.code === highlightCode);
          return (
            <li key={place} className="br-podium__place flex min-w-0 flex-col items-center" style={{ animationDelay: `${[240, 0, 420][i]}ms` }}>
              <div className="mb-2 min-w-0 max-w-full px-1 text-center">
                <p className={cn("truncate font-bold", size === "lg" ? "text-lg sm:text-2xl" : "text-sm sm:text-lg", !r && "text-white/60")}>
                  {r ? r.name : "Your name here"}
                </p>
                <p className={cn("truncate text-white/75", size === "lg" ? "text-sm sm:text-base" : "text-[11px] sm:text-sm")}>
                  {r ? r.university : "Play to claim it"}
                </p>
                <p className={cn("mt-0.5 font-extrabold tracking-tight", size === "lg" ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl", !r && "text-white/40")}>
                  {r ? r.total : "—"}
                  {r && <span className="ml-1 text-xs font-semibold text-white/70">pts</span>}
                </p>
              </div>
              <Cup place={place} className={cn("br-podium__cup drop-shadow-[0_10px_18px_rgba(0,0,0,.35)]", CUP_W[place], !r && "opacity-45")} />
              <div
                className={cn(
                  "br-podium__block relative mt-1 flex w-full items-start justify-center rounded-t-2xl pt-2 sm:pt-4",
                  BLOCK_H[place],
                  mine && "ring-4 ring-[#f5b301]",
                )}
              >
                <span className={cn("font-extrabold leading-none text-[#16181d]", place === 1 ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl")}>{place}</span>
                <span className="sr-only">{METAL[place].label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
