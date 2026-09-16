import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, FlaskConical, Microscope, Smartphone, Stethoscope } from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE, FigureRow, PageHero, PageSection, Reveal } from "@/components/page-kit";
import { HUB_TOOL_COUNT } from "@/app/(site)/calculation-tools/tool-index";
import { SUBJECTS } from "@/lib/courses/registry";
import { TEAM, TEAM_SECTIONS, type TeamMember } from "@/lib/team";
import FlipCard from "./FlipCard";
import { Plate } from "./_Plate";

export const metadata: Metadata = {
    title: "About PharmaWallah — the students who build it",
    description:
        "PharmaWallah is built by pharmacy students in Karachi for the Pharm-D syllabus they are studying themselves. Meet the team and see what they make.",
    alternates: { canonical: "/about-us" },
};

/** Units live in the course registry, so the figure can never drift (MEMORY.md gotcha 47). */
const UNIT_COUNT = SUBJECTS.reduce((total, subject) => total + subject.units.length, 0);

/**
 * What the team makes. The two counts that can be derived are imported; the
 * rest are described in words rather than given a number nobody can check.
 */
const PILLARS = [
    {
        icon: Calculator,
        name: "Calculation tools",
        note: `${HUB_TOOL_COUNT} calculators, each showing its working step by step.`,
        href: "/calculation-tools",
    },
    {
        icon: BookOpen,
        name: "Courses & MCQs",
        note: `${UNIT_COUNT} units of lesson notes, each ending in practice questions.`,
        href: "/courses",
    },
    {
        icon: Microscope,
        name: "Spotting labs",
        note: "Histology, pathology and powder-microscopy slides, with timed tests.",
        href: "/spotting",
    },
    {
        icon: FlaskConical,
        name: "Simulations",
        note: "Wet-lab practicals run start to finish — titration, staining, UV and more.",
        href: "/simulations",
    },
    {
        icon: Stethoscope,
        name: "Clinical desk",
        note: "Drug finder, interaction checks and literature search for practice.",
        href: "/clinical",
    },
    {
        icon: Smartphone,
        name: "Android app",
        note: "Every calculator on your phone, offline and ad-free.",
        href: "/download",
    },
];

/**
 * /about-us — who builds PharmaWallah.
 *
 * Rebuilt 2026-09-16 at the user's request ("smooth, simple, scroll animations,
 * cards with description, no photo"), replacing the same day's GSAP roster-stage
 * version, then given a top-design pass (leadership feature cards, sticky group
 * labels, flip cards). A server component: the client code is the page kit's
 * <Reveal> — everything visible on the server, only below-fold blocks lift in
 * (MEMORY.md gotcha 65) — and <FlipCard>. No GSAP, no bespoke stylesheet.
 *
 * Lists use `!list-none !m-0 !p-0` because globals.css styles every ul/li
 * outside `.prose` (gotcha 30b).
 */
export default function AboutPage() {
    return (
        <div className="bg-[#fcfcfa] text-[#16181d] dark:bg-[#0b0c0e] dark:text-[#f7f5f1]">
            <PageHero
                size="display"
                trail={[{ label: "Home", href: "/" }, { label: "About us" }]}
                eyebrow="About PharmaWallah"
                title={
                    <>
                        Built by pharmacy students,{" "}
                        <span className="bg-gradient-to-r from-[#1567b8] to-[#17905f] bg-clip-text text-transparent">
                            for pharmacy students.
                        </span>
                    </>
                }
                lead={`We are ${TEAM.length} students sitting the same Pharm-D papers as the people who use this site. Every calculator, lesson and lab here started as something one of us needed before an exam.`}
                actions={
                    <>
                        <a
                            href="#team"
                            style={{ background: BRAND_BUTTON }}
                            className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition-transform duration-500 ease-out-expo hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60 focus-visible:ring-offset-2"
                        >
                            Meet the team
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <Link
                            href="/contact"
                            className="inline-flex h-11 items-center rounded-full border border-[#16181d]/15 px-6 text-[15px] font-semibold transition-colors duration-300 ease-out-expo hover:border-[#1c7bd9] hover:text-[#1c7bd9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60 dark:border-white/20"
                        >
                            Contact us
                        </Link>
                    </>
                }
                meta={
                    <FigureRow
                        columns={3}
                        figures={[
                            { value: TEAM.length, label: "students on the team", href: "#team" },
                            { value: HUB_TOOL_COUNT, label: "calculators", href: "/calculation-tools" },
                            { value: UNIT_COUNT, label: "course units", href: "/courses" },
                        ]}
                    />
                }
            />

            <Story />
            <Pillars />
            <Team />
            <Closing />
        </div>
    );
}

/* ── Story ────────────────────────────────────────────────────────────────── */

function Story() {
    return (
        <PageSection eyebrow="Our story" title="One place for the whole syllabus." ruled={false}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
                <Reveal>
                    <p className="text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold leading-snug tracking-[-0.02em] [text-wrap:balance]">
                        We were never short of study material. We were short of{" "}
                        <span className="text-[#1c7bd9]">one place to put it.</span>
                    </p>
                </Reveal>
                <Reveal delay={80} className="space-y-4 text-[15.5px] leading-relaxed text-[#16181d]/70 dark:text-[#f7f5f1]/70">
                    <p>
                        The formula was on a photocopied handout, the worked example in a senior&rsquo;s notebook, and the
                        slide you had to identify nowhere at all. We lost more evenings finding things than learning them.
                    </p>
                    <p>
                        So we started collecting — first for ourselves, then for our year. It is free, it needs no
                        account, and it is written and checked by the students on this page.
                    </p>
                </Reveal>
            </div>
        </PageSection>
    );
}

/* ── What we make ─────────────────────────────────────────────────────────── */

function Pillars() {
    return (
        <PageSection eyebrow="What we make" title="Everything a pharmacy student reaches for." action={`${PILLARS.length} sections`}>
            <ul className="!m-0 grid !list-none gap-4 !p-0 sm:grid-cols-2 lg:grid-cols-3">
                {PILLARS.map((pillar, i) => {
                    const Icon = pillar.icon;
                    return (
                        <Reveal as="li" key={pillar.href} delay={(i % 3) * 70} className="!m-0 !list-none !p-0">
                            {/* prefetch={false}: dynamic routes; root loading.tsx answers a click at once. */}
                            <Link
                                href={pillar.href}
                                prefetch={false}
                                className="group flex h-full flex-col rounded-2xl border border-[#16181d]/10 bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-[#1c7bd9]/40 hover:shadow-[0_18px_40px_-24px_rgba(22,24,29,.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60 dark:border-white/10 dark:bg-white/[0.03]"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c7bd9]/10 text-[#1c7bd9]">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <span className="mt-5 flex items-center justify-between gap-3 text-lg font-semibold tracking-[-0.01em]">
                                    {pillar.name}
                                    <ArrowRight
                                        className="h-4 w-4 shrink-0 text-[#16181d]/30 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-[#1c7bd9] dark:text-[#f7f5f1]/30"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="mt-2 text-[14.5px] leading-relaxed text-[#16181d]/60 dark:text-[#f7f5f1]/60">
                                    {pillar.note}
                                </span>
                            </Link>
                        </Reveal>
                    );
                })}
            </ul>
        </PageSection>
    );
}

/* ── Team ─────────────────────────────────────────────────────────────────── */

function Team() {
    const [lead, ...groups] = TEAM_SECTIONS;
    return (
        <PageSection
            id="team"
            eyebrow="The team"
            title="The people behind PharmaWallah."
            description="Students, not staff — grouped by the part of the work each of us does."
            action={`${TEAM.length} people · ${TEAM_SECTIONS.length} groups`}
        >
            {/* Leadership leads at a larger scale, description always visible. */}
            <div role="group" aria-labelledby="team-leadership" className="mb-14 sm:mb-20">
                <h3 id="team-leadership" className="sr-only">
                    {lead.label}
                </h3>
                <ul className="!m-0 grid !list-none gap-4 !p-0 md:grid-cols-2">
                    {lead.members.map((member, i) => (
                        <Reveal as="li" key={member.id} delay={i * 90} className="!m-0 !list-none !p-0">
                            <LeadCard member={member} />
                        </Reveal>
                    ))}
                </ul>
            </div>

            <div className="space-y-14 sm:space-y-20">
                {groups.map((section, g) => (
                    <div
                        key={section.id}
                        role="group"
                        aria-labelledby={`team-${section.id}`}
                        className="grid gap-6 border-t border-[#16181d]/10 pt-8 dark:border-white/10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12"
                    >
                        {/* Sticky group label beside its cards. A side column, so
                            the gap when the site header retracts is harmless
                            (MEMORY.md gotcha 66). */}
                        <Reveal className="lg:sticky lg:top-28 lg:self-start">
                            <span className="font-mono text-[11px] tracking-[0.14em] text-[#1c7bd9] tabular-nums">
                                {String(g + 2).padStart(2, "0")}
                            </span>
                            <h3
                                id={`team-${section.id}`}
                                className="mt-2 text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] font-bold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]"
                            >
                                {section.label}
                            </h3>
                            <p className="mt-3 text-[14.5px] leading-relaxed text-[#16181d]/60 dark:text-[#f7f5f1]/60">
                                {section.blurb}
                            </p>
                            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[#16181d]/45 tabular-nums dark:text-[#f7f5f1]/45">
                                {section.members.length} {section.members.length === 1 ? "person" : "people"}
                            </p>
                        </Reveal>

                        <ul className="!m-0 grid !list-none gap-4 !p-0 sm:grid-cols-2 xl:grid-cols-3">
                            {section.members.map((member, i) => (
                                <Reveal as="li" key={member.id} delay={(i % 3) * 80} className="!m-0 !list-none !p-0">
                                    <FlipCard
                                        member={member}
                                        code={`${String(g + 2).padStart(2, "0")}.${String(i + 1).padStart(2, "0")}`}
                                    />
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </PageSection>
    );
}

/**
 * A leadership card: the person at a larger scale with the description in view.
 * A brand-gradient hairline draws across the top on hover.
 */
function LeadCard({ member }: { member: TeamMember }) {
    return (
        <article
            id={member.id}
            className="group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-[#16181d]/10 bg-white p-7 transition-[transform,box-shadow] duration-700 ease-out-expo hover:-translate-y-1 hover:shadow-[0_28px_60px_-36px_rgba(22,24,29,.45)] dark:border-white/10 dark:bg-[#15171b] sm:p-9"
        >
            <span
                aria-hidden="true"
                style={{ background: BRAND_SURFACE }}
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
            />
            <div className="flex items-center gap-5">
                <Plate member={member} size={88} className="transition-transform duration-700 ease-out-expo group-hover:-rotate-3" />
                <div className="min-w-0">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#1c7bd9]">{roleTitle(member)}</p>
                    <h4 className="mt-2 text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                        {member.name}
                    </h4>
                </div>
            </div>
            <p className="mt-6 text-[15.5px] font-medium text-[#16181d] dark:text-[#f7f5f1]">{member.role}</p>
            <p className="mt-2 text-[15.5px] leading-relaxed text-[#16181d]/65 dark:text-[#f7f5f1]/65">
                {member.description}
            </p>
        </article>
    );
}

/** "Founder & Project Team Lead" → "Founder"; the eyebrow over a lead's name. */
function roleTitle(member: TeamMember): string {
    return member.role.split(/\s*&\s*/)[0];
}

/* ── Closing ──────────────────────────────────────────────────────────────── */

function Closing() {
    return (
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-4 sm:px-6 sm:pb-24 lg:px-8">
            <Reveal>
                <section
                    aria-labelledby="about-closing"
                    style={{ background: BRAND_SURFACE }}
                    className="rounded-3xl px-6 py-12 text-center text-white sm:px-12 sm:py-16"
                >
                    <h2
                        id="about-closing"
                        className="mx-auto max-w-2xl text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] [text-wrap:balance]"
                    >
                        Spotted a mistake, or want to help?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/90">
                        We are students too, so errors get through. Tell us about a wrong formula, figure or slide — or
                        write to us if you would like to join the team.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/contact"
                            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#0f4f8f] transition-transform duration-500 ease-out-expo hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            Contact us
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/careers"
                            className="inline-flex h-11 items-center rounded-full border border-white/50 px-6 text-[15px] font-semibold text-white transition-colors duration-300 ease-out-expo hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            Work with us
                        </Link>
                    </div>
                </section>
            </Reveal>
        </div>
    );
}
