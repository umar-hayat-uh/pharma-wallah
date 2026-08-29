'use client';

import React, { useState } from 'react';
import { AMRFilterOptions } from '@/types/amr';
import { ArrowRightLeft } from 'lucide-react';
import { getGeographicClassification } from '@/lib/amr/constants';

interface AMRCompareProps {
    filterOptions: AMRFilterOptions | null;
}

export const AMRCompare: React.FC<AMRCompareProps> = ({ filterOptions }) => {
    const [countryA, setCountryA] = useState('PAK');
    const [countryB, setCountryB] = useState('IND');
    const [pathogen, setPathogen] = useState('Escherichia coli');
    const [antibiotic, setAntibiotic] = useState('Imipenem');

    const geoA = getGeographicClassification(countryA);
    const geoB = getGeographicClassification(countryB);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-bold text-slate-900">Side-by-Side Entity Comparison</h3>
                <p className="text-xs text-slate-500">
                    Compare surveillance patterns and coverage between two sovereign reporting jurisdictions.
                </p>
            </div>

            {/* Selector Controls */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Entity A (Primary)
                    </label>
                    <select
                        value={countryA}
                        onChange={(e) => setCountryA(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
                    >
                        {filterOptions?.countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Entity B (Comparative)
                    </label>
                    <select
                        value={countryB}
                        onChange={(e) => setCountryB(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
                    >
                        {filterOptions?.countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Comparative Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-base font-bold text-slate-900">
                            {geoA.flag} {geoA.label}
                        </h4>
                        <span className="text-xs font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                            {countryA}
                        </span>
                    </div>
                    <div className="mt-4 space-y-3 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Source:</span>
                            <span className="font-semibold text-slate-800">WHO GLASS</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Reporting Years:</span>
                            <span className="font-semibold text-slate-800">2020 – 2023</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-500">Resistance Status:</span>
                            <span className="text-amber-700 font-semibold">Observation verified (WHO indicators)</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-base font-bold text-slate-900">
                            {geoB.flag} {geoB.label}
                        </h4>
                        <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                            {countryB}
                        </span>
                    </div>
                    <div className="mt-4 space-y-3 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Source:</span>
                            <span className="font-semibold text-slate-800">WHO GLASS</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Reporting Years:</span>
                            <span className="font-semibold text-slate-800">2020 – 2023</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-500">Resistance Status:</span>
                            <span className="text-amber-700 font-semibold">Observation verified (WHO indicators)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};