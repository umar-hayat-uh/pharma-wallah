// components/DrugSearch.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import DrugCard from "@/components/DrugCard";
import type { Drug, AutocompleteItem } from "@/types/drugs";

export default function DrugSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drug[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const limit = 10;
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------- FULL SEARCH ---------------- */

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, pageNum: number) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=${limit}`,
        );
        const data = await res.json();

        if (data.success) {
          setResults(data.data);
          setTotalResults(data.pagination.total);
        } else {
          setError(data.message || "Search failed");
        }
      } catch {
        setError("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    }, 500),
    [],
  );

  /* ---------------- AUTOCOMPLETE ---------------- */

  const debouncedAutocomplete = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(value)}`,
        );
        const data = await res.json();

        if (data.success) {
          setSuggestions(data.data);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error("Autocomplete error:", e);
      }
    }, 300),
    [],
  );

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    debouncedSearch(query, page);
    return () => debouncedSearch.cancel();
  }, [query, page, debouncedSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(1);
    debouncedAutocomplete(value);
  };

  const selectSuggestion = (item: AutocompleteItem) => {
    setQuery(item.name);
    setShowDropdown(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    debouncedSearch(item.name, 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setTotalResults(0);
    setPage(1);
    setShowDropdown(false);
  };

  const totalPages = Math.ceil(totalResults / limit);

  /* ---------------- RENDER ---------------- */

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 relative">
      {/* SEARCH INPUT */}
      <div className="mb-8 relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for drugs (name, UNII, CAS number)..."
          className="w-full p-4 pl-12 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all"
        />

        {/* CLEAR BUTTON */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}

        {/* SEARCH/LOADING ICON */}
        <div className="absolute left-4 top-4 text-gray-400">
          {loading ? (
            <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full" />
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* AUTOCOMPLETE DROPDOWN */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {suggestions.map((item, index) => (
              <li
                key={item.drugbank_id || item.unii || index}
                onMouseDown={() => selectSuggestion(item)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {item.drug_type} {item.unii && `• UNII: ${item.unii}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* RESULTS COUNT */}
      {query && totalResults > 0 && (
        <div className="mb-6 text-gray-600">
          Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "
          {query}"
        </div>
      )}

      {/* RESULTS */}
      <div className="space-y-8">
        {results.map((drug) => (
          <DrugCard
            key={drug.drugbank_ids?.[0]?.id || drug.unii || drug.name}
            drug={drug}
          />
        ))}
      </div>

      {/* NO RESULTS */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No drugs found for "{query}". Try a different search term.
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalResults)} of {totalResults} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
