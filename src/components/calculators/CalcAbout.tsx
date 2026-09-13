"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapse } from "./Collapse";

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
    <section className={cn("rounded-2xl border border-border/80 bg-card p-4 sm:p-5", className)}>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
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
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      {/* role="list" restores list semantics that Safari drops once the
          bullets are removed; div markup avoids globals.css's ul/li rules. */}
      <div role="list" className="mt-2.5 space-y-2">
        {items.map((item) => (
          <div role="listitem" key={item} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
            <span
              className={cn(
                "mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full",
                tone === "caution" ? "bg-amber-500" : "bg-primary",
              )}
              aria-hidden="true"
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Common questions, collapsed. Also gives crawlers Q&A-shaped content. */
export function CalcFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <h2 className="px-4 pb-2 pt-4 text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:px-5 sm:pt-5 sm:text-base">
        Common questions
      </h2>
      <div className="divide-y divide-border/70 border-t border-border/70">
        {items.map((item) => (
          <FaqItem key={item.q} {...item} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-300 ease-out-expo hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5"
      >
        <span className="flex-1 text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-out-expo",
            open && "rotate-180",
          )}
        />
      </button>
      <Collapse open={open} id={panelId}>
        <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">{a}</p>
      </Collapse>
    </div>
  );
}
