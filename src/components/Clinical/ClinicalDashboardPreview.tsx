"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Activity } from 'lucide-react';

export default function ClinicalDashboardPreview() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        See the clinical workspace in action
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-4">
                        A preview of the integrated clinical environment we are building.
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={containerVariants}
                >
                    {/* Top Bar */}
                    <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-white/70 text-sm font-medium tracking-wide">
                            Clinical Workspace
                        </div>
                        <div>
                            <span className="px-2 py-1 bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest rounded">
                                Preview
                            </span>
                        </div>
                    </div>

                    {/* Panels Container */}
                    <div className="flex flex-col lg:flex-row">

                        {/* Left Panel - Medication Profile */}
                        <motion.div variants={itemVariants} className="w-full lg:w-1/4 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Patient Profile</h3>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">ID: PW-2847</span>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Metformin 500mg</div>
                                        <div className="text-xs text-slate-500 mt-0.5">2x daily</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Warfarin 5mg</div>
                                        <div className="text-xs text-slate-500 mt-0.5">1x daily</div>
                                        <div className="text-[10px] text-amber-700 font-medium mt-1">Needs monitoring</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Lisinopril 10mg</div>
                                        <div className="text-xs text-slate-500 mt-0.5">1x daily</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Atorvastatin 20mg</div>
                                        <div className="text-xs text-slate-500 mt-0.5">1x daily</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Omeprazole 20mg</div>
                                        <div className="text-xs text-slate-500 mt-0.5">1x daily</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Middle Panel - Analysis */}
                        <motion.div variants={itemVariants} className="w-full lg:flex-1 bg-slate-50 p-5 lg:p-8">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#1C7BD9]" />
                                Clinical Analysis
                            </h3>

                            <div className="space-y-4">
                                {/* Interaction Card */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-slate-700">Interaction Status</span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Moderate Risk
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-900">
                                        Warfarin + Atorvastatin
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Increased risk of bleeding due to CYP3A4 inhibition. Monitor INR closely.
                                    </div>
                                </div>

                                {/* Dose Verification */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-slate-700">Dose Verification</span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Within Range
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-900">
                                        Metformin 500mg BID
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                    Appropriate for current renal function (eGFR `{'>'}` 30 mL/min required).
                                    </div>
                                </div>

                                {/* Grid for Params and Risk */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="block text-sm font-semibold text-slate-700 mb-3">Monitoring Parameters</span>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                <span className="text-slate-500">INR</span>
                                                <span className="font-medium text-slate-900">2.4 <span className="text-slate-400 text-xs font-normal">(Target 2-3)</span></span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                                <span className="text-slate-500">CrCl</span>
                                                <span className="font-medium text-slate-900">82 mL/min</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">HbA1c</span>
                                                <span className="font-medium text-slate-900">7.1%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                        <span className="block text-sm font-semibold text-slate-700 mb-3">Risk Indicators</span>
                                        <div className="mt-auto mb-2 text-sm text-slate-700 font-medium">Overall risk: <span className="text-amber-600 font-bold">Low-Moderate</span></div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-green-500 w-1/3"></div>
                                            <div className="h-full bg-yellow-400 w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Panel - Insights */}
                        <motion.div variants={itemVariants} className="w-full lg:w-1/4 bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-5">
                            <h3 className="font-bold text-slate-900 mb-6">Clinical Insights</h3>
                            <div className="space-y-3">
                                <div className="bg-white rounded-lg border-l-4 border-l-amber-500 border-y border-r border-slate-100 shadow-sm p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                            Monitor INR weekly due to Warfarin-Atorvastatin interaction.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border-l-4 border-l-emerald-500 border-y border-r border-slate-100 shadow-sm p-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                            Renal function adequate for current Metformin dose.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border-l-4 border-l-blue-500 border-y border-r border-slate-100 shadow-sm p-3">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                            Consider gastroprotection review — Omeprazole long-term use.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        Clinical Workspace · Preview
                    </span>
                    <p className="text-xs text-slate-400 mt-4">
                        This is a static visualization of the clinical workspace experience under development.
                    </p>
                </motion.div>

            </div>
        </section>
    );
}