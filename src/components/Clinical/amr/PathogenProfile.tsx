'use client';

import React from 'react';
import { PathogenProfileData } from '@/types/amr';
import { Bug, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PathogenProfileProps {
    profile: PathogenProfileData | null;
}

export const PathogenProfile: React.FC<PathogenProfileProps> = ({ profile }) => {
    if (!profile) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <Bug className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                    Select a pathogen to view comprehensive surveillance profile.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold italic text-slate-900">{profile.pathogen}</h3>
                    <p className="text-xs text-slate-500">Pathogen Surveillance & Sensitivity Landscape</p>
                </div>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    {profile.totalObservations.toLocaleString()} Observations
                </span>
            </div>

            {/* Top Antibiotics Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                    Top Profiled Antimicrobial Agents
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profile.antibioticDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};