"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  WifiOff,
  ShieldCheck,
  Beaker,
  Scale,
  Pill,
  Activity,
  HeartPulse,
  Microscope,
  Syringe,
  FlaskRound,
  Stethoscope,
  Calculator,
  ChevronRight,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORIES, TOOL_NAMES, ONLINE_ONLY_SLUGS, toolShortName } from "../_data/tool-registry";
import { TOOL_SLUGS } from "../_generated/tool-slugs";

type Group = { id: string; label: string; desc: string; slugs: string[] };

/** Category icons mirror CAT_ICONS in the web hub so the two read as one product. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "pharma-chem": Beaker,
  "unit-conversion": Scale,
  pharmaceutics: Pill,
  "biopharmaceutics-pharmacokinetics": Activity,
  pharmacology: HeartPulse,
  "pharmaceutical-analysis": Microscope,
  microbiology: Syringe,
  "pharmaceutical-engineering": FlaskRound,
  "clinical-hospital-pharmacy": Stethoscope,
  physiology: Droplets,
  more: Calculator,
};

/**
 * Groups for the grid. Any slug the build generated a route for but that no
 * category claims lands in "More Tools" — the drift guard described in
 * _data/tool-registry.ts, so a new calculator can never go missing in the app.
 */
function buildGroups(): Group[] {
  const shipped = new Set<string>(TOOL_SLUGS as readonly string[]);
  const claimed = new Set(CATEGORIES.flatMap((category) => category.slugs));
  const unclaimed = (TOOL_SLUGS as readonly string[]).filter((slug) => !claimed.has(slug));

  const groups: Group[] = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    desc: category.desc,
    slugs: category.slugs.filter((slug) => shipped.has(slug)),
  })).filter((group) => group.slugs.length > 0);

  if (unclaimed.length > 0) {
    groups.push({
      id: "more",
      label: "More Tools",
      desc: "Recently added calculators",
      slugs: unclaimed,
    });
  }

  return groups;
}

/*
 * The search bar sticks directly under the app bar, which is 3.5rem tall plus
 * the Android status-bar inset. Section headings scroll to just below both.
 */
const STICKY_TOP = "calc(3.5rem + env(safe-area-inset-top))";

function ToolCard({ slug, icon: Icon }: { slug: string; icon: LucideIcon }) {
  const needsInternet = ONLINE_ONLY_SLUGS.has(slug);

  return (
    <Link
      href={`/calculation-tools/${slug}`}
      className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={TOOL_NAMES[slug] ?? slug}
    >
      <Card
        className={cn(
          "relative flex h-full min-h-[108px] flex-col items-start justify-between gap-3 rounded-2xl border-border/80 p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          "transition-[transform,background-color,border-color] duration-300 ease-out-expo",
          "active:scale-[0.96] active:border-primary/40 active:bg-primary/5",
        )}
      >
        {needsInternet && (
          <WifiOff className="absolute right-2 top-2 h-3.5 w-3.5 text-amber-500" aria-label="Needs internet" />
        )}

        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
          <Icon className="h-4 w-4" />
        </span>

        {/* Three lines is the most a 3-up phone card can hold without clipping. */}
        <span className="line-clamp-3 text-[11.5px] font-semibold leading-[1.22] tracking-[-0.01em] text-foreground">
          {toolShortName(slug)}
        </span>
      </Card>
    </Link>
  );
}

export default function ToolHub() {
  const [query, setQuery] = useState("");
  const groups = useMemo(buildGroups, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        // Match the full name, not the shortened card label.
        slugs: group.slugs.filter(
          (slug) =>
            (TOOL_NAMES[slug] ?? slug).toLowerCase().includes(needle) ||
            slug.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.slugs.length > 0);
  }, [groups, query]);

  const total = groups.reduce((sum, group) => sum + group.slugs.length, 0);
  const matches = visible.reduce((sum, group) => sum + group.slugs.length, 0);

  return (
    <div className="pb-14">
      {/* The count as a figure, not a sentence — and the offline promise, which
          is the reason this app exists at all. */}
      <section className="border-b border-border/80 px-4 pb-5 pt-6">
        <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Pharmacy calculators
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-[4.25rem] font-bold leading-[0.8] tracking-[-0.06em] tabular-nums text-foreground">
            {total}
            <span className="text-primary">.</span>
          </p>
          <p className="mb-1 flex max-w-[11rem] items-start gap-1.5 text-right text-xs leading-snug text-muted-foreground">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            Every one works with no internet connection
          </p>
        </div>
      </section>

      <div
        className="sticky z-40 border-b border-border/80 bg-background/90 px-4 pb-3 pt-3 backdrop-blur-md"
        style={{ top: STICKY_TOP }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            inputMode="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${total} calculators…`}
            aria-label="Search calculators"
            className="pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground active:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {query ? (
          <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground" aria-live="polite">
            {matches} {matches === 1 ? "match" : "matches"}
          </p>
        ) : (
          /* Jump links into each category — the catalogue is ~10 screens long. */
          <nav
            aria-label="Categories"
            className="-mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="shrink-0 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-300 ease-out-expo active:border-primary/40 active:bg-primary/10"
              >
                {group.label}
                <span className="ml-1.5 tabular-nums text-muted-foreground">{group.slugs.length}</span>
              </a>
            ))}
          </nav>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-5xl font-bold tracking-[-0.04em] text-muted-foreground/25" aria-hidden="true">
            0
          </p>
          <p className="mt-2 text-sm text-muted-foreground">No calculator matches “{query.trim()}”.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Show all {total}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        visible.map((group) => {
          const Icon = CATEGORY_ICONS[group.id] ?? Calculator;
          return (
            <section
              key={group.id}
              id={group.id}
              className="px-4 pt-7"
              // Anchor jumps land below the app bar and the sticky search, not under them.
              style={{ scrollMarginTop: `calc(${STICKY_TOP} + 7.5rem)` }}
            >
              <div className="flex items-end gap-3 border-b border-border/70 pb-2.5">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[17px] font-bold leading-tight tracking-[-0.02em]">{group.label}</h2>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{group.desc}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 font-mono tabular-nums">
                  {String(group.slugs.length).padStart(2, "0")}
                </Badge>
              </div>

              {/* Three across on a phone; wider screens get more columns. */}
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {group.slugs.map((slug) => (
                  <ToolCard key={slug} slug={slug} icon={Icon} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
