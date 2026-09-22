"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Clock,
  FlaskConical,
  History as HistoryIcon,
  Ruler,
  Sigma,
  WifiOff,
} from "lucide-react";
import { Figure, Panel, SearchField } from "./parts";
import { ALL_SLUGS, catalogGroups, searchTools, toolHref, toolName } from "../_data/catalog";
import { allFormulas } from "../_data/formulas";
import { VALUES } from "../_data/values";
import { LINEAR_FAMILIES } from "../_data/units";
import { getHistory, subscribe, type HistoryEntry } from "../_lib/store";

/**
 * The landing screen (spec §18).
 *
 * Every figure on it is COUNTED, never typed — the calculator total comes from
 * the generated slug list, so it is whatever this build actually contains. The
 * spec's "104+" is not hard-coded anywhere; if a calculator is added tomorrow
 * this screen says 105 without anybody editing it.
 */
export function Dashboard() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<HistoryEntry[]>([]);

  const groups = useMemo(() => catalogGroups(), []);
  const formulaCount = useMemo(() => allFormulas().length, []);
  const results = useMemo(() => (query.trim() ? searchTools(query).slice(0, 8) : []), [query]);

  useEffect(() => {
    let live = true;
    const sync = () => {
      void getHistory().then((entries) => {
        if (live) setRecent(entries.slice(0, 5));
      });
    };
    sync();
    const unsubscribe = subscribe(sync);
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  const sections = [
    {
      href: "/calculation-tools/",
      icon: Calculator,
      title: "Calculators",
      body: `${ALL_SLUGS.length} pharmaceutical calculators across ${groups.length} categories.`,
    },
    {
      href: "/values/",
      icon: FlaskConical,
      title: "Pharmaceutical values",
      body: `${VALUES.length} molecular weights, densities, constants and conversion factors.`,
    },
    {
      href: "/formulas/",
      icon: Sigma,
      title: "Formulas",
      body: `${formulaCount} formulas with every symbol defined, each linked to its calculator.`,
    },
    {
      href: "/convert/",
      icon: Ruler,
      title: "Unit conversions",
      body: `${LINEAR_FAMILIES.length} unit families, plus temperature and % ↔ molarity.`,
    },
    {
      href: "/history/",
      icon: HistoryIcon,
      title: "Calculation history",
      body: "Saved calculations, kept on this computer and exportable as PDF, CSV or text.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      <header className="mb-8">
        <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          PharmaWallah for Windows
        </p>
        <h1 className="mt-2 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.035em] text-foreground">
          Offline Pharmaceutical Calculator Suite
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Everything in this application runs on this computer. There is no account, no sign-in and
          no connection to anything — pull out the network cable and nothing changes.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-5">
          <Figure value={ALL_SLUGS.length} label="Calculators" />
          <Figure value={VALUES.length} label="Reference values" />
          <Figure value={formulaCount} label="Formulas" />
          <Figure value={groups.length} label="Categories" />
        </div>
      </header>

      <Panel className="mb-8">
        <label className="mb-3 block text-[13px] font-medium text-foreground/90" htmlFor="dash-search">
          Find a calculator
        </label>
        <div id="dash-search">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Find a calculator"
            placeholder="Search all calculators — try “dilution”, “half life”, “BSA”…   (press / anywhere)"
            autoFocus
          />
        </div>

        {query.trim() !== "" && (
          <div className="mt-4">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No calculator matches “{query.trim()}”. Try the{" "}
                <Link href="/calculation-tools/" className="font-medium text-primary underline">
                  full list
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={toolHref(slug)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate">{toolName(slug)}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Panel>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <li key={section.href} className="pw-rise" style={{ ["--i" as string]: index }}>
              <Link
                href={section.href}
                className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="mb-3.5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                  {section.title}
                </span>
                <span className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {section.body}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="pw-rise" style={{ ["--i" as string]: sections.length }}>
          <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-border bg-card p-5">
            <span
              className="mb-3.5 grid h-11 w-11 place-items-center rounded-xl bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/15"
              aria-hidden="true"
            >
              <WifiOff className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              No connection needed
            </span>
            <span className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              No sign-in, no cloud, no telemetry. Saved calculations stay in a file on this
              computer.
            </span>
          </div>
        </li>
      </ul>

      {recent.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
              Recent calculations
            </h2>
            <Link href="/history/" className="text-[13px] font-medium text-primary hover:underline">
              All history
            </Link>
          </div>
          <Panel className="p-0">
            <ul>
              {recent.map((entry) => (
                <li key={entry.id} className="border-b border-border/70 last:border-b-0">
                  <Link
                    href={toolHref(entry.slug)}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {entry.calculator}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                        {entry.results[0]
                          ? `${entry.results[0].label}: ${entry.results[0].value}`
                          : "Saved with no result on screen"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(entry.savedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}
    </div>
  );
}
