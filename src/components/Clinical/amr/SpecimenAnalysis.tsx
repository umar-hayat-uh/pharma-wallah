'use client';

import React from 'react';
import { SpecimenAnalysisData } from '@/types/amr';
import { TestTube2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SpecimenAnalysisProps {
    data: SpecimenAnalysisData | null;
}

export const SpecimenAnalysis: React.FC<SpecimenAnalysisProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Specimen Analysis: {data.specimen}
                    </h3>
                    <p className="text-xs text-slate-500">
                        Clinical isolate distribution across specimen types in WHO GLASS repository
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                    Predominant Pathogens Isolated in {data.specimen}
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topPathogens} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#334155' }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0369a1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};