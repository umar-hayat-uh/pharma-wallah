"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ShieldCheck, X } from "lucide-react";

/**
 * The home screen's header: a small drifting "lab in space" — twinkling
 * stars, two slow nebulae, orbit rings with a glowing electron, floating
 * glyphs (capsule, flask, atom, molecule), and the odd shooting star — with
 * the greeting and the search field on top.
 *
 * Positions are fixed numbers, not Math.random(), so the static HTML and the
 * hydrated page agree. Motion is CSS only (globals.css, .pw-space), paused
 * while the hero is off screen and off under reduced motion.
 */

const STARS = [
  [6, 12, 0], [14, 58, 1.1], [22, 30, 2.3], [31, 76, 0.4], [38, 14, 1.8], [47, 48, 2.9], [55, 22, 0.9],
  [61, 68, 2.1], [68, 8, 1.4], [74, 40, 0.2], [81, 62, 2.6], [88, 18, 1.2], [93, 50, 0.7], [18, 88, 1.6],
  [52, 86, 2.4], [84, 84, 0.5], [3, 40, 2.0], [96, 30, 1.0],
] as const;

export function SpaceHero({
  total,
  query,
  onQuery,
}: {
  total: number;
  query: string;
  onQuery: (q: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <header ref={ref} className="pw-space relative rounded-b-[2rem] pb-6" data-paused={paused}>
      {/* Status-bar inset on Android. */}
      <div className="h-[env(safe-area-inset-top)]" />

      <div aria-hidden="true">
        <span className="pw-nebula left-[-20%] top-[-30%] h-56 w-56 bg-sky-400" />
        <span className="pw-nebula bottom-[-35%] right-[-15%] h-64 w-64 bg-emerald-400" style={{ animationDelay: "-7s" }} />
        {STARS.map(([x, y, d], i) => (
          <span key={i} className="pw-star" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
        ))}
        <span className="pw-shooting" />
        <span className="pw-orbit right-[-3.5rem] top-[-2.5rem] h-44 w-44" />
        <span className="pw-orbit right-[-1.5rem] top-[-0.5rem] h-28 w-28" style={{ animationDuration: "15s", animationDirection: "reverse" }}>
          <span />
        </span>
        <Capsule className="pw-float right-8 top-[4.5rem] h-9 w-9" style={{ ["--r" as string]: "-24deg" }} />
        <Flask className="pw-float right-[4.75rem] top-[7.75rem] h-7 w-7 opacity-80" style={{ animationDelay: "-2.5s", animationDuration: "8.5s" }} />
        <Atom className="pw-float bottom-16 right-5 h-8 w-8 opacity-70" style={{ animationDelay: "-4s", animationDuration: "9.5s" }} />
        <Molecule className="pw-float left-[62%] top-[5.5rem] h-8 w-10 opacity-60" style={{ animationDelay: "-1s", animationDuration: "11s" }} />
      </div>

      <div className="relative px-4 pt-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
            <Capsule className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-bold tracking-[-0.01em]">PharmaWallah</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-white/20">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Works offline
          </span>
        </div>

        <p className="mt-7 font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-white/90">{greeting}</p>
        <h1 className="mt-1.5 max-w-[17rem] text-[1.9rem] font-bold leading-[1.05] tracking-[-0.035em]">
          What are we calculating today?
        </h1>
        <p className="mt-2 text-[13px] text-white/90">
          <span className="font-semibold tabular-nums text-white">{total}</span> pharmacy calculators, in your pocket.
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search dilution, BSA, half-life…"
            aria-label="Search calculators"
            className="h-[3.25rem] w-full rounded-2xl border-0 bg-white pl-11 pr-11 text-[15px] text-slate-900 shadow-[0_12px_30px_-12px_rgba(2,6,23,0.55)] outline-none placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-emerald-300/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 active:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

type GlyphProps = { className?: string; style?: React.CSSProperties };

function Capsule({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none">
      <rect x="4" y="11" width="24" height="10" rx="5" fill="#fff" fillOpacity="0.95" />
      <path d="M16 11h7a5 5 0 0 1 0 10h-7z" fill="#4ade80" />
    </svg>
  );
}

function Flask({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 4h8M13 4v8L6 25a2 2 0 0 0 1.8 3h16.4a2 2 0 0 0 1.8-3L19 12V4" />
      <path d="M9 21h14" stroke="#7dd3fc" />
    </svg>
  );
}

function Atom({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" stroke="#fff" strokeWidth="1.6">
      <ellipse cx="16" cy="16" rx="13" ry="5" />
      <ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(120 16 16)" />
      <circle cx="16" cy="16" r="2.4" fill="#4ade80" stroke="none" />
    </svg>
  );
}

function Molecule({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 40 32" className={className} style={style} fill="none" stroke="#fff" strokeWidth="1.6">
      <path d="M8 22l10-6 10 6 8-10" />
      <circle cx="8" cy="22" r="3.5" fill="#38bdf8" stroke="none" />
      <circle cx="18" cy="16" r="3" fill="#fff" stroke="none" />
      <circle cx="28" cy="22" r="3.5" fill="#4ade80" stroke="none" />
      <circle cx="36" cy="12" r="2.6" fill="#fff" stroke="none" />
    </svg>
  );
}
