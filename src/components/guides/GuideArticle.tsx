import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpenText, Calculator, Info } from "lucide-react";
import { PageHero } from "@/components/page-kit";
import { getReferences } from "@/lib/content/references";
import { formatDate, reviewLabel, reportErrorHref } from "@/lib/content/governance";
import { findGuide, readingMinutes } from "@/lib/guides";
import type { Guide, GuideBlock } from "@/lib/guides/types";
import { cn } from "@/lib/utils";

/**
 * One guide, rendered on the server from its typed data (src/lib/guides).
 *
 * Server-rendered on purpose: the calculators are client components whose
 * teaching text only reaches a crawler as hydration markup, whereas a guide is
 * read top to bottom and should be complete HTML before any script runs.
 *
 * Lists are `div role="list"`, not ul/li: globals.css styles every `ul` outside
 * `.prose` (MEMORY.md gotcha 192), and these are styled here. No ads — the
 * guides were added during an AdSense review and placements on new pages are
 * the owner's decision (see the adsense-monetization skill).
 */

const H2 = "scroll-mt-28 text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] text-[#16181d]";
const P = "text-[15.5px] leading-[1.75] text-[#16181d]/80 [text-wrap:pretty]";

function Bullets({ items, ordered, tone }: { items: string[]; ordered?: boolean; tone?: "caution" }) {
  return (
    <div role="list" className="space-y-2.5">
      {items.map((item, i) => (
        <div role="listitem" key={i} className={cn("flex gap-3", P)}>
          {ordered ? (
            <span className="mt-[3px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1C7BD9]/10 font-mono text-xs font-semibold text-[#1C7BD9]">
              {i + 1}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className={cn("mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full", tone === "caution" ? "bg-amber-500" : "bg-[#21B67A]")}
            />
          )}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case "p":
      return <p className={P}>{block.text}</p>;

    case "list":
      return <Bullets items={block.items} ordered={block.ordered} />;

    case "formula":
      return (
        <div className="rounded-xl border border-[#16181d]/10 border-l-[3px] border-l-[#1C7BD9] bg-[#f4f6f8] px-4 py-3.5">
          <p className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[15px] font-medium text-[#16181d]">{block.expr}</p>
          {block.where && block.where.length > 0 && (
            <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
              {block.where.map((w) => (
                <div key={w.sym} className="contents">
                  <dt className="font-mono font-semibold text-[#16181d]">{w.sym}</dt>
                  <dd className="text-[#16181d]/70">{w.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
          {block.note && <p className="mt-2.5 text-sm text-[#16181d]/65">{block.note}</p>}
        </div>
      );

    case "table":
      return (
        <figure>
          {/* Its own scroll box, so a wide table never makes the page scroll sideways on a phone. */}
          <div className="overflow-x-auto rounded-xl border border-[#16181d]/10" tabIndex={0} role="region" aria-label={block.caption}>
            <table className="w-full min-w-[420px] border-collapse text-left text-sm" style={{ marginBottom: 0 }}>
              <caption className="sr-only">{block.caption}</caption>
              <thead>
                <tr>
                  {block.head.map((h) => (
                    <th key={h} scope="col" className="border-b border-[#16181d]/10 bg-[#f4f6f8] px-3.5 py-2.5 font-semibold text-[#16181d]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-[#16181d]/[0.06] last:border-0">
                    {row.map((cell, c) => (
                      <td key={c} className="px-3.5 py-2.5 align-top tabular-nums text-[#16181d]/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="mt-2 text-xs text-[#16181d]/55">{block.caption}</figcaption>
        </figure>
      );

    case "callout": {
      const caution = block.tone === "caution";
      const Icon = caution ? AlertTriangle : Info;
      return (
        <div className={cn("flex gap-3 rounded-xl border px-4 py-3.5", caution ? "border-amber-300/70 bg-amber-50" : "border-[#1C7BD9]/20 bg-[#1C7BD9]/[0.05]")}>
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", caution ? "text-amber-600" : "text-[#1C7BD9]")} aria-hidden="true" />
          <div className="text-[15px] leading-relaxed text-[#16181d]/85">
            {block.title && <p className="mb-1 font-semibold text-[#16181d]">{block.title}</p>}
            <p>{block.text}</p>
          </div>
        </div>
      );
    }

    case "example":
      return (
        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-4 shadow-[0_1px_0_rgba(22,24,29,0.04)] sm:p-5">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#21B67A]">Worked example</p>
          <h3 className="mt-1 text-base font-semibold text-[#16181d]">{block.title}</h3>
          <p className={cn(P, "mt-2")}>{block.problem}</p>
          <div role="list" className="mt-3 space-y-1.5 border-l-2 border-[#16181d]/10 pl-4">
            {block.steps.map((s, i) => (
              <p role="listitem" key={i} className="whitespace-pre-wrap break-words font-mono text-[13.5px] leading-relaxed text-[#16181d]/80">
                {s}
              </p>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-[#21B67A]/10 px-3.5 py-2.5 text-[15px] font-semibold text-[#16181d]">{block.answer}</p>
          {block.note && <p className="mt-2.5 text-sm leading-relaxed text-[#16181d]/65">{block.note}</p>}
        </section>
      );
  }
}

export function GuideArticle({ guide }: { guide: Guide }) {
  const references = getReferences(guide.refs);
  const related = (guide.relatedGuides ?? []).map(findGuide).filter((g): g is Guide => Boolean(g));
  const toc = [
    { id: "objectives", label: "Learning objectives" },
    { id: "key-terms", label: "Key terms" },
    ...guide.sections.map((s) => ({ id: s.id, label: s.heading })),
    { id: "common-mistakes", label: "Common mistakes" },
    { id: "practice", label: "Practice questions" },
    { id: "limitations", label: "Limitations" },
    { id: "references", label: "References" },
  ];

  return (
    <article className="bg-[#fcfcfa]">
      <PageHero
        trail={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: guide.title }]}
        eyebrow={`Guide · ${guide.category}`}
        title={guide.title}
        lead={guide.description}
        meta={
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[#16181d]/65">
            <span>By {guide.meta.author}</span>
            <span>Updated {formatDate(guide.meta.updated)}</span>
            <span>{readingMinutes(guide)} min read</span>
          </div>
        }
      />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:px-8">
        <div className="min-w-0 max-w-3xl space-y-12">
          <div className="space-y-4">
            {guide.intro.map((p, i) => (
              <p key={i} className={cn(P, i === 0 && "text-[17px] text-[#16181d]/90")}>
                {p}
              </p>
            ))}
            <p className="rounded-xl border border-[#16181d]/10 bg-white px-4 py-3 text-sm text-[#16181d]/70">
              {reviewLabel(guide.meta.review)}{" "}
              <Link href="/editorial-policy" className="font-medium text-[#1C7BD9] underline-offset-2 hover:underline">
                How we write and check guides
              </Link>
            </p>
          </div>

          <section aria-labelledby="objectives" className="space-y-4">
            <h2 id="objectives" className={H2}>Learning objectives</h2>
            <p className={P}>After working through this guide you should be able to:</p>
            <Bullets items={guide.objectives} ordered />
          </section>

          <section aria-labelledby="key-terms" className="space-y-4">
            <h2 id="key-terms" className={H2}>Key terms</h2>
            <dl className="divide-y divide-[#16181d]/[0.08] rounded-xl border border-[#16181d]/10 bg-white">
              {guide.terms.map((t) => (
                <div key={t.term} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                  <dt className="font-semibold text-[#16181d]">{t.term}</dt>
                  <dd className="text-[15px] leading-relaxed text-[#16181d]/75">{t.definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          {guide.sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id} className="space-y-5">
              <h2 id={s.id} className={H2}>{s.heading}</h2>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </section>
          ))}

          <section aria-labelledby="common-mistakes" className="space-y-4">
            <h2 id="common-mistakes" className={H2}>Common mistakes</h2>
            <Bullets items={guide.mistakes} tone="caution" />
          </section>

          <section aria-labelledby="practice" className="space-y-4">
            <h2 id="practice" className={H2}>Practice questions</h2>
            <p className={P}>Try each one before opening the answer.</p>
            <div className="space-y-3">
              {guide.practice.map((q, i) => (
                <div key={i} className="rounded-xl border border-[#16181d]/10 bg-white p-4">
                  <p className="text-[15px] font-medium leading-relaxed text-[#16181d]">
                    <span className="mr-2 font-mono text-[#1C7BD9]">Q{i + 1}.</span>
                    {q.q}
                  </p>
                  {/* <details> works without JavaScript and keeps the answer in the HTML. */}
                  <details className="group mt-3">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-[#1C7BD9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C7BD9]">
                      Show answer and working
                    </summary>
                    <div className="mt-3 space-y-1.5 border-l-2 border-[#21B67A]/40 pl-4">
                      {q.working.map((w, j) => (
                        <p key={j} className="whitespace-pre-wrap break-words font-mono text-[13.5px] leading-relaxed text-[#16181d]/80">
                          {w}
                        </p>
                      ))}
                      <p className="pt-1 text-[15px] font-semibold text-[#16181d]">Answer: {q.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="limitations" className="space-y-4">
            <h2 id="limitations" className={H2}>Limitations and safe use</h2>
            <Bullets items={guide.limitations} />
          </section>

          {guide.relatedTools.length > 0 && (
            <section aria-labelledby="practise-with" className="space-y-4">
              <h2 id="practise-with" className={H2}>Practise with the calculators</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {guide.relatedTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/calculation-tools/${t.slug}`}
                    className="group flex gap-3 rounded-xl border border-[#16181d]/10 bg-white p-4 transition-colors hover:border-[#1C7BD9]/40"
                  >
                    <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-[#1C7BD9]" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold text-[#16181d] group-hover:text-[#1C7BD9]">{t.name}</span>
                      <span className="text-sm text-[#16181d]/65">{t.why}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="references" className="space-y-4">
            <h2 id="references" className={H2}>References</h2>
            <ol className="space-y-2.5 text-sm leading-relaxed text-[#16181d]/75" style={{ paddingLeft: "1.25rem" }}>
              {references.map((r) => (
                <li key={r.citation} style={{ listStyle: "decimal" }}>
                  {r.citation}{" "}
                  {"url" in r && r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1C7BD9] underline-offset-2 hover:underline">
                      Source
                    </a>
                  )}
                </li>
              ))}
            </ol>
            <p className="text-sm text-[#16181d]/65">
              Spotted a mistake?{" "}
              <Link href={reportErrorHref(guide.title)} className="font-medium text-[#1C7BD9] underline-offset-2 hover:underline">
                Report it
              </Link>{" "}
              and we will correct the page.
            </p>
          </section>

          {related.length > 0 && (
            <section aria-labelledby="more-guides" className="space-y-4">
              <h2 id="more-guides" className={H2}>Related guides</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="group flex gap-3 rounded-xl border border-[#16181d]/10 bg-white p-4 transition-colors hover:border-[#21B67A]/50">
                    <BookOpenText className="mt-0.5 h-5 w-5 shrink-0 text-[#21B67A]" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold text-[#16181d] group-hover:text-[#21B67A]">{g.title}</span>
                      <span className="text-sm text-[#16181d]/65">{g.category}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#16181d]/50">On this page</p>
            <div role="list" className="mt-3 space-y-1.5 border-l border-[#16181d]/10">
              {toc.map((t) => (
                <a role="listitem" key={t.id} href={`#${t.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-sm text-[#16181d]/60 hover:border-[#1C7BD9] hover:text-[#16181d]">
                  {t.label}
                </a>
              ))}
            </div>
            <Link href="/guides" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1C7BD9]">
              All guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </nav>
        </aside>
      </div>
    </article>
  );
}
