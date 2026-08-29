'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Globe, Bug, Pill } from 'lucide-react';
import { AMRFilterOptions } from '@/types/amr';

interface AMRSearchProps {
    filterOptions: AMRFilterOptions | null;
    onSelectResult: (type: 'country' | 'pathogen' | 'antibiotic', value: string) => void;
    onSearchQuerySubmit?: (q: string) => void;
}

export const AMRSearch: React.FC<AMRSearchProps> = ({
    filterOptions,
    onSelectResult,
    onSearchQuerySubmit,
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const normalizedQuery = query.toLowerCase().trim();

    const matchedCountries = (filterOptions?.countries || [])
        .filter(
            (c) =>
                c.name.toLowerCase().includes(normalizedQuery) ||
                c.code.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 4);

    const matchedPathogens = (filterOptions?.pathogens || [])
        .filter((p) => p.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 4);

    const matchedAntibiotics = (filterOptions?.antibiotics || [])
        .filter((a) => a.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 4);

    const hasResults =
        normalizedQuery.length > 0 &&
        (matchedCountries.length > 0 || matchedPathogens.length > 0 || matchedAntibiotics.length > 0);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearchQuerySubmit?.(query);
                            setIsOpen(false);
                        }
                    }}
                    placeholder="Search by pathogen (e.g. E. coli), antibiotic (e.g. Imipenem), or country..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && hasResults && (
                <div className="absolute z-40 mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 shadow-lg divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {/* Countries */}
                    {matchedCountries.length > 0 && (
                        <div className="px-3 py-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                <Globe className="h-3.5 w-3.5 text-blue-600" />
                                <span>Countries & Regions</span>
                            </div>
                            <div className="space-y-0.5">
                                {matchedCountries.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            onSelectResult('country', c.code);
                                            setQuery('');
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-medium text-slate-800">{c.name}</span>
                                        <span className="text-xs text-slate-400 font-mono">{c.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pathogens */}
                    {matchedPathogens.length > 0 && (
                        <div className="px-3 py-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                <Bug className="h-3.5 w-3.5 text-teal-600" />
                                <span>Pathogens</span>
                            </div>
                            <div className="space-y-0.5">
                                {matchedPathogens.map((p) => (
                                    <button
                                        key={p.name}
                                        onClick={() => {
                                            onSelectResult('pathogen', p.name);
                                            setQuery('');
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-medium italic text-slate-800">{p.name}</span>
                                        <span className="text-xs text-slate-400">{p.count} records</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Antibiotics */}
                    {matchedAntibiotics.length > 0 && (
                        <div className="px-3 py-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                <Pill className="h-3.5 w-3.5 text-amber-600" />
                                <span>Antibiotics</span>
                            </div>
                            <div className="space-y-0.5">
                                {matchedAntibiotics.map((a) => (
                                    <button
                                        key={a.name}
                                        onClick={() => {
                                            onSelectResult('antibiotic', a.name);
                                            setQuery('');
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-medium text-slate-800">{a.name}</span>
                                        <span className="text-xs text-slate-400">{a.count} records</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};