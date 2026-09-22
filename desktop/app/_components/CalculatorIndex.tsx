"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, PageHeader, SearchField } from "./parts";
import {
  ALL_SLUGS,
  catalogGroups,
  searchTools,
  toolHref,
  toolName,
  toolShortName,
} from "../_data/catalog";
import { cn } from "@/lib/utils";

/**
 * Every calculator in the build, grouped by category (spec §19).
 *
 * Server-rendered markup with a client filter on top: the whole list is in the
 * HTML, so it is readable the instant the window opens rather than after
 * hydration. Categories come from the shared registry, so they are the
 * categories the calculators genuinely fall into.
 */
export function CalculatorIndex() {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => catalogGroups(), []);
  const matches = useMemo(() => {
    const trimmed = query.trim();
    return trimmed ? new Set(searchTools(trimmed)) : null;
  }, [query]);

  const visible = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          slugs: matches ? group.slugs.filter((slug) => matches.has(slug)) : group.slugs,
        }))
        .filter((group) => group.slugs.length > 0),
    [groups, matches],
  );

  const shown = visible.reduce((total, group) => total + group.slugs.length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      <PageHeader
        eyebrow="Calculators"
        title="All calculators"
        lead={`${ALL_SLUGS.length} pharmaceutical calculators, grouped into ${groups.length} categories. Every one of them runs on this computer.`}
      />

      <div className="mb-6">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search calculators"
          placeholder="Search by name — “molarity”, “creatinine”, “F value”…   (press /)"
        />
        <p className="mt-2 text-[13px] text-muted-foreground" aria-live="polite">
          {matches
            ? `${shown} of ${ALL_SLUGS.length} calculators match.`
            : `Showing all ${ALL_SLUGS.length} calculators.`}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={`Nothing matches “${query.trim()}”`}
          body="Try a shorter term, the quantity you are solving for, or clear the search to browse every category."
        />
      ) : (
        <div className="space-y-9">
          {visible.map((group) => (
            <section key={group.id} aria-labelledby={`cat-${group.id}`}>
              <div className="mb-3.5">
                <h2
                  id={`cat-${group.id}`}
                  className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground"
                >
                  <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
                  {group.label}
                  <span className="font-mono text-[11px] font-normal text-muted-foreground">
                    {group.slugs.length}
                  </span>
                </h2>
                <p className="mt-1 pl-[13px] text-[13px] text-muted-foreground">{group.desc}</p>
              </div>

              <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {group.slugs.map((slug, index) => (
                  <li key={slug} className="pw-rise" style={{ ["--i" as string]: Math.min(index, 12) }}>
                    <Link
                      href={toolHref(slug)}
                      title={toolName(slug)}
                      className={cn(
                        "flex h-full flex-col rounded-xl border border-border/80 bg-card px-4 py-3.5",
                        "transition-[border-color,box-shadow,transform] duration-200",
                        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      <span className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
                        {toolShortName(slug)}
                      </span>
                      <span className="mt-1 text-[12px] leading-snug text-muted-foreground">
                        {toolName(slug)}
                      </span>
                    </Link>
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
