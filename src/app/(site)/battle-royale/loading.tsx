import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest } from "@/components/battle-royale/ui";

/**
 * Route-level loading screen for every Battle Royale page: the event wordmark
 * on the brand surface, so navigating between event pages (or opening the
 * arena on a slow connection) never shows a blank frame.
 */
export default function Loading() {
  return (
    <div
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: BRAND_SURFACE }}
      role="status"
      aria-live="polite"
    >
      <div className="br-grid" aria-hidden="true" />
      <div className="br-sheen" aria-hidden="true" />
      <div className="relative flex flex-col items-center text-center">
        <Crest size={72} className="animate-pulse motion-reduce:animate-none" />
        <p className="mt-5 text-sm font-semibold text-white/85">PharmaWallah</p>
        <p className="mt-1 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Battle Royale</p>
        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-1/3 animate-[br-load_1.1s_ease-in-out_infinite] rounded-full bg-white motion-reduce:animate-none" />
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] text-white/80">Loading</p>
      </div>
    </div>
  );
}
