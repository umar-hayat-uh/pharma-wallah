import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The Science Fair 2026 launch strip, shown directly under the header on the
 * landing page.
 *
 * Redesigned 2026-09-13 to match the landing page's instrument language: an ink
 * bar, a live status dot and mono labels, instead of the blue→indigo→emerald
 * gradient with shimmer and blurred orbs — which is the generic "AI gradient"
 * the top-design skill names as an anti-pattern, and which competed with the
 * hero for attention. It is an announcement; it should read like a ticker.
 */
export function OfficialLaunchBanner() {
  return (
    <Link
      href="/pw"
      className="group relative block w-full bg-[#0b0c0e] text-[#f7f5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
      aria-label="Science Fair 2026 — play the PharmaWallah Rapid Pharmacy Quiz"
    >
      <div className="mx-auto flex min-h-[44px] max-w-7xl items-center gap-3 px-4 py-2 sm:gap-5 sm:px-6 lg:px-8">
        {/* Live status */}
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-emerald-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>

        <span className="hidden h-4 w-px shrink-0 bg-white/15 sm:block" aria-hidden="true" />

        <p className="min-w-0 flex-1 truncate text-[13px] leading-tight sm:text-sm">
          <span className="font-semibold tracking-[-0.01em]">Science Fair 2026</span>
          <span className="hidden text-white/55 sm:inline">
            {" "}
            — the PharmaWallah Rapid Pharmacy Quiz is open
          </span>
        </p>

        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em]">
          <span className="relative hidden sm:inline">
            Play now
            {/* Underline wipes in from the left on hover. */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 right-0 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
            />
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-[background-color,transform] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:bg-[#1c7bd9]">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </div>
    </Link>
  );
}
