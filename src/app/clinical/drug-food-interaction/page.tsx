"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    Pill,
    Utensils,
    AlertTriangle,
    AlertOctagon,
    Clock,
    Hourglass,
    MinusCircle,
    Droplets,
    RefreshCw,
    FileText,
    Layers,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    BookOpen,
    Info,
    CheckCircle2,
    X,
    Sparkles,
    ArrowRight,
    ShieldAlert,
} from "lucide-react";
import {
    InteractionCategory,
    CategorizedInteraction,
    DrugDetailResponse,
    FoodSearchMatch,
} from "@/types/drug-food";
import { CATEGORY_META } from "@/lib/drug-food-interactions";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    Layers,
    AlertOctagon,
    AlertTriangle,
    Utensils,
    Clock,
    Hourglass,
    MinusCircle,
    Pill,
    Droplets,
    RefreshCw,
    FileText,
};

const POPULAR_FOODS = [
    "Grapefruit",
    "Alcohol",
    "Caffeine",
    "Milk / Dairy",
    "Calcium",
    "High-fat meal",
    "Potassium",
    "St. John's Wort",
    "Antacids",
    "Iron",
];

export default function DrugFoodInteractionCheckerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialDrugParam = searchParams.get("drug") || "";

    const [activeTab, setActiveTab] = useState<"by-drug" | "by-food">("by-drug");
    const [searchQuery, setSearchQuery] = useState("");
    const [foodQuery, setFoodQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [exampleDrugs, setExampleDrugs] = useState<string[]>([
        "Metformin",
        "Phenytoin",
        "Cyclosporine",
        "Doxycycline",
        "Lovastatin",
        "Warfarin",
        "Levothyroxine",
        "Ciprofloxacin",
    ]);

    // Drug Result State
    const [selectedDrugData, setSelectedDrugData] = useState<DrugDetailResponse | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<InteractionCategory>("all");
    const [isSourceOpen, setIsSourceOpen] = useState(false);

    // Food Search Result State
    const [foodResults, setFoodResults] = useState<FoodSearchMatch[]>([]);
    const [foodSearchedTerm, setFoodSearchedTerm] = useState("");

    // Loading & Error States
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch initial examples
    useEffect(() => {
        fetch("/api/clinical/drug-food-interactions?mode=examples")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.examples?.length) {
                    setExampleDrugs(data.examples);
                }
            })
            .catch(() => { });
    }, []);

    // Handle URL query parameter `?drug=...`
    useEffect(() => {
        if (initialDrugParam) {
            setSearchQuery(initialDrugParam);
            loadDrugDetails(initialDrugParam);
        }
    }, [initialDrugParam]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Autocomplete fetch on drug input change
    useEffect(() => {
        if (activeTab !== "by-drug" || !searchQuery.trim()) {
            setSuggestions([]);
            setIsDropdownOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/clinical/drug-food-interactions?mode=autocomplete&q=${encodeURIComponent(
                        searchQuery.trim()
                    )}`
                );
                const data = await res.json();
                if (data.success && data.suggestions) {
                    setSuggestions(data.suggestions);
                    setIsDropdownOpen(data.suggestions.length > 0);
                }
            } catch (err) {
                console.error("Autocomplete error:", err);
            }
        }, 180);

        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    const loadDrugDetails = async (drugName: string) => {
        if (!drugName.trim()) return;
        setLoading(true);
        setErrorMessage(null);
        setIsDropdownOpen(false);
        setSelectedCategoryFilter("all");

        try {
            const res = await fetch(
                `/api/clinical/drug-food-interactions?drug=${encodeURIComponent(drugName.trim())}`
            );
            const json = await res.json();

            if (!res.ok || !json.success) {
                setSelectedDrugData(null);
                setErrorMessage(
                    json.message || `No matching medication found for "${drugName}".`
                );
            } else {
                setSelectedDrugData(json.data);
                setSearchQuery(json.data.drug.name);
                // Sync URL without full reload
                router.replace(`?drug=${encodeURIComponent(json.data.drug.name)}`, { scroll: false });
            }
        } catch (err: any) {
            setErrorMessage("Network error while connecting to interaction database.");
        } finally {
            setLoading(false);
        }
    };

    const handleFoodSearch = async (substanceName?: string) => {
        const term = (substanceName || foodQuery).trim();
        if (!term) return;

        setFoodSearchedTerm(term);
        setFoodQuery(term);
        setLoading(true);
        setErrorMessage(null);

        try {
            const res = await fetch(
                `/api/clinical/drug-food-interactions?mode=food&q=${encodeURIComponent(term)}`
            );
            const json = await res.json();

            if (!res.ok || !json.success) {
                setFoodResults([]);
                setErrorMessage(json.message || "Failed to search substance interactions.");
            } else {
                setFoodResults(json.results || []);
            }
        } catch (err) {
            setErrorMessage("Error searching substance interactions.");
        } finally {
            setLoading(false);
        }
    };

    const renderCategoryIcon = (category: InteractionCategory, className = "w-4 h-4") => {
        const iconName = CATEGORY_META[category]?.icon || "FileText";
        const IconComp = ICON_MAP[iconName] || FileText;
        return <IconComp className={className} />;
    };

    const filteredInteractions = selectedDrugData
        ? selectedDrugData.categorizedInteractions.filter((item) => {
            if (selectedCategoryFilter === "all") return true;
            return item.category === selectedCategoryFilter;
        })
        : [];

    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans pb-24 antialiased">
            {/* Top Banner Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4ADE80] flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Drug–Food Interaction Checker
                                </h1>
                                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    PharmaWallah Clinical
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-normal">
                                Check how foods, beverages, herbs, supplements, and meal timing may affect a medication.
                            </p>
                        </div>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start md:self-auto">
                        <button
                            onClick={() => {
                                setActiveTab("by-drug");
                                setErrorMessage(null);
                            }}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "by-drug"
                                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Pill className="w-3.5 h-3.5" />
                            Search by Medication
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("by-food");
                                setErrorMessage(null);
                            }}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "by-food"
                                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Utensils className="w-3.5 h-3.5" />
                            Search by Food / Substance
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
                {/* Search Section */}
                {activeTab === "by-drug" ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-6">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Medication Name Search
                        </label>
                        <div className="relative">
                            <div className="relative flex items-center">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setIsDropdownOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && searchQuery.trim()) {
                                            loadDrugDetails(searchQuery.trim());
                                        }
                                    }}
                                    placeholder="Search medication (e.g., Metformin, Phenytoin, Cyclosporine, Lovastatin)..."
                                    className="w-full pl-10 pr-24 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                                    aria-label="Search medication"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedDrugData(null);
                                            setSuggestions([]);
                                            router.replace(window.location.pathname, { scroll: false });
                                        }}
                                        className="absolute right-12 text-slate-400 hover:text-slate-600 p-1"
                                        title="Clear input"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => loadDrugDetails(searchQuery.trim())}
                                    disabled={loading || !searchQuery.trim()}
                                    className="absolute right-2 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-lg transition shadow-xs"
                                >
                                    {loading ? "Searching..." : "Lookup"}
                                </button>
                            </div>

                            {/* Autocomplete dropdown */}
                            {isDropdownOpen && suggestions.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden"
                                >
                                    <div className="py-1 max-h-64 overflow-y-auto">
                                        {suggestions.map((drug) => (
                                            <button
                                                key={drug}
                                                onClick={() => {
                                                    setSearchQuery(drug);
                                                    loadDrugDetails(drug);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-blue-50/80 hover:text-blue-700 flex items-center justify-between group transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Pill className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                                    <span className="font-medium">{drug}</span>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Curated clickable examples */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-slate-600 font-medium mr-1">Sample Medications:</span>
                            {exampleDrugs.slice(0, 8).map((example) => (
                                <button
                                    key={example}
                                    onClick={() => {
                                        setSearchQuery(example);
                                        loadDrugDetails(example);
                                    }}
                                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-md transition"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Food-first Search Section */
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-6">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Food, Beverage or Substance Search
                        </label>
                        <div className="relative flex items-center">
                            <Utensils className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                                type="text"
                                value={foodQuery}
                                onChange={(e) => setFoodQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleFoodSearch();
                                }}
                                placeholder="Search substance (e.g. Grapefruit, Alcohol, Milk, Caffeine, High-fat meal, Calcium)..."
                                className="w-full pl-10 pr-24 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all"
                                aria-label="Search food or substance"
                            />
                            <button
                                onClick={() => handleFoodSearch()}
                                disabled={loading || !foodQuery.trim()}
                                className="absolute right-2 px-3 py-1.5 bg-[#16A34A] hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-lg transition shadow-xs"
                            >
                                {loading ? "Searching..." : "Find Drugs"}
                            </button>
                        </div>

                        {/* Curated quick food tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-slate-600 font-medium mr-1">Quick Select:</span>
                            {POPULAR_FOODS.map((food) => (
                                <button
                                    key={food}
                                    onClick={() => handleFoodSearch(food.split(" ")[0])}
                                    className="text-xs bg-emerald-50/70 hover:bg-emerald-100 hover:text-emerald-800 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md transition"
                                >
                                    {food}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">{errorMessage}</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Absence of a record does not prove the absence of clinical interaction. Please verify with complete prescribing guidelines.
                            </p>
                        </div>
                    </div>
                )}

                {/* Results Area */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mb-3" />
                        <p className="text-sm font-medium text-slate-600">Retrieving dataset records...</p>
                    </div>
                ) : activeTab === "by-drug" ? (
                    /* BY-DRUG DETAIL VIEW */
                    selectedDrugData ? (
                        <div className="space-y-6">
                            {/* Header Drug Summary Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <Pill className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                Medication Profile
                                            </span>
                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                                {selectedDrugData.drug.name}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                                            <strong>{selectedDrugData.totalInteractions}</strong> recorded considerations
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                {selectedDrugData.availableCategories.length > 1 && (
                                    <div className="mt-5">
                                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                                            Filter by Clinical Guidance Category
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDrugData.availableCategories.map((catKey) => {
                                                const isSelected = selectedCategoryFilter === catKey;
                                                const meta = CATEGORY_META[catKey];
                                                const count =
                                                    catKey === "all"
                                                        ? selectedDrugData.categorizedInteractions.length
                                                        : selectedDrugData.categorizedInteractions.filter((i) => i.category === catKey).length;

                                                return (
                                                    <button
                                                        key={catKey}
                                                        onClick={() => setSelectedCategoryFilter(catKey)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                                                                ? "bg-slate-900 text-white shadow-xs"
                                                                : `${meta.bg} ${meta.text} border ${meta.border} hover:opacity-80`
                                                            }`}
                                                    >
                                                        {renderCategoryIcon(catKey, "w-3.5 h-3.5")}
                                                        <span>{meta.label}</span>
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-slate-700 text-slate-200" : "bg-white/80 text-slate-700"
                                                                }`}
                                                        >
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Interaction Statements Grid */}
                            <div className="space-y-3.5">
                                {filteredInteractions.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                                        <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">
                                            No interactions match the selected filter.
                                        </p>
                                    </div>
                                ) : (
                                    filteredInteractions.map((item, index) => {
                                        const meta = CATEGORY_META[item.category] || CATEGORY_META.other;

                                        if (item.isNeutral) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-start gap-4"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1.5">
                                                            No Significant Food Interaction Reported
                                                        </span>
                                                        <p className="text-sm text-slate-800 font-normal leading-relaxed">
                                                            {item.originalText}
                                                        </p>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            Note: This statement reflects the dataset documentation.
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={`bg-white rounded-xl border ${meta.border} p-5 shadow-xs hover:border-slate-300 transition`}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${meta.bg} ${meta.text} border ${meta.border}`}
                                                    >
                                                        {renderCategoryIcon(item.category, "w-3.5 h-3.5")}
                                                        {meta.label}
                                                    </span>

                                                    {item.extractedSubstances.length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            {item.extractedSubstances.map((sub) => (
                                                                <span
                                                                    key={sub}
                                                                    className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tight font-medium"
                                                                >
                                                                    {sub}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Preserved Exact Dataset Text */}
                                                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                                                    {item.originalText}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Collapsible Source Citation Section */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <button
                                    onClick={() => setIsSourceOpen(!isSourceOpen)}
                                    className="w-full px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition"
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        Source & Reference Citation
                                    </div>
                                    {isSourceOpen ? (
                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>
                                {isSourceOpen && (
                                    <div className="p-5 border-t border-slate-200 text-xs text-slate-600 bg-white leading-relaxed">
                                        <p className="font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 break-words">
                                            {selectedDrugData.drug.reference}
                                        </p>
                                        <p className="mt-2 text-[11px] text-slate-600">
                                            Preserved verbatim from the DrugBank open-access clinical reference index.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ZERO STATE (No drug selected yet) */
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <Pill className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                                Search for a medication to check food and medication considerations
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                                Type any drug name above or click one of the representative clinical records below to inspect meal timing, dietary restrictions, and co-administration instructions.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                                {exampleDrugs.map((drug) => (
                                    <button
                                        key={drug}
                                        onClick={() => {
                                            setSearchQuery(drug);
                                            loadDrugDetails(drug);
                                        }}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition"
                                    >
                                        {drug}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    /* FOOD-FIRST SEARCH VIEW */
                    <div>
                        {foodSearchedTerm && (
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Medications with &ldquo;{foodSearchedTerm}&rdquo; considerations
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Found {foodResults.length} matching medication records in dataset
                                    </p>
                                </div>
                            </div>
                        )}

                        {foodResults.length === 0 && foodSearchedTerm ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                                <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-700">
                                    No matching food-related interaction was found in this dataset for &ldquo;{foodSearchedTerm}&rdquo;.
                                </p>
                                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                    Try searching for another broad category like &ldquo;grapefruit&rdquo;, &ldquo;alcohol&rdquo;, &ldquo;milk&rdquo;, or &ldquo;empty stomach&rdquo;.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {foodResults.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-200 transition"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <Pill className="w-4 h-4 text-blue-600" />
                                                    <h4 className="text-base font-bold text-slate-900">
                                                        {item.drugName}
                                                    </h4>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab("by-drug");
                                                        setSearchQuery(item.drugName);
                                                        loadDrugDetails(item.drugName);
                                                    }}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    View Full Drug <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="space-y-2.5">
                                                {item.matchingInteractions.map((match, mIdx) => {
                                                    const meta = CATEGORY_META[match.category] || CATEGORY_META.other;
                                                    return (
                                                        <div
                                                            key={mIdx}
                                                            className={`p-3 rounded-lg border text-xs leading-relaxed ${meta.bg} ${meta.border}`}
                                                        >
                                                            <div className="flex items-center gap-1.5 font-semibold mb-1 text-[11px] text-slate-700">
                                                                {renderCategoryIcon(match.category, "w-3 h-3")}
                                                                {meta.label}
                                                            </div>
                                                            <p className="text-slate-800">{match.originalText}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Clinical Safety & Regulatory Notice */}
                <section className="mt-12 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800 font-semibold block mb-0.5">
                                Clinical Information Notice
                            </strong>
                            This tool provides food–drug interaction information derived from the PharmaWallah Clinical dataset and is intended for educational and clinical reference purposes. It does not replace professional clinical judgment, official prescribing information, or patient-specific advice. Verify clinically significant interactions using an appropriate authoritative source before making treatment decisions.
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}