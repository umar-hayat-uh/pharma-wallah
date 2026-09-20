"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Search, SearchX, X } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit/brand";
import { EmptyState, ErrorState } from "@/components/page-kit/States";
import Monograph from "./Monograph";
import { useDrugSearch, PAGE_SIZE } from "./useDrugSearch";
import { drugId, type EncDrug } from "./types";
import "./encyclopedia.css";

/*
 * /encyclopedia — a search desk over the DrugBank import (12,673 drugs,
 * re-measured 2026-09-20) that opens each drug as a monograph.
 *
 * Redesigned 2026-09-20. The previous version opened on a full brand-gradient
 * cover — a display headline, a lead, chips and four figures — that every visit
 * had to scroll past before it could search. The search is the page, so it is
 * now a bar that is always on screen: it carries the marketing band only while
 * nothing has been searched, and becomes a slim sticky control the moment it
 * has. Critically it is ONE input in both states, never remounted, so focus
 * survives the second character.
 *
 * State lives in the URL (?q=&page=&drug=) so a record can be shared, and the
 * phone's back button returns from a record to its result list. Typing replaces
 * the history entry; opening a drug pushes one.
 */

// Common first searches; each was checked to return the intended drug first,
// including the two British names DrugBank does not use (the API aliases them).
const TRY = ["Paracetamol", "Metformin", "Amoxicillin", "Omeprazole", "Salbutamol", "Atorvastatin", "Warfarin", "Ciprofloxacin"];

// Every way the search can be addressed, with an example that really resolves.
const WAYS: [string, string, string][] = [
  ["Generic name", "Metformin", "Matches anywhere in the DrugBank name"],
  ["British name", "Salbutamol", "Matched through synonyms — returns Albuterol"],
  ["DrugBank ID", "DB00331", "Exact match"],
  ["CAS number", "50-78-2", "Exact — acetylsalicylic acid"],
  ["UNII", "9100L32L2N", "Exact — the FDA substance code"],
];

const CONTENTS: [string, string][] = [
  ["Overview", "What the drug is, in DrugBank's words."],
  ["Pharmacology", "Indication, mechanism of action, effects and toxicity."],
  ["Kinetics", "Absorption, distribution, binding, metabolism, half-life, elimination, clearance."],
  ["Interactions", "Every drug interaction on record — each opens that drug — plus food and timing notes."],
  ["Products", "Marketed forms with strength, route, labeller and years on the market."],
  ["Chemistry", "2D and 3D structure, SMILES, InChI, measured and predicted properties."],
  ["Classification", "The chemical lineage from kingdom down to direct parent, and every structural feature."],
  ["Names & references", "Synonyms, cited papers and links to other databases."],
];

function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const page = Number(p.get("page"));
  return {
    q: p.get("q") ?? "",
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
    drug: p.get("drug"),
  };
}

/** Why a row is in the results when its name doesn't show the query. */
function matchNote(d: EncDrug, q: string): string | null {
  const needle = q.trim().toLowerCase();
  if (!needle || d.name.toLowerCase().includes(needle)) return null;
  const up = needle.toUpperCase();
  if (d.drugbank_ids?.some((x) => x.id === up)) return "DrugBank ID match";
  if (d.cas_number === q.trim()) return "CAS number match";
  if (d.unii === up) return "UNII match";
  const syn = d.synonyms?.find((s) => s.name.toLowerCase().includes(needle));
  return syn ? `also known as “${syn.name}”` : "matched by another name";
}

export default function EncyclopediaClient({
  initialQuery,
  initialPage,
  initialDrug,
  figures,
}: {
  initialQuery: string;
  initialPage: number;
  initialDrug: string | null;
  /** Streamed server figures (EncyclopediaFigures inside a Suspense boundary). */
  figures: React.ReactNode;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [selected, setSelected] = useState<string | null>(initialDrug);
  const [isDesktop, setIsDesktop] = useState(false);

  // 0 for a committed search (Enter, a chip, a link); a short pause while typing.
  const delay = useRef(0);
  const pushNext = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const { state, retry, minChars } = useDrugSearch(query, page, delay.current);
  const payload = state.payload;
  const q = query.trim();
  const active = q.length >= minChars;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /*
   * The site header is fixed and retracts on scroll-down (MEMORY gotcha 66).
   * The search bar sticks directly beneath it, so it has to follow, or a 60px
   * strip of scrolling results shows above it. Watch only the header's own
   * style attribute — it changes when the header toggles, not per frame — and
   * set a data attribute directly, so the result list never re-renders for it.
   */
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.fixed.top-0");
    const bar = barRef.current;
    if (!header || !bar) return;
    const sync = () => bar.toggleAttribute("data-header-hidden", header.style.transform.includes("-100%"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(header, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  // ── URL ⇄ state ──
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (q && page > 1) p.set("page", String(page));
    if (q && selected) p.set("drug", selected);
    const next = `${window.location.pathname}${p.toString() ? `?${p}` : ""}`;
    if (next === `${window.location.pathname}${window.location.search}`) return;
    if (pushNext.current) window.history.pushState(null, "", next);
    else window.history.replaceState(null, "", next);
    pushNext.current = false;
  }, [q, page, selected]);

  useEffect(() => {
    const onPop = () => {
      const u = readUrl();
      delay.current = 0;
      setQuery(u.q);
      setPage(u.page);
      setSelected(u.drug);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── "/" and ⌘K focus the search ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = payload?.data ?? [];
  const current =
    results.find((d) => drugId(d) === selected) ?? (isDesktop && results.length > 0 ? results[0] : undefined);
  const currentId = current ? drugId(current) : null;
  const showCard = !!current && (isDesktop || selected !== null);

  const scrollTo = (el: HTMLElement | null, onlyIfAbove = false) => {
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (onlyIfAbove && top >= 0) return;
    window.scrollTo({ top: window.scrollY + top - 132, behavior: "smooth" });
  };

  const runSearch = useCallback((term: string) => {
    delay.current = 0;
    pushNext.current = true;
    setQuery(term);
    setPage(1);
    setSelected(null);
    inputRef.current?.blur();
    window.setTimeout(() => scrollTo(bodyRef.current), 60);
  }, []);

  const openDrug = useCallback((name: string, id?: string) => {
    delay.current = 0;
    pushNext.current = true;
    setQuery(name);
    setPage(1);
    setSelected(id ?? null);
    window.setTimeout(() => scrollTo(bodyRef.current), 60);
  }, []);

  const select = (d: EncDrug) => {
    pushNext.current = true;
    setSelected(drugId(d));
    window.setTimeout(() => scrollTo(isDesktop ? cardRef.current : bodyRef.current, isDesktop), 30);
  };

  const goPage = (n: number) => {
    delay.current = 0;
    pushNext.current = true;
    setPage(n);
    setSelected(null);
    scrollTo(bodyRef.current, true);
  };

  const onListKey = (e: React.KeyboardEvent<HTMLOListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-row]") ?? []);
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = buttons[Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), buttons.length - 1)];
    if (next) {
      e.preventDefault();
      next.focus();
      if (isDesktop) next.click();
    }
  };

  const loading = state.status === "loading";
  const firstLoad = loading && !payload;

  return (
    <div className="pw-enc" data-active={active || undefined}>
      {/* ══════ OPENING — only before a search ══════ */}
      {!active && (
        <section className="pw-enc-hero" style={{ background: BRAND_SURFACE }}>
          <div className="pw-enc-wrap">
            <p className="pw-enc-eyebrow">
              <span aria-hidden="true" />
              Pharmacopedia · Drug encyclopedia
            </p>
            <h1 className="pw-enc-h1">
              <span>Every drug,</span>
              <span>whole.</span>
            </h1>
            <p className="pw-enc-lead">
              Search 12,673 DrugBank records. Each one opens as a monograph — pharmacology, kinetics, every interaction,
              products, and the structure in 2D and 3D — laid out section by section so you can read it, not drown in it.
            </p>
          </div>
        </section>
      )}

      {/* ══════ SEARCH BAR — always mounted, sticky once searching ══════ */}
      <div
        ref={barRef}
        className="pw-enc-bar"
        style={active ? undefined : { background: BRAND_SURFACE }}
        data-open={!active || undefined}
      >
        <div className="pw-enc-wrap pw-enc-bar__in">
          <form
            role="search"
            className="pw-enc-search"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.length >= minChars) runSearch(q);
            }}
          >
            <label htmlFor="enc-q" className="sr-only">
              Search drugs by name, DrugBank ID, CAS or UNII
            </label>
            <Search className="pw-enc-search__icon" aria-hidden="true" />
            <input
              id="enc-q"
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              maxLength={80}
              placeholder="Metformin, salbutamol, DB00331…"
              onChange={(e) => {
                delay.current = 260;
                setQuery(e.target.value);
                setPage(1);
                setSelected(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  delay.current = 0;
                  setQuery("");
                }
              }}
            />
            {query ? (
              <button
                type="button"
                className="pw-enc-search__clear"
                aria-label="Clear search"
                onClick={() => {
                  delay.current = 0;
                  setQuery("");
                  setSelected(null);
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="pw-enc-kbd" aria-hidden="true">/</kbd>
            )}
            <span className="pw-enc-search__bar" data-on={loading || undefined} aria-hidden="true" />
          </form>

          <p className="pw-enc-bar__status" aria-live="polite">
            {q.length === 1
              ? "Keep typing — searches start at two letters."
              : q.length === 2 && !payload
                ? `Showing names that start with “${q}”.`
                : active && payload
                  ? `${payload.total.toLocaleString()} ${payload.total === 1 ? "drug" : "drugs"} for “${q}”${
                      payload.totalPages > 1 ? ` · page ${payload.page} of ${payload.totalPages.toLocaleString()}` : ""
                    }`
                  : "Name · British or US name · DrugBank ID · CAS number · UNII"}
          </p>
        </div>
      </div>

      {/* ══════ OPENING, PART TWO ══════ */}
      {!active && (
        <section className="pw-enc-open">
          <div className="pw-enc-wrap">
            <ul className="pw-enc-try" aria-label="Try a common drug">
              {TRY.map((t) => (
                <li key={t}>
                  <button type="button" onClick={() => runSearch(t)}>
                    {t}
                  </button>
                </li>
              ))}
            </ul>

            <div className="pw-enc-figs-slot">{figures}</div>

            <div className="pw-enc-idle">
              <div className="pw-enc-idle__col">
                <p className="pw-enc-label">What a record holds</p>
                <h2 className="pw-enc-h2">Eight sections, the same order every time.</h2>
                <ol className="pw-enc-contents">
                  {CONTENTS.map(([title, desc], i) => (
                    <li key={title}>
                      <span className="pw-enc-contents__n" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="pw-enc-note pw-enc-note--lead">
                  A section a record has no data for is left out rather than shown empty — many experimental compounds
                  carry identifiers and chemistry only.
                </p>
              </div>

              <div className="pw-enc-idle__col">
                <p className="pw-enc-label">Five ways to search</p>
                <h2 className="pw-enc-h2">Type a name, or an identifier.</h2>
                <ul className="pw-enc-ways">
                  {WAYS.map(([kind, example, note]) => (
                    <li key={kind}>
                      <button type="button" onClick={() => runSearch(example)}>
                        <span className="pw-enc-ways__kind">{kind}</span>
                        <span className="pw-enc-ways__ex">{example}</span>
                        <span className="pw-enc-ways__note">{note}</span>
                        <ArrowRight className="pw-enc-ways__go" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="pw-enc-colophon-line">
                  Drug data from DrugBank · 2D depictions rendered by NIH CACTUS · 3D conformers generated on your
                  device. For study and reference, not prescribing advice.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ BODY ══════ */}
      <div ref={bodyRef} className="pw-enc-body">
        <div className="pw-enc-wrap">
          {active && firstLoad && (
            <div className="pw-enc-desk" aria-busy="true">
              <div role="status" className="pw-enc-index">
                <span className="sr-only">Searching…</span>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="pw-enc-skel-row" aria-hidden="true">
                    <span style={{ width: `${[62, 48, 70, 55, 40, 66][i]}%` }} />
                    <span />
                  </div>
                ))}
              </div>
              <div className="pw-enc-skel-mono hidden lg:block" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {active && state.status === "error" && !payload && (
            <ErrorState title="The search didn't go through" description={state.message} onRetry={retry} className="my-6" />
          )}

          {active && payload && payload.total === 0 && !loading && (
            <EmptyState
              icon={SearchX}
              label="No match"
              title={`Nothing in the record matches “${q}”`}
              description={
                <>
                  DrugBank uses US adopted names, and identifiers must be exact. Check the spelling, try the generic
                  rather than a brand name, or start from one of these.
                </>
              }
              action={
                <ul className="pw-enc-try pw-enc-try--board">
                  {TRY.slice(0, 4).map((t) => (
                    <li key={t}>
                      <button type="button" onClick={() => runSearch(t)}>
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              }
              className="my-6"
            />
          )}

          {active && payload && payload.total > 0 && (
            <div className="pw-enc-desk" data-loading={loading || undefined}>
              {/* ── Result index ── */}
              <div className={showCard && !isDesktop ? "hidden" : "pw-enc-index"}>
                <p className="pw-enc-index__head">
                  <span className="pw-enc-label">Results</span>
                  <span>
                    {payload.total.toLocaleString()} {payload.total === 1 ? "drug" : "drugs"}
                  </span>
                </p>

                {state.status === "error" && (
                  <div role="alert" className="pw-enc-inline-error">
                    <span>{state.message}</span>
                    <button type="button" onClick={retry}>
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                      Retry
                    </button>
                  </div>
                )}

                <ol ref={listRef} className="pw-enc-rows" onKeyDown={onListKey} aria-label="Search results">
                  {results.map((d, i) => {
                    const idOf = drugId(d);
                    const note = matchNote(d, q);
                    const on = idOf === currentId && showCard;
                    return (
                      <li key={idOf} style={{ ["--i" as string]: i }}>
                        <button type="button" data-row className="pw-enc-row" aria-current={on ? "true" : undefined} onClick={() => select(d)}>
                          <span className="pw-enc-row__n" aria-hidden="true">
                            {String((payload.page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="pw-enc-row__name">{d.name}</span>
                            <span className="pw-enc-row__meta">
                              {[
                                d.drug_type === "biotech" ? "Biotech" : d.drug_type ? "Small molecule" : null,
                                d.status?.replace("_", " "),
                                idOf.startsWith("DB") ? idOf : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                            {note && <span className="pw-enc-row__why">{note}</span>}
                          </span>
                          <ArrowRight className="pw-enc-row__go" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {payload.totalPages > 1 && (
                  <nav className="pw-enc-pager" aria-label="Result pages">
                    <button type="button" onClick={() => goPage(payload.page - 1)} disabled={payload.page <= 1}>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Previous
                    </button>
                    <span>
                      {payload.page} / {payload.totalPages.toLocaleString()}
                    </span>
                    <button type="button" onClick={() => goPage(payload.page + 1)} disabled={payload.page >= payload.totalPages}>
                      Next
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </div>

              {/* ── Record ── */}
              {showCard && current && (
                <div ref={cardRef} className="pw-enc-reader" key={currentId}>
                  <Monograph
                    drug={current}
                    onOpenDrug={openDrug}
                    onBack={
                      isDesktop
                        ? undefined
                        : () => {
                            pushNext.current = true;
                            setSelected(null);
                          }
                    }
                    backLabel={`All ${payload.total.toLocaleString()} results`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
