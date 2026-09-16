import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BRAND_SURFACE, Eyebrow, Reveal } from "@/components/page-kit";
import { HUB_TOOL_COUNT } from "@/app/(site)/calculation-tools/tool-index";
import { SUBJECTS } from "@/lib/courses/registry";
import { TEAM, TEAM_CAMPUS_COUNT, TEAM_ROLES, TEAM_SECTIONS } from "@/lib/team";
import RosterStage from "./RosterStage";
import AboutMotion from "./AboutMotion";
import TeamRegister from "./TeamRegister";
import "./about.css";

/**
 * The stage ground. BRAND_SURFACE's 40% scrim is tuned for a panel with body
 * text on it; an opening screen wants the room dark enough for one lit portrait,
 * so the same navy is taken to 88%/74% top-to-bottom. It is still the brand
 * gradient underneath — the product has no black ground (CLAUDE.md §6 rule 15).
 */
const STAGE_SURFACE =
    "linear-gradient(170deg, rgba(6,18,36,.88) 0%, rgba(6,18,36,.74) 100%), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)";

export const metadata: Metadata = {
    // The page had no metadata at all before this rewrite: it was a client
    // component, so it could not export any, and search results showed the
    // root layout's site-wide title for it.
    title: "About PharmaWallah — the students who build it",
    description:
        "PharmaWallah is built by pharmacy students in Karachi for the Pharm-D syllabus they are studying themselves. Meet the team, and see what they have published.",
    alternates: { canonical: "/about-us" },
};

/** Units live in the course registry, so the figure can never drift (gotcha 47). */
const UNIT_COUNT = SUBJECTS.reduce((total, subject) => total + subject.units.length, 0);

const FIGURES: { value: number; label: string; href: string }[] = [
    { value: TEAM.length, label: "students on the team", href: "#team" },
    { value: HUB_TOOL_COUNT, label: "calculators in the index", href: "/calculation-tools" },
    { value: UNIT_COUNT, label: "course units published", href: "/courses" },
];

/**
 * What the team has published. Counts are imported, never typed: the two that
 * can be derived are, and the rest are described in words rather than given a
 * number nobody can check — the `/spotting` hub's hard-coded "24+" (real: 35)
 * is exactly the fault this avoids.
 */
const PILLARS: { name: string; note: string; href: string; tag: string }[] = [
    {
        name: "Calculation tools",
        note: `${HUB_TOOL_COUNT} calculators, grouped by the subject you first meet them in.`,
        href: "/calculation-tools",
        tag: "Free",
    },
    {
        name: "Courses & MCQs",
        note: `${UNIT_COUNT} units of lesson notes, each ending in questions from its own bank.`,
        href: "/courses",
        tag: "Free",
    },
    {
        name: "Spotting labs",
        note: "Histology, pathology and powder-microscopy slides, with timed identification tests.",
        href: "/spotting",
        tag: "Timed",
    },
    {
        name: "Simulations",
        note: "Wet-lab procedures run start to finish — titration, disk diffusion, staining, UV.",
        href: "/simulations",
        tag: "Interactive",
    },
    {
        name: "Clinical desk",
        note: "Drug finder, interaction checks, ADR reporting and literature search.",
        href: "/clinical",
        tag: "Subdomain",
    },
    {
        name: "Android app",
        note: "Every calculator, offline, on a phone — and provably ad-free.",
        href: "/download",
        tag: "Offline",
    },
];

/**
 * /about-us — who builds PharmaWallah.
 *
 * A server component. The only client code on the page is <RosterStage>,
 * <TeamRegister> and <AboutMotion>; the first two render their full contents on
 * the server, and the third only adds motion, so everything here is readable
 * before any JavaScript runs (MEMORY.md gotcha 65).
 *
 * The design is the site's index language — hairline rules, mono instrument
 * labels, tabular codes — pushed to cover weight and applied to people: the team
 * is set as a REGISTER rather than a grid of avatar cards. That is deliberate,
 * and not only stylistic: there are no photographs of this team (the old page's
 * card grid fell back to three stock portraits shared between sixteen people,
 * then hid them behind initials) and no verified profiles to link to, so a card
 * grid would be a frame around nothing. Set as type, the same facts carry it.
 *
 * The hero is bespoke rather than <PageHero>: it is a cover, and it needs the
 * monogram wall beside the title at a scale the shared hero does not offer. It
 * keeps the kit's Trail, Eyebrow and type scale so it still reads as the same
 * product.
 */
export default function AboutPage() {
    return (
        <div className="pw-about">
            <AboutMotion />
            <ChapterRail />

            <Hero />
            <Figures />
            <RoleBand />
            <Origin />
            <Built />

            <section id="team" aria-labelledby="about-team" className="pw-about-chapter">
                <div className="pw-about-shell">
                    <ChapterHead
                        number="03"
                        eyebrow="The register"
                        titleId="about-team"
                        title="Everyone who builds it."
                        lead={`${TEAM.length} students across ${TEAM_CAMPUS_COUNT} campuses, and no staff. The groups below are how the work actually divides — choose one to read it on its own.`}
                        meta={`${TEAM.length} people · ${TEAM_SECTIONS.length} groups`}
                    />
                    <TeamRegister />
                </div>
            </section>

            <Closing />
        </div>
    );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

/**
 * The opening screen, played as a roster select.
 *
 * The page's subject is who builds PharmaWallah, so it opens on the people: a
 * deep brand-navy stage, the title on the left, and on the right one member at
 * a time at portrait scale — advancing on its own until you take it over. It is
 * an introduction, not a page header, and it is the one screen on this site
 * that is meant to be watched before it is read.
 *
 * The ground is the brand gradient under a heavy navy scrim, NOT black
 * (CLAUDE.md §6 rule 15). The atmosphere is four static layers — grain,
 * scanlines, a vignette and a brand glow — all absolutely positioned, painted
 * once, and never repainted while scrolling; there is no backdrop-filter
 * anywhere on this page (MEMORY.md gotcha 51).
 */
function Hero() {
    return (
        <header className="pw-stage" style={{ background: STAGE_SURFACE }}>
            <div className="pw-stage__grain" aria-hidden="true" />
            <div className="pw-stage__scan" aria-hidden="true" />
            <div className="pw-stage__vignette" aria-hidden="true" />
            <div className="pw-stage__beam" aria-hidden="true" />

            <div className="pw-stage__bar pw-stage__bar--top" aria-hidden="true">
                <span>PharmaWallah</span>
                <span>About</span>
                <span>Karachi, Pakistan</span>
            </div>

            {/* The lede is server-rendered and handed to the client island, so
                the title and copy stay out of the client bundle. */}
            <RosterStage lede={<Lede />} />

            <div className="pw-stage__bar pw-stage__bar--bottom" aria-hidden="true">
                <span>{TEAM.length} students</span>
                <span>{TEAM_CAMPUS_COUNT} campuses</span>
                <span>No staff</span>
            </div>
        </header>
    );
}

function Lede() {
    return (
        <div className="pw-stage__lede">
            <Eyebrow dot tone="inverse">
                The people who build it
            </Eyebrow>

            <h1 className="pw-stage__title">
                <span className="pw-stage__title-line">Built by the class,</span>
                <span className="pw-stage__title-line pw-stage__title-accent">for the class.</span>
            </h1>

            <p className="pw-stage__lead">
                PharmaWallah is made by {TEAM.length} pharmacy students sitting the same papers as the people who use
                it. Every calculator, unit and lab here started as something one of us needed the night before an exam.
            </p>

            <div className="pw-stage__actions">
                <Link href="#team" className="pw-about-cta pw-about-cta--onbrand">
                    Read the register
                </Link>
                <Link href="/contact" className="pw-about-cta pw-about-cta--onbrand-ghost">
                    Write to us
                </Link>
            </div>
        </div>
    );
}

/** The figures, on the board directly beneath the stage. */
function Figures() {
    return (
        <div className="pw-about-shell">
            <dl className="pw-about-figs">
                {FIGURES.map((figure) => (
                    <div key={figure.label} className="pw-about-fig">
                        <Link href={figure.href} prefetch={false} className="pw-about-fig__link">
                            <dt className="pw-about-fig__value">
                                <span className="pw-about-fig__count">{figure.value}</span>
                                <ArrowUpRight className="pw-about-fig__arrow" aria-hidden="true" />
                            </dt>
                            <dd className="pw-about-fig__label">{figure.label}</dd>
                        </Link>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/**
 * A conveyor of every job title on the roster, derived from the data.
 *
 * Decorative, so it is aria-hidden and the register below states the same roles
 * in a readable list. Linear timing is correct here and only here: a conveyor
 * that eased would visibly stutter at the seam. It pauses on hover and stops
 * entirely under reduced motion.
 */
function RoleBand() {
    const strip = [...TEAM_ROLES, ...TEAM_ROLES];
    return (
        <div className="pw-about-band" aria-hidden="true">
            <div className="pw-about-band__track">
                {strip.map((role, i) => (
                    <span key={`${role}-${i}`} className="pw-about-band__item">
                        {role}
                        <span className="pw-about-band__dot" />
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ── Chapters ─────────────────────────────────────────────────────────────── */

function ChapterHead({
    number,
    eyebrow,
    title,
    titleId,
    lead,
    meta,
}: {
    number: string;
    eyebrow: string;
    title: string;
    titleId: string;
    lead?: string;
    meta?: string;
}) {
    return (
        <div className="pw-about-chapter__head">
            {/* A filled ghost numeral, never -webkit-text-stroke: Outfit's contour
                overlaps show through an outlined glyph (MEMORY.md gotcha 43). */}
            <span className="pw-about-chapter__num" aria-hidden="true">
                {number}
            </span>
            <div className="pw-about-chapter__titles">
                <div className="pw-about-chapter__rule">
                    <Eyebrow>{eyebrow}</Eyebrow>
                    {meta && <span className="pw-about-chapter__meta">{meta}</span>}
                </div>
                <h2 id={titleId} className="pw-about-chapter__title">
                    {title}
                </h2>
                {lead && <p className="pw-about-chapter__lead">{lead}</p>}
            </div>
        </div>
    );
}

/**
 * The origin, as a statement rather than an "Our Story" card. The quote is the
 * only thing on the page set at hero scale below the fold, and the fact that
 * follows it sits on the brand surface — the one place the gradient appears in
 * the body of the page, so it still reads as an event.
 */
function Origin() {
    return (
        <section id="about-origin-chapter" aria-labelledby="about-origin" className="pw-about-chapter">
            <div className="pw-about-shell">
                <ChapterHead
                    number="01"
                    eyebrow="Origin"
                    title="Why any of this exists."
                    titleId="about-origin"
                />

                <div className="pw-about-origin">
                    <Reveal>
                        <p className="pw-about-quote">
                            <Words text="We were never short of material. We were short of" />{" "}
                            <em className="pw-about-accent">
                                <Words text="one place to put it." />
                            </em>
                        </p>
                    </Reveal>

                    <Reveal delay={80} className="pw-about-origin__body">
                        <p className="pw-about-prose">
                            The Pharm-D curriculum is not the problem — the scattering is. The formula lives on a
                            photocopied handout, the worked example in a senior&rsquo;s notebook, and the slide you are
                            actually asked to identify nowhere at all. We lost more evenings to finding things than to
                            learning them.
                        </p>
                        <p className="pw-about-prose">
                            So we started collecting, first for ourselves and then for our year. What began as a shared
                            folder now runs to <strong>{HUB_TOOL_COUNT} calculators</strong>, a course library whose
                            units end in questions, spotting labs, wet-lab simulations and a clinical desk.
                        </p>

                        <div className="pw-about-card" style={{ background: BRAND_SURFACE }}>
                            <Eyebrow tone="inverse">What it costs you</Eyebrow>
                            <p className="pw-about-card__line">
                                Nothing. No account, no paywall, no trial — and every calculator works offline in the
                                Android app.
                            </p>
                            <p className="pw-about-card__foot">
                                Written, checked and maintained by the {TEAM.length} people in the register below.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/** What the team has built, as a ruled index of the six pillars. */
function Built() {
    return (
        <section id="about-built-chapter" aria-labelledby="about-built" className="pw-about-chapter">
            <div className="pw-about-shell">
                <ChapterHead
                    number="02"
                    eyebrow="What we make"
                    title="Six pillars, one syllabus."
                    titleId="about-built"
                    lead="Everything below is free, and none of it needs an account."
                    meta={`${PILLARS.length} sections`}
                />

                <ol className="pw-about-index">
                    {PILLARS.map((pillar, i) => (
                        <li key={pillar.href}>
                            {/* prefetch={false}: these are dynamic routes, and the root
                                loading.tsx already answers a click instantly. */}
                            <Link href={pillar.href} prefetch={false} className="pw-about-entry">
                                <span className="pw-about-code" aria-hidden="true">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="pw-about-entry__name">{pillar.name}</span>
                                <span className="pw-about-entry__note">{pillar.note}</span>
                                <span className="pw-about-entry__tag" aria-hidden="true">
                                    {pillar.tag}
                                </span>
                                <span className="pw-about-arrow" aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/**
 * The closing band — the same ground as the opening stage, so the page is
 * bookended: it opens on the roster screen, runs bright through the middle, and
 * closes back in the dark. It is the brand gradient under the stage's navy
 * scrim, never a black ground (CLAUDE.md §6 rule 15).
 *
 * It deliberately does NOT use BRAND_SURFACE: the site footer immediately below
 * is already a brand gradient at that weight, and the two ran together into one
 * undifferentiated wash with the sign-off lost inside it.
 *
 * It asks for corrections rather than sign-ups, because that is the thing this
 * team can actually act on.
 */
function Closing() {
    return (
        <section id="about-closing-chapter" aria-labelledby="about-closing" className="pw-about-closing" style={{ background: STAGE_SURFACE }}>
            <div className="pw-about-closing__grain" aria-hidden="true" />
            <div className="pw-about-closing__grid" aria-hidden="true" />
            <span className="pw-about-closing__ghost" aria-hidden="true">
                PharmaWallah
            </span>

            <div className="pw-about-shell pw-about-closing__inner">
                <Eyebrow tone="inverse">Tell us when we are wrong</Eyebrow>
                <h2 id="about-closing" className="pw-about-closing__title">
                    We are students too, so mistakes get through.
                </h2>
                <p className="pw-about-closing__lead">
                    If a formula, a figure or a slide looks wrong to you, it may well be. Send it over — we will check
                    it, fix it, and say what changed.
                </p>
                <div className="pw-about-closing__actions">
                    <Link href="/contact" className="pw-about-cta pw-about-cta--onbrand">
                        Report an error
                    </Link>
                    <Link href="/careers" className="pw-about-cta pw-about-cta--onbrand-ghost">
                        Work with us
                    </Link>
                </div>
            </div>
        </section>
    );
}

/**
 * Splits a sentence into per-word spans so the scroll choreography can bring it
 * up a word at a time. The words are plain text in the server HTML — selectable,
 * searchable, and fully legible if the motion chunk never arrives.
 */
function Words({ text }: { text: string }) {
    const words = text.split(" ");
    return (
        <>
            {words.map((word, i) => (
                <span key={`${word}-${i}`} className="pw-about-word">
                    {word}
                    {i < words.length - 1 ? " " : ""}
                </span>
            ))}
        </>
    );
}

/**
 * The page's HUD: a fixed hairline down the left margin with one tick per
 * chapter. The fill tracks scroll and the ticks light as their chapter comes
 * into view — both driven by ScrollTrigger in _useAboutMotion.ts, so without
 * JavaScript the rail simply never appears (it is decoration; every chapter is
 * reachable by scrolling and by the in-page links).
 */
function ChapterRail() {
    const chapters = [
        { label: "Origin", target: "#about-origin-chapter" },
        { label: "What we make", target: "#about-built-chapter" },
        { label: "The register", target: "#team" },
        { label: "Contact", target: "#about-closing-chapter" },
    ];
    return (
        <div className="pw-about-rail" aria-hidden="true">
            <span className="pw-about-rail__line">
                <span className="pw-about-rail__fill" />
            </span>
            <ol className="pw-about-rail__ticks">
                {chapters.map((chapter) => (
                    <li key={chapter.target}>
                        <span className="pw-about-rail__tick" data-target={chapter.target}>
                            <span className="pw-about-rail__label">{chapter.label}</span>
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
