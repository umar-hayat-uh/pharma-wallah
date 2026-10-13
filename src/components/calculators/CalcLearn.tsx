"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { getReferences, type ReferenceId } from "@/lib/content/references";
import { CalcList } from "./CalcAbout";
import { IS_MOBILE_APP, calculatorHref } from "./lab-math";
import { SourceLink } from "./SourceLink";

/**
 * The teaching half of a calculator page (added 2026-10-12, AdSense
 * low-value-content remediation): a worked example, the mistakes students
 * actually make with this calculation, where it stops applying, and the sources
 * it rests on.
 *
 * Content is data, kept in the tool's own `_learn.ts` beside its page, so the
 * content inventory (`scripts/content-inventory.mjs`) can see which tools have
 * it without rendering anything. Every section is optional except references:
 * a unit converter needs no worked example, but no page teaches a formula
 * without saying where it comes from. Depth should follow the calculation's
 * complexity — do not pad a simple tool to fill the shape.
 *
 * Figures in a worked example must be recomputed independently (Python or by
 * hand) and must match what the calculator itself prints for the same inputs.
 */

export type WorkedExample = {
  title: string;
  /** One or two sentences that set the problem up, as a practical sheet would. */
  scenario: string;
  given: { label: string; value: string }[];
  /** Formula → substitution → intermediate result, one line per step. */
  steps: { label: string; working: string }[];
  answer: string;
  /** What the number means — and, where relevant, what it does not establish. */
  interpretation?: string;
};

export type CalcEducation = {
  /** Realistic situations where a student reaches for this tool. */
  whenToUse?: string[];
  workedExample?: WorkedExample;
  /** A second example with different numbers (same rules as the first). */
  extraExample?: WorkedExample;
  mistakes?: string[];
  limitations?: string[];
  refs: ReferenceId[];
  /** Other calculators, by directory slug, with the reason to go there. */
  related?: { slug: string; name: string; why: string }[];
  /** A guide under /guides (website only — the apps carry no guides). */
  guide?: { slug: string; title: string };
};

export function CalcLearn({ content }: { content: CalcEducation }) {
  const { whenToUse, workedExample, extraExample, mistakes, limitations, refs, related, guide } = content;
  const references = getReferences(refs);

  return (
    <div className="space-y-4">
      {whenToUse && whenToUse.length > 0 && (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5" aria-label="When you'd use this">
          <CalcList title="When you'd use this" items={whenToUse} />
        </section>
      )}

      {[workedExample, extraExample].filter((e): e is WorkedExample => Boolean(e)).map((ex, n) => (
        <WorkedExampleCard key={ex.title} ex={ex} id={n === 0 ? "calc-worked-example" : `calc-worked-example-${n + 1}`} />
      ))}

      {(mistakes?.length || limitations?.length) && (
        <section className="space-y-5 rounded-2xl border border-border/80 bg-card p-4 sm:p-5" aria-label="Common mistakes and limitations">
          {mistakes && mistakes.length > 0 && <CalcList title="Common mistakes" items={mistakes} tone="caution" />}
          {limitations && limitations.length > 0 && <CalcList title="Assumptions and limitations" items={limitations} />}
        </section>
      )}

      {(related?.length || (guide && !IS_MOBILE_APP)) && (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5" aria-labelledby="calc-related">
          <h2 id="calc-related" className="text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">
            Keep learning
          </h2>
          <div className="mt-3 space-y-2">
            {guide && !IS_MOBILE_APP && (
              <Link
                href={`/guides/${guide.slug}`}
                className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm transition-colors hover:bg-primary/10"
              >
                <BookOpenText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-foreground">Guide: {guide.title}</span>
                  <span className="text-muted-foreground">The concept in full, with practice questions.</span>
                </span>
              </Link>
            )}
            {related?.map((r) => (
              <Link
                key={r.slug}
                href={calculatorHref(r.slug, {})}
                className="flex items-start gap-3 rounded-xl border border-border/70 p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-foreground">{r.name}</span>
                  <span className="text-muted-foreground">{r.why}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5" aria-labelledby="calc-references">
        <h2 id="calc-references" className="text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">
          References
        </h2>
        <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground" style={{ paddingLeft: "1.25rem" }}>
          {references.map((r) => (
            <li key={r.citation} style={{ listStyle: "decimal" }}>
              <span className="text-foreground">{r.citation}</span>{" "}
              {"url" in r && r.url && <SourceLink href={r.url}>Source</SourceLink>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function WorkedExampleCard({ ex, id }: { ex: WorkedExample; id: string }) {
  return (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5" aria-labelledby={id}>
          <h2 id={id} className="text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">
            Worked example: {ex.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ex.scenario}</p>

          <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {ex.given.map((g) => (
              <div key={g.label} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 text-sm">
                <dt className="text-muted-foreground">{g.label}</dt>
                <dd className="text-right font-mono tabular-nums text-foreground">{g.value}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-4 space-y-2.5" style={{ listStyle: "none", paddingLeft: 0 }}>
            {ex.steps.map((s, i) => (
              <li key={s.label} className="flex gap-3 text-sm" style={{ listStyle: "none" }}>
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[11px] font-semibold text-primary"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{s.label}</p>
                  {/* Mono and wrapping: a long substitution must not push the page sideways on a phone. */}
                  <p className="mt-0.5 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-muted-foreground">
                    {s.working}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 rounded-lg border border-border/70 border-l-[3px] border-l-primary bg-muted/60 px-3.5 py-2.5 text-sm font-semibold text-foreground">
            {ex.answer}
          </p>
          {ex.interpretation && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ex.interpretation}</p>
          )}
        </section>
  );
}
