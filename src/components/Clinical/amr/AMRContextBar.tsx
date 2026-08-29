'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { AMRFilters } from '@/types/amr';
import { getGeographicClassification } from '@/lib/amr/constants';

interface AMRContextBarProps {
    filters: AMRFilters;
    onRemoveFilter: (key: keyof AMRFilters) => void;
    onClearAll: () => void;
}

export const AMRContextBar: React.FC<AMRContextBarProps> = ({
    filters,
    onRemoveFilter,
    onClearAll,
}) => {
    const activeTags: { key: keyof AMRFilters; label: string; value: string }[] = [];

    if (filters.country) {
        const geo = getGeographicClassification(filters.country);
        activeTags.push({ key: 'country', label: 'Country', value: `${geo.flag} ${geo.label}` });
    }
    if (filters.pathogen) {
        activeTags.push({ key: 'pathogen', label: 'Pathogen', value: filters.pathogen });
    }
    if (filters.antibiotic) {
        activeTags.push({ key: 'antibiotic', label: 'Antibiotic', value: filters.antibiotic });
    }
    if (filters.specimen) {
        activeTags.push({ key: 'specimen', label: 'Specimen', value: filters.specimen });
    }
    if (filters.year) {
        activeTags.push({ key: 'year', label: 'Year', value: String(filters.year) });
    }

    if (activeTags.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/50 p-2.5 text-xs">
            <div className="flex items-center gap-1 text-teal-800 font-semibold uppercase tracking-wider">
                <Filter className="h-3.5 w-3.5" />
                <span>Surveillance Context:</span>
            </div>

            {activeTags.map((tag) => (
                <span
                    key={tag.key}
                    className="inline-flex items-center gap-1 rounded-md border border-teal-300 bg-white px-2.5 py-1 font-medium text-slate-800 shadow-xs"
                >
                    <span className="text-slate-500">{tag.label}:</span>
                    <span className="font-semibold text-teal-900">{tag.value}</span>
                    <button
                        onClick={() => onRemoveFilter(tag.key)}
                        className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}

            <button
                onClick={onClearAll}
                className="ml-auto text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2"
            >
                Clear All
            </button>
        </div>
    );
};