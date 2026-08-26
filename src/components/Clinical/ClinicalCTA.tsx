"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ClinicalCTA() {
    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Background patterns */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Blurred circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#1C7BD9]/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                        Your clinical toolkit starts here.
                    </h2>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
                        Explore practical pharmacy tools designed for faster, smarter clinical workflows.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="#tools"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#1C7BD9] to-teal-500 text-white font-bold text-sm shadow-lg shadow-[#1C7BD9]/20 hover:shadow-xl hover:shadow-[#1C7BD9]/30 transition-all duration-300 active:scale-95 gap-2"
                        >
                            Explore Clinical Tools
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                            href="https://academia.pharmawallah.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-transparent border-2 border-slate-600 text-slate-300 font-bold text-sm hover:text-white hover:border-slate-400 hover:bg-slate-800 transition-all duration-300 active:scale-95"
                        >
                            Visit PharmaWallah Academia
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}