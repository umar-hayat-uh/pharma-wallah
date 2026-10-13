import { GUIDES } from "./index";

/**
 * Which guides a course subject's units link to (2026-10-13, internal linking).
 * Lists may name DRAFT guides: only published ones are returned, so a draft
 * starts appearing on its subject's units the day it is published.
 * Server-only (it pulls in the guide registry).
 */
const BY_SUBJECT: Record<string, string[]> = {
  "physical-pharmacy": [
    "dilution-and-concentration",
    "reaction-kinetics-drug-stability",
    "ph-pka-and-henderson-hasselbalch",
    "isotonicity-and-tonicity-adjustment",
    "powder-flow-and-micromeritics",
    "partition-coefficient-and-ionisation",
    "dissolution-testing-and-drug-release",
  ],
  "pharmaceutical-biochemistry": ["beer-lambert-and-uv-spectrophotometry", "ph-pka-and-henderson-hasselbalch"],
  physiology: ["blood-cell-counts-with-a-haemocytometer", "anion-gap-and-electrolyte-calculations", "renal-function-estimation"],
  "pharmaceutical-organic-chemistry": ["stoichiometry-and-percentage-yield", "chromatography-rf-and-resolution", "ph-pka-and-henderson-hasselbalch"],
};

export function relatedGuidesForSubject(subjectSlug: string): { slug: string; title: string }[] {
  const wanted = BY_SUBJECT[subjectSlug] ?? [];
  return wanted
    .map((slug) => GUIDES.find((g) => g.slug === slug))
    .filter((g): g is (typeof GUIDES)[number] => Boolean(g))
    .map((g) => ({ slug: g.slug, title: g.title }));
}
