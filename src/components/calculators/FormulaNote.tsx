"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The "how it works" material, collapsed by default.
 *
 * Every calculator carries a formula, worked example and caveats. Shown inline
 * they dominate a phone screen and push the actual inputs below the fold, so
 * they live behind a disclosure: available to a student who wants to learn,
 * invisible to a pharmacist who just needs the number.
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

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-accent"
      >
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-primary/10 text-primary">
          <BookOpen className="w-4 h-4" />
        </span>
        <span className="flex-1 text-[15px] font-medium text-foreground">{title}</span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-muted-foreground space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

/** A formula rendered so it reads as a formula, not as prose. */
export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-muted px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground overflow-x-auto">
      {children}
    </p>
  );
}
