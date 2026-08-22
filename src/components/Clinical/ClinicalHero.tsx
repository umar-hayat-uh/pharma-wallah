"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, HeartPulse } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function ClinicalHero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-68px)] flex items-center overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-3xl z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left max-w-2xl"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                PharmaWallah Clinical
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C7BD9] to-teal-500">Clinical Tools.</span>
              <br />
              Smarter Decisions.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-500 mb-8 max-w-xl leading-relaxed">
              A growing ecosystem of practical clinical pharmacy tools designed to help pharmacists and healthcare professionals analyze medicines, assess therapy, and make informed clinical decisions.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="#tools"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#1C7BD9] to-teal-500 text-white font-bold text-sm shadow-lg shadow-[#1C7BD9]/20 hover:shadow-xl hover:shadow-[#1C7BD9]/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Explore Clinical Tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://pharmawallah.com"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-[#1C7BD9]/30 hover:text-[#1C7BD9] transition-all duration-300 flex items-center justify-center"
              >
                Explore PharmaWallah
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center"
          >
            {/* Floating Card 1 */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 backdrop-blur-xl bg-white/90"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C7BD9]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CrCl</p>
                <p className="text-sm font-bold text-slate-900">82 mL/min</p>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 -right-6 z-20 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 backdrop-blur-xl bg-white/90"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">INR</p>
                <p className="text-sm font-bold text-slate-900">2.4 <span className="text-teal-500 text-xs">(Target 2-3)</span></p>
              </div>
            </motion.div>

            {/* Main Dashboard Container */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-[#1C7BD9]/10 border border-slate-800 flex flex-col z-10"
            >
              {/* Top Window Bar */}
              <div className="h-12 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-medium text-slate-300">Clinical Workspace • Live</span>
                </div>
                <div className="w-12" /> {/* Spacer for centering */}
              </div>

              {/* Dashboard Content */}
              <div className="p-4 grid grid-cols-2 gap-4 flex-1 bg-slate-900">
                
                {/* Left Panel */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Patient Medications</h3>
                  
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-medium text-slate-700">Metformin 500mg</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-medium text-slate-700">Lisinopril 10mg</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-medium text-slate-700">Atorvastatin 20mg</span>
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-medium text-slate-700">Warfarin 5mg</span>
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>

                {/* Right Panel */}
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Interaction Analysis</h3>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-semibold text-slate-800 mb-2">Warfarin + Atorvastatin</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                      Moderate Risk
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-semibold text-slate-800 mb-2">Metformin + Lisinopril</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Low Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="bg-slate-800/80 px-4 py-3 flex items-center justify-between text-[11px] font-medium text-slate-400 border-t border-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">●</span> Risk Score: 3/10
                </div>
                <div>
                  Monitoring: Active
                </div>
                <div>
                  Last Updated: Just now
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}