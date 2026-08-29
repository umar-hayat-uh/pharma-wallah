"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Search,
  Pill,
  Plus,
  Trash2,
  ArrowRight,
  Info,
  Layers,
  X,
  RefreshCw,
} from "lucide-react";
import {
  DDISeverity,
  DrugDrugInteraction,
  PairCheckResult,
  MultiDrugSummary,
} from "@/types/drug-drug";

const SEVERITY_CONFIG: Record<
  DDISeverity,
  { label: string; badge: string; icon: React.FC<{ className?: string }>; bg: string; border: string; text: string }
> = {
  high: {
    label: "High Clinical Significance",
    badge: "High",
    icon: AlertOctagon,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  moderate: {
    label: "Moderate Clinical Significance",
    badge: "Moderate",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  low: {
    label: "Low Clinical Significance",
    badge: "Low",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
};

export default function DrugDrugInteractionPage() {
  const [mode, setMode] = useState<"pair" | "multi">("pair");

  // Single Pair States
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [pairResult, setPairResult] = useState<PairCheckResult | null>(null);

  // Multi-Drug States
  const [multiDrugList, setMultiDrugList] = useState<string[]>([
    "Warfarin",
    "Lisinopril",
    "Ibuprofen",
  ]);
  const [multiNewInput, setMultiNewInput] = useState("");
  const [multiSummary, setMultiSummary] = useState<MultiDrugSummary | null>(null);

  // Autocomplete & UI States
  const [activeInput, setActiveInput] = useState<"drug1" | "drug2" | "multi" | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 300, low: 75, moderate: 125, high: 100 });
  const [samplePairs, setSamplePairs] = useState<Array<{ drugA: string; drugB: string; severity: DDISeverity }>>([]);

  // Fetch initial stats and examples from MongoDB API
  useEffect(() => {
    fetch("/api/clinical/drug-drug-interactions?mode=stats")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.stats) setStats(d.stats);
      })
      .catch(() => {});

    fetch("/api/clinical/drug-drug-interactions?mode=examples")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.examples) setSamplePairs(d.examples);
      })
      .catch(() => {});
  }, []);

  // Fetch autocomplete suggestions with debounce
  const fetchSuggestions = (query: string, target: "drug1" | "drug2" | "multi") => {
    setActiveInput(target);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    fetch(`/api/clinical/drug-drug-interactions?mode=autocomplete&q=${encodeURIComponent(query.trim())}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.suggestions) setSuggestions(d.suggestions);
      })
      .catch(() => {});
  };

  const handleSelectSuggestion = (drug: string, target: "drug1" | "drug2" | "multi") => {
    if (target === "drug1") setDrug1(drug);
    if (target === "drug2") setDrug2(drug);
    if (target === "multi") {
      if (!multiDrugList.includes(drug)) {
        setMultiDrugList([...multiDrugList, drug]);
      }
      setMultiNewInput("");
    }
    setActiveInput(null);
    setSuggestions([]);
  };

  // Perform single pair lookup via MongoDB API
  const handleCheckPair = async (dA = drug1, dB = drug2) => {
    if (!dA.trim() || !dB.trim()) return;
    setActiveInput(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/clinical/drug-drug-interactions?drugA=${encodeURIComponent(dA.trim())}&drugB=${encodeURIComponent(
          dB.trim()
        )}`
      );
      const json = await res.json();
      setPairResult(json);
    } catch (e) {
      setPairResult({
        found: false,
        drugA: dA,
        drugB: dB,
        message: "Failed to connect to interaction API.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Perform multi-drug regimen evaluation via POST API
  const handleCheckMulti = async (drugs = multiDrugList) => {
    if (drugs.length < 2) return;
    setLoading(true);

    try {
      const res = await fetch("/api/clinical/drug-drug-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs }),
      });
      const json = await res.json();
      if (json.success) {
        setMultiSummary(json.summary);
      }
    } catch (e) {
      console.error("Multi-check error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "multi" && multiDrugList.length >= 2) {
      handleCheckMulti(multiDrugList);
    }
  }, [multiDrugList, mode]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans pb-24 antialiased">
      {/* Top Clinical Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4ADE80] flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Drug–Drug Interaction Checker
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Prototype DDI Database
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Check potential pharmacological and clinical interactions between medications.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setMode("pair")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "pair"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Two Medications
            </button>
            <button
              onClick={() => setMode("multi")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "multi"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Multi-Drug Regimen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Prototype Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Prototype Database
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
            <div className="text-[11px] text-slate-400">Curated Records in MongoDB</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
              High Severity
            </div>
            <div className="text-xl font-bold text-red-700 mt-0.5">{stats.high}</div>
            <div className="text-[11px] text-slate-400">Critical / Avoid</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              Moderate
            </div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{stats.moderate}</div>
            <div className="text-[11px] text-slate-400">Monitor / Adjust</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Low Severity
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{stats.low}</div>
            <div className="text-[11px] text-slate-400">Minor / Informational</div>
          </div>
        </div>

        {/* MODE 1: SINGLE PAIR CHECKER */}
        {mode === "pair" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Medication 1 */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Medication 1
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={drug1}
                      onChange={(e) => {
                        setDrug1(e.target.value);
                        fetchSuggestions(e.target.value, "drug1");
                      }}
                      onFocus={() => fetchSuggestions(drug1, "drug1")}
                      placeholder="Search medication (e.g. Warfarin, Simvastatin)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  {activeInput === "drug1" && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelectSuggestion(s, "drug1")}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medication 2 */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Medication 2
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={drug2}
                      onChange={(e) => {
                        setDrug2(e.target.value);
                        fetchSuggestions(e.target.value, "drug2");
                      }}
                      onFocus={() => fetchSuggestions(drug2, "drug2")}
                      placeholder="Search medication (e.g. Clarithromycin, Aspirin)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  {activeInput === "drug2" && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelectSuggestion(s, "drug2")}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => handleCheckPair()}
                  disabled={loading || !drug1.trim() || !drug2.trim()}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  {loading ? "Checking API..." : "Check Interaction"}
                </button>
              </div>

              {/* Try an Example */}
              {samplePairs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-600 font-medium mr-1">Curated Pairs:</span>
                  {samplePairs.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDrug1(p.drugA);
                        setDrug2(p.drugB);
                        handleCheckPair(p.drugA, p.drugB);
                      }}
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition"
                    >
                      {p.drugA} + {p.drugB}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction Result Card */}
            {pairResult && (
              pairResult.found && pairResult.interaction ? (
                <div
                  className={`bg-white rounded-2xl border ${
                    SEVERITY_CONFIG[pairResult.interaction.severity].border
                  } p-6 shadow-xs space-y-5`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="text-xs uppercase font-semibold text-slate-600 tracking-wider">
                        Pharmacological Interaction Detected
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {pairResult.interaction.drugA} <span className="text-slate-400">+</span> {pairResult.interaction.drugB}
                      </h2>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        SEVERITY_CONFIG[pairResult.interaction.severity].bg
                      } ${SEVERITY_CONFIG[pairResult.interaction.severity].text} border ${
                        SEVERITY_CONFIG[pairResult.interaction.severity].border
                      }`}
                    >
                      {React.createElement(
                        SEVERITY_CONFIG[pairResult.interaction.severity].icon,
                        { className: "w-4 h-4" }
                      )}
                      <span>{SEVERITY_CONFIG[pairResult.interaction.severity].label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mechanism
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {pairResult.interaction.mechanism}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Clinical Effect
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {pairResult.interaction.clinicalEffect}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                      <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                        Management & Clinical Recommendation
                      </div>
                      <p className="text-blue-950 leading-relaxed">
                        {pairResult.interaction.management}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2">
                    <span className="font-medium">
                      Category: <strong className="text-slate-800">{pairResult.interaction.category}</strong>
                    </span>
                    <span>
                      Source: <em>{pairResult.interaction.source}</em>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    {pairResult.isSameDrug
                      ? "Same Medication Selected"
                      : "No Interaction Found in Prototype"}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {pairResult.message}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          /* MODE 2: MULTI-DRUG REGIMEN */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Build Multi-Medication Regimen
              </label>

              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px]">
                {multiDrugList.map((drug) => (
                  <span
                    key={drug}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg shadow-2xs"
                  >
                    <Pill className="w-3 h-3 text-blue-600" />
                    {drug}
                    <button
                      onClick={() => setMultiDrugList(multiDrugList.filter((d) => d !== drug))}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={multiNewInput}
                      onChange={(e) => {
                        setMultiNewInput(e.target.value);
                        fetchSuggestions(e.target.value, "multi");
                      }}
                      onFocus={() => fetchSuggestions(multiNewInput, "multi")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && multiNewInput.trim()) {
                          handleSelectSuggestion(multiNewInput.trim(), "multi");
                        }
                      }}
                      placeholder="Type medication name to add to regimen..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (multiNewInput.trim()) {
                        handleSelectSuggestion(multiNewInput.trim(), "multi");
                      }
                    }}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                  >
                    + Add
                  </button>
                </div>

                {activeInput === "multi" && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSelectSuggestion(s, "multi")}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Multi-drug Summary from API */}
            {multiSummary && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Regimen Interaction Matrix
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated {multiSummary.totalPairsEvaluated} pairwise combinations across {multiSummary.drugsChecked.length} medications via MongoDB.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold">
                      {multiSummary.highCount} High
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {multiSummary.moderateCount} Moderate
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {multiSummary.lowCount} Low
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {multiSummary.interactionsFound.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        No interactions found among the selected medications in this prototype database.
                      </p>
                    </div>
                  ) : (
                    multiSummary.interactionsFound.map((item) => {
                      const cfg = SEVERITY_CONFIG[item.severity];
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-xl border ${cfg.border} p-4 shadow-xs`}
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                            <div className="font-bold text-sm text-slate-900">
                              {item.drugA} <span className="text-slate-400">+</span> {item.drugB}
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                            >
                              {cfg.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mb-1.5">
                            <strong>Mechanism:</strong> {item.mechanism}
                          </p>
                          <p className="text-xs text-blue-900 bg-blue-50/50 p-2 rounded border border-blue-100">
                            <strong>Management:</strong> {item.management}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prototype Clinical Notice */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-semibold block mb-0.5">
                Prototype Clinical Information Notice
              </strong>
              This Drug–Drug Interaction Checker uses a limited curated prototype database of 300 interaction pairs fetched from MongoDB. It is intended for educational, demonstration, and software-development purposes and is not a comprehensive clinical interaction database. Failure to identify an interaction does not mean that no interaction exists. Always verify clinically significant interactions using an appropriate authoritative drug-information resource and apply professional clinical judgment before making treatment decisions.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}