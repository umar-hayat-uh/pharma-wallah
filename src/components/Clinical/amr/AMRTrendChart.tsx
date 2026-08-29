'use client';

import React from 'react';
import { AMRTrendPoint } from '@/types/amr';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

interface AMRTrendChartProps {
    data: AMRTrendPoint[];
    contextTitle?: string;
}

export const AMRTrendChart: React.FC<AMRTrendChartProps> = ({ data, contextTitle }) => {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">No trend data available.</p>
            </div>
        );
    }

    const hasReportedResistance = data.some((d) => d.isReported);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        {hasReportedResistance ? 'Resistance Trend (2020–2023)' : 'Surveillance Observation Trend (2020–2023)'}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {contextTitle || 'WHO GLASS Longitudinal Reporting Dynamics'}
                    </p>
                </div>
            </div>

            {/* Chart Container */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569' }} />
                            <YAxis
                                domain={[0, hasReportedResistance ? 100 : 'auto']}
                                unit={hasReportedResistance ? '%' : ''}
                                tick={{ fontSize: 12, fill: '#475569' }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const pt = payload[0].payload as AMRTrendPoint;
                                        return (
                                            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs">
                                                <p className="font-bold text-slate-900">Year {pt.year}</p>
                                                <p className="mt-1 text-slate-600">
                                                    {hasReportedResistance
                                                        ? `Reported Resistance: ${pt.resistantPercent !== null ? `${pt.resistantPercent}%` : 'Not reported'}`
                                                        : `Observations: ${pt.observationCount.toLocaleString()}`}
                                                </p>
                                                <p className="text-slate-500">Reporting Entities: {pt.reportingEntities}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={hasReportedResistance ? 'resistantPercent' : 'observationCount'}
                                stroke={hasReportedResistance ? '#0f766e' : '#2563eb'}
                                strokeWidth={3}
                                dot={{ r: 5, fill: hasReportedResistance ? '#0f766e' : '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Year over Year Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.map((pt) => (
                    <div key={pt.year} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{pt.year}</span>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                            {pt.isReported && pt.resistantPercent !== null
                                ? `${pt.resistantPercent}%`
                                : `${pt.observationCount.toLocaleString()} obs`}
                        </p>
                        <span className="text-[11px] text-slate-400">
                            {pt.reportingEntities} reporting entities
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};