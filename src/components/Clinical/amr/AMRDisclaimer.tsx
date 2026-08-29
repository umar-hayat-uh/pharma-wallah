'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AMRDisclaimerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AMRDisclaimer: React.FC<AMRDisclaimerProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-teal-800 font-bold">
                        <AlertCircle className="h-5 w-5" />
                        <span>PharmaWallah Clinical Disclaimer</span>
                    </div>
                    <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
                    <p>
                        This tool provides epidemiological surveillance and educational information derived from <strong>WHO GLASS</strong> data.
                    </p>
                    <p>
                        It is <strong>not a substitute</strong> for patient-specific clinical assessment, local hospital antibiograms, laboratory culture reports, antimicrobial susceptibility testing (AST), or professional clinical judgment.
                    </p>
                    <p className="font-semibold text-slate-800">
                        Do not initiate, adjust, or discontinue antimicrobial therapy based solely on aggregate surveillance data.
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition-colors"
                    >
                        I Understand & Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};