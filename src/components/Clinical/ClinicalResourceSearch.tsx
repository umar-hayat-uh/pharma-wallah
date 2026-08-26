// src/components/Clinical/ClinicalResourceSearch.tsx
"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    ExternalLink,
    FileText,
    FlaskConical,
    Loader2,
    Search,
} from "lucide-react";

import { RESOURCE_SOURCES, ResourceSourceId } from "@/types/clinical-resources";

interface Props {
    sourceId: ResourceSourceId;
}

export default function ClinicalResourceSearch({ sourceId }: Props) {
    const source = RESOURCE_SOURCES.find((s) => s.id === sourceId);

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const runSearch = useCallback(
        async (q: string) => {
            if (!q.trim() || !source) return;
            setLoading(true);
            setError(null);
            setHasSearched(true);
            try {
                const res = await fetch(`${source.apiRoute}?q=${encodeURIComponent(q.trim())}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || `Search failed (${res.status})`);
                }
                const json = await res.json();
                setData(json);
            } catch (e: any) {
                setError(e.message || "Something went wrong. Please try again.");
                setData(null);
            } finally {
                setLoading(false);
            }
        },
        [source]
    );

    // This should be unreachable now that the server page.tsx calls notFound()
    // for invalid ids, but kept as a defensive fallback.
    if (!source) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] dark:bg-[#0B100E]">
                <div className="text-center">
                    <p className="text-[#17211D]/60 dark:text-white/50">Unknown resource.</p>
                    <Link
                        href="/clinical/resources"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] hover:underline"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to resources
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAF9] text-[#17211D] dark:bg-[#0B100E] dark:text-[#F2F7F4]">
            <div className="h-1 w-full" style={{ backgroundColor: source.accentColor }} />

            {/* ---------------------------------------------------------
          HEADER
      --------------------------------------------------------- */}
            <section className="relative overflow-hidden border-b border-[#17211D]/8 dark:border-white/8">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
                    style={{ backgroundColor: `${source.accentColor}0D` }}
                />

                <div className="relative mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14 lg:px-10">
                    {/* Breadcrumb */}
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

                    {/* Search bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            runSearch(query);
                        }}
                        className="mt-7 flex flex-col gap-2.5 sm:flex-row"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17211D]/35 dark:text-white/35" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholderFor(source.id)}
                                className="w-full rounded-xl border border-[#17211D]/12 bg-white py-3 pl-10 pr-4 text-sm text-[#17211D] outline-none transition-colors focus:border-[#17211D]/30 dark:border-white/12 dark:bg-[#121916] dark:text-white dark:focus:border-white/30"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ backgroundColor: source.accentColor }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Searching
                                </>
                            ) : (
                                "Search"
                            )}
                        </button>
                    </form>

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

            {/* ---------------------------------------------------------
          RESULTS
      --------------------------------------------------------- */}
            <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8 lg:px-10">
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {!error && !loading && !hasSearched && (
                    <EmptyState
                        icon={<FlaskConical className="h-5 w-5" />}
                        title={`Search ${source.name}`}
                        subtitle={`Try a query like "${placeholderFor(source.id)}" above.`}
                    />
                )}

                {!error && hasSearched && !loading && data && (
                    <>
                        <p className="mb-5 text-xs font-medium text-[#17211D]/45 dark:text-white/40">
                            <span className="font-mono">{data.totalCount ?? 0}</span> results
                            {data.cached ? " · served from cache" : ""}
                        </p>
                        <ResultList sourceId={source.id} data={data} accentColor={source.accentColor} />

                        {getItemCount(source.id, data) === 0 && (
                            <EmptyState
                                icon={<Search className="h-5 w-5" />}
                                title="No results found"
                                subtitle="Try a different or broader search term."
                            />
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

function getItemCount(sourceId: ResourceSourceId, data: any): number {
    switch (sourceId) {
        case "pubmed":
            return data.articles?.length ?? 0;
        case "clinicaltrials":
            return data.trials?.length ?? 0;
        case "medlineplus":
            return data.topics?.length ?? 0;
        default:
            return (data.results ?? data.drugs ?? []).length;
    }
}

function EmptyState({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#17211D]/15 py-16 text-center dark:border-white/10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                {icon}
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-[#17211D]/45 dark:text-white/40">{subtitle}</p>
        </div>
    );
}

function placeholderFor(id: ResourceSourceId): string {
    switch (id) {
        case "pubmed":
            return "metformin cardiovascular outcomes";
        case "clinicaltrials":
            return "type 2 diabetes recruiting trials";
        case "medlineplus":
            return "asthma, high blood pressure";
        case "dailymed":
            return "atorvastatin, amoxicillin";
    }
}

function ResultList({
    sourceId,
    data,
    accentColor,
}: {
    sourceId: ResourceSourceId;
    data: any;
    accentColor: string;
}) {
    const cardClass =
        "block rounded-xl border border-[#17211D]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#17211D]/15 hover:shadow-[0_12px_30px_rgba(23,33,29,0.06)] dark:border-white/8 dark:bg-[#121916] dark:hover:border-white/15";

    if (sourceId === "pubmed") {
        return (
            <div className="space-y-3.5">
                {(data.articles ?? []).map((a: any) => (
                    <a key={a.pmid} href={a.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                        <h3 className="text-base font-semibold leading-snug">{a.title}</h3>
                        <p className="mt-1.5 text-xs text-[#17211D]/55 dark:text-white/45">
                            {a.authors?.join(", ")}
                            {a.authors?.length ? " · " : ""}
                            {a.journal} · {a.pubDate}
                        </p>
                        <p
                            className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: accentColor }}
                        >
                            PMID {a.pmid} · View on PubMed →
                        </p>
                    </a>
                ))}
            </div>
        );
    }

    if (sourceId === "clinicaltrials") {
        return (
            <div className="space-y-3.5">
                {(data.trials ?? []).map((t: any) => (
                    <a key={t.nctId} href={t.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-snug">{t.title}</h3>
                            <span
                                className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                                style={{ backgroundColor: statusColor(t.status) }}
                            >
                                {formatStatus(t.status)}
                            </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#17211D]/60 dark:text-white/50">
                            {t.summary}
                        </p>
                        <p className="mt-2.5 text-xs text-[#17211D]/45 dark:text-white/40">
                            {t.sponsor}
                            {t.phase?.length ? ` · ${t.phase.join(", ")}` : ""}
                            {t.locationCountries?.length ? ` · ${t.locationCountries.slice(0, 3).join(", ")}` : ""}
                        </p>
                        <p
                            className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: accentColor }}
                        >
                            {t.nctId} · View on ClinicalTrials.gov →
                        </p>
                    </a>
                ))}
            </div>
        );
    }

    if (sourceId === "medlineplus") {
        return (
            <div className="space-y-3.5">
                {(data.topics ?? []).map((topic: any, i: number) => (
                    <a key={i} href={topic.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                        <h3 className="text-base font-semibold leading-snug">{topic.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#17211D]/60 dark:text-white/50">
                            {topic.snippet}
                        </p>
                        <p
                            className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: accentColor }}
                        >
                            Read on MedlinePlus →
                        </p>
                    </a>
                ))}
            </div>
        );
    }

    // dailymed — adjust field names if your existing route returns a
    // different shape (e.g. data.results vs data.drugs).
    return (
        <div className="space-y-3.5">
            {(data.results ?? data.drugs ?? []).map((d: any, i: number) => (
                <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    <h3 className="text-base font-semibold leading-snug">{d.title || d.name}</h3>
                    <p
                        className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: accentColor }}
                    >
                        View label →
                    </p>
                </a>
            ))}
        </div>
    );
}

function formatStatus(status: string) {
    return status
        .toLowerCase()
        .split("_")
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(" ");
}

function statusColor(status: string) {
    switch (status) {
        case "RECRUITING":
            return "#059669";
        case "COMPLETED":
            return "#2563EB";
        case "TERMINATED":
            return "#DC2626";
        case "NOT_YET_RECRUITING":
            return "#D97706";
        default:
            return "#6B7280";
    }
}