"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { EmptyState, PageHeader, SearchField } from "./parts";
import { allFormulas, searchFormulas, type FormulaEntry } from "../_data/formulas";
import { toolHref, toolName } from "../_data/catalog";

/**
 * The formula reference (spec §14).
 *
 * Each entry states the identity, then defines every symbol in it, then links
 * to the calculator that applies it — formula, then meaning, then the tool that
 * does the arithmetic. The worked substitution the spec describes belongs on
 * the calculator itself, where the numbers are, so the link is the hand-off.
 */
export function FormulaLibrary() {
  const [query, setQuery] = useState("");
  const all = useMemo(() => allFormulas(), []);
  const rows = useMemo(() => searchFormulas(query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FormulaEntry[]>();
    for (const entry of rows) {
      const list = map.get(entry.group) ?? [];
      list.push(entry);
      map.set(entry.group, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-8">
      <PageHeader
        eyebrow="Reference"
        title="Formulas"
        lead={`${all.length} formulas with every symbol defined. Each one links to the PharmaWallah calculator that applies it — the calculator, not this page, is the authority on how a figure is produced.`}
      />

      <div className="mb-6">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search formulas"
          placeholder="Search a formula or a symbol — “C1V1”, “clearance”, “pKa”, “Rf”…   (press /)"
          autoFocus
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={`No formula matches “${query.trim()}”`}
          body="Try the quantity you are solving for, or a symbol from the equation. The calculators themselves carry a “how this is calculated” panel with the full working."
        />
      ) : (
        <div className="space-y-9">
          {grouped.map(([group, entries]) => (
            <section key={group}>
              <h2 className="mb-3.5 flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
                {group}
                <span className="font-mono text-[11px] font-normal text-muted-foreground">
                  {entries.length}
                </span>
              </h2>

              <ul className="space-y-3">
                {entries.map((entry, index) => (
                  <li key={entry.id} className="pw-rise" style={{ ["--i" as string]: Math.min(index, 10) }}>
                    <article className="rounded-2xl border border-border/80 bg-card p-5">
                      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                        {entry.name}
                      </h3>

                      {/* The formula reads as a formula, not as prose — same
                          treatment the calculator kit's <Formula> gives it. */}
                      <p className="mt-2.5 overflow-x-auto rounded-lg border border-border/70 border-l-[3px] border-l-primary bg-muted/60 px-3.5 py-3 font-mono text-[13.5px] leading-relaxed text-foreground">
                        {entry.expression}
                      </p>

                      <dl className="mt-3.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                        {entry.symbols.map((symbol) => (
                          <div key={symbol.symbol} className="flex gap-2 text-[13px] leading-relaxed">
                            <dt className="shrink-0 font-mono font-semibold text-foreground">
                              {symbol.symbol}
                            </dt>
                            <dd className="min-w-0 text-muted-foreground">{symbol.meaning}</dd>
                          </div>
                        ))}
                      </dl>

                      {entry.note && (
                        <p className="mt-3 border-t border-border/60 pt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                          {entry.note}
                        </p>
                      )}

                      {entry.slug && (
                        <Link
                          href={toolHref(entry.slug)}
                          className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Open {toolName(entry.slug)}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
