"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BR_BASE } from "@/lib/battle-royale/constants";

const LINKS = [
  { href: BR_BASE, label: "Overview" },
  { href: `${BR_BASE}/register`, label: "Register" },
  { href: `${BR_BASE}/instructions`, label: "Instructions" },
  { href: `${BR_BASE}/status`, label: "My status" },
  { href: `${BR_BASE}/leaderboard`, label: "Leaderboard" },
];

/** The event's own tabs, under the site header. Hidden on the chromeless apps. */
export function EventNav() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith(`${BR_BASE}/battle`) || pathname.startsWith(`${BR_BASE}/admin`)) return null;

  return (
    <nav aria-label="Battle Royale" className="br-no-print relative z-10 border-b border-[#16181d]/10 bg-[#fcfcfa]/95">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none]">
        <span className="mr-3 hidden shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#1C7BD9] md:inline">
          Battle Royale
        </span>
        {LINKS.map((l) => {
          const active = l.href === BR_BASE ? pathname === BR_BASE : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative shrink-0 px-3 py-3.5 text-sm font-medium transition-colors",
                active ? "text-[#16181d]" : "text-[#16181d]/55 hover:text-[#16181d]",
              )}
            >
              {l.label}
              {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#1C7BD9]" />}
            </Link>
          );
        })}
        <Link
          href={`${BR_BASE}/battle`}
          className="ml-auto shrink-0 rounded-lg bg-[#1C7BD9]/10 px-3 py-1.5 text-sm font-semibold text-[#1462b0] hover:bg-[#1C7BD9]/15"
        >
          Enter arena
        </Link>
      </div>
    </nav>
  );
}
