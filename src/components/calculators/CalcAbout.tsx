"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Explanatory content about the calculator: what it is for, when to use it, how
 * to read the result, and where it stops being reliable.
 *
 * Two reasons this exists beyond filling the desktop sidebar: students using
 * these tools to learn need the context, and search engines need real content on
 * a page whose interactive part is invisible to a crawler.
 */
export function CalcAbout({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 sm:p-5", className)}>
      <h2 className="text-[15px] sm:text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

/** A labelled list — "when to use", "limitations", "what affects the result". */
export function CalcList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "caution";
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
            <span
              className={cn(
                "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                tone === "caution" ? "bg-amber-500" : "bg-primary",
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Common questions, collapsed. Also gives crawlers Q&A-shaped content. */
export function CalcFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <h2 className="px-4 pt-4 pb-1 text-[15px] sm:text-base font-semibold text-foreground sm:px-5 sm:pt-5">
        Common questions
      </h2>
      <div className="divide-y">
        {items.map((item) => (
          <FaqItem key={item.q} {...item} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-accent sm:px-5"
      >
        <span className="flex-1 text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">{a}</p>
      )}
    </div>
  );
}
