import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageSection } from "@/components/page-kit";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/content/governance";

/**
 * How PharmaWallah's educational content is written, checked and corrected
 * (added 2026-10-12). The public face of docs/content-review-policy.md — keep
 * the two in step. Every statement here must be something the team actually
 * does: this page is read by AdSense reviewers and by students deciding
 * whether to trust a number, and an overstated process is worse than none.
 */

export const metadata: Metadata = pageMeta({
  title: `Editorial and Corrections Policy | ${SITE_NAME}`,
  description:
    "How PharmaWallah writes, checks and corrects its calculators and guides, what our review labels mean, and how to report an error.",
  path: "/editorial-policy",
});

const UPDATED = "2026-10-12";

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "who",
    title: "Who writes PharmaWallah",
    body: (
      <>
        <p>
          PharmaWallah is built by a team of pharmacy students in Karachi for the Doctor of Pharmacy syllabus they are
          studying themselves. The team is listed on the <Link href="/about-us">About page</Link>. We are not a
          university, a regulator or a professional body, and nothing on the site is endorsed or accredited by one.
        </p>
        <p>
          Pages are published under the byline &ldquo;PharmaWallah team&rdquo; unless a named person wrote them and
          agreed to be named. Some drafts are prepared with the help of AI writing tools; the checks below apply to
          every page however it was drafted.
        </p>
      </>
    ),
  },
  {
    id: "checks",
    title: "How content is checked before it is published",
    body: (
      <ul>
        <li>
          <strong>Formulas</strong> are compared with the source cited on the page. If we cannot find a reliable source
          for a formula, it is not published as fact.
        </li>
        <li>
          <strong>Worked examples and practice answers</strong> are recalculated independently — in code or by hand —
          and, on a calculator page, checked against what the calculator itself prints for the same inputs.
        </li>
        <li>
          <strong>Units</strong> are written out on every input, result and step, because most calculation errors in
          pharmacy are unit errors.
        </li>
        <li>
          <strong>Example values are illustrative.</strong> Where an example names a drug or a dose, it is there to
          practise the arithmetic, not as a recommendation.
        </li>
      </ul>
    ),
  },
  {
    id: "references",
    title: "How references are chosen",
    body: (
      <>
        <p>
          We cite standard pharmacy textbooks, pharmacopoeial chapters, international guidelines (such as ICH), and
          original papers for named equations. Every citation comes from one shared list in which the edition, year and
          publisher were checked against the publisher&rsquo;s or issuing body&rsquo;s own listing. We link only to the
          issuing body&rsquo;s own site, and we do not quote page numbers we have not checked.
        </p>
        <p>
          A reference supports the formula or principle on the page. It does not mean the author of that source has
          reviewed our page.
        </p>
      </>
    ),
  },
  {
    id: "labels",
    title: "What the review labels mean",
    body: (
      <ul>
        <li>
          <strong>Checked by the PharmaWallah team.</strong> The team has carried out the checks above. No independent
          pharmacist or academic has reviewed the page. This is the status of every page today.
        </li>
        <li>
          <strong>Reviewed by [name, qualification, date].</strong> Used only when a named, qualified person has
          reviewed that specific page and agreed to be named. No page carries this label yet. We will not display a
          review badge without a real reviewer behind it.
        </li>
        <li>
          <strong>Draft.</strong> Work in progress. Drafts are not linked from the site or listed in our sitemap.
        </li>
      </ul>
    ),
  },
  {
    id: "corrections",
    title: "Reporting and correcting errors",
    body: (
      <>
        <p>
          If you find a mistake — a wrong formula, a unit error, a calculator result that disagrees with your working,
          or a broken page — please tell us through the{" "}
          <Link href="/contact?subject=Error%20report">contact form</Link>. Every calculator and guide has a
          &ldquo;Report an error&rdquo; link that fills in the page name for you.
        </p>
        <p>
          We check each report against the cited source. If the page is wrong we correct it and change its
          &ldquo;updated&rdquo; date. Where a calculator has a known problem we have not yet fixed, we say so on the
          calculator page rather than leave it silent.
        </p>
      </>
    ),
  },
  {
    id: "clinical",
    title: "Educational use and clinical limits",
    body: (
      <>
        <p>
          PharmaWallah is for learning. Calculators and guides show how a calculation works; they are not a substitute
          for a validated laboratory method, an official monograph, a product&rsquo;s approved labelling, or the
          judgement of a pharmacist or prescriber. Do not use a result from this site to decide a dose for a real
          patient.
        </p>
        <p>
          Laboratory examples follow common Pharm-D practical methods. Where your institution&rsquo;s method or
          specification differs, follow your institution.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "How content is kept up to date",
    body: (
      <p>
        Each guide shows the date it was last substantively changed. We revisit a page when a cited guideline or
        pharmacopoeial chapter is revised, when an error is reported, and when we change the calculator it explains.
      </p>
    ),
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="bg-[#fcfcfa]">
      <PageHero
        trail={[{ label: "Home", href: "/" }, { label: "Editorial policy" }]}
        eyebrow="Editorial policy"
        title="How we write, check and correct"
        lead="What stands behind the numbers on PharmaWallah, what our review labels mean, and how to tell us when something is wrong."
        meta={<p className="text-sm text-[#16181d]/60">Last updated {formatDate(UPDATED)}</p>}
      />
      <PageSection width="narrow" ruled={false}>
        {/* No typography plugin in this repo: the children are styled here. The
            `prose` class is kept only because it opts these lists out of
            globals.css's `ul:not(.prose ul)` rule (MEMORY.md gotcha 192). */}
        <div className="prose space-y-10 text-[15.5px] leading-[1.75] text-[#16181d]/80 [&_a]:font-medium [&_a]:text-[#1C7BD9] [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:text-[1.4rem] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-[#16181d] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-[#21B67A] [&_p+p]:mt-3 [&_strong]:text-[#16181d] [&_ul]:space-y-2.5">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
              <h2 id={`${s.id}-h`}>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
