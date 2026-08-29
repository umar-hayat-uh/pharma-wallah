'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface TimeAnalysisProps {
    yearsAvailable?: number[];
    totalObservations?: number;
}

export const TimeAnalysis: React.FC<TimeAnalysisProps> = ({
    yearsAvailable = [2023, 2022, 2021, 2020],
    totalObservations = 17914,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-bold text-slate-900">Longitudinal Reporting Timeline</h3>
                <p className="text-xs text-slate-500">
                    WHO GLASS surveillance cadence across 4 active reporting cycles (2020–2023).
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {yearsAvailable.map((yr) => (
                    <div key={yr} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">{yr} Cycle</span>
                            <Calendar className="h-4 w-4 text-teal-700" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            WHO GLASS validated observation set.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};