import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone, TriangleAlert } from "lucide-react";
import { BRAND_SURFACE, Eyebrow, FigureRow, PageHero } from "@/components/page-kit";
import HubCatalogue from "./HubCatalogue";
import { HUB_SUBJECTS, HUB_TOOL_COUNT, START_HERE, findTool, toolHref } from "./tool-index";

export const metadata: Metadata = {
  title: "Pharmaceutical Calculation Tools | Advanced Calculators",
  description:
    "Professional pharmacy calculators and formula tools for pharmaceutical chemistry and healthcare professionals",
};

/**
 * /calculation-tools — the calculator index.
 *
 * A server component: the hero, the start-here card and the closing band are
 * static HTML with no JavaScript. Only `HubCatalogue` (search, subject rail,
 * scroll-spy) is a client island, and it too renders its full list on the
 * server, so the page is readable before hydration.
 *
 * Every number on the page is derived from `tool-index.ts` (MEMORY.md gotcha 47).
 */
export default function CalculationToolsPage() {
  return (
    <div className="pw-hub bg-[#fcfcfa]">
      <PageHero
        size="display"
        trail={[{ label: "Home", href: "/" }, { label: "Calculation tools" }]}
        eyebrow={`Calculation tools · ${HUB_TOOL_COUNT} in the index`}
        title={
          <>
            Pharmacy calculations,
            <span className="pw-hub-title__accent block">worked out.</span>
          </>
        }
        lead={
          <>
            Every calculator for the Pharm-D syllabus, grouped by the subject you meet it in — from
            C₁V₁ = C₂V₂ to Child-Pugh. Free, no account needed, and each one also ships in the offline
            Android app.
          </>
        }
        actions={
          <p className="flex max-w-xl items-start gap-2.5 text-sm leading-relaxed text-[#16181d]/62">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-[#16181d]">Educational use only.</strong> Built for study and
              reference — not for making clinical decisions.
            </span>
          </p>
        }
        aside={<StartHere />}
        meta={
          <FigureRow
            columns={2}
            figures={[
              { value: HUB_TOOL_COUNT, label: "calculators in this index" },
              { value: HUB_SUBJECTS.length, label: "syllabus subjects they are grouped under" },
            ]}
          />
        }
      />

      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-0 sm:px-6 lg:px-8 lg:pt-12">
        <HubCatalogue />

        <AppBand />
      </div>
    </div>
  );
}

/** Hero aside: a short, labelled set of common starting points, on the brand surface. */
function StartHere() {
  const rows = START_HERE.map(({ slug, label, formula }) => ({ tool: findTool(slug), label, formula })).filter(
    (r): r is { tool: NonNullable<ReturnType<typeof findTool>>; label: string; formula: string } => r.tool !== undefined,
  );

  return (
    <div className="rounded-2xl p-6 text-white shadow-[0_24px_60px_-36px_rgba(6,18,36,.8)] sm:p-7" style={{ background: BRAND_SURFACE }}>
      <Eyebrow tone="inverse">Common starting points</Eyebrow>
      {/* `!mt-5`: the namespace list reset (hub.css) zeroes list margins. */}
      <ul className="!mt-5">
        {rows.map(({ tool, label, formula }) => (
          <li key={tool.slug}>
            <Link href={toolHref(tool.slug)} prefetch={false} className="pw-hub-start__row">
              <span className="truncate text-[15px] font-semibold">{label}</span>
              <span className="pw-hub-start__formula">{formula}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Closing band: the same tools, offline. */
function AppBand() {
  return (
    <section
      aria-labelledby="hub-app-title"
      className="mt-20 grid gap-6 rounded-2xl p-7 text-white sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
      style={{ background: BRAND_SURFACE }}
    >
      <div className="min-w-0">
        <Eyebrow tone="inverse" dot>
          Android app
        </Eyebrow>
        <h2 id="hub-app-title" className="mt-4 text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.035em] [text-wrap:balance]">
          The whole index, in your lab coat pocket.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">
          The PharmaWallah app carries these calculators and runs them with no signal — in the lab or on the ward.
        </p>
      </div>
      <Link
        href="/download"
        prefetch={false}
        className="group inline-flex h-12 items-center justify-center gap-2.5 self-start rounded-xl bg-white px-5 text-[15px] font-semibold text-[#16181d] transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-px hover:shadow-[0_14px_30px_-16px_rgba(6,18,36,.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C7BD9] md:self-end"
      >
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        Get the app
        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </section>
  );
}
