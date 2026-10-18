import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { LibraryList, type LibraryItem } from "@/components/osteology/LibraryList";
import { BONES, REGIONS, REGION_LABEL, boneHref } from "@/lib/osteology/registry";
import { boneModel } from "@/lib/osteology/models";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Bone library — 3D osteology for Pharm-D | ${SITE_NAME}`,
  description:
    "Every bone in the Osteology Lab: upper limb, pelvis and lower limb, and the axial skeleton. Rotate each bone in 3D, find its landmarks and learn how to tell right from left.",
  path: "/osteology-lab/bones",
});

export default function BoneLibraryPage() {
  const items: LibraryItem[] = BONES.map((b) => {
    const marked = b.landmarks.filter((l) => l.zName).length;
    return {
      slug: b.slug,
      href: boneHref(b.slug),
      name: b.name,
      sub: `${b.latin} · ${b.classification.split(/[.;—–(]/)[0].trim().toLowerCase()}`,
      region: b.region,
      regionLabel: REGION_LABEL[b.region],
      group: b.group,
      keywords: `${b.latin} ${b.aka.join(" ")}`,
      badge: boneModel(b.slug) ? `3D model · ${b.landmarks.length} landmarks${marked ? ` (${marked} marked)` : ""}` : undefined,
    };
  });
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Bones" }]}
        eyebrow="Learn bones"
        title="Bone library"
        lead="Choose a bone to study it in 3D. Each lesson covers its landmarks, how to hold it, how to tell right from left, its articulations and attachments, and the questions examiners ask."
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LibraryList kind="bone" items={items} regions={REGIONS.map((r) => ({ id: r, label: REGION_LABEL[r] }))} />
        <p className="mt-10 max-w-3xl text-sm text-[#5b616b]">
          This is a starting library for Pharm-D osteology practicals, not a copy of any university&apos;s syllabus. Check
          your own course outline for the bones your practical examines.
        </p>
      </div>
    </>
  );
}
