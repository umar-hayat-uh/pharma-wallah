'use client';

import React from 'react';
import { ShieldCheck, ExternalLink, BookOpen, AlertTriangle } from 'lucide-react';

export const AMREvidence: React.FC = () => {
    return (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <BookOpen className="h-5 w-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">
                    Evidence, Provenance & Surveillance Standards
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs leading-relaxed text-slate-600">
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Primary Data Repository</h4>
                    <p>
                        Surveillance observations are derived directly from the World Health Organization
                        Global Antimicrobial Resistance and Use Surveillance System (<strong>WHO GLASS</strong>).
                    </p>
                    <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <p className="font-semibold text-slate-700">WHO GLASS Source Indicator</p>
                        <code className="text-teal-800 font-mono text-[11px]">
                            AMR_RESISTANCE_ANTIBIOTIC_BOX
                        </code>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Data Reporting Disclaimer</h4>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-700" />
                            <span>Surveillance Integrity Notice</span>
                        </div>
                        <p>
                            In strict accordance with medical informatics principles, missing observations or AST records are never interpolated, manufactured, or displayed as zero percent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};