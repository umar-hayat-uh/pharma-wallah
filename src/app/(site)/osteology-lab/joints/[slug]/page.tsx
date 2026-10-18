import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-kit";
import { JointExplorer } from "@/components/osteology/JointExplorer";
import { LessonProgress } from "@/components/osteology/LessonProgress";
import { Bullets, Card, Chip, Fact, QAList, References } from "@/components/osteology/blocks";
import { ContentByline } from "@/components/content/ContentByline";
import { JOINTS, REGION_LABEL, boneHref, getJoint, jointHref } from "@/lib/osteology/registry";
import { jointModel, kb, modelUrl } from "@/lib/osteology/models";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return JOINTS.map((j) => ({ slug: j.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const joint = getJoint(params.slug);
  if (!joint) return {};
  return pageMeta({
    title: `${joint.name} — bones, ligaments & movements | ${SITE_NAME}`,
    description: `${joint.summary} Explore the 3D joint with its ligaments, classification, movements and viva questions.`,
    path: jointHref(joint.slug),
    extra: ["Part of the PharmaWallah Virtual Osteology & Arthrology Lab for Pharm-D students."],
    type: "article",
  });
}

export default function JointPage({ params }: { params: { slug: string } }) {
  const joint = getJoint(params.slug);
  if (!joint) notFound();
  const model = jointModel(joint.slug);
  const path = jointHref(joint.slug);
  const sameRegion = JOINTS.filter((j) => j.region === joint.region);
  const idx = sameRegion.findIndex((j) => j.slug === joint.slug);
  const prev = sameRegion[idx - 1];
  const next = sameRegion[idx + 1];
  const related = joint.related.map((s) => getJoint(s)).filter((j): j is NonNullable<typeof j> => !!j);
  const structures = [...joint.special, ...joint.ligaments];

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Osteology Lab", path: "/osteology-lab" },
          { name: "Joints", path: "/osteology-lab/joints" },
          { name: joint.name, path },
        ])}
      />
      <PageHero
        trail={[{ label: "Osteology Lab", href: "/osteology-lab" }, { label: "Joints", href: "/osteology-lab/joints" }, { label: joint.name }]}
        eyebrow={REGION_LABEL[joint.region]}
        title={joint.name}
        lead={joint.summary}
        actions={<LessonProgress kind="joint" slug={joint.slug} name={joint.name} />}
        meta={
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Fact label="Structural">{joint.structural.split(/[.;(]/)[0].trim()}</Fact>
            <Fact label="Functional">{joint.functional.split(/[.;(]/)[0].trim()}</Fact>
            <Fact label="Synovial type">{joint.synovialSubtype ? joint.synovialSubtype.split(/[.;(]/)[0].trim() : "Not synovial"}</Fact>
            <Fact label="Axes">{joint.axes ? joint.axes.split(/[.;(]/)[0].trim() : "—"}</Fact>
          </dl>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {model ? (
          <JointExplorer
            joint={{ slug: joint.slug, name: joint.name, bones: joint.bones, special: joint.special, ligaments: joint.ligaments }}
            modelSrc={modelUrl(model.file)}
            modelSize={kb(model.bytes)}
            parts={model.parts}
          />
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">No 3D model is available for this joint yet.</p>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card id="identification" title="Identification">
            <p><strong>Location:</strong> {joint.location}</p>
            <p className="mt-2 font-semibold">Bones taking part</p>
            <ul>
              {joint.bones.map((b) => (
                <li key={b.name}>
                  {b.slug ? <Link className="text-brandBlue underline-offset-2 hover:underline" href={boneHref(b.slug)}>{b.name}</Link> : b.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-semibold">Articulating surfaces</p>
            <Bullets items={joint.surfaces} />
          </Card>

          <Card id="classification" title="Classification & structure">
            <dl className="space-y-2">
              <div><dt className="font-semibold">Structural</dt><dd>{joint.structural}</dd></div>
              <div><dt className="font-semibold">Functional</dt><dd>{joint.functional}</dd></div>
              {joint.synovialSubtype && <div><dt className="font-semibold">Synovial subtype</dt><dd>{joint.synovialSubtype}</dd></div>}
              {joint.axes && <div><dt className="font-semibold">Axes</dt><dd>{joint.axes}</dd></div>}
              {joint.capsule && <div><dt className="font-semibold">Capsule & cavity</dt><dd>{joint.capsule}</dd></div>}
            </dl>
          </Card>

          {joint.components.length > 0 && (
            <Card id="components" title="Its parts, one by one" className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {joint.components.map((c) => (
                  <div key={c.name} className="rounded-xl border border-[#16181d]/10 bg-[#fafbfc] p-4">
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-0.5 text-sm text-brandBlue">{c.type}</p>
                    <p className="mt-1.5 text-sm"><strong>Bones:</strong> {c.bones}</p>
                    <p className="mt-1 text-sm">{c.notes}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card id="ligaments" title="Ligaments & supporting structures" className="lg:col-span-2">
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#16181d]/10 text-[#5b616b]">
                    <th className="px-1 py-2 font-semibold">Structure</th>
                    <th className="px-1 py-2 font-semibold">Attachments / position</th>
                    <th className="px-1 py-2 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((s) => (
                    <tr key={s.name} className="border-b border-[#16181d]/5 align-top">
                      <td className="px-1 py-2 font-medium">{s.name}</td>
                      <td className="px-1 py-2">{s.attachments}</td>
                      <td className="px-1 py-2">{s.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card id="movements" title="Movements" className="lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              {joint.movements.map((m) => (
                <div key={m.name} className="rounded-xl border border-[#16181d]/10 p-4">
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-1 text-sm">{m.description}</p>
                  {m.muscles.length > 0 && <p className="mt-1.5 text-sm text-[#4a4f57]"><strong>Main muscles:</strong> {m.muscles.join(", ")}</p>}
                </div>
              ))}
            </div>
            {joint.notHere && joint.notHere.length > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Not at this joint</p>
                <Bullets items={joint.notHere} />
              </div>
            )}
          </Card>

          <Card id="function" title="Function">
            <Bullets items={joint.functions} />
            <p className="mt-3"><strong>Stability vs mobility:</strong> {joint.stability}</p>
          </Card>

          <Card id="clinical" title="Clinical correlations">
            <Bullets items={joint.clinical} />
          </Card>

          <Card id="exam-points" title="What examiners look for">
            <Bullets items={joint.examPoints} />
          </Card>

          <Card id="mistakes" title="Common mistakes">
            <Bullets items={joint.mistakes} />
          </Card>

          <Card id="viva" title="Viva questions" className="lg:col-span-2">
            <QAList items={joint.viva} />
          </Card>

          <Card id="revision" title="Revision notes" className="border-brandGreen/30 bg-[#f3fbf7] lg:col-span-2">
            <Bullets items={joint.revision} />
          </Card>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-h" className="mt-8">
            <h2 id="related-h" className="text-lg font-bold">Related joints</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((j) => <Chip key={j.slug} href={jointHref(j.slug)}>{j.name}</Chip>)}
            </div>
          </section>
        )}

        <nav aria-label="Previous and next joint" className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={jointHref(prev.slug)} className="flex min-h-14 items-center gap-2 rounded-2xl border border-[#16181d]/10 bg-white px-4 font-semibold hover:border-brandBlue/40">
              <ArrowLeft className="h-4 w-4" aria-hidden /> {prev.name}
            </Link>
          ) : <span />}
          {next && (
            <Link href={jointHref(next.slug)} className="flex min-h-14 items-center justify-end gap-2 rounded-2xl border border-[#16181d]/10 bg-white px-4 font-semibold hover:border-brandBlue/40">
              {next.name} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </nav>

        <section aria-labelledby="refs-h" className="mt-10 border-t border-[#16181d]/10 pt-6">
          <h2 id="refs-h" className="text-sm font-bold uppercase tracking-wide text-[#5b616b]">References</h2>
          <div className="mt-3"><References ids={joint.refs} /></div>
          <ContentByline className="mt-4" path={path} pageTitle={joint.name} />
        </section>
      </div>
    </>
  );
}
