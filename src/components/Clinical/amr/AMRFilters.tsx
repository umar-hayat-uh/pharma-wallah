'use client';

import React from 'react';
import { AMRFilters, AMRFilterOptions } from '@/types/amr';
import { RotateCcw } from 'lucide-react';

interface AMRFiltersProps {
    filters: AMRFilters;
    filterOptions: AMRFilterOptions | null;
    onFilterChange: (newFilters: Partial<AMRFilters>) => void;
    onReset: () => void;
}

export const AMRFiltersComponent: React.FC<AMRFiltersProps> = ({
    filters,
    filterOptions,
    onFilterChange,
    onReset,
}) => {
    const hasActiveFilters = Boolean(
        filters.country || filters.pathogen || filters.antibiotic || filters.specimen || filters.year
    );

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {/* Country Filter */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Country / Region
                    </label>
                    <select
                        value={filters.country || ''}
                        onChange={(e) => onFilterChange({ country: e.target.value || undefined })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                        <option value="">All Countries & Regions</option>
                        {filterOptions?.countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pathogen Filter */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Pathogen
                    </label>
                    <select
                        value={filters.pathogen || ''}
                        onChange={(e) => onFilterChange({ pathogen: e.target.value || undefined })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm italic text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                        <option value="" className="not-italic">All Pathogens</option>
                        {filterOptions?.pathogens.map((p) => (
                            <option key={p.name} value={p.name}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Antibiotic Filter */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Antibiotic
                    </label>
                    <select
                        value={filters.antibiotic || ''}
                        onChange={(e) => onFilterChange({ antibiotic: e.target.value || undefined })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                        <option value="">All Antibiotics</option>
                        {filterOptions?.antibiotics.map((a) => (
                            <option key={a.name} value={a.name}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Specimen Filter */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Specimen Type
                    </label>
                    <select
                        value={filters.specimen || ''}
                        onChange={(e) => onFilterChange({ specimen: e.target.value || undefined })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                        <option value="">All Specimens</option>
                        {filterOptions?.specimens.map((s) => (
                            <option key={s.name} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Reporting Year
                    </label>
                    <select
                        value={filters.year || ''}
                        onChange={(e) =>
                            onFilterChange({
                                year: e.target.value ? parseInt(e.target.value, 10) : undefined,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                        <option value="">All Years (2020–2023)</option>
                        {filterOptions?.years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Auxiliary bar: Include regions & Reset */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                    <input
                        type="checkbox"
                        checked={Boolean(filters.includeRegions)}
                        onChange={(e) => onFilterChange({ includeRegions: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Include WHO Aggregate Regions (WPR, EMR, EUR, etc.)</span>
                </label>

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 transition-colors"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset All Filters</span>
                    </button>
                )}
            </div>
        </div>
    );
};