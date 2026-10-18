import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { ProgressOverview } from "@/components/osteology/ProgressOverview";
import { BONES, JOINTS } from "@/lib/osteology/registry";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `My Osteology Lab progress | ${SITE_NAME}`,
  description: "Lessons completed, bones and joints recently studied, practice rounds and mock exam history in the PharmaWallah Osteology Lab.",
  path: "/osteology-lab/progress",
});

export default function ProgressPage() {
  const lessons = [
    ...BONES.map((b) => ({ kind: "bone" as const, slug: b.slug, name: b.name, region: b.region })),
    ...JOINTS.map((j) => ({ kind: "joint" as const, slug: j.slug, name: j.name, region: j.region })),
  ];
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "My progress" }]}
        eyebrow="My progress"
        title="Your lab record"
        lead="What you have finished, what is next, and how your practice and mock exams have gone."
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ProgressOverview lessons={lessons} />
      </div>
    </>
  );
}
