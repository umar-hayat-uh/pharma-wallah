"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BRAND_SURFACE } from "@/components/page-kit/brand";

export type ResultTone = "neutral" | "success" | "warning" | "danger";

/*
 * Every result sits on the same brand-gradient instrument face, and the tone is carried
 * by three coordinated marks — the top rule, the status dot and the
 * interpretation pill — instead of flooding the whole card. A full red card
 * made every "danger" look identical; the pill states *what* is wrong, in a
 * colour that still reads at a glance on a phone in daylight.
 */
const TONE_STYLES: Record<ResultTone, { rule: string; dot: string; pill: string }> = {
  neutral: { rule: "bg-white/60", dot: "bg-white", pill: "bg-white/15 text-white" },
  success: { rule: "bg-emerald-500", dot: "bg-emerald-400", pill: "bg-emerald-500 text-white" },
  warning: { rule: "bg-amber-400", dot: "bg-amber-400", pill: "bg-amber-400 text-slate-950" },
  danger: { rule: "bg-red-500", dot: "bg-red-400", pill: "bg-red-500 text-white" },
};

/**
 * The answer, stated once and unmistakably.
 *
 * The old pages tended to bury the result in a row of equal-weight boxes below
 * a long form. On a phone that means scrolling past every input to find out
 * what the calculator said — so the result gets its own high-contrast card, and
 * an `interpretation` line that says what the number *means* in words.
 */
export function ResultCard({
  label,
  value,
  unit,
  interpretation,
  tone = "neutral",
  empty,
  className,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  /** Plain-language reading of the number, e.g. "Normal range" or "Dose too high". */
  interpretation?: string;
  tone?: ResultTone;
  /** Shown instead of the value before there is enough input. */
  empty?: string;
  className?: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";

  if (!hasValue) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border bg-card px-5 py-6 sm:px-6",
          className,
        )}
        aria-live="polite"
      >
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 flex items-baseline gap-3">
          <span className="text-5xl font-bold leading-none tracking-[-0.04em] text-muted-foreground/25" aria-hidden="true">
            —
          </span>
          <span className="text-sm leading-relaxed text-muted-foreground">
            {empty ?? "Enter the values above to see the result."}
          </span>
        </p>
      </div>
    );
  }

  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl px-5 pb-5 pt-6 text-white shadow-lg shadow-slate-950/10 sm:px-6 sm:pb-6",
        className,
      )}
      // The brand surface, not ink (user's rule, 2026-09-13). Small text on it
      // stays at white/90 or brighter — that is what keeps it at AA.
      style={{ background: BRAND_SURFACE }}
      aria-live="polite"
    >
      <span className={cn("absolute inset-x-0 top-0 h-1", styles.rule)} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/90">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} aria-hidden="true" />
          <span className="truncate">{label}</span>
        </p>
        <CopyButton text={`${label}: ${value}${unit ? ` ${unit}` : ""}${interpretation ? ` (${interpretation})` : ""}`} />
      </div>

      {/* Keyed on the value, so the figure settles in again every time the
          answer changes — the eye is drawn to what just moved. */}
      <p key={String(value)} className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 animate-calc-result motion-reduce:animate-none">
        <span className="text-[2.75rem] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-6xl">
          {value}
        </span>
        {unit && <span className="font-mono text-sm text-white/90 sm:text-base">{unit}</span>}
      </p>

      {interpretation && (
        <p className="mt-4">
          <span
            className={cn(
              "inline-flex max-w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium leading-snug",
              styles.pill,
            )}
          >
            {interpretation}
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * Copy the result as a sentence, for pasting into notes or a chat with a
 * classmate. Fails silently where the Clipboard API is unavailable.
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // No clipboard permission (insecure context, old WebView): nothing to do.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Result copied" : "Copy result"}
      className="-mr-1.5 -mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/80 transition-colors duration-300 ease-out-expo hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

/** A secondary figure — intermediate steps, derived values, reference numbers. */
export function ResultRow({
  label,
  value,
  unit,
  badge,
  badgeTone,
}: {
  label: string;
  value: string | number;
  unit?: string;
  badge?: string;
  badgeTone?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-foreground">
        {value}
        {unit && <span className="font-mono text-xs font-normal text-muted-foreground">{unit}</span>}
        {badge && <Badge variant={badgeTone ?? "secondary"}>{badge}</Badge>}
      </span>
    </div>
  );
}
