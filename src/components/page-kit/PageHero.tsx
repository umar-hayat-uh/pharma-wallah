import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";
import { BRAND_SURFACE } from "./brand";

export type TrailItem = { label: string; href?: string };

/**
 * The top of a page, in the language set on 2026-09-13.
 *
 * It replaces the pattern most pages grew independently: a decorative hero
 * with blurred circles, a pill badge and a centred title. Here the title does
 * the work — Outfit at display size with tight tracking, a mono eyebrow, a lead
 * in muted ink, and a hairline rule underneath. The brand gradient is kept for
 * surfaces that should read as the brand (`ground="brand"`), with a scrim so
 * its text passes contrast.
 *
 * Server-component safe (no hooks, no handlers), so a server page such as
 * `courses/[subjectSlug]` can render it directly.
 *
 *  - `trail`   breadcrumb; the last item is the current page and is not linked.
 *  - `actions` buttons, rendered after the lead.
 *  - `meta`    usually a <FigureRow>, ruled off beneath the title block.
 *  - `aside`   right-hand column from `lg` up (a specimen, a preview, a search box).
 *  - `ground`  `board` (warm white) for most pages; `brand` — the blue→green
 *              gradient surface — for the one page in a family that should read
 *              as a cover. Use `brand` sparingly. There is no black ground: the
 *              product's theme is the brand gradient (user decision, 2026-09-13).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  trail,
  actions,
  meta,
  aside,
  ground = "board",
  size = "default",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  trail?: TrailItem[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  aside?: React.ReactNode;
  ground?: "board" | "brand";
  /** `display` for hubs and covers; `default` for detail pages. */
  size?: "default" | "display";
  className?: string;
}) {
  const ink = ground === "brand";

  return (
    <header
      style={ink ? { background: BRAND_SURFACE } : undefined}
      className={cn(
        ink
          ? "text-white"
          : "border-b border-[#16181d]/10 bg-[#fcfcfa] text-[#16181d] dark:border-white/10 dark:bg-[#0b0c0e] dark:text-[#f7f5f1]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
        {trail && trail.length > 0 && <Trail items={trail} inverse={ink} />}

        <div className={cn("gap-12", aside && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end")}>
          <div className="min-w-0">
            {eyebrow && (
              <Eyebrow dot tone={ink ? "inverse" : "default"}>
                {eyebrow}
              </Eyebrow>
            )}
            <h1
              className={cn(
                "mt-4 font-bold [text-wrap:balance]",
                size === "display"
                  ? "text-[clamp(2.6rem,1.4rem+5.4vw,6.25rem)] leading-[0.95] tracking-[-0.045em]"
                  : "text-[clamp(2rem,1.3rem+2.9vw,3.75rem)] leading-[1] tracking-[-0.035em]",
              )}
            >
              {title}
            </h1>
            {lead && (
              <p
                className={cn(
                  "mt-5 max-w-2xl text-[clamp(1rem,0.94rem+0.3vw,1.2rem)] leading-relaxed [text-wrap:pretty]",
                  ink ? "text-white/90" : "text-[#16181d]/62 dark:text-[#f7f5f1]/62",
                )}
              >
                {lead}
              </p>
            )}
            {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>

          {aside && <div className="mt-10 min-w-0 lg:mt-0">{aside}</div>}
        </div>

        {meta && (
          <div className={cn("mt-10 border-t pt-6 sm:mt-12", ink ? "border-white/25" : "border-[#16181d]/10 dark:border-white/10")}>
            {meta}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Breadcrumb as a mono trail. Rendered as `nav > ol` for assistive technology,
 * with `list-none` doubled up because globals.css puts bullets and padding on
 * every `ol`/`li` that is not inside `.prose` (MEMORY.md gotcha 30b).
 */
export function Trail({ items, inverse = false }: { items: TrailItem[]; inverse?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 sm:mb-10">
      <ol className="!m-0 flex !list-none flex-wrap items-center gap-x-1.5 gap-y-1 !p-0">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="!m-0 flex items-center gap-1.5 !p-0 font-mono text-[11px] uppercase tracking-[0.12em]">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60",
                    inverse
                      ? "text-white/80 hover:text-white"
                      : "text-[#16181d]/45 hover:text-[#16181d] dark:text-[#f7f5f1]/45 dark:hover:text-[#f7f5f1]",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={inverse ? "text-white" : "text-[#16181d]/80 dark:text-[#f7f5f1]/80"}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  className={cn("h-3 w-3", inverse ? "text-white/50" : "text-[#16181d]/25 dark:text-[#f7f5f1]/25")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
