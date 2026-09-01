"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Sparkles, ArrowRight, Stethoscope, Zap } from "lucide-react";

export default function LaunchBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const openTimer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  const close = () => {
    setVisible(false);
    setTimeout(() => setIsOpen(false), 220);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-slate-900/45 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
        }`}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-3xl max-w-md w-full shadow-[0_24px_60px_rgba(15,_98,_254,_0.16)] border border-slate-100 overflow-hidden transition-all duration-300 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-[0.98]"
          }`}
      >
        {/* Animated gradient top edge — signature motion moment */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-green-400 to-blue-600 bg-[length:200%_100%] animate-[bannerFlow_4s_ease-in-out_infinite]" />

        {/* Soft floating glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100 rounded-full blur-2xl pointer-events-none animate-[float_7s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-green-100 rounded-full blur-2xl pointer-events-none animate-[float_8s_ease-in-out_infinite_1.5s]" />

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all z-20"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 relative z-10">
          {/* Live badge + animated trophy */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live now
            </span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Science Fair <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Rapid Pharmacy Quiz
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Think fast, answer correctly, and win a prize! Play the PharmaWallah Rapid Pharmacy Quiz now.
            </p>
          </div>

          {/* Format chips */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              10 Questions
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              10 Seconds Each
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
              Win 8/10
            </span>
          </div>

          {/* Clinical cross-link */}
          <div className="bg-green-50/60 border border-green-100 rounded-xl p-3.5 mb-6 flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-xs text-green-900 font-medium leading-snug">
              Also new: <span className="font-semibold">PharmaWallah Clinical</span>, our case-based clinical pharmacy hub.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <a
              href="/pw"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold rounded-xl shadow-md shadow-blue-500/15 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Play Rapid Quiz</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="/clinical"
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition text-center border border-slate-200/80 text-sm flex items-center justify-center gap-1.5"
            >
              <Stethoscope size={14} className="text-green-600" />
              Clinical
            </a>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400">
            <Zap size={12} className="text-blue-500" />
            <span>PharmaWallah Rapid Pharmacy Quiz · Live · 2026</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bannerFlow {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}