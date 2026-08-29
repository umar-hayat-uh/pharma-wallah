'use client';

import React from 'react';
import { AMRMatrixData } from '@/types/amr';
import { Grid } from 'lucide-react';

interface AMRMatrixProps {
    matrixData: AMRMatrixData | null;
}

export const AMRMatrix: React.FC<AMRMatrixProps> = ({ matrixData }) => {
    if (!matrixData || matrixData.pathogens.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <Grid className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                    Insufficient data to render the AMR coverage matrix.
                </p>
            </div>
        );
    }

    const { pathogens, antibiotics, cells } = matrixData;
    const hasReportedResistance = cells.some((c) => c.isReported);

    const getCell = (p: string, ab: string) =>
        cells.find((c) => c.pathogen === p && c.antibiotic === ab);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-bold text-slate-900">
                    {hasReportedResistance ? 'Antimicrobial Resistance Matrix' : 'Surveillance Coverage Matrix'}
                </h3>
                <p className="text-xs text-slate-500">
                    {hasReportedResistance
                        ? 'Resistance rates (%) across primary pathogens and antimicrobial classes'
                        : 'Number of reported surveillance observations across pathogen-antibiotic combinations'}
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-slate-800">Pathogen</th>
                            {antibiotics.map((ab) => (
                                <th key={ab} className="px-3 py-3 text-center font-semibold text-slate-700 max-w-[100px] truncate" title={ab}>
                                    {ab}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pathogens.map((pathogen) => (
                            <tr key={pathogen} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-semibold italic text-slate-900 whitespace-nowrap">
                                    {pathogen}
                                </td>
                                {antibiotics.map((ab) => {
                                    const cell = getCell(pathogen, ab);
                                    const count = cell?.observationCount || 0;
                                    const res = cell?.resistantPercent;

                                    return (
                                        <td key={ab} className="px-3 py-2 text-center">
                                            {count === 0 ? (
                                                <span className="text-slate-300">-</span>
                                            ) : cell?.isReported && res != null ? (
                                                <div
                                                    className="mx-auto rounded px-2 py-1 font-bold text-white text-[11px]"
                                                    style={{
                                                        backgroundColor:
                                                            res > 50 ? '#991b1b' : res > 25 ? '#d97706' : '#0f766e',
                                                    }}
                                                >
                                                    {res}%
                                                </div>
                                            ) : (
                                                <div className="mx-auto rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">
                                                    {count}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="font-medium">Legend:</span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-teal-700"></span> Low / Reported
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-slate-200"></span> Observation Volume Only
                </span>
            </div>
        </div>
    );
};