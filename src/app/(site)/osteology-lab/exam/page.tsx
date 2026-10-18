import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { ExamRunner } from "@/components/osteology/ExamRunner";
import { getPreset } from "@/lib/osteology/exam-config";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Mock osteology practical exam | ${SITE_NAME}`,
  description:
    "Timed mock practical exams for osteology and arthrology: upper limb, lower limb, bones, joints, spotting, viva or a full simulation. Marked by the server, with weak areas and lessons to revise.",
  path: "/osteology-lab/exam",
});

export default function ExamPage({ searchParams }: { searchParams: { preset?: string } }) {
  const preset = searchParams.preset && getPreset(searchParams.preset) ? searchParams.preset : null;
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Mock exams" }]}
        eyebrow="Mock practical"
        title="Timed mock exams"
        lead="Choose a paper. A countdown runs, you can move between stations and flag any to revisit, and the paper submits itself when time is up. Answers are marked on our server after you submit."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ExamRunner initialPreset={preset} />
      </div>
    </>
  );
}
