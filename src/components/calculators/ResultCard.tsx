"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ResultTone = "neutral" | "success" | "warning" | "danger";

const TONE_STYLES: Record<ResultTone, { card: string; value: string }> = {
  neutral: { card: "bg-primary text-primary-foreground", value: "text-primary-foreground" },
  success: { card: "bg-emerald-600 text-white", value: "text-white" },
  warning: { card: "bg-amber-500 text-white", value: "text-white" },
  danger: { card: "bg-red-600 text-white", value: "text-white" },
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
          "rounded-xl border border-dashed bg-card p-5 text-center",
          className,
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {empty ?? "Enter the values above to see the result."}
        </p>
      </div>
    );
  }

  const styles = TONE_STYLES[tone];

  return (
    <div className={cn("rounded-xl p-5 shadow-sm", styles.card, className)}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className={cn("text-3xl sm:text-4xl font-bold tabular-nums leading-none", styles.value)}>
          {value}
        </span>
        {unit && <span className="text-base font-medium opacity-90">{unit}</span>}
      </p>
      {interpretation && <p className="mt-2.5 text-sm leading-relaxed opacity-95">{interpretation}</p>}
    </div>
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
    <div className="flex items-center justify-between gap-3 py-2.5 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-foreground">
        {value}
        {unit && <span className="font-normal text-muted-foreground">{unit}</span>}
        {badge && <Badge variant={badgeTone ?? "secondary"}>{badge}</Badge>}
      </span>
    </div>
  );
}
