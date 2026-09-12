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

function ToolCard({ slug }: { slug: string }) {
  const needsInternet = ONLINE_ONLY_SLUGS.has(slug);

  return (
    <Link href={`/calculation-tools/${slug}`} className="group" title={TOOL_NAMES[slug] ?? slug}>
      <Card
        className={cn(
          "relative h-full min-h-[104px] p-3 flex flex-col items-center justify-start gap-2 text-center",
          "transition-transform active:scale-[0.97] active:bg-accent",
        )}
      >
        {needsInternet && (
          <WifiOff
            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-500"
            aria-label="Needs internet"
          />
        )}

        <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
          <Calculator className="w-[18px] h-[18px]" />
        </span>

        {/* Three lines is the most a 3-up phone card can hold without clipping. */}
        <span className="text-[11px] leading-[1.25] font-medium text-foreground line-clamp-3">
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
    <div className="pb-12">
      {/* Offline promise — the reason this app exists at all. */}
      <div className="bg-primary text-primary-foreground px-4 pb-5 pt-1">
        <p className="text-sm text-primary-foreground/90 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {total} calculators, available with no internet
        </p>
      </div>

      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur px-4 pt-3 pb-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            inputMode="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calculators…"
            aria-label="Search calculators"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-lg text-muted-foreground active:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {query && (
          <p className="mt-2 text-xs text-muted-foreground">
            {matches} {matches === 1 ? "match" : "matches"}
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No calculator matches “{query.trim()}”.
          </p>
        </div>
      ) : (
        visible.map((group) => {
          const Icon = CATEGORY_ICONS[group.id] ?? Calculator;
          return (
            <section key={group.id} className="px-4 pt-6">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-semibold leading-tight">{group.label}</h2>
                  <p className="text-xs text-muted-foreground truncate">{group.desc}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {group.slugs.length}
                </Badge>
              </div>

              {/* Three across on a phone; wider screens get more columns. */}
              <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                {group.slugs.map((slug) => (
                  <ToolCard key={slug} slug={slug} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
