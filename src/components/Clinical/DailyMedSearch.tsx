"use client";

import { FormEvent, useState } from "react";

interface DailyMedResult {
    setid?: string;
    title?: string;
    spl_version?: string;
    published_date?: string;
    effective_time?: string;
    labeler?: string;
}

interface ApiResponse {
    success: boolean;
    source?: string;
    query?: string;
    cached?: boolean;
    stale?: boolean;
    data?: DailyMedResult[];
    metadata?: {
        total_elements?: number;
        total_pages?: number;
        current_page?: number;
        page_size?: number;
    };
    error?: string;
}

export default function DailyMedSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<DailyMedResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cached, setCached] = useState(false);
    const [stale, setStale] = useState(false);

    async function handleSearch(event: FormEvent) {
        event.preventDefault();

        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 2) {
            setError("Enter at least 2 characters.");
            return;
        }

        setLoading(true);
        setError("");
        setResults([]);
        setCached(false);
        setStale(false);

        try {
            const response = await fetch(
                `/api/clinical/dailymed?q=${encodeURIComponent(
                    trimmedQuery
                )}`,
                {
                    method: "GET",
                }
            );

            const json: ApiResponse = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(
                    json.error || "Unable to search DailyMed."
                );
            }

            setResults(json.data ?? []);
            setCached(Boolean(json.cached));
            setStale(Boolean(json.stale));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-6">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">
                        DailyMed
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Official drug labels
                    </span>
                </div>

                <h2 className="text-2xl font-semibold">
                    Search Drug Labels
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Search official drug labeling information from
                    DailyMed.
                </p>
            </div>

            <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 sm:flex-row"
            >
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search a drug, e.g. amoxicillin"
                    maxLength={100}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {stale && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    DailyMed could not be reached right now. Showing
                    previously cached information.
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {results.length} result
                            {results.length !== 1 ? "s" : ""} found
                        </p>

                        {cached && !stale && (
                            <span className="text-xs text-gray-400">
                                Cached result
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {results.map((drug, index) => {
                            const setId = drug.setid;

                            const labelUrl = setId
                                ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(
                                    setId
                                )}`
                                : null;

                            return (
                                <article
                                    key={setId ?? `${drug.title}-${index}`}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {drug.title || "Untitled drug label"}
                                            </h3>

                                            {drug.labeler && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Manufacturer: {drug.labeler}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {drug.spl_version && (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                                        SPL v{drug.spl_version}
                                                    </span>
                                                )}

                                                {drug.effective_time && (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                                        Updated:{" "}
                                                        {formatDate(drug.effective_time)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {labelUrl && (
                                            <a
                                                href={labelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50"
                                            >
                                                View Label
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}

            {!loading &&
                !error &&
                query.trim().length >= 2 &&
                results.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                        <p className="font-medium text-gray-700">
                            No DailyMed labels found.
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try another drug name or search term.
                        </p>
                    </div>
                )}
        </section>
    );
}

function formatDate(value: string): string {
    if (!value) return "Unknown";

    const normalized =
        value.length === 8
            ? `${value.slice(0, 4)}-${value.slice(
                4,
                6
            )}-${value.slice(6, 8)}`
            : value;

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}