"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    ExternalLink,
    FlaskConical,
    Library,
    Search,
    ShieldCheck,
    Stethoscope,
    Users,
} from "lucide-react";

import {
    RESOURCE_SOURCES,
    AudienceType,
} from "@/types/clinical-resources";

const AUDIENCE_LABELS: Record<AudienceType, string> = {
    patient: "Patients",
    clinician: "Clinicians",
    researcher: "Researchers",
};

const AUDIENCE_FILTERS: {
    id: AudienceType | "all";
    label: string;
    icon: typeof Users;
}[] = [
        {
            id: "all",
            label: "All resources",
            icon: Library,
        },
        {
            id: "patient",
            label: "Patients",
            icon: Users,
        },
        {
            id: "clinician",
            label: "Clinical practice",
            icon: Stethoscope,
        },
        {
            id: "researcher",
            label: "Research",
            icon: FlaskConical,
        },
    ];

export default function ClinicalResourcesPage() {
    const [audience, setAudience] =
        useState<AudienceType | "all">("all");

    const filtered = useMemo(() => {
        if (audience === "all") {
            return RESOURCE_SOURCES;
        }

        return RESOURCE_SOURCES.filter((source) =>
            source.audience.includes(audience)
        );
    }, [audience]);

    return (
        <main className="min-h-screen bg-[#F8FAF9] text-[#17211D] dark:bg-[#0B100E] dark:text-[#F2F7F4]">
            {/* =========================================================
          TOP ACCENT
      ========================================================= */}
            <div className="h-1 w-full bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#2563EB]" />

            {/* =========================================================
          HEADER
      ========================================================= */}
            <section className="relative overflow-hidden border-b border-[#17211D]/8 dark:border-white/8">
                {/* Background decoration */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#0D9488]/5 blur-3xl"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#2563EB]/5 blur-3xl"
                />

                <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:px-10">
                    {/* Breadcrumb */}
                    <div className="mb-8 flex items-center gap-2 text-xs font-medium text-[#17211D]/45 dark:text-white/45">
                        <Link
                            href="/clinical"
                            className="transition-colors hover:text-[#0D9488]"
                        >
                            Clinical
                        </Link>

                        <ChevronRight className="h-3.5 w-3.5" />

                        <span className="text-[#17211D]/70 dark:text-white/70">
                            Resources
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0D9488]/15 bg-[#0D9488]/5 px-3 py-1.5 text-xs font-semibold text-[#0D7F75] dark:border-[#14B8A6]/20 dark:bg-[#14B8A6]/10 dark:text-[#5EEAD4]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Trusted clinical sources
                        </div>

                        <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                            Clinical resources
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#17211D]/60 dark:text-white/60 sm:text-lg sm:leading-8">
                            Access trusted drug information, biomedical evidence,
                            clinical trials, and patient education resources from one
                            clinical workspace.
                        </p>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#17211D]/50 dark:text-white/45">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
                            Government & academic sources
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
                            Evidence-focused
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
                            Built for clinical workflows
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          FILTER / TOOLBAR
      ========================================================= */}
            <section className="sticky top-0 z-30 border-b border-[#17211D]/8 bg-[#F8FAF9]/90 backdrop-blur-xl dark:border-white/8 dark:bg-[#0B100E]/90">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                    {/* Filters */}
                    <div
                        className="flex flex-wrap gap-1.5"
                        role="group"
                        aria-label="Filter resources"
                    >
                        {AUDIENCE_FILTERS.map((filter) => {
                            const Icon = filter.icon;
                            const active = audience === filter.id;

                            return (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => setAudience(filter.id)}
                                    aria-pressed={active}
                                    className={`
                    inline-flex items-center gap-2
                    rounded-lg border
                    px-3.5 py-2
                    text-sm font-medium
                    transition-all
                    ${active
                                            ? "border-[#17211D] bg-[#17211D] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#17211D]"
                                            : "border-transparent text-[#17211D]/55 hover:border-[#17211D]/10 hover:bg-white hover:text-[#17211D] dark:text-white/55 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Result count */}
                    <div className="flex items-center gap-2 text-xs font-medium text-[#17211D]/45 dark:text-white/40">
                        <span className="font-mono">{filtered.length}</span>
                        {filtered.length === 1 ? "source" : "sources"} available
                    </div>
                </div>
            </section>

            {/* =========================================================
          RESOURCE CONTENT
      ========================================================= */}
            <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12 lg:px-10">
                {/* Section heading */}
                <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
                            Reference library
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                            Explore clinical sources
                        </h2>
                    </div>

                    <p className="max-w-md text-sm leading-6 text-[#17211D]/45 dark:text-white/40 sm:text-right">
                        Select a source to search its clinical information through
                        PharmaWallah Clinical.
                    </p>
                </div>

                {/* =======================================================
            RESOURCE GRID
        ======================================================= */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {filtered.map((source) => (
                        <Link
                            key={source.id}
                            href={`/clinical/resources/${source.id}`}
                            className="
                group relative flex min-h-[420px] flex-col
                overflow-hidden rounded-2xl
                border border-[#17211D]/8
                bg-white
                shadow-[0_1px_2px_rgba(0,0,0,0.03)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-[#17211D]/15
                hover:shadow-[0_16px_45px_rgba(23,33,29,0.08)]
                dark:border-white/8
                dark:bg-[#121916]
                dark:hover:border-white/15
                dark:hover:shadow-[0_16px_45px_rgba(0,0,0,0.25)]
              "
                        >
                            {/* Accent line */}
                            <div
                                className="absolute inset-x-0 top-0 h-[3px]"
                                style={{
                                    backgroundColor: source.accentColor,
                                }}
                            />

                            {/* =================================================
                  IMAGE
              ================================================= */}
                            <div
                                className="
                  relative flex h-52 shrink-0
                  items-center justify-center
                  overflow-hidden
                  border-b border-[#17211D]/6
                  dark:border-white/6
                "
                                style={{
                                    backgroundColor: `${source.accentColor}08`,
                                }}
                            >
                                {/* Decorative glow */}
                                <div
                                    aria-hidden="true"
                                    className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                                    style={{
                                        backgroundColor: `${source.accentColor}12`,
                                    }}
                                />

                                {/* Logo */}
                                <div className="relative z-10 h-32 w-[78%] sm:h-36">
                                    <Image
                                        src={source.previewImage}
                                        alt={`${source.name} logo`}
                                        fill
                                        sizes="(max-width: 768px) 90vw, 40vw"
                                        className="
                      object-contain
                      p-4
                      transition-transform
                      duration-500
                      ease-out
                      group-hover:scale-[1.035]
                    "
                                    />
                                </div>

                                {/* Source type */}
                                <div className="absolute left-5 top-5 z-20">
                                    <span
                                        className="
                      inline-flex items-center gap-1.5
                      rounded-md
                      border border-white/50
                      bg-white/90
                      px-2.5 py-1.5
                      text-[11px]
                      font-semibold
                      shadow-sm
                      backdrop-blur
                      dark:border-white/10
                      dark:bg-[#121916]/90
                    "
                                        style={{
                                            color: source.accentColor,
                                        }}
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Clinical source
                                    </span>
                                </div>
                            </div>

                            {/* =================================================
                  CARD BODY
              ================================================= */}
                            <div className="flex flex-1 flex-col p-6 sm:p-7">
                                {/* Title row */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-tight">
                                            {source.name}
                                        </h3>

                                        <p
                                            className="mt-1 text-sm font-medium"
                                            style={{
                                                color: source.accentColor,
                                            }}
                                        >
                                            {source.tagline}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div
                                        className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-full
                      border border-[#17211D]/8
                      text-[#17211D]/35
                      transition-all duration-300
                      group-hover:border-transparent
                      group-hover:text-white
                      dark:border-white/10
                      dark:text-white/35
                    "
                                        style={{
                                            backgroundColor:
                                                "transparent",
                                        }}
                                    >
                                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#17211D]/60 dark:text-white/55">
                                    {source.description}
                                </p>

                                {/* Audience */}
                                <div className="mt-5 flex flex-wrap gap-1.5">
                                    {source.audience.map((item) => (
                                        <span
                                            key={item}
                                            className="
                        rounded-md
                        bg-[#17211D]/[0.045]
                        px-2.5 py-1
                        text-[11px]
                        font-medium
                        text-[#17211D]/55
                        dark:bg-white/[0.06]
                        dark:text-white/50
                      "
                                        >
                                            {AUDIENCE_LABELS[item]}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom */}
                                <div className="mt-auto pt-6">
                                    <div className="mb-4 h-px bg-[#17211D]/6 dark:bg-white/6" />

                                    <div className="flex items-center justify-between gap-4">
                                        {/* Provider */}
                                        <p className="line-clamp-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#17211D]/35 dark:text-white/30">
                                            {source.provider}
                                        </p>

                                        {/* External source */}
                                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#17211D]/45 transition-colors group-hover:text-[#0D9488] dark:text-white/35 dark:group-hover:text-[#5EEAD4]">
                                            Official source
                                            <ExternalLink className="h-3 w-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* =======================================================
            EMPTY STATE
        ======================================================= */}
                {filtered.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#17211D]/15 py-20 text-center dark:border-white/10">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                            <Search className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 font-semibold">
                            No matching resources
                        </h3>

                        <p className="mt-2 text-sm text-[#17211D]/45 dark:text-white/40">
                            Try another audience category.
                        </p>

                        <button
                            type="button"
                            onClick={() => setAudience("all")}
                            className="mt-5 text-sm font-semibold text-[#0D9488] hover:underline"
                        >
                            View all resources
                        </button>
                    </div>
                )}
            </section>

            {/* =========================================================
          FOOTER NOTE
      ========================================================= */}
            <section className="mx-auto max-w-7xl px-6 pb-12 sm:px-8 lg:px-10">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#17211D]/8 bg-white/60 p-5 dark:border-white/8 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-[#0D9488]/10 p-2 text-[#0D9488]">
                            <ShieldCheck className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                Source transparency
                            </p>

                            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#17211D]/45 dark:text-white/40">
                                PharmaWallah Clinical surfaces information from established
                                medical and government sources. Always verify critical
                                clinical decisions against the original source.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/clinical"
                        className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0D9488] hover:underline"
                    >
                        Back to Clinical
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}