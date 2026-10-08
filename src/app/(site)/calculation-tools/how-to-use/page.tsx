import type { Metadata } from "next";
import { CalculatorGuide, type GuideFacts } from "@/components/calculator-guide";
import { HUB_SUBJECTS, HUB_TOOL_COUNT } from "../tool-index";
import { SITE_NAME } from "@/lib/seo";

/**
 * /calculation-tools/how-to-use — the calculator guide on the website.
 *
 * Deliberately outside `(tools)/`: that directory is the list of calculators,
 * and both app route generators turn every folder in it into a tool page. The
 * apps mount the same guide from `mobile/app/how-to-use/`.
 */
export const metadata: Metadata = {
  title: `How to Use the Calculators — a guide for pharmacy students | ${SITE_NAME}`,
  description:
    "A step-by-step guide to every PharmaWallah calculator: choosing a tool, entering values and units, reading results, formulas, tables and graphs, fixing common errors and verifying your answer.",
};

// Counted from the hub registry, so the guide's figures match the hub's.
const FACTS: GuideFacts = {
  platform: "web",
  toolCount: HUB_TOOL_COUNT,
  categories: HUB_SUBJECTS.map((s) => ({ id: s.id, label: s.label, href: `/calculation-tools#${s.id}` })),
  hubHref: "/calculation-tools",
};

export default function CalculatorGuidePage() {
  return <CalculatorGuide facts={FACTS} />;
}
