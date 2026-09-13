"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The frame every migrated calculator sits in.
 *
 * Two jobs, pulling in opposite directions:
 *  - On a phone it must be a single, thumb-friendly column. The old pages used
 *    `max-w-7xl` with fixed multi-column grids, which squeezed fields badly.
 *  - On a desktop a lone 2xl column left most of the viewport empty, so the
 *    layout widens into a main column plus a sticky sidebar carrying the
 *    explanatory content and an ad slot.
 *
 * `aside` renders to the right from `lg` up, and simply follows the main content
 * on smaller screens — no duplicated markup, no hidden copies.
 *
 * Visual language (shared with the landing page): a mono instrument label over
 * a tightly tracked title, hairline rules instead of heavy boxes, and the
 * result — not the chrome — as the loudest thing on the screen.
 */
export function CalculatorShell({
  title,
  subtitle,
  icon: Icon,
  eyebrow = "Calculator",
  children,
  aside,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** The small mono label above the title, e.g. "Pharmacokinetics". */
  eyebrow?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-screen bg-muted/40", className)}
      // No top padding here. The website's fixed header already renders an
      // in-flow spacer of its own height, so padding by --calc-top-offset as
      // well stacked a second ~80px gap above every kit calculator (tracker
      // F16, measured 141px header→title vs 56px on an old page). The offset
      // is still needed below, for the sticky aside, which does sit under
      // the fixed header.
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-10">
        <header className="mb-6 border-b border-border/80 pb-5 sm:mb-8 sm:pb-7">
          <div className="flex items-start gap-3.5 sm:gap-4">
            {Icon && (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
            )}
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {eyebrow}
              </p>
              <h1 className="mt-1.5 text-[1.6rem] font-bold leading-[1.05] tracking-[-0.03em] text-foreground [text-wrap:balance] sm:text-[2.6rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[17px]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className={cn("gap-8", aside && "lg:grid lg:grid-cols-[minmax(0,1fr)_21rem]")}>
          <div className="space-y-4 sm:space-y-5">{children}</div>

          {aside && (
            <aside className="mt-6 space-y-4 lg:mt-0">
              {/* Sticky so the reference material stays in view while a long
                  form is being filled in. Offset by the fixed site header. */}
              <div
                className="space-y-4 lg:sticky"
                style={{ top: "calc(var(--calc-top-offset, 0px) + 1.5rem)" }}
              >
                {aside}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/** A titled group of inputs. Keeps long calculators scannable. */
export function CalcSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6",
        className,
      )}
    >
      {title && (
        <div className="mb-4 sm:mb-5">
          <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">
            {/* A short rule, the kit's section mark — quieter than an icon. */}
            <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
            {title}
          </h2>
          {description && (
            <p className="mt-1 pl-[13px] text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * One column on a phone, two from `sm` up. Never a fixed multi-column grid —
 * that is the single biggest reason the old pages felt cramped on mobile.
 */
export function FieldGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
