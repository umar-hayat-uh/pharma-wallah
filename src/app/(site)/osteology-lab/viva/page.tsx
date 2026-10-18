import type { Metadata } from "next";
import { PageHero, PageSection } from "@/components/page-kit";
import { SkeletonViva } from "@/components/osteology/SkeletonViva";
import { VivaTrainer, type VivaCard } from "@/components/osteology/VivaTrainer";
import { BONES, JOINTS, boneHref, jointHref } from "@/lib/osteology/registry";
import { SKELETON, kb, skeletonUrl } from "@/lib/osteology/models";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Osteology viva practice & skeleton identification | ${SITE_NAME}`,
  description:
    "Practise the osteology and arthrology viva: one question at a time with model answers and a revise-later list, plus bone identification on a full 3D skeleton.",
  path: "/osteology-lab/viva",
});

// The small bones of the hand and foot are not asked for on the whole skeleton: on a phone
// they are a few pixels wide, so the question would test tapping, not anatomy. They are
// still named in Explore mode, and asked about in their own lessons and in spotting.
const NOT_ASKED_ON_SKELETON = new Set(["carpals", "metacarpals", "hand-phalanges", "tarsals", "metatarsals", "foot-phalanges"]);

export default function VivaPage() {
  const cards: VivaCard[] = [
    ...BONES.flatMap((b) => [
      ...b.examQuestions.map((x, i) => ({ key: `bone:${b.slug}:e${i}`, q: x.q, a: x.a, topic: b.name, href: boneHref(b.slug), region: b.region, kind: "bone" as const })),
      ...b.landmarks
        .filter((l) => l.viva)
        .map((l) => ({ key: `bone:${b.slug}:lm:${l.id}`, q: l.viva!.q, a: l.viva!.a, topic: b.name, href: `${boneHref(b.slug)}#lm-${l.id}`, region: b.region, kind: "bone" as const })),
    ]),
    ...JOINTS.flatMap((j) =>
      j.viva.map((x, i) => ({ key: `joint:${j.slug}:v${i}`, q: x.q, a: x.a, topic: j.name, href: jointHref(j.slug), region: j.region, kind: "joint" as const })),
    ),
  ];
  const parts = SKELETON.parts.map((p) => (p.bone && NOT_ASKED_ON_SKELETON.has(p.bone) ? { ...p, bone: null } : p));
  const boneNames = Object.fromEntries(BONES.map((b) => [b.slug, b.name.toLowerCase()]));

  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Viva practice" }]}
        eyebrow="Viva practice"
        title="Skeleton viva"
        lead={`${cards.length} viva questions with model answers, and a full 3D skeleton to identify bones on — the two halves of a practical's oral station.`}
      />
      <PageSection ruled={false} eyebrow="Part 1" title="Viva trainer" width="narrow">
        <VivaTrainer cards={cards} />
      </PageSection>
      <PageSection eyebrow="Part 2" title="Identify bones on the skeleton" description="The complete articulated skeleton from Z-Anatomy, simplified so it loads on a phone. Find the named bone, or explore and tap any bone to name it.">
        <SkeletonViva src={skeletonUrl()} sizeLabel={kb(SKELETON.bytes)} parts={parts} boneNames={boneNames} />
      </PageSection>
    </>
  );
}
