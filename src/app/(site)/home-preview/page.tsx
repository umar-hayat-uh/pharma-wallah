import React from "react";
import MoleculeLanding, { type SubjectSummary } from "@/components/Home/molecule-landing/MoleculeLanding";
import { HUB_SUBJECTS } from "@/app/(site)/calculation-tools/tool-index";
import { pageMeta } from "@/lib/seo";

/*
 * Preview of the next home page (2026-10-25): the molecule landing, built from
 * the owner's reference brief in PharmaWallah's brand. Noindexed (and kept out
 * of the sitemap by src/lib/indexing.ts) until it replaces "The Index" at /;
 * then this route is deleted and src/app/page.tsx renders MoleculeLanding.
 * No Battle Royale podium here: removed at the owner's request.
 */
export const metadata = pageMeta({
  title: "Home page preview",
  description:
    "A preview of PharmaWallah's next home page: pharmacy calculators, 3D virtual labs, the osteology lab and the offline Android app, with a paracetamol molecule flying between them.",
  path: "/home-preview",
  noindex: true,
});

/*
 * The practical-lab subjects section 01 shows, counted here on the server so the
 * client bundle never carries the tool index. Clinical & Hospital Pharmacy is
 * deliberately not featured while its dosing faults are an open owner decision
 * (CLAUDE.md §7 Known Issue 15).
 */
const FEATURED = ["pharma-chem", "pharmaceutics", "biopharmaceutics-pharmacokinetics", "pharmaceutical-analysis"];

export default function HomePreview() {
  const subjects: SubjectSummary[] = FEATURED.flatMap((id) => {
    const s = HUB_SUBJECTS.find((x) => x.id === id);
    return s ? [{ id: s.id, label: s.label, desc: s.desc, count: s.tools.length }] : [];
  });
  return <MoleculeLanding subjects={subjects} />;
}
