import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Bone, ClipboardCheck, FlaskConical, MessagesSquare, Waypoints } from "lucide-react";
import { PageHero, PageSection } from "@/components/page-kit";
import { ContinueLearning } from "@/components/osteology/ContinueLearning";
import { BONES, JOINTS, REGION_LABEL, boneHref, jointHref } from "@/lib/osteology/registry";
import { SITE_NAME, pageMeta } from "@/lib/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMeta({
  title: `Virtual Osteology & Arthrology Lab for Pharm-D | ${SITE_NAME}`,
  description:
    "Study bones and joints in 3D: rotate each bone, find its landmarks, learn to side it, take a joint apart ligament by ligament, then practise spotting, viva questions and timed mock practical exams.",
  path: "/osteology-lab",
});

const SECTIONS = [
  { href: "/osteology-lab/bones", title: "Learn bones", body: `${BONES.length} bones and bone groups in 3D, with landmarks and side determination.`, Icon: Bone },
  { href: "/osteology-lab/joints", title: "Study joints", body: `${JOINTS.length} upper- and lower-limb joints with their ligaments, classification and movements.`, Icon: Waypoints },
  { href: "/osteology-lab/spotting", title: "Spotting practice", body: "Identify the bone, its side, the marked landmark, the joint and the ligament.", Icon: FlaskConical },
  { href: "/osteology-lab/viva", title: "Viva practice", body: "Model answers to viva questions, and bone identification on a full skeleton.", Icon: MessagesSquare },
  { href: "/osteology-lab/exam", title: "Mock exams", body: "Timed practical papers, marked on our server, with what to revise.", Icon: ClipboardCheck },
  { href: "/osteology-lab/progress", title: "My progress", body: "Completed lessons, recent study, practice and exam history.", Icon: BarChart3 },
];

export default function OsteologyLabHome() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Osteology Lab", path: "/osteology-lab" }])} />
      <PageHero
        eyebrow="Virtual practical lab"
        title="Osteology & Arthrology Lab"
        lead="Hold every bone in your hand — on your phone. Turn it, find each landmark, tell right from left, take joints apart ligament by ligament, then test yourself the way the practical will."
        size="display"
        actions={
          <>
            <Link href="/osteology-lab/bones" className="inline-flex min-h-12 items-center rounded-xl bg-brandBlue px-5 font-semibold text-white">Start with the bones</Link>
            <Link href="/osteology-lab/exam" className="inline-flex min-h-12 items-center rounded-xl border border-[#16181d]/15 bg-white px-5 font-semibold">Take a mock exam</Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <ContinueLearning />
      </div>

      <PageSection ruled={false} title="What would you like to do?">
        <ul className="pw-osteo-list grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ href, title, body, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full min-h-[7.5rem] gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-5 transition hover:border-brandBlue/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandBlue"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brandBlue/10 text-brandBlue"><Icon className="h-6 w-6" aria-hidden /></span>
                <span>
                  <span className="block text-lg font-bold group-hover:text-brandBlue">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[#4a4f57]">{body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title="Everything in the lab" description="Every bone and joint has its own lesson page.">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Bones</h3>
            {(["upper-limb", "lower-limb", "axial"] as const).map((r) => (
              <p key={r} className="mt-2 text-sm leading-relaxed">
                <span className="text-[#6b7079]">{REGION_LABEL[r]}: </span>
                {BONES.filter((b) => b.region === r).map((b, i, arr) => (
                  <span key={b.slug}>
                    <Link href={boneHref(b.slug)} className="text-brandBlue underline-offset-2 hover:underline">{b.name}</Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <div>
            <h3 className="font-semibold">Joints</h3>
            {(["upper-limb", "lower-limb"] as const).map((r) => (
              <p key={r} className="mt-2 text-sm leading-relaxed">
                <span className="text-[#6b7079]">{REGION_LABEL[r]}: </span>
                {JOINTS.filter((j) => j.region === r).map((j, i, arr) => (
                  <span key={j.slug}>
                    <Link href={jointHref(j.slug)} className="text-brandBlue underline-offset-2 hover:underline">{j.name}</Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
        <p className="mt-8 text-sm text-[#5b616b]">
          3D models from Z-Anatomy (CC BY-SA 4.0), derived from BodyParts3D © DBCLS.{" "}
          <Link href="/osteology-lab/about" className="text-brandBlue underline">Sources, method and limits</Link>.
        </p>
      </PageSection>
    </>
  );
}
