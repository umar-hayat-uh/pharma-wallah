'use client';

import React from 'react';
import { ShieldCheck, Database, Calendar, HelpCircle, Activity } from 'lucide-react';

interface AMRHeaderProps {
    onOpenDisclaimer: () => void;
    totalRecords?: number;
}

export const AMRHeader: React.FC<AMRHeaderProps> = ({ onOpenDisclaimer, totalRecords }) => {
    return (
        <header className="border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                    AMR Surveillance Explorer
                                </h1>
                                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                                    WHO GLASS
                                </span>
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            Antimicrobial resistance surveillance intelligence across pathogens, antibiotics, specimens, and reporting years.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium">
                            <Database className="h-3.5 w-3.5 text-teal-700" />
                            <span>{totalRecords ? `${totalRecords.toLocaleString()} Records` : '17,914 Records'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-blue-700" />
                            <span>2020 – 2023 Coverage</span>
                        </div>

                        <button
                            onClick={onOpenDisclaimer}
                            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            title="Clinical Disclaimer & Evidence"
                        >
                            <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                            <span>Clinical Disclaimer</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};