import type { Metadata } from "next";
import CloveLab from "@/components/virtual-labs/labs/CloveLab";
import { LABS } from "@/lib/virtual-labs/catalog";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

const lab = LABS["powdered-clove"];

export const metadata: Metadata = pageMeta({
  title: `Powdered Clove Microscopy Virtual Lab | ${SITE_NAME}`,
  description: "A 3D pharmacognosy lab: mount powdered clove in chloral hydrate, focus a compound microscope at low and high power, find the diagnostic elements and identify the drug with the evidence that supports it.",
  path: lab.href,
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }, { name: lab.experimentTitle, path: lab.href }])} />
      <CloveLab />
    </>
  );
}
