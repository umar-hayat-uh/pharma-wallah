'use client';

import React from 'react';
import { AMRSummary } from '@/types/amr';
import { Database, Globe2, Bug, Pill, CalendarCheck, CheckCircle2 } from 'lucide-react';

interface AMRStatsProps {
    summary: AMRSummary | null;
}

export const AMRStats: React.FC<AMRStatsProps> = ({ summary }) => {
    if (!summary) return null;

    const stats = [
        {
            label: 'Total Observations',
            value: summary.totalObservations.toLocaleString(),
            icon: Database,
            accent: 'text-teal-700 bg-teal-50',
        },
        {
            label: 'Reporting Entities',
            value: summary.reportingEntitiesCount.toString(),
            icon: Globe2,
            accent: 'text-blue-700 bg-blue-50',
        },
        {
            label: 'Pathogens Tracked',
            value: summary.pathogensCount.toString(),
            icon: Bug,
            accent: 'text-emerald-700 bg-emerald-50',
        },
        {
            label: 'Antibiotics Profiled',
            value: summary.antibioticsCount.toString(),
            icon: Pill,
            accent: 'text-amber-700 bg-amber-50',
        },
        {
            label: 'Coverage Years',
            value: `${summary.yearsAvailable.length} Years (${summary.yearsAvailable.slice().reverse().join('-')})`,
            icon: CalendarCheck,
            accent: 'text-indigo-700 bg-indigo-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {stat.label}
                            </span>
                            <div className={`rounded-lg p-2 ${stat.accent}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
};