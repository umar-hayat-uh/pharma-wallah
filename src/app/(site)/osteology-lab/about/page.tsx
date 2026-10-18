import type { Metadata } from "next";
import { PageHero, PageSection } from "@/components/page-kit";
import { ADAPTATIONS, ASSET_LICENCE, ASSET_SOURCES } from "@/lib/osteology/attribution";
import { BONES, JOINTS } from "@/lib/osteology/registry";
import { References } from "@/components/osteology/blocks";
import { SITE_NAME, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `About the Osteology Lab — sources, method and limits | ${SITE_NAME}`,
  description:
    "Where the Osteology Lab's 3D models and landmark positions come from, how they were converted, how its questions are made and marked, what it does not yet cover, and the CC BY-SA licence of its models.",
  path: "/osteology-lab/about",
});

export default function AboutLabPage() {
  const landmarks = BONES.reduce((n, b) => n + b.landmarks.length, 0);
  const marked = BONES.reduce((n, b) => n + b.landmarks.filter((l) => l.zName).length, 0);
  return (
    <>
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "About" }]}
        eyebrow="About the lab"
        title="Sources, method and limits"
        lead="What you can trust the lab for, where every model and marker comes from, and what it does not do yet."
      />
      <PageSection ruled={false} title="How it is built" width="narrow">
        <div className="pw-osteo-prose space-y-3 text-[15px] leading-relaxed">
          <p>
            The lab teaches {BONES.length} bones (or groups of bones) and {JOINTS.length} joints. Each 3D model is exported from the
            Z-Anatomy atlas by a repeatable script, so it shows the same anatomy as that atlas — bones with their articular cartilage,
            and for joints the capsule, ligaments, discs and menisci as separate parts.
          </p>
          <p>
            Of {landmarks} landmarks taught, {marked} carry a marker on the 3D model. A marker is placed only at the point where the
            Z-Anatomy anatomist placed that label&apos;s leader line; we never estimate a position. The rest are taught from the list.
          </p>
          <p>
            Spotting images are renders of the same models, not photographs and never X-rays. A question points at a landmark only when
            that point is visible from the camera.
          </p>
          <p>
            Practice answers and mock exams are marked on our server; the answer key is not sent to your browser before you answer.
            Exam settings (stations, time, marks) are practice defaults, not any university&apos;s official format.
          </p>
          <p>
            The written content was drafted against standard anatomy textbooks and then checked a second time, line by line, for errors.
            It has not yet been reviewed by a named anatomy teacher; if you find a mistake, please tell us through the contact page.
          </p>
        </div>
      </PageSection>
      <PageSection title="What it does not do yet" width="narrow">
        <ul className="pw-osteo-prose text-[15px] leading-relaxed">
          <li>No photographs of real bone specimens — none with a licence we could verify were available.</li>
          <li>The models are a single adult skeleton: they do not show variation between people or between sexes.</li>
          <li>Some small landmarks (and the whole patella) have no 3D marker because Z-Anatomy does not label them.</li>
          <li>Movements are described in words; there are no movement animations.</li>
          <li>The bone list is a starting library and has not been matched to a specific university syllabus.</li>
        </ul>
      </PageSection>
      <PageSection id="credits" title="Credits & licence of the 3D models and images" width="narrow">
        <div className="space-y-5 text-[15px] leading-relaxed">
          {ASSET_SOURCES.map((s) => (
            <div key={s.title}>
              <p className="font-semibold">{s.title}</p>
              <p className="text-[#4a4f57]">{s.authors}</p>
              <p className="mt-1">{s.used}</p>
              <p className="mt-1 text-sm">
                Licence: <a className="text-brandBlue underline" href={s.licenceUrl} rel="noopener noreferrer" target="_blank">{s.licence}</a> ·{" "}
                <a className="text-brandBlue underline" href={s.url} rel="noopener noreferrer" target="_blank">Source</a>
              </p>
            </div>
          ))}
          <div>
            <p className="font-semibold">Changes we made</p>
            <ul className="pw-osteo-prose">
              {ADAPTATIONS.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
          <p className="text-sm">
            The adapted models (files under /models/osteology) and the spotting images are shared under{" "}
            <a className="text-brandBlue underline" href={ASSET_LICENCE.url} rel="noopener noreferrer" target="_blank">{ASSET_LICENCE.name}</a>, as their
            licence requires. This applies to those files only, not to the rest of PharmaWallah.
          </p>
        </div>
      </PageSection>
      <PageSection title="References" width="narrow">
        <References ids={["graysStudents5", "moore9", "ta2", "zAnatomy"]} />
      </PageSection>
    </>
  );
}
