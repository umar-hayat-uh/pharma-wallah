// src/components/Clinical/DailyMedAutocompleteSearch.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    ExternalLink,
    Loader2,
    Search,
} from "lucide-react";

interface Suggestion {
    name: string;
    nameType: string; // "G" | "B"
}

interface SplResult {
    setid?: string;
    title?: string;
    spl_version?: string;
    published_date?: string;
    labeler?: string;
}

const ACCENT = "#2563EB"; // matches your DailyMed accentColor

export default function DailyMedAutocompleteSearch() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestLoading, setSuggestLoading] = useState(false);

    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [results, setResults] = useState<SplResult[] | null>(null);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced suggestion fetch as the user types
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await fetch(
                    `/api/clinical/dailymed/suggest?q=${encodeURIComponent(query.trim())}`
                );
                const json = await res.json();
                if (json.success) {
                    setSuggestions(json.suggestions ?? []);
                    setShowDropdown(true);
                } else {
                    setSuggestions([]);
                }
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectSuggestion = useCallback(async (name: string) => {
        setQuery(name);
        setSelectedName(name);
        setShowDropdown(false);
        setError(null);
        setResultsLoading(true);
        setResults(null);

        try {
            const res = await fetch(`/api/clinical/dailymed?exact=${encodeURIComponent(name)}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Lookup failed.");
            setResults(json.data ?? []);
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setResultsLoading(false);
        }
    }, []);

    return (
        <div className="mx-auto max-w-2xl">
            <div ref={containerRef} className="relative">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17211D]/35 dark:text-white/35" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedName(null);
                            setResults(null);
                            setError(null);
                        }}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        placeholder="Start typing a drug name, e.g. acetaminophen"
                        className="w-full rounded-xl border border-[#17211D]/12 bg-white py-3 pl-10 pr-10 text-sm text-[#17211D] outline-none transition-colors focus:border-[#17211D]/30 dark:border-white/12 dark:bg-[#121916] dark:text-white dark:focus:border-white/30"
                    />
                    {suggestLoading && (
                        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#17211D]/35 dark:text-white/35" />
                    )}
                </div>

                {/* Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#17211D]/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#121916]">
                        {suggestions.map((s) => (
                            <li key={s.name}>
                                <button
                                    type="button"
                                    onClick={() => selectSuggestion(s.name)}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#17211D]/5 dark:hover:bg-white/5"
                                >
                                    <span className="text-[#17211D] dark:text-white">{s.name}</span>
                                    <span className="shrink-0 rounded-md bg-[#17211D]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#17211D]/45 dark:bg-white/10 dark:text-white/40">
                                        {s.nameType === "B" ? "Brand" : "Generic"}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {showDropdown &&
                    !suggestLoading &&
                    query.trim().length >= 2 &&
                    suggestions.length === 0 && (
                        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#17211D]/10 bg-white p-4 text-sm text-[#17211D]/50 shadow-lg dark:border-white/10 dark:bg-[#121916] dark:text-white/40">
                            No matching drug names found.
                        </div>
                    )}
            </div>

            {/* Results */}
            <div className="mt-8">
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {resultsLoading && (
                    <div className="flex items-center gap-2 py-8 text-sm text-[#17211D]/50 dark:text-white/40">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading labels for {selectedName}…
                    </div>
                )}

                {!resultsLoading && results && results.length === 0 && (
                    <p className="py-8 text-center text-sm text-[#17211D]/45 dark:text-white/40">
                        No labels found for "{selectedName}".
                    </p>
                )}

                {!resultsLoading && results && results.length > 0 && (
                    <div className="space-y-3.5">
                        <p className="text-xs font-medium text-[#17211D]/45 dark:text-white/40">
                            {results.length} label{results.length === 1 ? "" : "s"} for{" "}
                            <span className="font-semibold text-[#17211D] dark:text-white">
                                {selectedName}
                            </span>
                        </p>
                        {results.map((r, i) => (
                            <a
                                key={r.setid || i}
                                href={
                                    r.setid
                                        ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${r.setid}`
                                        : "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl border border-[#17211D]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#17211D]/15 hover:shadow-[0_12px_30px_rgba(23,33,29,0.06)] dark:border-white/8 dark:bg-[#121916] dark:hover:border-white/15"
                            >
                                <h3 className="text-base font-semibold leading-snug">{r.title}</h3>
                                <p className="mt-1.5 text-xs text-[#17211D]/55 dark:text-white/45">
                                    {r.labeler} · Published {r.published_date} · v{r.spl_version}
                                </p>
                                <p
                                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
                                    style={{ color: ACCENT }}
                                >
                                    View full label
                                    <ExternalLink className="h-3 w-3" />
                                </p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}