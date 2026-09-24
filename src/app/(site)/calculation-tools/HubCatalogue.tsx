"use client";

import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { AdSlot } from "@/components/calculators/AdSlot";
import { Eyebrow } from "@/components/page-kit";
import { HUB_SUBJECTS, HUB_TOOL_COUNT, toolHref, type HubSubject, type HubTool } from "./tool-index";
import "./hub.css";

/**
 * The searchable body of /calculation-tools: subject rail, search, and the
 * index of every tool.
 *
 * Why it is fast (the page used to feel slow — measured 2026-09-13):
 *  - Everything renders visible in the server HTML. The old page shipped 97
 *    elements at `opacity:0` for framer-motion to reveal, so on a phone the
 *    catalogue stayed blank until ~280 KB of JS had downloaded and hydrated.
 *  - No framer-motion, no infinite background animation, and no SVG per row
 *    (the old cards drew an icon each; the rows here use a text arrow).
 *  - Links don't prefetch. ~90 tool routes are all dynamic; prefetching the
 *    ones in view fired dozens of background RSC requests on load and on every
 *    scroll. The root `loading.tsx` already gives an instant response on click.
 */

// ── Search normalisation ────────────────────────────────────────────────────
// Tool names carry subscripts, en dashes and arrows ("C₁V₁ = C₂V₂",
// "Mass–Molarity", "mg/mL ↔ Molarity"). Fold them so "c1v1" or "mass-molarity"
// match, keeping one output character per input character so a match in the
// folded string maps straight back onto the original for highlighting.
const FOLD: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "⁰": "0", "¹": "1", "²": "2", "³": "3",
  "–": "-", "—": "-", "‑": "-", "−": "-",
};

function fold(text: string): string {
  let out = "";
  // Index loop over UTF-16 units (every name here is in the BMP), so out[i]
  // always corresponds to text[i].
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const mapped = FOLD[ch] ?? ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    // Anything that would fold to zero or several characters keeps one slot.
    out += mapped.length === 1 ? mapped : " ";
  }
  return out;
}

function tokens(query: string): string[] {
  return fold(query)
    .split(/\s+/)
    .filter(Boolean);
}

type Match = { subject: HubSubject; number: number; tools: { tool: HubTool; number: number }[] };

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const folded = fold(text);
  const marked = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let from = folded.indexOf(term);
    while (from !== -1) {
      for (let i = from; i < from + term.length; i++) marked[i] = true;
      from = folded.indexOf(term, from + term.length);
    }
  }
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const on = marked[i];
    let j = i;
    while (j < text.length && marked[j] === on) j++;
    const chunk = text.slice(i, j);
    parts.push(on ? <mark key={i}>{chunk}</mark> : chunk);
    i = j;
  }
  return <>{parts}</>;
}

export default function HubCatalogue() {
  const [query, setQuery] = useState("");
  // Typing stays instant; the list re-renders at lower priority.
  const deferredQuery = useDeferredValue(query);
  const terms = useMemo(() => tokens(deferredQuery), [deferredQuery]);
  const [active, setActive] = useState<string>(HUB_SUBJECTS[0].id);

  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<HTMLOListElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);

  // Subject and section numbers stay fixed while searching, so "3.07" always
  // means the same tool.
  const matches: Match[] = useMemo(() => {
    return HUB_SUBJECTS.map((subject, s) => {
      const subjectText = fold(`${subject.label} ${subject.desc}`);
      return {
        subject,
        number: s + 1,
        tools: subject.tools
          .map((tool, t) => ({ tool, number: t + 1 }))
          .filter(({ tool }) => {
            if (terms.length === 0) return true;
            const hay = `${fold(tool.name)} ${fold(tool.desc)} ${tool.slug.toLowerCase()} ${subjectText}`;
            return terms.every((term) => hay.includes(term));
          }),
      };
    });
  }, [terms]);

  const visible = matches.filter((m) => m.tools.length > 0);
  // Unique, to match HUB_TOOL_COUNT: a tool listed under two subjects counts once.
  const resultCount = new Set(visible.flatMap((m) => m.tools.map((t) => t.tool.slug))).size;
  const searching = terms.length > 0;

  // "/" focuses search from anywhere on the page, as on most documentation sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll-spy: the subject whose section crosses the upper third of the
  // viewport is the current one. One observer, no scroll listener.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-hub-section]"));
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive((hit.target as HTMLElement).id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [visible.length, resultCount]);

  // The site header slides out of view while scrolling down (Header/index.tsx,
  // `retracted`). The rail is stuck just below it, so it follows: without this a
  // 60px strip of scrolling list shows above the search box. Watches only the
  // header's own style attribute — it changes when the header toggles, not per
  // scroll frame (the progress bar writes to a child) — and sets a data
  // attribute directly, so the 90-row list never re-renders for it.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.fixed.top-0");
    const rail = railRef.current;
    if (!header || !rail) return;
    const sync = () => {
      rail.toggleAttribute("data-header-hidden", header.style.transform.includes("-100%"));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(header, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  // On the horizontal chip bar (below lg), keep the current subject in view.
  useEffect(() => {
    const index = indexRef.current;
    if (!index || index.scrollWidth <= index.clientWidth) return;
    const chip = index.querySelector<HTMLElement>(`[data-subject="${active}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - 20;
    if (left < index.scrollLeft || chip.offsetLeft + chip.offsetWidth > index.scrollLeft + index.clientWidth) {
      index.scrollTo({ left, behavior: "smooth" });
    }
  }, [active]);

  function onQueryChange(next: string) {
    setQuery(next);
    // If the rail is stuck (the reader is deep in the list), bring the top of
    // the results back into view — otherwise a shrinking list leaves them
    // looking at blank page below it.
    const body = bodyRef.current;
    if (body && body.getBoundingClientRect().top < 0) {
      const header = window.matchMedia("(min-width: 1024px)").matches ? 64 + 24 : 60 + 130;
      window.scrollTo({ top: body.getBoundingClientRect().top + window.scrollY - header });
    }
  }

  return (
    <div className="pw-hub__layout">
      <aside ref={railRef} className="pw-hub__rail" aria-label="Find a calculator">
        <form role="search" className="pw-hub__search" onSubmit={(e) => e.preventDefault()}>
          <Search className="pw-hub__search-icon" aria-hidden="true" />
          <label htmlFor="hub-search" className="sr-only">
            Search {HUB_TOOL_COUNT} calculators
          </label>
          <input
            ref={inputRef}
            id="hub-search"
            type="search"
            className="pw-hub__input"
            placeholder={`Search ${HUB_TOOL_COUNT} calculators`}
            value={query}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                onQueryChange("");
              }
            }}
          />
          {query ? (
            <button type="button" className="pw-hub__clear" onClick={() => { onQueryChange(""); inputRef.current?.focus(); }}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : (
            <kbd className="pw-hub__kbd" aria-hidden="true">/</kbd>
          )}
        </form>

        <Eyebrow className="pw-hub__index-label">By subject</Eyebrow>
        <nav aria-label="Subjects">
          <ol ref={indexRef} className="pw-hub__index">
            {matches.map(({ subject, tools }) => {
              const empty = tools.length === 0;
              return (
                <li key={subject.id}>
                  <a
                    href={`#${subject.id}`}
                    data-subject={subject.id}
                    className="pw-hub__subject"
                    aria-current={!empty && active === subject.id ? "true" : undefined}
                    aria-disabled={empty ? "true" : undefined}
                    tabIndex={empty ? -1 : undefined}
                    onClick={() => setActive(subject.id)}
                  >
                    <span>{subject.label}</span>
                    <span className="pw-hub__subject-count">{tools.length}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <div ref={bodyRef} className="min-w-0 pt-8 lg:pt-0">
        <p className="sr-only" aria-live="polite">
          {searching ? `${resultCount} of ${HUB_TOOL_COUNT} calculators match.` : ""}
        </p>

        {searching && resultCount > 0 && (
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[#16181d]/55" aria-hidden="true">
            {resultCount} of {HUB_TOOL_COUNT} match “{deferredQuery.trim()}”
          </p>
        )}

        {/* Ad placement. A plain div — never inside anything animated or
            transformed (MEMORY.md gotcha 29) — and only while there are results,
            because AdSense forbids ads beside an empty page (gotcha 30b). */}
        {resultCount > 0 && (
          <div className="mb-10">
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST} format="horizontal" />
          </div>
        )}

        {resultCount === 0 && (
          <div className="border-t-2 border-[#16181d] pt-8" role="status">
            <Eyebrow>No match</Eyebrow>
            <p className="mt-4 text-2xl font-bold tracking-[-0.03em] [text-wrap:balance] sm:text-3xl">
              Nothing in the index matches “{deferredQuery.trim()}”.
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#16181d]/62">
              Try the quantity instead of the tool name — “clearance”, “osmolarity”, “dose” — or a formula such as “c1v1”.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { onQueryChange(""); inputRef.current?.focus(); }}
                className="h-10 rounded-lg bg-[#16181d]/[0.06] px-4 text-sm font-semibold transition-colors duration-300 hover:bg-[#16181d]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]"
              >
                Show all calculators
              </button>
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-[#1567b8] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]"
              >
                Ask for a calculator we don’t have
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-14 sm:space-y-16">
          {visible.map(({ subject, number, tools }, index) => (
            <Fragment key={subject.id}>
            {/* An ad between every third subject (added 2026-09-23), not while
                searching — a filtered list is short, and the one above covers it.
                Plain div, nothing animated around it (gotcha 29). */}
            {!searching && index > 0 && index % 3 === 0 && (
              <div>
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST} format="horizontal" className="min-h-[250px]" />
              </div>
            )}
            <section
              id={subject.id}
              data-hub-section
              aria-labelledby={`${subject.id}-title`}
              className="pw-hub__section"
            >
              <div className="pw-hub__section-head">
                <div className="min-w-0">
                  <Eyebrow>{String(number).padStart(2, "0")} · Subject</Eyebrow>
                  <h2 id={`${subject.id}-title`} className="mt-3 text-[clamp(1.45rem,1.2rem+1vw,2rem)] font-bold leading-tight tracking-[-0.03em]">
                    {subject.label}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-[#16181d]/62">{subject.desc}</p>
                </div>
                <p className="shrink-0 pb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#16181d]/55 tabular-nums">
                  {searching ? `${tools.length}/${subject.tools.length}` : tools.length} tools
                </p>
              </div>

              <ul className="pw-hub__tools">
                {tools.map(({ tool, number: t }) => (
                  <li key={tool.slug}>
                    <Link href={toolHref(tool.slug)} prefetch={false} className="pw-hub__tool">
                      <span className="pw-hub__code" aria-hidden="true">
                        {number}.{String(t).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="pw-hub__name">
                          <Highlight text={tool.name} terms={terms} />
                        </span>
                        <span className="pw-hub__desc">{tool.desc}</span>
                      </span>
                      {/* A glyph, not an icon component: 90 rows × an inline SVG was ~40 KB of HTML. */}
                      <span className="pw-hub__arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
