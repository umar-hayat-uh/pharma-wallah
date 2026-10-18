import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { LibraryList, type LibraryItem } from "@/components/osteology/LibraryList";
import { JOINTS, REGION_LABEL, jointHref } from "@/lib/osteology/registry";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Joints of the limbs — articulation explorer | ${SITE_NAME}`,
  description:
    "All nine upper-limb joints and eight pelvic and lower-limb joints: bones and articular surfaces, classification, ligaments, movements and viva questions, each with a 3D model of the joint and its ligaments.",
  path: "/osteology-lab/joints",
});

export default function JointIndexPage() {
  const items: LibraryItem[] = JOINTS.map((j) => ({
    slug: j.slug,
    href: jointHref(j.slug),
    name: j.name,
    sub: j.synovialSubtype ? `Synovial · ${j.synovialSubtype.split(/[.;(]/)[0].trim().toLowerCase()}` : j.structural.split(/[.;(]/)[0].trim(),
    region: j.region,
    regionLabel: REGION_LABEL[j.region],
    group: j.region === "upper-limb" ? "Upper limb joints" : "Lower limb joints",
    keywords: `${j.aka.join(" ")} ${j.bones.map((b) => b.name).join(" ")}`,
    badge: `${j.ligaments.length} ligaments · ${j.movements.length} movements`,
  }));
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Joints" }]}
        eyebrow="Study joints"
        title="Articulation explorer"
        lead="Search a joint, or a bone to see every joint it forms. Each joint opens as a 3D model you can take apart: highlight a bone or a ligament, hide the capsule, and read its classification and movements."
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LibraryList
          kind="joint"
          items={items}
          regions={[{ id: "upper-limb", label: "Upper limb" }, { id: "lower-limb", label: "Pelvis & lower limb" }]}
        />
      </div>
    </>
  );
}
