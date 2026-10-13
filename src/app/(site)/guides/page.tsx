import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, PageSection } from "@/components/page-kit";
import { GUIDES, readingMinutes } from "@/lib/guides";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMeta({
  title: `Pharmacy Calculation Guides | ${SITE_NAME}`,
  description:
    "Worked, step-by-step guides to the calculations in a Pharm-D course: dilutions, doses, reaction kinetics, analytical recovery and pharmacokinetics, with practice questions.",
  path: "/guides",
});

export default function GuidesIndex() {
  return (
    <div className="bg-[#fcfcfa]">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <PageHero
        trail={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        eyebrow="Guides"
        title="Calculation guides"
        lead="Each guide explains one family of calculations from the start: the idea, the formulas and their units, worked examples, the mistakes students make, and practice questions with full working. Then it points you to the calculator that does the arithmetic."
      />
      <PageSection width="default" ruled={false}>
        <div className="grid gap-4 md:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex flex-col rounded-2xl border border-[#16181d]/10 bg-white p-5 transition-colors hover:border-[#1C7BD9]/40"
            >
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#16181d]/50">
                {g.category} · {readingMinutes(g)} min read
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-[#16181d] group-hover:text-[#1C7BD9]">{g.title}</h2>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#16181d]/70">{g.description}</p>
              <p className="mt-4 text-sm text-[#16181d]/60">
                {g.practice.length} practice questions · {g.relatedTools.length} linked calculators
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C7BD9]">
                Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#16181d]/60">
          Guides are written and checked by the PharmaWallah team.{" "}
          <Link href="/editorial-policy" className="font-medium text-[#1C7BD9] underline-offset-2 hover:underline">
            Read how we write and correct them
          </Link>
          .
        </p>
      </PageSection>
    </div>
  );
}
