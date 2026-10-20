import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, GraduationCap, ShieldCheck } from "lucide-react";
import { PageHero, PageSection } from "@/components/page-kit";
import { LabProgressBadge } from "@/components/virtual-labs/LabProgressBadge";
import { CURRICULUM_LABEL } from "@/lib/virtual-labs/labels";
import { LAB_LIST } from "@/lib/virtual-labs/catalog";
import { ASSET_MANIFEST } from "@/lib/virtual-labs/assets/manifest";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";
import "@/components/virtual-labs/virtual-labs.css";

export const metadata: Metadata = pageMeta({
  title: `3D Virtual Pharmacy Labs | ${SITE_NAME}`,
  description:
    "Four 3D virtual pharmacy laboratories, one complete experiment each: acid–base titration assay, Simple Syrup preparation, a graded dose–response curve and powdered clove microscopy — with real calculations, a lab notebook, viva questions and a results report.",
  path: "/virtual-labs",
});

const TONE: Record<string, string> = {
  proposed: "bg-amber-100 text-amber-800",
  source_verified: "bg-brandBlue/10 text-brandBlue",
  faculty_reviewed: "bg-brandGreen/12 text-[#137a52]",
  published: "bg-brandGreen/12 text-[#137a52]",
};

export default function VirtualLabsPage() {
  const used = ASSET_MANIFEST.filter((a) => a.used && a.kind !== "procedural");
  return (
    <div className="pw-vlab">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }])} />
      <PageHero
        eyebrow="Virtual laboratories"
        title="3D Virtual Pharmacy Labs"
        lead="Four laboratories, one complete practical in each. Walk up to the bench, handle the apparatus, make the measurements yourself — and get a report built from what you actually did."
        size="display"
      />

      <PageSection ruled={false} title="Choose a laboratory">
        <ul className="vl-list grid gap-5 md:grid-cols-2">
          {LAB_LIST.map((lab) => (
            <li key={lab.id} className="flex flex-col overflow-hidden rounded-3xl border border-[#16181d]/10 bg-white">
              <div className="relative aspect-[16/9] bg-[#e9eff4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/virtual-labs/${lab.id}.webp`} alt={`The ${lab.labName.toLowerCase()} in the 3D virtual lab`} className="h-full w-full object-cover" loading="lazy" width={1280} height={720} />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#16181d]">{lab.disciplineLabel}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brandBlue">{lab.labName}</p>
                <h2 className="mt-1 text-xl font-extrabold leading-snug text-[#16181d]">{lab.experimentTitle}</h2>
                <ul className="vl-bullets mt-3 space-y-1 text-sm text-[#3a3f47]">
                  {lab.objectives.map((o) => <li key={o}>{o}</li>)}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16181d]/[0.06] px-2.5 py-0.5 font-semibold text-[#3a3f47]"><Clock className="h-3.5 w-3.5" aria-hidden />~{lab.minutes} min</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16181d]/[0.06] px-2.5 py-0.5 font-semibold text-[#3a3f47]"><GraduationCap className="h-3.5 w-3.5" aria-hidden />{lab.difficulty}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${TONE[lab.curriculum.status]}`} title={lab.curriculum.summary}><ShieldCheck className="h-3.5 w-3.5" aria-hidden />{CURRICULUM_LABEL[lab.curriculum.status]}</span>
                  <LabProgressBadge id={lab.id} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#4a4f57]">{lab.curriculum.summary}</p>
                <div className="mt-auto pt-5">
                  <Link href={lab.href} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white hover:bg-[#1667b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue">
                    Start experiment <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title="How these labs work">
        <div className="grid gap-4 text-[15px] leading-relaxed text-[#3a3f47] md:grid-cols-3">
          <p><strong className="text-[#16181d]">You do the practical.</strong> Choose the apparatus, weigh, measure, read the burette or the recorder yourself. Every number in your report comes from your own readings, and mistakes carry through to the result — with an explanation of why.</p>
          <p><strong className="text-[#16181d]">Walk, or be guided.</strong> Explore the room in first person, or let the camera take you to each station. Every action is also a button in the side panel, so the labs work with a keyboard, a screen reader, or on a device without 3D graphics.</p>
          <p><strong className="text-[#16181d]">Honest about what is simulated.</strong> Samples, purities and responses come from documented teaching models and illustrative data — not real patients or animals. Curriculum badges say exactly how far each mapping has been checked; none has yet been reviewed by faculty.</p>
        </div>
      </PageSection>

      <PageSection title="Credits and sources">
        <div className="space-y-3 text-sm leading-relaxed text-[#3a3f47]">
          <p>The rooms, furniture, glassware and instruments are original procedural models built for PharmaWallah. Openly licensed assets used:</p>
          <ul className="vl-bullets space-y-1">
            {used.map((a) => (
              <li key={a.id}>
                <a href={a.sourceUrl} className="font-medium text-brandBlue underline-offset-2 hover:underline" target="_blank" rel="noreferrer">{a.name}</a> — {a.creator}, {a.licence}. {a.attribution}
                {a.status === "needs_review" && " (Awaiting confirmation by a subject reviewer.)"}
              </li>
            ))}
          </ul>
          <p>Curriculum references: University of Karachi Pharm-D practical syllabi (Departments of Pharmaceutical Chemistry, Pharmaceutics, Pharmacology and Pharmacognosy) and the HEC Pharm-D curriculum (2025). Each lab’s briefing quotes the exact entry it maps to.</p>
        </div>
      </PageSection>
    </div>
  );
}
