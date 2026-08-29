'use client';

import React, { useState, useMemo } from 'react';
import { AntibioticComparisonItem } from '@/types/amr';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from 'recharts';
import { Pill, Search, SlidersHorizontal } from 'lucide-react';

interface AntibioticComparisonProps {
    data: AntibioticComparisonItem[];
    selectedPathogen?: string;
}

// Custom YAxis Tick to prevent text overlapping and handle long drug names
const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const rawText: string = payload.value || '';

    // Truncate cleanly if longer than 22 characters for chart aesthetics
    const displayText = rawText.length > 22 ? `${rawText.slice(0, 20)}…` : rawText;

    return (
        <g transform={`translate(${x},${y})`}>
            <title>{rawText}</title>
            <text
                x={-10}
                y={4}
                textAnchor="end"
                fill="#334155"
                fontSize={12}
                fontWeight={500}
                className="font-sans select-none"
            >
                {displayText}
            </text>
        </g>
    );
};

export const AntibioticComparison: React.FC<AntibioticComparisonProps> = ({
    data,
    selectedPathogen,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState<number>(12);

    const filteredData = useMemo(() => {
        if (!data) return [];
        let items = data;
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            items = items.filter((d) => d.antibiotic.toLowerCase().includes(q));
        }
        return items;
    }, [data, searchTerm]);

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <Pill className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                    No antibiotic comparison data available for this context.
                </p>
            </div>
        );
    }

    const hasReportedResistance = data.some((d) => d.isReported);
    const chartData = displayLimit === 0 ? filteredData : filteredData.slice(0, displayLimit);

    // Calculate dynamic height based on the number of items (42px per item + padding)
    const dynamicHeight = Math.max(320, chartData.length * 42);

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Antibiotic Comparison {selectedPathogen ? `for ${selectedPathogen}` : ''}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {hasReportedResistance
                            ? 'Reported resistance percentage across profiled antimicrobials'
                            : 'Surveillance observation frequency by antibiotic (Resistance % not reported in source)'}
                    </p>
                </div>

                {/* View Limit Selector & Quick Search */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter drugs..."
                            className="h-8 w-36 sm:w-44 rounded-md border border-slate-200 bg-white pl-8 pr-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
                        <button
                            onClick={() => setDisplayLimit(10)}
                            className={`rounded px-2 py-1 font-medium transition-colors ${displayLimit === 10 ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Top 10
                        </button>
                        <button
                            onClick={() => setDisplayLimit(20)}
                            className={`rounded px-2 py-1 font-medium transition-colors ${displayLimit === 20 ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Top 20
                        </button>
                        <button
                            onClick={() => setDisplayLimit(0)}
                            className={`rounded px-2 py-1 font-medium transition-colors ${displayLimit === 0 ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            All ({filteredData.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {chartData.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                        No antibiotics matching <span className="font-semibold">"{searchTerm}"</span>
                    </div>
                ) : (
                    <div style={{ height: `${dynamicHeight}px`, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 10, right: 40, left: 10, bottom: 20 }}
                                barCategoryGap="22%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis
                                    type="number"
                                    domain={[0, hasReportedResistance ? 100 : 'auto']}
                                    unit={hasReportedResistance ? '%' : ''}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="antibiotic"
                                    width={185}
                                    interval={0}
                                    tick={<CustomYAxisTick />}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload as AntibioticComparisonItem;
                                            return (
                                                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs min-w-[200px]">
                                                    <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5">
                                                        <Pill className="h-3.5 w-3.5 text-teal-700" />
                                                        <span>{item.antibiotic}</span>
                                                    </div>
                                                    <div className="space-y-1 text-slate-600">
                                                        <p className="flex justify-between">
                                                            <span>{hasReportedResistance ? 'Resistance Rate:' : 'Observations:'}</span>
                                                            <span className="font-semibold text-slate-800">
                                                                {hasReportedResistance
                                                                    ? item.resistantPercent !== null
                                                                        ? `${item.resistantPercent}%`
                                                                        : 'Not reported'
                                                                    : item.observationCount.toLocaleString()}
                                                            </span>
                                                        </p>
                                                        {item.interpretableAST !== null && item.interpretableAST !== undefined && (
                                                            <p className="flex justify-between">
                                                                <span>Interpretable AST:</span>
                                                                <span className="font-mono text-slate-700">
                                                                    {item.interpretableAST.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey={hasReportedResistance ? 'resistantPercent' : 'observationCount'}
                                    radius={[0, 4, 4, 0]}
                                    barSize={18}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={hasReportedResistance ? '#0f766e' : '#0284c7'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Sortable Reference Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Antibiotic Agent</th>
                            <th className="px-4 py-3 text-right">Observation Volume</th>
                            <th className="px-4 py-3 text-right">Interpretable AST</th>
                            <th className="px-4 py-3 text-right">Resistance Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((row) => (
                            <tr key={row.antibiotic} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-900">{row.antibiotic}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                                    {row.observationCount.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                                    {row.interpretableAST ? row.interpretableAST.toLocaleString() : 'Not reported'}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    {row.isReported && row.resistantPercent !== null ? (
                                        <span className="font-bold text-teal-800">{row.resistantPercent}%</span>
                                    ) : (
                                        <span className="text-slate-400 italic">Not reported</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};