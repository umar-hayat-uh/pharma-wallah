import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { PracticeSession } from "@/components/osteology/PracticeSession";
import { SPOTTING_TYPES } from "@/lib/osteology/exam-config";
import type { Region } from "@/lib/osteology/types";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Osteology spotting practice | ${SITE_NAME}`,
  description:
    "Spotting practice for the osteology practical: identify the bone, determine its side, name the marked landmark, identify the joint and the highlighted ligament — with the answer and an explanation after every question.",
  path: "/osteology-lab/spotting",
});

const REGIONS: Region[] = ["upper-limb", "lower-limb", "axial"];

export default function SpottingPage({ searchParams }: { searchParams: { region?: string } }) {
  const region = REGIONS.find((r) => r === searchParams.region) ?? null;
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Spotting practice" }]}
        eyebrow="Spotting practice"
        title="Spot it, side it, name it"
        lead="Specimen images of each bone and joint. Answer, then see the right answer and why. Every image is a render of the lab's verified 3D models — not a photograph, and never an X-ray."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <PracticeSession
          title="Set up a practice round"
          kind="spotting"
          types={[...SPOTTING_TYPES, "articulating-bone", "classify-joint", "joint-bones"]}
          defaultTypes={SPOTTING_TYPES}
          initialRegion={region}
          examHref="/osteology-lab/exam?preset=spotting"
        />
        <section className="mt-10 text-sm text-[#4a4f57]">
          <h2 className="font-semibold text-[#16181d]">About the images</h2>
          <p className="mt-1">
            The images are renders of the Z-Anatomy 3D models (derived from BodyParts3D), lit like a specimen on a tray. A marker
            points at a landmark only where Z-Anatomy places that label and only when nothing hides it from the camera. Photographs of
            real bone specimens are not used yet: none with a licence we could verify were available. Ask your department whether its
            specimen photographs can be added.
          </p>
        </section>
      </div>
    </>
  );
}
