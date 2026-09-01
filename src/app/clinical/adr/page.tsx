"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { MedicalDisclaimerBanner } from "@/components/MedicalDisclaimerBanner";
import {
    AlertTriangle,
    ShieldAlert,
    Pill,
    TrendingUp,
    AlertCircle,
    Info,
    ChevronRight,
    Database,
} from "lucide-react";

interface ReportedReaction {
    reactionTerm: string;
    reportCount: number;
}

interface AdverseResult {
    matchedGenericName: string[];
    matchedBrandName: string[];
    boxedWarning: string[];
    warnings: string[];
    adverseReactions: string[];
    reportedReactions: ReportedReaction[];
}

interface AdverseResponse {
    source: string;
    found?: boolean;
    result?: AdverseResult;
    message?: string;
    disclaimer?: string;
    error?: string;
    warnings?: { event_api?: string };
}

interface DrugSuggestion {
    name: string;
    type: "generic" | "brand";
}

function AdverseSection({
    title,
    items,
    tone = "default",
    icon,
}: {
    title: string;
    items?: string[];
    tone?: "default" | "critical" | "warning";
    icon?: React.ReactNode;
}) {
    if (!items || items.length === 0) return null;

    const toneStyles = {
        default: "bg-slate-50 border-slate-200",
        critical: "bg-red-50 border-red-200 ring-1 ring-red-200/50",
        warning: "bg-amber-50 border-amber-200 ring-1 ring-amber-200/50",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 sm:p-4 ${toneStyles[tone]} transition-all`}
        >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                    {title}
                </h3>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed flex gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="break-words">{item}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

export default function AdverseEffectsPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<AdverseResponse | null>(null);

    async function runSearch(term: string) {
        if (!term.trim()) return;
        setLoading(true);
        setResponse(null);
        try {
            const res = await fetch(`/api/drugs/adverse-effects?q=${encodeURIComponent(term)}`);
            const data = await res.json();
            setResponse(data);
        } catch {
            setResponse({ source: "error", error: "Network error — please try again." });
        } finally {
            setLoading(false);
        }
    }

    const r = response?.result;
    const maxCount = r?.reportedReactions?.[0]?.reportCount ?? 1;
    const hasBoxedWarning = (r?.boxedWarning?.length ?? 0) > 0;
    const hasEventWarning = response?.warnings?.event_api;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-10">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
                        <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Clinical Decision Support
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Adverse Effect Detector
                    </h1>
                    <p className="text-blue-100 max-w-2xl mt-2 sm:mt-3 text-xs sm:text-sm md:text-base leading-relaxed">
                        Surface known adverse reactions, warnings, and post-market reports for any drug
                        from FDA labeling and the FAERS database.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 md:py-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
                    <div className="mb-4 sm:mb-6">
                        <MedicalDisclaimerBanner />
                    </div>

                    {/* Search */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                            <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                            <span className="font-medium">Enter a drug generic or brand name</span>
                        </div>

                        <AutocompleteSearch
                            value={query}
                            onChange={setQuery}
                            onSubmit={(v) => {
                                setQuery(v);
                                runSearch(v);
                            }}
                            suggestUrl={(q) => `/api/drugs/adverse-effects/suggest?q=${encodeURIComponent(q)}`}
                            extractSuggestions={(data) =>
                                ((data as { suggestions?: DrugSuggestion[] }).suggestions ?? []).map(
                                    (s) => s.name
                                )
                            }
                            placeholder="e.g., ibuprofen, amoxicillin, metformin"
                            loading={loading}
                            accentColor="#2563EB"
                        />

                        {loading && (
                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-blue-600 font-medium pt-1 sm:pt-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Querying openFDA database...</span>
                            </div>
                        )}

                        {/* Error / Not Found */}
                        {response?.error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                                <div className="break-words">
                                    <span className="font-bold">Error.</span> {response.error}
                                </div>
                            </div>
                        )}

                        {response && response.found === false && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-amber-700 flex items-start gap-2 sm:gap-3">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                                <div className="break-words">{response.message}</div>
                            </div>
                        )}

                        {/* Results */}
                        {r && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 sm:space-y-6 mt-3 sm:mt-4"
                            >
                                {/* Header */}
                                <div className="border-b border-gray-100 pb-3 sm:pb-4">
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 break-words capitalize">
                                        {r.matchedGenericName?.[0] || query}
                                    </h2>
                                    {r.matchedBrandName?.length > 0 && (
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">
                                            <span className="font-medium">US brand names:</span>{" "}
                                            {r.matchedBrandName.join(", ")}
                                        </p>
                                    )}
                                </div>

                                {/* Boxed Warning – highlighted */}
                                {hasBoxedWarning && (
                                    <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2 sm:gap-3 shadow-sm">
                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-red-500" />
                                        <div className="break-words">
                                            <span className="font-bold">FDA Boxed Warning —</span>{" "}
                                            {r.boxedWarning?.[0]}
                                        </div>
                                    </div>
                                )}

                                {/* Sections */}
                                <div className="space-y-3 sm:space-y-4">
                                    <AdverseSection
                                        title="Labeled Adverse Reactions"
                                        items={r.adverseReactions}
                                        icon={<Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />}
                                    />
                                    <AdverseSection
                                        title="Warnings & Precautions"
                                        items={r.warnings}
                                        tone="warning"
                                        icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />}
                                    />
                                    {r.boxedWarning && r.boxedWarning.length > 0 && (
                                        <AdverseSection
                                            title="Boxed Warning (Black Box)"
                                            items={r.boxedWarning}
                                            tone="critical"
                                            icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />}
                                        />
                                    )}
                                </div>

                                {/* Reported Reactions (FAERS) */}
                                {r.reportedReactions?.length > 0 && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                                            <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                                                Most-Reported Reactions (FAERS)
                                            </h3>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-slate-500 italic mb-3 sm:mb-4">
                                            Voluntary post-market reports. High count ≠ causation. Always verify clinically.
                                        </p>
                                        <div className="space-y-2.5 sm:space-y-3">
                                            {r.reportedReactions.slice(0, 10).map((rr) => (
                                                <div key={rr.reactionTerm} className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-xs sm:text-sm text-slate-700 w-20 sm:w-32 md:w-40 truncate capitalize shrink-0">
                                                        {rr.reactionTerm.toLowerCase()}
                                                    </span>
                                                    <div className="flex-1 h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden min-w-[30px]">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                                                            style={{
                                                                width: `${Math.max(4, (rr.reportCount / maxCount) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs font-mono text-slate-500 w-12 sm:w-16 text-right shrink-0">
                                                        {rr.reportCount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {hasEventWarning && (
                                            <p className="text-[10px] sm:text-xs text-amber-600 mt-3 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {hasEventWarning}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Disclaimer */}
                                {response?.disclaimer && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                                        <span className="font-bold text-slate-400">ℹ️</span> {response.disclaimer}
                                    </div>
                                )}

                                {/* Back link */}
                                <div className="pt-1 sm:pt-2">
                                    <Link
                                        href="/drug-tools"
                                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <span>←</span> Back to Drug Tools
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}