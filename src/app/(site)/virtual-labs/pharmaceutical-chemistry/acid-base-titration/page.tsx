import type { Metadata } from "next";
import TitrationLab from "@/components/virtual-labs/labs/TitrationLab";
import { LABS } from "@/lib/virtual-labs/catalog";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

const lab = LABS["acid-base-titration"];

export const metadata: Metadata = pageMeta({
  title: `Acid–Base Titration Virtual Lab: Assay of Citric Acid | ${SITE_NAME}`,
  description:
    "A 3D pharmaceutical chemistry lab: weigh citric acid on an analytical balance, make it up to volume, pipette an aliquot and titrate with standardised NaOH to a phenolphthalein end-point, then calculate the assay from your own readings.",
  path: lab.href,
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }, { name: lab.experimentTitle, path: lab.href }])} />
      <TitrationLab />
    </>
  );
}
