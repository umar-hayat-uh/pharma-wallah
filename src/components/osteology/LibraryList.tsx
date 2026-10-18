"use client";

/**
 * Searchable, region-filtered list used by the bone library and the joint index.
 * Rendered on the server too, so every link is in the first HTML; search and the
 * "completed" ticks are client enhancements.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOsteoProgress, type LessonKind } from "./progress-store";

export type LibraryItem = {
  slug: string;
  href: string;
  name: string;
  sub: string;
  region: string;
  regionLabel: string;
  group: string;
  /** Words matched by search besides the name (Latin, other names, bones of a joint). */
  keywords: string;
  badge?: string;
};

export function LibraryList({ kind, items, regions }: { kind: LessonKind; items: LibraryItem[]; regions: { id: string; label: string }[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("all");
  const progress = useOsteoProgress();

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      items.filter(
        (i) => (region === "all" || i.region === region) && (!q || `${i.name} ${i.keywords} ${i.group}`.toLowerCase().includes(q)),
      ),
    [items, region, q],
  );
  const groups = Array.from(new Set(shown.map((i) => `${i.regionLabel} — ${i.group}`)));
  const doneCount = items.filter((i) => progress.completed[`${kind}:${i.slug}`]).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-[#16181d]/12 bg-white px-3 focus-within:border-brandBlue">
          <Search className="h-4 w-4 text-[#6b7079]" aria-hidden />
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={kind === "bone" ? "Search bones — e.g. femur, collar bone" : "Search joints — e.g. knee, or a bone"}
            className="w-full !bg-transparent text-base outline-none"
          />
        </label>
        <p className="text-sm text-[#5b616b]" aria-live="polite">{doneCount} of {items.length} completed</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by region">
        {[{ id: "all", label: "All" }, ...regions].map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={region === r.id}
            onClick={() => setRegion(r.id)}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-medium transition",
              region === r.id ? "bg-brandBlue text-white" : "border border-[#16181d]/12 bg-white text-[#16181d]",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g} className="mt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b7079]">{g}</h2>
          <ul className="pw-osteo-list mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {shown
              .filter((i) => `${i.regionLabel} — ${i.group}` === g)
              .map((i) => {
                const done = !!progress.completed[`${kind}:${i.slug}`];
                return (
                  <li key={i.slug}>
                    <Link
                      href={i.href}
                      className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-[#16181d]/10 bg-white p-4 transition hover:border-brandBlue/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandBlue"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-semibold">
                          {i.name}
                          {done && <CheckCircle2 className="h-4 w-4 text-brandGreen" aria-label="completed" />}
                        </span>
                        <span className="mt-0.5 block text-sm text-[#5b616b]">{i.sub}</span>
                        {i.badge && <span className="mt-1 inline-block text-xs font-medium text-brandBlue">{i.badge}</span>}
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#16181d]/30 group-hover:text-brandBlue" aria-hidden />
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
      {shown.length === 0 && <p className="mt-8 text-center text-[#5b616b]">Nothing matches “{query}”. Try another name.</p>}
    </div>
  );
}
