"use client";

import { useId, useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapse } from "./Collapse";

/**
 * The "how it works" material, collapsed by default.
 *
 * Every calculator carries a formula, worked example and caveats. Shown inline
 * they dominate a phone screen and push the actual inputs below the fold, so
 * they live behind a disclosure: available to a student who wants to learn,
 * invisible to a pharmacist who just needs the number. The content stays in the
 * HTML when closed (see Collapse), so search engines still index the formula.
 */
export function FormulaNote({
  title = "How this is calculated",
  defaultOpen = false,
  children,
  className,
}: {
  title?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card", className)}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-300 ease-out-expo hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5 sm:py-4"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
          <BookOpen className="h-4 w-4" />
        </span>
        <span className="flex-1 text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</span>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
          {open ? "Hide" : "Show"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-out-expo",
            open && "rotate-180",
          )}
        />
      </button>

      <Collapse open={open} id={panelId}>
        <div className="space-y-3 border-t border-border/70 px-4 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

/** A formula rendered so it reads as a formula, not as prose. */
export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="overflow-x-auto rounded-lg border border-border/70 border-l-[3px] border-l-primary bg-muted/60 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground">
      {children}
    </p>
  );
}
