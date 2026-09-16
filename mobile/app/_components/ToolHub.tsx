"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, ChevronRight, Clock, Sparkle, Star, Trash2 } from "lucide-react";
import { START_HERE } from "@/app/(site)/calculation-tools/tool-index";
import { cn } from "@/lib/utils";
import { FEATURED, GROUPS, SLUG_SET, TOOL_BY_SLUG, TOTAL, searchTools, type AppGroup, type AppTool } from "../_data/catalogue";
import { BottomNav, type HubView } from "./BottomNav";
import { CategoryIcon, SectionTitle, ToolChip, ToolRow, styleFor, toolHref } from "./parts";
import { SpaceHero } from "./SpaceHero";
import { useLibrary } from "./useLibrary";

/**
 * The app's home screen, in three views reached from the bottom bar:
 *
 *   Home    space hero + search, Recent, the camera tools, category tiles,
 *           common starting points, Saved
 *   Browse  every category, then every tool grouped under sticky headings
 *   Saved   starred tools and the recently opened list
 *
 * A category opens as its own list (#cat/<id>). Views live in the URL hash,
 * so Android's back button steps back through them instead of leaving the app.
 */

type Route = { view: HubView; category: string | null };

function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (h.startsWith("cat/")) return { view: "browse", category: h.slice(4) };
  if (h === "browse" || h === "saved") return { view: h, category: null };
  return { view: "home", category: null };
}

const FEATURE_COPY: Record<string, string> = {
  "rf-value-calculator": "Photograph a TLC plate, mark the lines and spots, get every Rf.",
  "cfu-calculator": "Photograph an agar plate, check the detected colonies, get CFU/mL.",
};

const tools = (slugs: readonly string[]) => slugs.map((s) => TOOL_BY_SLUG.get(s)).filter((t): t is AppTool => !!t);

export default function ToolHub() {
  const [route, setRoute] = useState<Route>({ view: "home", category: null });
  const [query, setQuery] = useState("");
  const { recent, saved, toggleSaved, clearRecent } = useLibrary(SLUG_SET);

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const go = useCallback((hash: string) => {
    if (window.location.hash.replace(/^#/, "") === hash) return;
    if (hash) window.location.hash = hash;
    // A bare "#" would linger in the URL; push the clean path instead (back still returns here).
    else window.history.pushState(null, "", window.location.pathname);
    setRoute(parseHash(hash));
    window.scrollTo({ top: 0 });
  }, []);

  const savedSet = useMemo(() => new Set(saved), [saved]);
  const results = useMemo(() => searchTools(query), [query]);
  const group = route.category ? GROUPS.find((g) => g.id === route.category) ?? null : null;

  let body: React.ReactNode;
  if (group) body = <CategoryView group={group} savedSet={savedSet} onToggleSaved={toggleSaved} onBack={() => window.history.back()} />;
  else if (route.view === "browse") body = <BrowseView onOpen={(id) => go(`cat/${id}`)} savedSet={savedSet} onToggleSaved={toggleSaved} />;
  else if (route.view === "saved")
    body = <SavedView saved={tools(saved)} recent={tools(recent)} savedSet={savedSet} onToggleSaved={toggleSaved} onClearRecent={clearRecent} onBrowse={() => go("browse")} />;
  else
    body = (
      <>
        <SpaceHero total={TOTAL} query={query} onQuery={setQuery} />
        {query.trim() ? (
          <SearchResults query={query} results={results} savedSet={savedSet} onToggleSaved={toggleSaved} onClear={() => setQuery("")} />
        ) : (
          <HomeView recent={tools(recent)} saved={tools(saved)} onOpen={(id) => go(`cat/${id}`)} onBrowse={() => go("browse")} onSaved={() => go("saved")} />
        )}
      </>
    );

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      {body}
      <BottomNav view={group ? "browse" : route.view} onChange={(v) => go(v === "home" ? "" : v)} savedCount={saved.length} />
    </div>
  );
}

/* ── Home ────────────────────────────────────────────────────────────────── */

function HomeView({
  recent,
  saved,
  onOpen,
  onBrowse,
  onSaved,
}: {
  recent: AppTool[];
  saved: AppTool[];
  onOpen: (id: string) => void;
  onBrowse: () => void;
  onSaved: () => void;
}) {
  const featured = tools(FEATURED);
  const starts = START_HERE.map((s) => ({ ...s, tool: TOOL_BY_SLUG.get(s.slug) })).filter((s) => s.tool);

  return (
    <div className="space-y-7 pt-6">
      {recent.length > 0 && (
        <section>
          <SectionTitle
            title="Continue where you left off"
            action={
              <button type="button" onClick={onSaved} className="text-xs font-medium text-primary">
                History
              </button>
            }
          />
          <div className="pw-scroll-x flex gap-2.5 overflow-x-auto px-4 pb-1">
            {recent.map((t, i) => (
              <ToolChip key={t.slug} tool={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="px-4">
          <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-emerald-700">
            <Sparkle className="h-3.5 w-3.5" />
            New · camera tools
          </p>
          <div className="grid gap-2.5">
            {featured.map((t, i) => (
              <Link
                key={t.slug}
                href={toolHref(t.slug)}
                className="pw-rise pw-press relative flex items-center gap-3.5 overflow-hidden rounded-3xl p-4 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.7)]"
                style={{
                  ["--i" as string]: i,
                  background:
                    i === 0
                      ? "linear-gradient(0deg, rgba(10,22,52,0.35), rgba(10,22,52,0.35)), linear-gradient(120deg, #4f46e5, #2563eb 55%, #0ea5e9)"
                      : "linear-gradient(0deg, rgba(10,22,52,0.35), rgba(10,22,52,0.35)), linear-gradient(120deg, #15803d, #21b67a 50%, #2563eb)",
                }}
              >
                <span className="pw-sheen" style={{ animationDelay: `${1.2 + i * 1.6}s` }} />
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                  <Camera className="h-6 w-6" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[16px] font-bold leading-tight tracking-[-0.01em]">{t.name}</span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-white/90">{FEATURE_COPY[t.slug] ?? t.desc}</span>
                </span>
                <ChevronRight className="relative h-5 w-5 shrink-0 text-white/80" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle
          title="Browse by subject"
          action={
            <button type="button" onClick={onBrowse} className="text-xs font-medium text-primary">
              All {TOTAL}
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-2.5 px-4">
          {GROUPS.map((g, i) => (
            <CategoryTile key={g.id} group={g} index={i} onOpen={onOpen} />
          ))}
        </div>
      </section>

      {starts.length > 0 && (
        <section>
          <SectionTitle title="Common starting points" />
          <ul className="mx-4 divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/80 bg-card px-2">
            {starts.map((s, i) => (
              <li key={s.slug} className="pw-rise" style={{ ["--i" as string]: i }}>
                <Link href={toolHref(s.slug)} className="pw-press flex items-center gap-3 px-1.5 py-3">
                  <CategoryIcon category={s.tool!.category} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-foreground">{s.label}</span>
                    <span className="block truncate font-mono text-[11.5px] text-muted-foreground">{s.formula}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {saved.length > 0 && (
        <section>
          <SectionTitle
            title="Saved"
            action={
              <button type="button" onClick={onSaved} className="text-xs font-medium text-primary">
                See all
              </button>
            }
          />
          <div className="pw-scroll-x flex gap-2.5 overflow-x-auto px-4 pb-1">
            {saved.map((t, i) => (
              <ToolChip key={t.slug} tool={t} index={i} />
            ))}
          </div>
        </section>
      )}

      <p className="px-6 text-center text-[11.5px] leading-relaxed text-muted-foreground">
        Every calculator runs on this phone, with no internet connection. For educational purposes — check results against
        your references.
      </p>
    </div>
  );
}

function CategoryTile({ group, index, onOpen }: { group: AppGroup; index: number; onOpen: (id: string) => void }) {
  const s = styleFor(group.id);
  return (
    <button
      type="button"
      onClick={() => onOpen(group.id)}
      className="pw-rise pw-press relative flex min-h-[8.25rem] flex-col items-start overflow-hidden rounded-3xl border border-border/80 bg-card p-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ ["--i" as string]: index }}
    >
      {/* A soft wash of the category's hue in the corner. */}
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.14]"
        style={{ background: `radial-gradient(circle, ${s.to}, transparent 70%)` }}
        aria-hidden="true"
      />
      <CategoryIcon category={group.id} />
      <span className="mt-3 line-clamp-2 text-[13.5px] font-bold leading-[1.2] tracking-[-0.01em] text-foreground">{group.label}</span>
      <span className="mt-auto pt-1.5 text-[11.5px] font-medium tabular-nums text-muted-foreground">
        {group.tools.length} tool{group.tools.length === 1 ? "" : "s"}
      </span>
    </button>
  );
}

/* ── Search ──────────────────────────────────────────────────────────────── */

function SearchResults({
  query,
  results,
  savedSet,
  onToggleSaved,
  onClear,
}: {
  query: string;
  results: AppTool[];
  savedSet: Set<string>;
  onToggleSaved: (slug: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="pt-5">
      <p className="px-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "match" : "matches"}
      </p>
      {results.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">No calculator matches “{query.trim()}”.</p>
          <button type="button" onClick={onClear} className="mt-3 text-sm font-medium text-primary">
            Clear the search
          </button>
        </div>
      ) : (
        <ul className="mx-3 mt-2 rounded-3xl border border-border/80 bg-card p-1.5" key={query}>
          {results.map((t, i) => (
            <ToolRow key={t.slug} tool={t} index={i} saved={savedSet.has(t.slug)} onToggleSaved={onToggleSaved} />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── Browse & category ───────────────────────────────────────────────────── */

function PageHeader({ title, subtitle, onBack, category }: { title: string; subtitle: string; onBack?: () => void; category?: string }) {
  return (
    <header className="pw-space relative rounded-b-[1.75rem] pb-5">
      <div className="h-[env(safe-area-inset-top)]" />
      <div aria-hidden="true">
        <span className="pw-nebula right-[-25%] top-[-60%] h-44 w-44 bg-sky-400" />
        <span className="pw-star left-[70%] top-[30%]" />
        <span className="pw-star left-[86%] top-[62%]" style={{ animationDelay: "1.2s" }} />
        <span className="pw-star left-[55%] top-[16%]" style={{ animationDelay: "2.1s" }} />
      </div>
      <div className="relative flex items-center gap-3 px-4 pt-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/90">PharmaWallah</span>
      </div>
      <div className="relative mt-4 flex items-center gap-3 px-4">
        {category && <CategoryIcon category={category} size="lg" />}
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold leading-tight tracking-[-0.03em]">{title}</h1>
          <p className="mt-0.5 text-[13px] text-white/90">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

function BrowseView({
  onOpen,
  savedSet,
  onToggleSaved,
}: {
  onOpen: (id: string) => void;
  savedSet: Set<string>;
  onToggleSaved: (slug: string) => void;
}) {
  return (
    <>
      <PageHeader title="Browse" subtitle={`${GROUPS.length} subjects · ${TOTAL} calculators`} />
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-5">
        {GROUPS.map((g, i) => (
          <CategoryTile key={g.id} group={g} index={i} onOpen={onOpen} />
        ))}
      </div>
      <h2 className="mt-8 px-4 text-[15px] font-bold text-foreground">Every calculator</h2>
      {GROUPS.map((g) => (
        <section key={g.id} className="mt-3">
          <div className="sticky top-[env(safe-area-inset-top)] z-10 flex items-center gap-2 bg-[#f6f8fb] px-4 py-2">
            <span className="h-2 w-2 rounded-full" style={{ background: styleFor(g.id).from }} aria-hidden="true" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{g.label}</h3>
          </div>
          <ul className="mx-3 rounded-3xl border border-border/80 bg-card p-1.5">
            {g.tools.map((t) => (
              <ToolRow key={t.slug} tool={t} saved={savedSet.has(t.slug)} onToggleSaved={onToggleSaved} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function CategoryView({
  group,
  savedSet,
  onToggleSaved,
  onBack,
}: {
  group: AppGroup;
  savedSet: Set<string>;
  onToggleSaved: (slug: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <PageHeader title={group.label} subtitle={`${group.tools.length} calculators · ${group.desc}`} onBack={onBack} category={group.id} />
      <ul className="mx-3 mt-4 rounded-3xl border border-border/80 bg-card p-1.5" key={group.id}>
        {group.tools.map((t, i) => (
          <ToolRow key={t.slug} tool={t} index={i} saved={savedSet.has(t.slug)} onToggleSaved={onToggleSaved} />
        ))}
      </ul>
    </>
  );
}

/* ── Saved ───────────────────────────────────────────────────────────────── */

function SavedView({
  saved,
  recent,
  savedSet,
  onToggleSaved,
  onClearRecent,
  onBrowse,
}: {
  saved: AppTool[];
  recent: AppTool[];
  savedSet: Set<string>;
  onToggleSaved: (slug: string) => void;
  onClearRecent: () => void;
  onBrowse: () => void;
}) {
  return (
    <>
      <PageHeader title="Saved" subtitle="Your starred calculators and recent history, on this phone." />
      <section className="pt-5">
        <SectionTitle title={`Starred · ${saved.length}`} />
        {saved.length === 0 ? (
          <div className="mx-4 rounded-3xl border border-dashed border-border bg-card px-5 py-8 text-center">
            <Star className="mx-auto h-7 w-7 text-amber-400" />
            <p className="mt-2 text-sm font-semibold text-foreground">Nothing saved yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Tap the star on any calculator to keep it here.</p>
            <button type="button" onClick={onBrowse} className="mt-4 text-sm font-medium text-primary">
              Browse calculators
            </button>
          </div>
        ) : (
          <ul className="mx-3 rounded-3xl border border-border/80 bg-card p-1.5">
            {saved.map((t, i) => (
              <ToolRow key={t.slug} tool={t} index={i} saved={savedSet.has(t.slug)} onToggleSaved={onToggleSaved} />
            ))}
          </ul>
        )}
      </section>
      <section className="pt-7">
        <SectionTitle
          title="Recently opened"
          action={
            recent.length > 0 && (
              <button type="button" onClick={onClearRecent} className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )
          }
        />
        {recent.length === 0 ? (
          <p className={cn("mx-4 flex items-center gap-2 text-sm text-muted-foreground")}>
            <Clock className="h-4 w-4" />
            Calculators you open will appear here.
          </p>
        ) : (
          <ul className="mx-3 rounded-3xl border border-border/80 bg-card p-1.5">
            {recent.map((t, i) => (
              <ToolRow key={t.slug} tool={t} index={i} saved={savedSet.has(t.slug)} onToggleSaved={onToggleSaved} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
