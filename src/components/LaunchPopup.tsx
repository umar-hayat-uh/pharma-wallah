"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Sparkles, ArrowRight, Award, Zap } from "lucide-react";

export default function LaunchPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.12)] border border-slate-100 overflow-hidden transition-all">

        {/* Subtle Decorative Background Gradients */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all z-20"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 relative z-10">

          {/* Top Badge & Trophy Icon */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
              <Sparkles size={12} className="text-amber-500 fill-amber-500" /> Live Event
            </span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Heading Section */}
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Science Fair <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tournament 2026
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Compete with students nationwide and showcase your knowledge.
            </p>
          </div>

          {/* Game Modes Chips */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              ⚡ MCQ Battle
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              🔥 Flashcard Rush
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              🎯 Spotting Challenge
            </span>
          </div>

          {/* Perks Banner */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 mb-6 flex items-center gap-3">
            <Award className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900 font-medium leading-snug">
              Win medals, certificates, trophies & premium platform access.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <a
              href="/tournament/play"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/15 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Register / Enter Code</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="/leaderboard"
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition text-center border border-slate-200/80 text-sm"
            >
              View Live Leaderboard
            </a>
          </div>

          {/* Footer Note */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400">
            <Zap size={12} className="text-amber-500" />
            <span>PharmaWallah Science Fair Tournament · 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
}