"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import DrugCard from "@/components/DrugCard";
import type { Drug, AutocompleteItem } from "@/types/drugs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronLeft, ChevronRight, AlertCircle, Pill,
  Database, Sparkles, ArrowRight, FlaskConical, Clock, TrendingUp,
  Hash, Atom, CornerDownLeft,
} from "lucide-react";

const LIMIT = 10;

const POPULAR = [
  "Metformin", "Aspirin", "Amoxicillin", "Ibuprofen", "Atorvastatin",
  "Omeprazole", "Lisinopril", "Warfarin", "Paracetamol", "Morphine",
];

const TYPE_COLORS: Record<string, string> = {
  "SmallMoleculeDrug": "bg-blue-50 text-blue-700 border-blue-200",
  "BiotechDrug":       "bg-green-50 text-green-700 border-green-200",
  "Nutraceutical":     "bg-amber-50 text-amber-700 border-amber-200",
  "Illicit":           "bg-red-50 text-red-700 border-red-200",
};

export default function DrugSearch() {
  const [query,          setQuery]          = useState("");
  const [results,        setResults]        = useState<Drug[]>([]);
  const [suggestions,    setSuggestions]    = useState<AutocompleteItem[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [acLoading,      setAcLoading]      = useState(false);
  const [error,          setError]          = useState("");
  const [totalResults,   setTotalResults]   = useState(0);
  const [page,           setPage]           = useState(1);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [inputFocused,   setInputFocused]   = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  /* ── Full search ── */
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
    }, 400), [],
  );

  /* ── Autocomplete ── */
  const doAC = useCallback(
    debounce(async (val: string) => {
      if (!val.trim()) { setSuggestions([]); setShowDropdown(false); setAcLoading(false); return; }
      setAcLoading(true);
      try {
        const res  = await fetch(`/api/autocomplete?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) { setSuggestions(data.data); setShowDropdown(true); }
        else { setSuggestions([]); setShowDropdown(false); }
      } catch {}
      finally { setAcLoading(false); }
    }, 180), [],
  );

  useEffect(() => { doSearch(query, page); return () => doSearch.cancel(); }, [query, page, doSearch]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDropdown(false); setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Handlers ── */
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val); setPage(1); setHighlightedIdx(-1);
    if (val.trim()) doAC(val);
    else { setSuggestions([]); setShowDropdown(false); }
  };

  const commitSearch = (term: string) => {
    setQuery(term); setShowDropdown(false); setSuggestions([]);
    setHighlightedIdx(-1); setPage(1);
    doSearch.cancel(); doSearch(term, 1);
    setRecentSearches(prev => [term, ...prev.filter(r => r !== term)].slice(0, 5));
    inputRef.current?.blur();
  };

  const selectSuggestion = (item: AutocompleteItem) => commitSearch(item.name);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || !suggestions.length) {
      if (e.key === "Enter" && query.trim()) { doSearch.cancel(); commitSearch(query); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlightedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter") {
      if (highlightedIdx >= 0) { e.preventDefault(); selectSuggestion(suggestions[highlightedIdx]); }
      else { setShowDropdown(false); commitSearch(query); }
    }
    if (e.key === "Escape") { setShowDropdown(false); inputRef.current?.blur(); }
  };

  const handleClear = () => {
    setQuery(""); setResults([]); setSuggestions([]);
    setTotalResults(0); setPage(1); setShowDropdown(false);
    doSearch.cancel(); doAC.cancel();
    inputRef.current?.focus();
  };

  /* ── Pagination ── */
  const totalPages = Math.ceil(totalResults / LIMIT);
  const pageNums: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) pageNums.push(p);
    else if (pageNums[pageNums.length - 1] !== "…") pageNums.push("…");
  }

  /* ── Highlight match ── */
  const highlightMatch = (text: string, q: string) => {
    const lq = q.toLowerCase(), lt = text.toLowerCase();
    const idx = lt.indexOf(lq);
    if (idx < 0) return <span>{text}</span>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-blue-600 font-extrabold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const showEmptyState    = !loading && !query && results.length === 0 && !inputFocused;
  const showNoResults     = !loading && query.trim() !== "" && results.length === 0 && !error;
  const showPopularPanel  = inputFocused && !query && !showDropdown;

  return (
    <div ref={containerRef} className="relative">

      {/* ══════════════════════════════════════════════
          SEARCH BAR
      ══════════════════════════════════════════════ */}
      <div className="relative mb-8">

        {/* Ambient glow */}
        <div className={`absolute -inset-0.5 rounded-3xl blur-md pointer-events-none transition-opacity duration-500
          bg-gradient-to-r from-blue-500 via-green-400 to-blue-600
          ${inputFocused ? "opacity-20" : "opacity-0"}`} />

        {/* Input wrapper */}
        <div className={`relative flex items-center bg-white rounded-2xl border-2 transition-all duration-300
          ${inputFocused
            ? "border-blue-400 shadow-lg shadow-blue-100/60"
            : "border-gray-200 hover:border-gray-300 shadow-sm"}`}>

          {/* Left icon */}
          <div className="absolute left-4 flex items-center pointer-events-none">
            <AnimatePresence mode="wait">
              {loading || acLoading ? (
                <motion.div key="spin"
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              ) : (
                <motion.div key="icon"
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Search className={`w-5 h-5 transition-colors duration-200 ${inputFocused ? "text-blue-500" : "text-gray-400"}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setInputFocused(true);
              if (query.trim() && suggestions.length > 0) setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setInputFocused(false), 150)}
            placeholder="Search drugs by name, UNII, or CAS number..."
            className="w-full pl-12 pr-28 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent font-medium"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Right side */}
          <div className="absolute right-3 flex items-center gap-2">
            <AnimatePresence>
              {!query && !inputFocused && (
                <motion.span key="kbd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="hidden sm:flex items-center text-[10px] font-bold text-gray-300 gap-1">
                  <span className="px-1.5 py-0.5 rounded-md border border-gray-200 font-mono">⌘K</span>
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {query && (
                <motion.button key="clear"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 group">
                  <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Autocomplete dropdown ── */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.25, 0, 0, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-black/10 overflow-hidden z-50">

              <div className="h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

              {/* Dropdown header */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Suggestions
                </span>
                <span className="text-[10px] text-gray-300 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> to select
                </span>
              </div>

              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {suggestions.map((item, i) => {
                  const isHl      = i === highlightedIdx;
                  const typeClass = TYPE_COLORS[item.drug_type ?? ""] ?? "bg-gray-50 text-gray-500 border-gray-200";
                  const TypeIcon  = item.drug_type === "BiotechDrug" ? FlaskConical
                                  : item.drug_type === "SmallMoleculeDrug" ? Atom
                                  : Pill;

                  return (
                    <div key={item.drugbank_id ?? item.unii ?? i}
                      onMouseDown={e => { e.preventDefault(); selectSuggestion(item); }}
                      onMouseEnter={() => setHighlightedIdx(i)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 transition-all duration-150
                        ${isHl ? "bg-gradient-to-r from-blue-50 to-green-50/40" : "hover:bg-gray-50/80"}`}>

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                        ${isHl ? "bg-gradient-to-br from-blue-600 to-green-400 shadow-md shadow-blue-200/50" : "bg-blue-50 border border-blue-100"}`}>
                        <TypeIcon className={`w-4 h-4 ${isHl ? "text-white" : "text-blue-500"}`} />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {highlightMatch(item.name, query)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {item.drug_type && (
                            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${typeClass}`}>
                              {item.drug_type.replace("SmallMoleculeDrug", "Small Molecule").replace("Drug", "")}
                            </span>
                          )}
                          {item.unii && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Hash className="w-2.5 h-2.5" />{item.unii}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter indicator */}
                      <AnimatePresence>
                        {isHl && (
                          <motion.div key="enter-hint"
                            initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-extrabold text-blue-500 hidden sm:block">select</span>
                            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                              <CornerDownLeft className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Keyboard hint footer */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="font-mono px-1 py-0.5 rounded border border-gray-300 text-gray-500">↑↓</span> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-mono px-1 py-0.5 rounded border border-gray-300 text-gray-500">Esc</span> close
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Popular panel (shown on focus, no query) ── */}
        <AnimatePresence>
          {showPopularPanel && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-black/10 overflow-hidden z-50">

              <div className="h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

              <div className="p-4">
                {/* Recent */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(r => (
                        <button key={r} onMouseDown={e => { e.preventDefault(); commitSearch(r); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150">
                          <Clock className="w-3 h-3 text-gray-400" />{r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular */}
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(drug => (
                    <button key={drug} onMouseDown={e => { e.preventDefault(); commitSearch(drug); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-400 hover:text-white hover:border-transparent transition-all duration-200">
                      <Pill className="w-3 h-3" />{drug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Searching 17,430+ drugs from DrugBank v5.1
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════
          ERROR
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 mb-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-400" />
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Search Error</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 transition">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          RESULTS HEADER
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {query && totalResults > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md shadow-blue-200/50">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">
                  for <span className="font-bold text-blue-600">"{query}"</span>
                </p>
              </div>
            </div>
            <button onClick={handleClear}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          LOADING SKELETON
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative rounded-2xl border border-gray-100 bg-white overflow-hidden p-5">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-2/3" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/3" style={{ animationDelay: `${i * 0.15}s` }} />
                    <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-3/4" style={{ animationDelay: `${i * 0.2}s` }} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          DRUG CARDS
      ══════════════════════════════════════════════ */}
      {!loading && (
        <div className="space-y-5">
          <AnimatePresence>
            {results.map((drug, i) => (
              <motion.div key={drug.drugbank_ids?.[0]?.id ?? drug.unii ?? drug.name}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, delay: i * 0.04 }}>
                <DrugCard drug={drug} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          NO RESULTS
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNoResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden text-center py-16 px-8">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-extrabold shadow-md shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <X className="w-4 h-4" /> Clear Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          EMPTY STATE (not focused, no query)
      ══════════════════════════════════════════════ */}
      {showEmptyState && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-green-50/20 pointer-events-none" />

          <div className="relative z-10 py-14 px-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-lg shadow-blue-200/60">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">Search the Drug Database</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Covers <span className="font-bold text-gray-600">17,430+ drugs</span> from DrugBank v5.1. Search by name, UNII, or CAS number.
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5 justify-center">
              <TrendingUp className="w-3 h-3" /> Popular Searches
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR.map(drug => (
                <button key={drug}
                  onClick={() => { setQuery(drug); inputRef.current?.focus(); commitSearch(drug); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-sm">
                  <Pill className="w-3 h-3 text-blue-400" />{drug}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            {[
              { n: "17,430+", l: "Total Drugs"  },
              { n: "DrugBank", l: "v5.1 Source"  },
              { n: "Live",     l: "Search API"   },
            ].map(({ n, l }) => (
              <div key={l} className="py-4 text-center">
                <div className="text-sm font-extrabold text-gray-800">{n}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════
          PAGINATION
      ══════════════════════════════════════════════ */}
      {totalPages > 1 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-700">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT, totalResults)}</span>
              {" "}of{" "}
              <span className="font-bold text-gray-700">{totalResults.toLocaleString()}</span> results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNums.map((n, i) =>
              n === "…"
                ? <span key={`e-${i}`} className="text-gray-400 text-sm w-4 text-center select-none">…</span>
                : <button key={n} onClick={() => setPage(n as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === n
                        ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md shadow-blue-200/50"
                        : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    }`}>{n}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}