"use client";

/**
 * PharmaWallah Clinical — About Us
 * src/app/clinical/about/page.tsx
 *
 * Self-contained page assembled from internal section components
 * defined in this file. Split into separate files under
 * src/components/clinical/about/* if you want per the suggested
 * structure (ClinicalAboutHero, MissionCards, TeamSection, etc.) —
 * the boundaries below map 1:1 to that structure already.
 *
 * Dependencies: framer-motion, lucide-react, tailwindcss
 */

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import {
    motion,
    useScroll,
    useTransform,
    type Variants,
} from "framer-motion";
import {
    Pill,
    FlaskConical,
    BookOpen,
    FileSearch,
    GraduationCap,
    ShieldCheck,
    Microscope,
    Database,
    Activity,
    ArrowRight,
    ArrowDown,
    Linkedin,
    Sparkles,
    Compass,
    Layers,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — PharmaWallah Clinical color system                */
/*  Clinical Blue + Teal identity (see design.md)                     */
/* ------------------------------------------------------------------ */

const c = {
    primary: "#2563EB", // Clinical Blue
    primaryDark: "#1E3A8A", // Deep Blue
    secondary: "#0D9488", // Clinical Teal
    accent: "#06B6D4", // Cyan
    bg: "#F8FAFC", // Clinical White
    bgAlt: "#EFF6FF", // Alternate section background
    surface: "#FFFFFF",
    textPrimary: "#0F172A", // Navy
    textSecondary: "#475569", // Slate
    border: "#E2E8F0", // Light Slate
    borderHover: "#93C5FD",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#DC2626",
} as const;

const heroImageUrl =
    "https://res.cloudinary.com/osevupfr/image/upload/Pharmacist_holding_digital_tablet_2K_202608261407-Photoroom.png";
/* ------------------------------------------------------------------ */
/*  Shared design tokens (Tailwind utility clusters used throughout)  */
/* ------------------------------------------------------------------ */

const container = "mx-auto w-full max-w-6xl px-6 md:px-10";
const eyebrow =
    "font-mono text-[11px] tracking-[0.2em] uppercase text-[#0D9488]/80";
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
    }),
};

/* ------------------------------------------------------------------ */
/*  Signature motif: a single continuous clinical waveform / molecule */
/*  path, reused (in different crops) across Hero, Ecosystem & Vision */
/* ------------------------------------------------------------------ */

function SignatureThread({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 1200 200"
            fill="none"
            className={className}
            preserveAspectRatio="none"
        >
            <motion.path
                d="M0 100 L120 100 L150 40 L185 160 L215 60 L245 140 L275 100 L420 100 
           C 460 100 460 40 500 40 C 540 40 540 100 580 100 L760 100
           L790 30 L825 170 L855 50 L885 150 L915 100 L1200 100"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
            />
        </svg>
    );
}

function MolecularField({
    className = "",
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    const nodes = [
        [60, 40], [140, 90], [40, 140], [180, 30], [210, 120],
        [100, 170], [260, 70], [300, 150], [20, 60],
    ];
    const edges = [
        [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [1, 5], [4, 6], [6, 7], [0, 8],
    ];
    return (
        <svg
            viewBox="0 0 320 200"
            className={className}
            style={style}
            fill="none"
        >
            {edges.map(([a, b], i) => (
                <line
                    key={i}
                    x1={nodes[a][0]}
                    y1={nodes[a][1]}
                    x2={nodes[b][0]}
                    y2={nodes[b][1]}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                    strokeWidth={1}
                />
            ))}
            {nodes.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.5 : 2} fill="currentColor" fillOpacity={0.5} />
            ))}
        </svg>
    );
}

function ClinicalGrid({
    className = "",
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <svg className={className} style={style} width="100%" height="100%">
            <defs>
                <pattern id="clinical-grid" width="42" height="42" patternUnits="userSpaceOnUse">
                    <path d="M42 0 H0 V42" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#clinical-grid)" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  1. ClinicalAboutHero                                              */
/* ------------------------------------------------------------------ */

function ClinicalAboutHero() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={ref}
            className="relative overflow-hidden pt-28 pb-24 md:pt-32 md:pb-32"
            style={{ backgroundColor: c.bg }}
        >
            <ClinicalGrid className="absolute inset-0" style={{ color: c.primaryDark }} />
            <div
                className="pointer-events-none absolute -right-24 top-10 h-[460px] w-[460px] rounded-full blur-3xl"
                style={{
                    background:
                        "radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(6,182,212,0.06) 60%, transparent 100%)",
                }}
            />
            <div
                className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full blur-3xl"
                style={{ backgroundColor: "rgba(30,58,138,0.05)" }}
            />

            <motion.div style={{ y, opacity }} className={`${container} relative`}>
                <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
                    {/* Left: copy */}
                    <div>
                        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center gap-3">
                            <span className="h-px w-8" style={{ backgroundColor: `${c.secondary}80` }} />
                            <span className={eyebrow}>PharmaWallah Clinical</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={1}
                            className="mt-6 max-w-xl font-serif text-5xl leading-[1.08] tracking-tight md:text-6xl lg:text-[4.2rem]"
                            style={{ color: c.textPrimary }}
                        >
                            Built for Better
                            <br />
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: `linear-gradient(90deg, ${c.primaryDark}, ${c.primary} 55%, ${c.accent})`,
                                }}
                            >
                                Clinical Learning.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={2}
                            className="mt-7 max-w-lg text-lg leading-relaxed"
                            style={{ color: c.textSecondary }}
                        >
                            PharmaWallah Clinical brings trusted clinical resources, drug
                            information, research tools, and evidence-based learning into
                            one modern platform for the next generation of pharmacy and
                            healthcare professionals.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={3}
                            className="mt-10 flex flex-wrap items-center gap-4"
                        >
                            <a
                                href="#features"
                                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-[0_1px_2px_rgba(37,99,235,0.15)] transition-colors"
                                style={{ backgroundColor: c.primary }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.primary)}
                            >
                                Explore Clinical
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </a>
                            <a
                                href="#mission"
                                className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-medium transition-colors"
                                style={{ borderColor: "#CBD5E1", color: c.primaryDark }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = c.borderHover)}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
                            >
                                Our Mission
                            </a>
                        </motion.div>
                    </div>

                    {/* Right: pharmacist image — desktop/tablet only */}
                    <motion.div
                        initial={{ opacity: 0, x: 24, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div
                            className="absolute -inset-6 -z-10 rounded-[2.5rem] blur-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${c.primaryDark}14, ${c.primary}10, ${c.accent}14)`,
                            }}
                        />
                        <MolecularField
                            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40"
                            style={{ color: `${c.secondary}55` }}
                        />
                        <div className="relative mx-auto max-w-md">
                            <img
                                src={heroImageUrl}
                                alt="Pharmacist reviewing clinical data on a digital tablet"
                                className="relative z-10 h-auto w-full select-none"
                                draggable={false}
                            />
                            {/* floating data chip */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                                className="absolute left-2 top-8 z-20 flex items-center gap-2 rounded-xl border bg-white/90 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                                style={{ borderColor: c.border }}
                            >
                                <span
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${c.secondary}14`, color: c.secondary }}
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: c.textSecondary }}>
                                    Evidence-Based
                                </span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.6 }}
                                className="absolute -right-2 bottom-10 z-20 flex items-center gap-2 rounded-xl border bg-white/90 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                                style={{ borderColor: c.border }}
                            >
                                <span
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${c.primary}14`, color: c.primary }}
                                >
                                    <Activity className="h-3.5 w-3.5" strokeWidth={2} />
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: c.textSecondary }}>
                                    Clinical Data
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={4}
                    className="relative mt-16 h-[100px] md:mt-20"
                    style={{ color: `${c.secondary}90` }}
                >
                    <SignatureThread className="h-full w-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  2. ClinicalAboutSection ("What is PharmaWallah Clinical?")        */
/* ------------------------------------------------------------------ */

const ecosystemNodes = [
    { label: "Drug Information", icon: Pill },
    { label: "Clinical Evidence", icon: ShieldCheck },
    { label: "Research", icon: FlaskConical },
    { label: "Learning", icon: BookOpen },
    { label: "Better Practice", icon: GraduationCap },
];

function EcosystemDiagram() {
    return (
        <div className="relative rounded-2xl border border-[#0B2340]/10 bg-white p-8 md:p-10">
            <MolecularField className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-teal-700/40" />
            <p className={eyebrow}>The Clinical Ecosystem</p>
            <div className="mt-8 flex flex-col gap-0">
                {ecosystemNodes.map((node, i) => {
                    const Icon = node.icon;
                    const isLast = i === ecosystemNodes.length - 1;
                    return (
                        <div key={node.label}>
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="flex items-center gap-4"
                            >
                                <motion.span
                                    whileHover={{ scale: 1.06 }}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#0B2340]/10 bg-[#FAFAF8] text-[#0E8388]"
                                >
                                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                                </motion.span>
                                <span className="font-medium text-[#0B2340]">{node.label}</span>
                            </motion.div>
                            {!isLast && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
                                    className="ml-[22px] h-6 w-px origin-top bg-gradient-to-b from-teal-700/40 to-[#0B2340]/10"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ClinicalAboutSection() {
    const areas = [
        "Drug information",
        "Clinical resources",
        "Evidence-based learning",
        "Medical literature",
        "Clinical trials",
        "Patient-oriented resources",
        "Pharmacotherapy learning",
        "Clinical decision support concepts",
    ];

    return (
        <section id="mission" className="bg-white py-24 md:py-32">
            <div className={container}>
                <div className="grid gap-14 md:grid-cols-2 md:gap-16">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <p className={eyebrow}>About the Platform</p>
                        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                            What is PharmaWallah Clinical?
                        </h2>
                        <p className="mt-6 text-base leading-relaxed text-slate-600">
                            PharmaWallah Clinical is a dedicated clinical learning and
                            information platform built to bridge the gap between
                            pharmaceutical knowledge and real-world clinical practice. We
                            focus on making reliable clinical information easier to
                            discover, understand, and use — organized around how students
                            and healthcare professionals actually study and work.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            The platform is not a substitute for clinical judgment, medical
                            diagnosis, or the guidance of a licensed healthcare
                            professional. It exists to support learning, not replace it.
                        </p>

                        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
                            {areas.map((area) => (
                                <li key={area} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0E8388]" />
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        custom={1}
                    >
                        <EcosystemDiagram />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  3. MissionCards                                                   */
/* ------------------------------------------------------------------ */

function MissionCards() {
    const cards = [
        {
            icon: ShieldCheck,
            title: "Evidence",
            text: "Promote learning based on reliable and credible clinical information.",
        },
        {
            icon: Compass,
            title: "Accessibility",
            text: "Make valuable clinical resources easier to discover and access.",
        },
        {
            icon: Sparkles,
            title: "Innovation",
            text: "Use modern technology to improve the way pharmacy and healthcare knowledge is explored.",
        },
    ];

    return (
        <section className="relative overflow-hidden bg-[#0B2340] py-24 md:py-32">
            <ClinicalGrid className="absolute inset-0 text-white" />
            <div className={`${container} relative`}>
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-300/80">Our Mission</p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight text-white md:text-4xl">
                        To make trustworthy clinical and pharmaceutical knowledge more
                        accessible, understandable, and useful for students and
                        healthcare professionals.
                    </h2>
                </motion.div>

                <div className="mt-14 grid gap-5 md:grid-cols-3">
                    {cards.map(({ icon: Icon, title, text }, i) => (
                        <motion.div
                            key={title}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            custom={i}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors hover:border-teal-300/30"
                        >
                            <Icon className="h-6 w-6 text-teal-300" strokeWidth={1.75} />
                            <h3 className="mt-5 font-serif text-xl text-white">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  4. ClinicalFeatures ("More Than a Resource Library")              */
/* ------------------------------------------------------------------ */

function ClinicalFeatures() {
    const features = [
        { icon: Pill, title: "Drug Information", text: "Reliable and structured medication information." },
        { icon: BookOpen, title: "Clinical Resources", text: "Curated resources for clinical pharmacy learning." },
        { icon: FileSearch, title: "Research", text: "Access to literature and research-oriented resources." },
        { icon: FlaskConical, title: "Clinical Trials", text: "Explore ongoing and completed clinical research." },
        { icon: Layers, title: "Learning Tools", text: "Tools designed to make clinical concepts easier to understand." },
        { icon: ShieldCheck, title: "Evidence-Based Practice", text: "Encourage informed learning through credible sources." },
    ];

    return (
        <section id="features" className="bg-[#FAFAF8] py-24 md:py-32">
            <div className={container}>
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <p className={eyebrow}>What We're Building</p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                        More Than a Resource Library
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-slate-600">
                        PharmaWallah Clinical is being developed as an ecosystem for
                        clinical learning — connecting drug information, research, and
                        practical tools in one coherent experience.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, text }, i) => (
                        <motion.div
                            key={title}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            custom={i % 3}
                            whileHover={{ y: -4, borderColor: "rgba(14,131,136,0.35)" }}
                            className="rounded-2xl border border-[#0B2340]/10 bg-white p-7 shadow-[0_1px_2px_rgba(11,35,64,0.04)] transition-colors"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700/[0.08] text-[#0E8388]">
                                <Icon className="h-5 w-5" strokeWidth={1.75} />
                            </span>
                            <h3 className="mt-5 font-medium text-[#0B2340]">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  5. TeamSection + TeamMemberCard                                   */
/* ------------------------------------------------------------------ */

function initials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase();
}

function TeamMemberCard({
    name,
    role,
    description,
    size = "regular",
    index = 0,
}: {
    name: string;
    role: string;
    description: string;
    size?: "featured" | "regular";
    index?: number;
}) {
    const isFeatured = size === "featured";

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={index}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl border border-[#0B2340]/10 bg-white transition-shadow hover:shadow-[0_8px_30px_rgba(11,35,64,0.06)] ${isFeatured ? "p-9" : "p-6"
                }`}
        >
            <MolecularField
                className={`pointer-events-none absolute -right-8 -bottom-8 text-teal-700/[0.35] ${isFeatured ? "h-40 w-40" : "h-28 w-28"
                    }`}
            />
            <div className="relative flex items-start gap-4">
                <div
                    className={`flex shrink-0 items-center justify-center rounded-full bg-[#0B2340] font-serif text-white ${isFeatured ? "h-16 w-16 text-xl" : "h-12 w-12 text-sm"
                        }`}
                >
                    {initials(name)}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                    <h3 className={`font-medium text-[#0B2340] ${isFeatured ? "text-xl" : "text-base"}`}>
                        {name}
                    </h3>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[#0E8388]">
                        {role}
                    </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0B2340]/10 text-[#0B2340]/30">
                    <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
            </div>
            <p
                className={`relative mt-5 leading-relaxed text-slate-600 ${isFeatured ? "text-[15px]" : "text-sm"
                    }`}
            >
                {description}
            </p>
        </motion.div>
    );
}

function TeamSection() {
    const clinicalTeam = [
        { name: "Sumaiya Saeed", role: "Team Member", description: "Contributing to the clinical and project team behind PharmaWallah Clinical." },
        { name: "Muhammad Salman", role: "Team Member", description: "Contributing to the clinical and project team behind PharmaWallah Clinical." },
        { name: "Rumaisa Farooqui", role: "Team Member", description: "Contributing to the clinical and project team behind PharmaWallah Clinical." },
        { name: "Saman Hamza", role: "Team Member", description: "Contributing to the clinical and project team behind PharmaWallah Clinical." },
    ];

    return (
        <section className="bg-white py-24 md:py-32">
            <div className={container}>
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <p className={eyebrow}>Our Team</p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                        Meet the Team Behind PharmaWallah Clinical
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-slate-600">
                        A student-led initiative combining pharmacy knowledge, clinical
                        interest, technology, and innovation.
                    </p>
                </motion.div>

                {/* Leadership: Team Lead + Technology Lead */}
                <div className="mt-14 grid gap-5 md:grid-cols-2">
                    <TeamMemberCard
                        size="featured"
                        index={0}
                        name="Kashaf Lateef"
                        role="Project Team Lead"
                        description="Leading the PharmaWallah Clinical team, coordinating the project vision, team collaboration, clinical direction, and development of the platform."
                    />
                    <TeamMemberCard
                        size="featured"
                        index={1}
                        name="Shayan Hussain"
                        role="Founder & Developer · Technology Lead"
                        description="Designed and built the PharmaWallah Clinical platform — responsible for the technical architecture, frontend development, backend integration, UI/UX implementation, and overall digital infrastructure."
                    />
                </div>

                {/* Clinical & project team */}
                <div className="mt-8">
                    <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Clinical & Project Team
                    </p>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {clinicalTeam.map((member, i) => (
                            <TeamMemberCard key={member.name} index={i} {...member} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  6. Why Clinical? (Fragmented → Organized)                         */
/* ------------------------------------------------------------------ */

function WhyClinical() {
    return (
        <section className="bg-[#FAFAF8] py-24 md:py-32">
            <div className={container}>
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mx-auto max-w-xl text-center"
                >
                    <p className={eyebrow}>Why Clinical?</p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                        Why Clinical?
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-slate-600">
                        Clinical and pharmaceutical information is often distributed
                        across multiple resources, making it difficult for students and
                        early healthcare professionals to efficiently find, understand,
                        and organize relevant information.
                    </p>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={1}
                    className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3"
                >
                    <div className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-4 text-center text-sm text-slate-500">
                        Fragmented Information
                    </div>
                    <ArrowDown className="h-5 w-5 text-slate-300" />
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0.7 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="w-full rounded-xl border border-[#0E8388]/30 bg-[#0E8388]/[0.06] px-6 py-4 text-center text-sm font-medium text-[#0B2340]"
                    >
                        PharmaWallah Clinical
                    </motion.div>
                    <ArrowDown className="h-5 w-5 text-slate-300" />
                    <div className="w-full rounded-xl border border-[#0B2340]/15 bg-[#0B2340] px-6 py-4 text-center text-sm font-medium text-white">
                        Organized Clinical Knowledge
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  7. ClinicalApproach (timeline)                                    */
/* ------------------------------------------------------------------ */

function ClinicalApproach() {
    const steps = [
        { n: "01", title: "Discover", text: "Find relevant clinical and pharmaceutical resources." },
        { n: "02", title: "Understand", text: "Explore information in a clear and student-friendly format." },
        { n: "03", title: "Connect", text: "Connect drug information, research, clinical evidence, and learning." },
        { n: "04", title: "Apply", text: "Use knowledge to strengthen clinical learning and professional development." },
    ];

    return (
        <section className="bg-white py-24 md:py-32">
            <div className={container}>
                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                    <p className={eyebrow}>Our Approach</p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                        A clear, four-step path
                    </h2>
                </motion.div>

                {/* Desktop horizontal timeline */}
                <div className="mt-16 hidden md:block">
                    <div className="relative grid grid-cols-4 gap-6">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute left-0 right-0 top-6 h-px origin-left bg-[#0B2340]/10"
                        />
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.n}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                custom={i}
                                className="relative"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0B2340]/15 bg-[#FAFAF8] font-mono text-xs text-[#0E8388]">
                                    {step.n}
                                </div>
                                <h3 className="mt-5 font-serif text-lg text-[#0B2340]">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mobile vertical timeline */}
                <div className="mt-12 space-y-8 md:hidden">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.n}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            custom={i}
                            className="flex gap-4"
                        >
                            <div className="flex flex-col items-center">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0B2340]/15 bg-[#FAFAF8] font-mono text-xs text-[#0E8388]">
                                    {step.n}
                                </div>
                                {i < steps.length - 1 && <div className="mt-2 w-px flex-1 bg-[#0B2340]/10" />}
                            </div>
                            <div className="pb-2">
                                <h3 className="font-serif text-lg text-[#0B2340]">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  8. TechnologySection                                              */
/* ------------------------------------------------------------------ */

function TechnologySection() {
    const items = [
        { name: "DailyMed", note: "Medication label data" },
        { name: "PubMed", note: "Biomedical literature" },
        { name: "ClinicalTrials.gov", note: "Trial registries" },
        { name: "MedlinePlus", note: "Consumer health info" },
        { name: "RxNorm / RxNav", note: "Drug nomenclature" },
        { name: "Supabase", note: "Platform infrastructure" },
        { name: "Next.js", note: "Application framework" },
    ];

    return (
        <section className="border-y border-[#0B2340]/8 bg-[#FAFAF8] py-20 md:py-24">
            <div className={container}>
                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Database className="h-4 w-4" strokeWidth={1.75} />
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Powered by Modern Technology</p>
                    </div>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
                        PharmaWallah Clinical integrates modern web technologies and
                        external evidence-oriented resources where appropriate. Mention
                        of any external source does not imply endorsement by that
                        organization.
                    </p>
                </motion.div>

                <div className="mt-8 flex flex-wrap gap-3">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.name}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            custom={i % 4}
                            className="rounded-full border border-[#0B2340]/10 bg-white px-4 py-2 text-xs text-slate-500"
                        >
                            <span className="font-medium text-[#0B2340]/80">{item.name}</span>
                            <span className="mx-1.5 text-slate-300">·</span>
                            {item.note}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  9. VisionSection                                                  */
/* ------------------------------------------------------------------ */

function VisionSection() {
    return (
        <section className="relative overflow-hidden bg-[#081A2E] py-28 md:py-36">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B2340] via-[#081A2E] to-black" />
            <MolecularField className="pointer-events-none absolute -left-10 top-0 h-72 w-72 text-teal-400/40" />
            <MolecularField className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 text-teal-400/30" />

            {/* animated particles */}
            {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                    key={i}
                    className="pointer-events-none absolute h-1 w-1 rounded-full bg-teal-300/50"
                    style={{
                        left: `${(i * 37) % 100}%`,
                        top: `${(i * 53) % 100}%`,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -14, 0] }}
                    transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
            ))}

            <div className={`${container} relative text-center`}>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-300/80"
                >
                    Our Vision
                </motion.p>
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={1}
                    className="mx-auto mt-5 max-w-2xl font-serif text-3xl leading-snug text-white md:text-4xl"
                >
                    We envision a future where pharmacy students and healthcare
                    professionals can access meaningful clinical knowledge without
                    navigating disconnected resources.
                </motion.h2>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={2}
                    className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300"
                >
                    PharmaWallah Clinical is being built to make that vision possible —
                    one resource, one tool, and one learner at a time.
                </motion.p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  10. ClinicalAboutCTA                                              */
/* ------------------------------------------------------------------ */

function ClinicalAboutCTA() {
    return (
        <section className="bg-white py-24 md:py-28">
            <div className={container}>
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="rounded-3xl border border-[#0B2340]/10 bg-[#FAFAF8] px-8 py-16 text-center md:px-16 md:py-20"
                >
                    <Activity className="mx-auto h-6 w-6 text-[#0E8388]" strokeWidth={1.75} />
                    <h2 className="mx-auto mt-6 max-w-xl font-serif text-3xl leading-tight text-[#0B2340] md:text-4xl">
                        Explore PharmaWallah Clinical
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
                        Discover clinical resources, research tools, and evidence-based
                        learning designed for the modern pharmacy learner.
                    </p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href="/clinical"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0B2340] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#0E8388] sm:w-auto"
                        >
                            Explore Clinical
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <a
                            href="https://pharmawallah.com"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0B2340]/15 bg-white px-7 py-3.5 text-sm font-medium text-[#0B2340] transition-colors hover:border-[#0B2340]/30 sm:w-auto"
                        >
                            Visit PharmaWallah
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page assembly                                                     */
/* ------------------------------------------------------------------ */

export default function ClinicalAboutPage() {
    return (
        <main className="min-h-screen bg-white font-sans antialiased">
            <ClinicalAboutHero />
            <ClinicalAboutSection />
            <MissionCards />
            <ClinicalFeatures />
            <TeamSection />
            <WhyClinical />
            <ClinicalApproach />
            <TechnologySection />
            <VisionSection />
            <ClinicalAboutCTA />
        </main>
    );
}