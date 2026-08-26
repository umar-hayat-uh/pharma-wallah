"use client";

import { useEffect, useRef, useState } from "react";

interface AutocompleteSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (finalValue: string) => void;
    suggestUrl: (query: string) => string;
    extractSuggestions: (data: unknown) => string[];
    placeholder: string;
    loading: boolean;
    accentColor: string;
}

/**
 * Debounced autocomplete input, shared by both the Drug Finder and
 * Adverse Effect Detector search bars. Keyboard-navigable (up/down/enter/escape).
 */
export function AutocompleteSearch({
    value,
    onChange,
    onSubmit,
    suggestUrl,
    extractSuggestions,
    placeholder,
    loading,
    accentColor,
}: AutocompleteSearchProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(suggestUrl(value.trim()));
                const data = await res.json();
                const names = extractSuggestions(data);
                setSuggestions(names);
                setOpen(names.length > 0);
                setActiveIndex(-1);
            } catch {
                setSuggestions([]);
                setOpen(false);
            }
        }, 250);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function pick(name: string) {
        onChange(name);
        setOpen(false);
        onSubmit(name);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            pick(suggestions[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className="autocomplete" ref={containerRef}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    onSubmit(value);
                }}
                className="search-bar"
            >
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    aria-label="Drug name"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    autoComplete="off"
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Searching…" : "Search"}
                </button>
            </form>

            {open && (
                <ul className="suggestions" role="listbox">
                    {suggestions.map((s, i) => (
                        <li key={s} role="option" aria-selected={i === activeIndex}>
                            <button
                                type="button"
                                className={i === activeIndex ? "active" : ""}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    pick(s);
                                }}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <style jsx>{`
        .autocomplete {
          position: relative;
        }
        .search-bar {
          display: flex;
          gap: 0.6rem;
        }
        .search-bar input {
          flex: 1;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          border: 1.5px solid #d5dbd8;
          font-size: 1rem;
          background: white;
        }
        .search-bar input:focus {
          outline: 2px solid ${accentColor};
          outline-offset: 1px;
          border-color: ${accentColor};
        }
        .search-bar button {
          padding: 0.85rem 1.4rem;
          background: ${accentColor};
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .search-bar button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .search-bar button:focus-visible {
          outline: 2px solid #12201b;
          outline-offset: 2px;
        }
        .suggestions {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 6.5rem;
          background: white;
          border: 1px solid #dde3e0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(20, 30, 27, 0.08);
          list-style: none;
          margin: 0;
          padding: 0.35rem;
          z-index: 20;
          max-height: 260px;
          overflow-y: auto;
        }
        .suggestions li {
          margin: 0;
        }
        .suggestions button {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 0.55rem 0.7rem;
          border-radius: 6px;
          font-size: 0.92rem;
          cursor: pointer;
          text-transform: capitalize;
          color: #1c2a25;
        }
        .suggestions button:hover,
        .suggestions button.active {
          background: #f1f5f3;
        }
      `}</style>
        </div>
    );
}