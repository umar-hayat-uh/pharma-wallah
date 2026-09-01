import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function OfficialLaunchBanner() {
    return (
        <Link
            href="/pw"
            className="group relative block w-full pt-6 overflow-hidden bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Science Fair 2026 — Play the PharmaWallah Rapid Pharmacy Quiz"
        >
            {/* Dynamic background gradient base */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />

            {/* Ambient background blur circles */}
            <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-400/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-400/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />

            {/* Main Content */}
            <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-white sm:gap-3 sm:py-3">
                {/* Pill Badge */}
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-white backdrop-blur-md shadow-sm transition-colors group-hover:bg-white/20">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                    <span>Official Launch</span>
                </span>

                {/* Headline text */}
                <p className="truncate text-xs font-medium tracking-tight text-white/95 sm:text-sm md:text-base">
                    <span className="font-semibold text-white">Science Fair 2026</span>
                    <span className="mx-1.5 hidden opacity-60 sm:inline">•</span>
                    <span className="hidden sm:inline">Play the PharmaWallah Rapid Pharmacy Quiz</span>
                </p>

                {/* CTA Icon & Text Indicator */}
                <div className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-white sm:text-sm">
                    <span className="hidden md:inline underline-offset-4 group-hover:underline">Play Now</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}