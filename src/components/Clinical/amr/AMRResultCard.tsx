'use client';

import React from 'react';
import { AMRRecord } from '@/types/amr';
import { getGeographicClassification } from '@/lib/amr/constants';
import { formatResistanceValue, formatIsolates } from '@/lib/amr/utils';
import { ShieldCheck, AlertCircle, Info, Database } from 'lucide-react';

interface AMRResultCardProps {
    record: AMRRecord | null;
    totalFilteredCount: number;
}

export const AMRResultCard: React.FC<AMRResultCardProps> = ({ record, totalFilteredCount }) => {
    if (!record) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-center py-6">
                    <Database className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-800">Select a Surveillance Target</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Use the search bar or filters above to view clinical pathogen-antibiotic surveillance observations.
                    </p>
                </div>
            </div>
        );
    }

    const geo = getGeographicClassification(record.country_iso3);
    const isReported = record.resistant_percent !== null && record.resistant_percent !== undefined;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                            Core Surveillance Result
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {record.id}</span>
                    </div>

                    <div className="mt-2">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="italic">{record.pathogen}</span>
                            <span className="text-slate-400 font-normal">/</span>
                            <span className="text-teal-800">{record.antibiotic}</span>
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 font-medium">
                            {geo.flag} {geo.label} &bull; Specimen: <span className="font-semibold text-slate-800">{record.specimen}</span> &bull; Year: <span className="font-semibold text-slate-800">{record.year}</span>
                        </p>
                    </div>
                </div>

                {/* Resistance Status Metric Box */}
                <div className="flex flex-col items-start md:items-end justify-center rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 min-w-[200px]">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Resistance Rate
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                        {isReported ? (
                            <>
                                <span className="text-3xl font-extrabold text-teal-900">
                                    {formatResistanceValue(record.resistant_percent)}
                                </span>
                                {record.resistant_percent_lower !== null && record.resistant_percent_upper !== null && (
                                    <span className="text-xs text-slate-500">
                                        CI: [{record.resistant_percent_lower}% - {record.resistant_percent_upper}%]
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                                <AlertCircle className="h-4 w-4" />
                                Not reported in WHO source
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Metadata Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Interpretable AST</span>
                    <p className="mt-1 text-base font-bold text-slate-800">
                        {formatIsolates(record.interpretable_ast)}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Total Pathogen Isolates</span>
                    <p className="mt-1 text-base font-bold text-slate-800">
                        {formatIsolates(record.total_pathogen_isolates)}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Source Repository</span>
                    <p className="mt-1 text-base font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        {record.source || 'WHO GLASS'}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-xs text-slate-500 font-medium">Geographic Tier</span>
                    <p className="mt-1 text-base font-bold text-slate-800">
                        {record.geographic_type || geo.type}
                    </p>
                </div>
            </div>

            {/* Source Provenance Notice */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                        Source Indicator:{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 font-mono text-[11px]">
                            {record.source_indicator || 'AMR_RESISTANCE_ANTIBIOTIC_BOX'}
                        </code>
                    </span>
                </div>
                <span>{totalFilteredCount} matching records found</span>
            </div>
        </div>
    );
};