// src/components/Clinical/DailyMedResourceView.tsx
"use client";

import Link from "next/link";
import { ChevronRight, FileText, ExternalLink } from "lucide-react";
import { RESOURCE_SOURCES } from "@/types/clinical-resources";
import DailyMedAutocompleteSearch from "@/components/Clinical/DailyMedAutocompleteSearch";

export default function DailyMedResourceView() {
    const source = RESOURCE_SOURCES.find((s) => s.id === "dailymed")!;

    return (
        <main className="min-h-screen bg-[#F8FAF9] text-[#17211D] dark:bg-[#0B100E] dark:text-[#F2F7F4]">
            <div className="h-1 w-full" style={{ backgroundColor: source.accentColor }} />

            <section className="relative overflow-hidden border-b border-[#17211D]/8 dark:border-white/8">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
                    style={{ backgroundColor: `${source.accentColor}0D` }}
                />

                <div className="relative mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14 lg:px-10">
                    <div className="mb-7 flex items-center gap-2 text-xs font-medium text-[#17211D]/45 dark:text-white/45">
                        <Link href="/clinical" className="transition-colors hover:text-[#0D9488]">
                            Clinical
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link
                            href="/clinical/resources"
                            className="transition-colors hover:text-[#0D9488]"
                        >
                            Resources
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-[#17211D]/70 dark:text-white/70">{source.name}</span>
                    </div>

                    <div
                        className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
                        style={{
                            borderColor: `${source.accentColor}26`,
                            backgroundColor: `${source.accentColor}0D`,
                            color: source.accentColor,
                        }}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        {source.tagline}
                    </div>

                    <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                        {source.name}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#17211D]/60 dark:text-white/55 sm:text-base sm:leading-7">
                        {source.description}
                    </p>

                    <p className="mt-3 max-w-2xl text-xs leading-5 text-[#17211D]/40 dark:text-white/35">
                        Start typing to see real drug names as you type, then select one to view
                        its official label.
                    </p>

                    <a
                        href={source.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#17211D]/45 transition-colors hover:text-[#0D9488] dark:text-white/40"
                    >
                        {source.provider}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8 lg:px-10">
                <DailyMedAutocompleteSearch />
            </section>
        </main>
    );
}