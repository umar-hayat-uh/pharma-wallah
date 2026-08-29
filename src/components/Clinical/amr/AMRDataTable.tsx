'use client';

import React from 'react';
import { AMRRecord } from '@/types/amr';
import { getGeographicClassification } from '@/lib/amr/constants';
import { formatResistanceValue, formatIsolates } from '@/lib/amr/utils';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface AMRDataTableProps {
    records: AMRRecord[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onExportCSV: () => void;
    onExportJSON: () => void;
}

export const AMRDataTable: React.FC<AMRDataTableProps> = ({
    records,
    totalRecords,
    currentPage,
    pageSize,
    onPageChange,
    onExportCSV,
    onExportJSON,
}) => {
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-slate-50/50">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Surveillance Observations</h3>
                    <p className="text-xs text-slate-500">
                        Showing {records.length} of {totalRecords.toLocaleString()} normalized records
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>CSV</span>
                    </button>
                    <button
                        onClick={onExportJSON}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>JSON</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                        <tr>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3">Country / Region</th>
                            <th className="px-4 py-3">Pathogen</th>
                            <th className="px-4 py-3">Antibiotic</th>
                            <th className="px-4 py-3">Specimen</th>
                            <th className="px-4 py-3 text-right">Interpretable AST</th>
                            <th className="px-4 py-3 text-right">Reported Resistance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map((r) => {
                            const geo = getGeographicClassification(r.country_iso3);
                            return (
                                <tr key={r.id} className="hover:bg-slate-50/80">
                                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.year}</td>
                                    <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                                        {geo.flag} {geo.label}
                                    </td>
                                    <td className="px-4 py-2.5 italic text-slate-800">{r.pathogen}</td>
                                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.antibiotic}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{r.specimen}</td>
                                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                                        {formatIsolates(r.interpretable_ast)}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        {r.resistant_percent !== null && r.resistant_percent !== undefined ? (
                                            <span className="font-bold text-teal-800">
                                                {formatResistanceValue(r.resistant_percent)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Not reported</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Bar */}
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs bg-slate-50/50">
                <span className="text-slate-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="rounded border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="rounded border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};