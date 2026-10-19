import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FlaskConical } from "lucide-react";
import { PageHero } from "@/components/page-kit";
import { BoneExplorer } from "@/components/osteology/BoneExplorer";
import { LessonProgress } from "@/components/osteology/LessonProgress";
import { Bullets, Card, Chip, Fact, QAList, References } from "@/components/osteology/blocks";
import { ContentByline } from "@/components/content/ContentByline";
import { BONES, REGION_LABEL, boneHref, getBone, jointHref, jointsOfBone } from "@/lib/osteology/registry";
import { boneModel, kb, modelUrl } from "@/lib/osteology/models";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

// Server page: every word of the lesson is in the first HTML (MEMORY gotcha 208); only
// the 3D viewer and the landmark selection are client-side. Unknown slugs render the
// noindexed not-found UI (gotcha 200).

export function generateStaticParams() {
  return BONES.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const bone = getBone(params.slug);
  if (!bone) return {};
  return pageMeta({
    title: `${bone.name} — 3D osteology lesson | ${SITE_NAME}`,
    description: `${bone.summary} Rotate the 3D model, find each landmark, learn how to tell right from left, and practise viva questions.`,
    path: boneHref(bone.slug),
    extra: ["Part of the PharmaWallah Virtual Osteology & Arthrology Lab for Pharm-D students."],
    type: "article",
  });
}

export default function BonePage({ params }: { params: { slug: string } }) {
  const bone = getBone(params.slug);
  if (!bone) notFound();
  const model = boneModel(bone.slug);
  const joints = jointsOfBone(bone.slug);
  const path = boneHref(bone.slug);
  const [w, h, d] = model?.sizeCm ?? [0, 0, 0];

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Osteology Lab", path: "/osteology-lab" },
          { name: "Bones", path: "/osteology-lab/bones" },
          { name: bone.name, path },
        ])}
      />
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Bones", href: "/osteology-lab/bones" }, { label: bone.name }]}
        eyebrow={`${REGION_LABEL[bone.region]} · ${bone.group}`}
        // Long anatomical words ("Metacarpophalangeal") are wider than a 320 px phone at the title's
        // minimum size: let them hyphenate, and break as a last resort, instead of widening the page.
        title={<span lang="en" className="hyphens-auto [overflow-wrap:anywhere]">{bone.name}</span>}
        lead={bone.summary}
        actions={<LessonProgress kind="bone" slug={bone.slug} name={bone.name} />}
        meta={
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Fact label="Latin (TA)">{bone.latin}</Fact>
            <Fact label="Type">{bone.classification.split(/[.;—–(]/)[0].trim()}</Fact>
            <Fact label="Side">{bone.sideType === "paired" ? "Paired — right and left" : "Midline — single"}</Fact>
            <Fact label="Model size">{model ? `${Math.max(w, h, d).toFixed(1)} cm longest` : "—"}</Fact>
          </dl>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {model ? (
          <BoneExplorer
            bone={{ slug: bone.slug, name: bone.name, sideType: bone.sideType, isGroup: bone.isGroup, landmarks: bone.landmarks }}
            modelSrc={modelUrl(model.file)}
            modelSize={kb(model.bytes)}
            anchors={model.landmarks}
          />
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">No 3D model is available for this bone yet.</p>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card id="classification" title="Classification & region">
            <p>{bone.classification}</p>
            {bone.parts.length > 0 && (
              <dl className="mt-3 space-y-2">
                {bone.parts.map((p) => (
                  <div key={p.name}>
                    <dt className="font-semibold">{p.name}</dt>
                    <dd>{p.description}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card id="orientation" title="Hold it in the anatomical position">
            <Bullets items={bone.orientation} ordered />
          </Card>

          <Card id="side" title={bone.sideType === "paired" ? "Right or left? Side determination" : "Orientation (a midline bone has no side)"}>
            <Bullets items={bone.sideDetermination.steps} ordered />
            {bone.sideDetermination.note && <p className="mt-2 text-[#4a4f57]">{bone.sideDetermination.note}</p>}
            {bone.sideType === "paired" && (
              <p className="mt-3 text-sm text-[#4a4f57]">Check yourself: switch the 3D model to “Left bone” and apply the same steps.</p>
            )}
          </Card>

          <Card id="articulations" title="Articulations">
            <ul>
              {bone.articulations.map((a, i) => (
                <li key={i}>
                  With the{" "}
                  {a.withSlug ? <Link className="font-semibold text-brandBlue underline-offset-2 hover:underline" href={boneHref(a.withSlug)}>{a.with.toLowerCase()}</Link> : <strong>{a.with.toLowerCase()}</strong>}{" "}
                  at the {a.jointSlug ? <Link className="text-brandBlue underline-offset-2 hover:underline" href={jointHref(a.jointSlug)}>{a.joint}</Link> : a.joint}
                  {" "}— {a.surface.replace(/\.$/, "")}.
                </li>
              ))}
            </ul>
          </Card>

          {bone.attachments.length > 0 && (
            <Card id="attachments" title="Muscle and ligament attachments" className="lg:col-span-2">
              {/* Phones: stacked, not a table cut off at the screen edge (from `sm` up, the table). */}
              <ul className="pw-osteo-list space-y-3 sm:hidden">
                {bone.attachments.map((a, i) => (
                  <li key={i}>
                    <div className="rounded-xl border border-[#16181d]/10 bg-[#fafbfc] p-4 text-sm leading-relaxed">
                      <p className="font-semibold text-[#16181d]">{a.structure} <span className="font-medium capitalize text-brandBlue">· {a.kind}</span></p>
                      <p className="mt-1">{a.site}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="-mx-1 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#16181d]/10 text-[#5b616b]">
                      <th className="px-1 py-2 font-semibold">Structure</th>
                      <th className="px-1 py-2 font-semibold">Type</th>
                      <th className="px-1 py-2 font-semibold">Where on the bone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bone.attachments.map((a, i) => (
                      <tr key={i} className="border-b border-[#16181d]/5 align-top">
                        <td className="px-1 py-2 font-medium">{a.structure}</td>
                        <td className="px-1 py-2 capitalize">{a.kind}</td>
                        <td className="px-1 py-2">{a.site}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card id="functions" title="Functions">
            <Bullets items={bone.functions} />
          </Card>

          <Card id="clinical" title="Clinical & practical relevance">
            <Bullets items={bone.clinical} />
          </Card>

          <Card id="tips" title="Identification tips">
            <Bullets items={bone.tips} />
          </Card>

          <Card id="mistakes" title="Common student mistakes">
            <Bullets items={bone.mistakes} />
          </Card>

          <Card id="exam" title="Common exam questions" className="lg:col-span-2">
            <QAList items={bone.examQuestions} />
          </Card>

          <Card id="revision" title="Revision summary" className="border-brandGreen/30 bg-[#f3fbf7] lg:col-span-2">
            <Bullets items={bone.revision} />
          </Card>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Test yourself on the {bone.name.toLowerCase()}</p>
            <p className="text-sm text-[#4a4f57]">Spotting questions on bones, sides and landmarks — untimed, with explanations.</p>
          </div>
          <Link
            href={`/osteology-lab/spotting?region=${bone.region}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brandBlue px-4 text-sm font-semibold text-white"
          >
            <FlaskConical className="h-4 w-4" aria-hidden /> Spotting practice <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {joints.length > 0 && (
          <section aria-labelledby="joints-h" className="mt-8">
            <h2 id="joints-h" className="text-lg font-bold">Joints of the {bone.name.toLowerCase()}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {joints.map((j) => (
                <Chip key={j.slug} href={jointHref(j.slug)}>{j.name}</Chip>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="refs-h" className="mt-10 border-t border-[#16181d]/10 pt-6">
          <h2 id="refs-h" className="text-sm font-bold uppercase tracking-wide text-[#5b616b]">References</h2>
          <div className="mt-3"><References ids={bone.refs} /></div>
          <ContentByline className="mt-4" path={path} pageTitle={bone.name} />
        </section>
      </div>
    </>
  );
}
