"use client";

import { cn } from "@/lib/utils";

/**
 * Height-animating disclosure body, shared by FormulaNote and CalcFaq.
 *
 * Animates `grid-template-rows` 0fr → 1fr, which is the one way to transition
 * to an unknown content height without measuring it in JavaScript. The content
 * is always in the DOM — so a crawler reads the formula and the FAQ answers —
 * but `visibility` flips to hidden once the close finishes, which takes any
 * links inside out of the tab order and away from screen readers.
 *
 * Internal to the kit; not exported from index.ts.
 */
export function Collapse({
  open,
  id,
  children,
  className,
}: {
  open: boolean;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "grid motion-reduce:transition-none",
        open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
      )}
      style={{
        transition: open
          ? "grid-template-rows 500ms cubic-bezier(0.16, 1, 0.3, 1), visibility 0s"
          : "grid-template-rows 500ms cubic-bezier(0.16, 1, 0.3, 1), visibility 0s 500ms",
      }}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}
