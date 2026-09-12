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
 */
export function CalculatorShell({
  title,
  subtitle,
  icon: Icon,
  children,
  aside,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-screen bg-muted/40", className)}
      // The website's header is `fixed`, the app's is in flow. Each surface sets
      // --calc-top-offset in its own globals.css, so no calculator hard-codes it.
      style={{ paddingTop: "var(--calc-top-offset, 0px)" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <header className="mb-5 sm:mb-6">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold leading-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className={cn("gap-6", aside && "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]")}>
          <div className="space-y-4">{children}</div>

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
    <section className={cn("rounded-xl border bg-card p-4 sm:p-5", className)}>
      {title && (
        <div className="mb-4">
          <h2 className="text-[15px] sm:text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
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
