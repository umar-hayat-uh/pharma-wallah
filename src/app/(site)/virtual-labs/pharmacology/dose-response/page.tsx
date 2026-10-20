import type { Metadata } from "next";
import DoseResponseLab from "@/components/virtual-labs/labs/DoseResponseLab";
import { LABS } from "@/lib/virtual-labs/catalog";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

const lab = LABS["dose-response"];

export const metadata: Metadata = pageMeta({
  title: `Dose–Response Curve Virtual Lab (Simulated Organ Bath) | ${SITE_NAME}`,
  description: "A 3D pharmacology lab: set up a simulated isolated-tissue organ bath, record graded responses to an agonist, plot linear and log dose–response curves, estimate Emax and EC50 and find an unknown concentration.",
  path: lab.href,
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }, { name: lab.experimentTitle, path: lab.href }])} />
      <DoseResponseLab />
    </>
  );
}
