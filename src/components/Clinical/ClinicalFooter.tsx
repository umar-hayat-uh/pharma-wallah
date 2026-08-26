"use client";

import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";

export default function ClinicalFooter() {
    return (
        <footer className="bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Section */}
                <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1C7BD9] to-teal-500 flex items-center justify-center shadow-md">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#1C7BD9] transition-colors">
                                PharmaWallah <span className="text-[#1C7BD9] font-black">Clinical</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                            Clinical pharmacy tools and resources for the next generation of healthcare professionals.
                        </p>
                    </div>

                    {/* Clinical Tools */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Clinical</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Clinical Tools</Link></li>
                            <li><Link href="/encyclopedia" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Pharmacopedia</Link></li>
                            <li><Link href="/calculation-tools" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Calculators</Link></li>
                            <li><Link href="/antibiogram-simulator" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Antibiogram</Link></li>
                        </ul>
                    </div>

                    {/* PharmaWallah */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">PharmaWallah</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="https://academia.pharmawallah.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">
                                    Academia
                                </Link>
                            </li>
                            <li><Link href="/about-us" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">About</Link></li>
                            <li><Link href="/contact" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Terms of Use</Link></li>
                            <li><Link href="#disclaimer" className="text-sm text-slate-500 hover:text-[#1C7BD9] transition-colors">Medical Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer Bar */}
                <div id="disclaimer" className="py-5 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl p-4 flex gap-3 items-start border border-slate-100">
                        <ShieldCheck className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            <strong className="font-semibold text-slate-700">Medical Disclaimer:</strong> PharmaWallah Clinical is an educational and decision-support platform. Its tools are not a substitute for professional clinical judgment, institutional protocols, or official prescribing information. Always verify information with primary literature and adhere to local guidelines.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">
                        © 2026 PharmaWallah. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                        Built with purpose for pharmacy professionals
                    </p>
                </div>

            </div>
        </footer>
    );
}