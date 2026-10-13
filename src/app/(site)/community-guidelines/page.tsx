import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageSection } from "@/components/page-kit";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/content/governance";

/**
 * Community guidelines and moderation policy (2026-10-13, AdSense remediation
 * phase 3). Describes only what the product does: every post and comment has a
 * Report button (src/components/community/PostActions.tsx → POST
 * /api/community/report), and reports reach the team. Kept outside /community
 * so it stays indexable (the community itself is noindexed — src/lib/indexing.ts).
 */

export const metadata: Metadata = pageMeta({
  title: "Community Guidelines and Moderation | PharmaWallah",
  description:
    "What you can post in the PharmaWallah pharmacy community, what is removed, how to report a post or comment, and how the team moderates.",
  path: "/community-guidelines",
});

const UPDATED = "2026-10-13";

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "purpose",
    title: "What the community is for",
    body: (
      <p>
        The community is a place for pharmacy students to ask and answer questions about their studies —
        pharmacology, pharmaceutics, calculations, lab work, exams and careers. Posts are public and written by
        members, not by the PharmaWallah team.
      </p>
    ),
  },
  {
    id: "allowed",
    title: "Please post",
    body: (
      <ul>
        <li>Questions about concepts, calculations and practicals, with your own working where you can.</li>
        <li>Answers that explain why, not just the final number — and say where a fact comes from.</li>
        <li>Study resources you are allowed to share: your own notes, links to official or open-access sources.</li>
      </ul>
    ),
  },
  {
    id: "not-allowed",
    title: "Not allowed",
    body: (
      <ul>
        <li>
          <strong>Advice for a real patient.</strong> Do not ask for or give a dose, diagnosis or treatment for a
          real person. That belongs with a pharmacist or doctor who can see the patient.
        </li>
        <li>
          <strong>Patient or personal information</strong> — names, prescriptions, photos or records that could
          identify anyone, including yourself.
        </li>
        <li>
          <strong>Copyrighted material</strong> you do not have the right to share: scanned textbook pages, paid
          course files, leaked exam papers.
        </li>
        <li>Harassment, hate speech, threats, or sexual content.</li>
        <li>Spam, advertising, and links to unrelated or unsafe sites.</li>
        <li>Content that encourages academic misconduct, such as selling assignments or exam answers.</li>
      </ul>
    ),
  },
  {
    id: "reporting",
    title: "Reporting a post or comment",
    body: (
      <>
        <p>
          Every post and comment has a <strong>Report</strong> option in its menu. Choose a reason and add any
          detail that helps. Reports go to the PharmaWallah team; the person you report is not told who reported
          them.
        </p>
        <p>
          You can also write to us through the <Link href="/contact?subject=Community%20report">contact form</Link>,
          for example to report something urgent or to ask about a removal.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "How we moderate",
    body: (
      <ul>
        <li>The team reviews reported content against these guidelines.</li>
        <li>Content that breaks them is removed. Repeated or serious breaches can lead to an account being suspended.</li>
        <li>
          If you think something was removed by mistake, tell us through the contact form and we will look at it
          again.
        </li>
        <li>
          Community answers are not checked by the team for accuracy. Treat them as discussion, and check against
          your textbook or instructor.
        </li>
      </ul>
    ),
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="bg-[#fcfcfa]">
      <PageHero
        trail={[{ label: "Home", href: "/" }, { label: "Community guidelines" }]}
        eyebrow="Community"
        title="Community guidelines"
        lead="How to take part in the PharmaWallah community, what is removed, and how to report a problem."
        meta={<p className="text-sm text-[#16181d]/60">Last updated {formatDate(UPDATED)}</p>}
      />
      <PageSection width="narrow" ruled={false}>
        {/* `prose` only opts the lists out of globals.css's ul styling (MEMORY.md gotcha 192). */}
        <div className="prose space-y-10 text-[15.5px] leading-[1.75] text-[#16181d]/80 [&_a]:font-medium [&_a]:text-[#1C7BD9] [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:text-[1.4rem] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-[#16181d] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-[#21B67A] [&_p+p]:mt-3 [&_strong]:text-[#16181d] [&_ul]:space-y-2.5">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
              <h2 id={`${s.id}-h`}>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
