"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import DrugCard from "@/components/DrugCard";
import type { Drug } from "@/types/drugs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronLeft, ChevronRight, AlertCircle, Pill,
  Database, TrendingUp, Clock,
} from "lucide-react";

const LIMIT = 10;
const POPULAR = [
  "Metformin", "Aspirin", "Amoxicillin", "Ibuprofen", "Atorvastatin",
  "Omeprazole", "Lisinopril", "Warfarin", "Paracetamol", "Morphine",
];

export default function DrugSearch() {
  const [query,          setQuery]          = useState("");
  const [results,        setResults]        = useState<Drug[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [totalResults,   setTotalResults]   = useState(0);
  const [page,           setPage]           = useState(1);
  const [isFocused,      setIsFocused]      = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showPanel,      setShowPanel]      = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  // ── Search ───────────────────────────────────────────────────────────────────
  const doSearch = useCallback(
    debounce(async (q: string, p: number) => {
      if (!q.trim()) { setResults([]); setTotalResults(0); setLoading(false); return; }
      setLoading(true); setError("");
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${p}&limit=${LIMIT}`);
        const data = await res.json();
        if (data.success) { setResults(data.data); setTotalResults(data.pagination.total); }
        else setError(data.message || "Search failed");
      } catch { setError("Failed to fetch results"); }
      finally { setLoading(false); }
    }, 380), [],
  );

  useEffect(() => { doSearch(query, page); return () => doSearch.cancel(); }, [query, page, doSearch]);

  // ── Click outside ────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setShowPanel(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── ⌘K shortcut ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const commitSearch = (term: string) => {
    setQuery(term); setPage(1); setShowPanel(false);
    doSearch.cancel(); doSearch(term, 1);
    setRecentSearches(prev => [term, ...prev.filter(r => r !== term)].slice(0, 5));
    inputRef.current?.blur();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val); setPage(1);
    if (!val) setShowPanel(true); // keep popular visible when cleared
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) { doSearch.cancel(); commitSearch(query); }
    if (e.key === "Escape") { setShowPanel(false); inputRef.current?.blur(); }
  };

  const handleClear = () => {
    setQuery(""); setResults([]); setTotalResults(0);
    setPage(1); setError(""); setShowPanel(true);
    doSearch.cancel(); inputRef.current?.focus();
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const panelVisible   = showPanel && !query.trim();
  const totalPages     = Math.ceil(totalResults / LIMIT);
  const showNoResults  = !loading && query.trim() && results.length === 0 && !error;
  const showEmptyState = !loading && !query && results.length === 0 && !showPanel;

  const pageNums: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) pageNums.push(p);
    else if (pageNums[pageNums.length - 1] !== "…") pageNums.push("…");
  }

  return (
    <div ref={containerRef} className="relative">

      {/* ── Search bar ── */}
      <div className="relative mb-8">
        <div className={`relative flex items-center bg-white transition-all duration-200 ${
          panelVisible
            ? "rounded-t-2xl border border-b-0 border-blue-300 shadow-lg"
            : isFocused
              ? "rounded-2xl border-2 border-blue-400 shadow-lg shadow-blue-100/50"
              : "rounded-2xl border-2 border-gray-200 shadow-sm hover:border-gray-300"
        }`}>

          {/* Spinner / search icon */}
          <div className="absolute left-4 pointer-events-none">
            {loading
              ? <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              : <Search className={`w-[18px] h-[18px] transition-colors ${isFocused ? "text-blue-500" : "text-gray-400"}`} />
            }
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => { setIsFocused(true); if (!query.trim()) setShowPanel(true); }}
            onBlur={() => { setTimeout(() => { setIsFocused(false); setShowPanel(false); }, 160); }}
            placeholder="Search drugs by name, UNII, or CAS number..."
            className="w-full pl-11 pr-28 py-[14px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent font-medium"
            autoComplete="off"
            spellCheck={false}
          />

          <div className="absolute right-3 flex items-center gap-2">
            {!query && !isFocused && (
              <span className="hidden sm:flex items-center gap-1 opacity-50">
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 font-mono bg-gray-50 text-gray-400">⌘K</kbd>
              </span>
            )}
            <AnimatePresence>
              {query && (
                <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={handleClear}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom divider when panel open */}
          {panelVisible && <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100" />}
        </div>

        {/* Popular / recents panel */}
        <AnimatePresence>
          {panelVisible && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.13 }}
              className="absolute left-0 right-0 bg-white rounded-b-2xl border border-t-0 border-blue-300 shadow-xl overflow-hidden z-50">

              <div className="p-4 pt-3 space-y-4">
                {/* Recents */}
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map(r => (
                        <button key={r} onMouseDown={e => { e.preventDefault(); commitSearch(r); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all">
                          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />{r}
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-gray-100 mt-3" />
                  </div>
                )}

                {/* Popular */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR.map(drug => (
                      <button key={drug} onMouseDown={e => { e.preventDefault(); commitSearch(drug); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                        <Pill className="w-3 h-3 flex-shrink-0" />{drug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> 17,430+ drugs · DrugBank v5.1
                </p>
                <p className="text-[10px] text-gray-400">Press Enter to search</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 mb-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-400" />
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div><p className="text-sm font-bold text-red-700">Search Error</p><p className="text-xs text-red-500 mt-0.5">{error}</p></div>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 transition"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results header ── */}
      <AnimatePresence>
        {query && totalResults > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">{totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-400">for <span className="font-bold text-blue-600">"{query}"</span></p>
              </div>
            </div>
            <button onClick={handleClear} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ── */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="relative rounded-2xl border border-gray-100 bg-white overflow-hidden p-5">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100 animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-2/3" />
                    <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {results.map((drug, i) => (
              <motion.div key={drug.drugbank_ids?.[0]?.id ?? drug.unii ?? drug.name}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.22, delay: i * 0.035 }}>
                <DrugCard drug={drug} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── No results ── */}
      <AnimatePresence>
        {showNoResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden text-center py-14 px-8">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Pill className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-gray-800 font-extrabold text-lg mb-1">No results for "{query}"</p>
            <p className="text-gray-400 text-sm mb-6">Try a different name, UNII, or CAS number</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {POPULAR.slice(0, 6).map(drug => (
                <button key={drug} onClick={() => commitSearch(drug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition">
                  <Pill className="w-3 h-3" />{drug}
                </button>
              ))}
            </div>
            <button onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-extrabold shadow-md hover:-translate-y-0.5 transition-all">
              <X className="w-4 h-4" /> Clear Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {showEmptyState && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="py-12 px-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200/50">
              <Database className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Search the Drug Database</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              17,430+ drugs from DrugBank v5.1. Click the search bar or try a popular drug below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR.map(drug => (
                <button key={drug} onClick={() => commitSearch(drug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm">
                  <Pill className="w-3 h-3 text-blue-400" />{drug}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            {[{ n: "17,430+", l: "Total Drugs" }, { n: "DrugBank", l: "v5.1 Source" }, { n: "Live", l: "Search API" }].map(({ n, l }) => (
              <div key={l} className="py-4 text-center">
                <div className="text-sm font-extrabold text-gray-800">{n}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            Showing <span className="font-bold text-gray-700">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT, totalResults)}</span>
            {" "}of <span className="font-bold text-gray-700">{totalResults.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNums.map((n,i) => n==="…"
              ? <span key={`e-${i}`} className="text-gray-400 text-sm w-4 text-center">…</span>
              : <button key={n} onClick={() => setPage(n as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    page===n ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md" : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                  }`}>{n}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}