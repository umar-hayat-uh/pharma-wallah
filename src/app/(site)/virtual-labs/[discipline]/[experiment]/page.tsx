import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabLoader } from "@/components/virtual-labs/labs/LabLoader";
import { labByPath, LAB_LIST, type ExperimentId } from "@/lib/virtual-labs/catalog";
import { EXPERIMENTS } from "@/lib/virtual-labs/experiments";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

/*
 * Every experiment, in the room it runs in: /virtual-labs/<discipline>/<experiment>.
 * One registry-driven route (2026-10-25) replaced the four hand-written pages, so adding
 * an experiment to a lab means registering it — never a new route or room. The URLs,
 * titles and descriptions of the original four are unchanged (they now live in the
 * catalogue's `seo`).
 */
type Params = { params: { discipline: string; experiment: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return LAB_LIST.filter((l) => EXPERIMENTS[l.id as ExperimentId]).map((l) => ({ discipline: l.discipline, experiment: l.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const lab = labByPath(params.discipline, params.experiment);
  if (!lab) return {};
  return pageMeta({ title: `${lab.seo.title} | ${SITE_NAME}`, description: lab.seo.description, path: lab.href });
}

export default function Page({ params }: Params) {
  const lab = labByPath(params.discipline, params.experiment);
  if (!lab || !EXPERIMENTS[lab.id as ExperimentId]) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Virtual Labs", path: "/virtual-labs" }, { name: lab.experimentTitle, path: lab.href }])} />
      <LabLoader id={lab.id as ExperimentId} />
    </>
  );
}
