import type { Metadata } from "next";
import SyrupLab from "@/components/virtual-labs/labs/SyrupLab";
import { LABS } from "@/lib/virtual-labs/catalog";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

const lab = LABS["simple-syrup"];

export const metadata: Metadata = pageMeta({
  title: `Simple Syrup Virtual Lab: Preparation and Evaluation | ${SITE_NAME}`,
  description: "A 3D pharmaceutics compounding lab: calculate the formula, tare and weigh sucrose, dissolve it with gentle heat, make up to volume when cool, pack, label and evaluate your Simple Syrup with a full batch record.",
  path: lab.href,
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }, { name: lab.experimentTitle, path: lab.href }])} />
      <SyrupLab />
    </>
  );
}
