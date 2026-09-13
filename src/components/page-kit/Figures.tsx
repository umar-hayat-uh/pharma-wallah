import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A figure is a fact, so it states its unit and its scope in words.
 *
 * Rules this component exists to enforce (each was a real fault on this site):
 *  - `label` is required. A bare "24+" on the spotting hub was wrong by 11 and
 *    nothing on screen said what it counted.
 *  - `note` marks a number that is estimated or not measured, e.g. "estimated
 *    at 200 wpm". It renders on screen, not in a tooltip.
 *  - `href` makes the figure an entry point into the view it counts. Count the
 *    figure *through* the same filter the destination applies.
 *  - Figures are tabular (`tabular-nums`) so a row of them aligns.
 *
 * Server-component safe.
 */
export type FigureProps = {
  value: React.ReactNode;
  /** Short unit set in mono after the value: "min", "tools", "%". */
  unit?: string;
  /** What the number counts, in words: "calculators in the catalogue". */
  label: string;
  /** Qualifier shown under the label: "estimated", "last 7 days". */
  note?: string;
  href?: string;
  className?: string;
};

export function Figure({ value, unit, label, note, href, className }: FigureProps) {
  const body = (
    <>
      <span className="flex items-baseline gap-1.5">
        <span className="text-[clamp(1.9rem,1.5rem+1.6vw,3rem)] font-bold leading-none tracking-[-0.045em] tabular-nums text-[#16181d] dark:text-[#f7f5f1]">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-[#16181d]/50 dark:text-[#f7f5f1]/50">{unit}</span>
        )}
        {href && (
          <ArrowUpRight
            className="ml-auto h-4 w-4 self-start text-[#16181d]/30 transition-[transform,color] duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1c7bd9] dark:text-[#f7f5f1]/30"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="mt-2 block text-sm leading-snug text-[#16181d]/65 dark:text-[#f7f5f1]/65">{label}</span>
      {note && (
        <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#16181d]/40 dark:text-[#f7f5f1]/40">
          {note}
        </span>
      )}
    </>
  );

  const base = "block min-w-0 py-4 pr-4";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group rounded-sm transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60 focus-visible:ring-offset-2",
          className,
        )}
      >
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}

/**
 * A hairline-ruled row of figures. Two columns on a phone, up to `columns` from
 * `md`. Pass only the figures that exist — a hidden figure must leave the array,
 * or the row lays out with a hole in it.
 */
export function FigureRow({
  figures,
  columns = 4,
  className,
}: {
  figures: FigureProps[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }[columns];
  return (
    <div
      role="list"
      className={cn(
        "grid grid-cols-2 divide-[#16181d]/10 dark:divide-white/10 md:divide-x",
        "[&>*]:border-t [&>*]:border-[#16181d]/10 dark:[&>*]:border-white/10 md:[&>*]:border-t-0 md:[&>*:not(:first-child)]:pl-5",
        "[&>*:nth-child(-n+2)]:border-t-0 [&>*:nth-child(even)]:pl-4",
        cols,
        className,
      )}
    >
      {figures.map((f) => (
        <div role="listitem" key={f.label} className="min-w-0">
          <Figure {...f} />
        </div>
      ))}
    </div>
  );
}
