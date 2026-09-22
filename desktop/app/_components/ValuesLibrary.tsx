"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, PageHeader, SearchField } from "./parts";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  VALUES,
  searchValues,
  valueCounts,
  type ValueCategory,
  type ValueRow,
} from "../_data/values";

/**
 * The searchable pharmaceutical values library (spec §9).
 *
 * The search is a pure function over an in-memory array — no request, no index
 * to download, nothing to fail when there is no network. The whole library is
 * about 250 rows, so filtering on every keystroke is imperceptible and there is
 * no reason to debounce it.
 *
 * Every row shows where its number came from. That is not decoration: a value
 * a student cannot trace is a value they should not use.
 */
export function ValuesLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ValueCategory | "all">("all");

  const counts = useMemo(() => valueCounts(), []);
  const rows = useMemo(() => searchValues(query, category), [query, category]);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      <PageHeader
        eyebrow="Reference"
        title="Pharmaceutical values"
        lead={`${VALUES.length} molecular weights, atomic weights, densities, sodium chloride equivalents, constants and conversion factors — all stored inside this application.`}
      />

      <div className="mb-5">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search pharmaceutical values"
          placeholder="Search a value — “paracetamol”, “Na”, “glycerol”, “Avogadro”…   (press /)"
          autoFocus
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <CategoryChip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="All"
          count={VALUES.length}
        />
        {CATEGORY_ORDER.map((id) => (
          <CategoryChip
            key={id}
            active={category === id}
            onClick={() => setCategory(id)}
            label={CATEGORY_LABELS[id]}
            count={counts[id]}
          />
        ))}
      </div>

      <p className="mb-4 text-[13px] text-muted-foreground" aria-live="polite">
        {rows.length === VALUES.length
          ? `Showing all ${VALUES.length} values.`
          : `${rows.length} ${rows.length === 1 ? "value" : "values"} shown.`}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title={`Nothing matches “${query.trim()}”`}
          body="This library holds the values PharmaWallah can source — molecular weights from PubChem, atomic weights from IUPAC, and the reference tables inside the calculators. A value it cannot source is deliberately absent rather than guessed."
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 400).map((row, index) => (
            <li key={row.id} className="pw-rise" style={{ ["--i" as string]: Math.min(index, 10) }}>
              <ValueCard row={row} />
            </li>
          ))}
        </ul>
      )}

      {rows.length > 400 && (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Showing the first 400 of {rows.length}. Narrow the search to see the rest.
        </p>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("ml-1.5 font-mono text-[11px]", active ? "text-white/75" : "text-muted-foreground/70")}>
        {count}
      </span>
    </button>
  );
}

function ValueCard({ row }: { row: ValueRow }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = `${row.name}: ${row.value}${row.unit ? ` ${row.unit}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // No clipboard permission. The value is on screen either way.
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {row.name}
          </p>
          {row.detail && (
            <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">{row.detail}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <p className="text-right">
            <span className="text-[1.35rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-foreground">
              {row.value}
            </span>
            {row.unit && (
              <span className="ml-1.5 font-mono text-[12px] text-muted-foreground">{row.unit}</span>
            )}
          </p>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? `${row.name} copied` : `Copy ${row.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {row.note && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{row.note}</p>
      )}
      <p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground/80">
        Source: {row.source}
      </p>
    </div>
  );
}
