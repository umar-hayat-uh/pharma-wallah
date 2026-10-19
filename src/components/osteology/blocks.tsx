/**
 * Server-safe building blocks for the lab's lesson pages: a titled card, a bullet list,
 * Q&A disclosures, references. Plain markup, no hooks — rendered into the first HTML.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getReferences, type ReferenceId } from "@/lib/content/references";
import type { QA } from "@/lib/osteology/types";

/**
 * `min-w-0`: cards are grid items, and a grid item's default `min-width: auto` let a wide table inside
 * (attachments, ligaments) widen the whole page on a phone instead of scrolling in its own box
 * (MEMORY gotcha 61; measured 2026-10-18: +202 px at 360 px wide).
 */
export function Card({ id, title, children, className }: { id?: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className={cn("pw-osteo-anchor min-w-0 rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:p-6", className)}>
      <h2 id={id ? `${id}-h` : undefined} className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="pw-osteo-prose mt-3 text-[15px] leading-relaxed text-[#2b2f36]">{children}</div>
    </section>
  );
}

export function Bullets({ items, ordered }: { items: string[]; ordered?: boolean }) {
  if (items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </Tag>
  );
}

/** Native <details>: works without JS, keyboard accessible, answer hidden until asked. */
export function QAList({ items }: { items: QA[] }) {
  return (
    <div className="space-y-2">
      {items.map((x, i) => (
        <details key={i} className="group rounded-xl border border-[#16181d]/10 bg-[#fafbfc] open:bg-white">
          <summary className="flex min-h-11 cursor-pointer list-none items-start gap-2 px-4 py-2.5 font-semibold [&::-webkit-details-marker]:hidden">
            <span className="mt-0.5 text-brandBlue" aria-hidden>Q.</span>
            <span className="flex-1">{x.q}</span>
            <span className="text-xs font-medium text-brandBlue group-open:hidden">Show answer</span>
          </summary>
          <p className="px-4 pb-3 pl-10 text-[15px] leading-relaxed">{x.a}</p>
        </details>
      ))}
    </div>
  );
}

export function References({ ids }: { ids: readonly ReferenceId[] }) {
  return (
    <ol className="pw-osteo-list space-y-1.5 text-sm text-[#4a4f57]">
      {getReferences(ids).map((r, i) => (
        <li key={i}>
          {r.citation}
          {r.url && (
            <>
              {" "}
              <a href={r.url} className="text-brandBlue underline underline-offset-2" rel="noopener noreferrer" target="_blank">
                {r.url.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center rounded-full border border-brandBlue/30 bg-brandBlue/[0.06] px-3.5 text-sm font-medium text-brandBlue hover:bg-brandBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandBlue"
    >
      {children}
    </Link>
  );
}

export function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b7079]">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium leading-snug">{children}</dd>
    </div>
  );
}
