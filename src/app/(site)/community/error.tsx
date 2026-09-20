"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

/**
 * Error boundary for every /community route.
 *
 * Most failures here are the community tables not existing yet — the schema
 * ships as `supabase/migrations/20260920_community.sql` and has to be applied
 * by hand — so the copy names that possibility rather than showing a bare
 * "something went wrong", which would send the reader hunting.
 */
export default function CommunityError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Community section error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fcfcfa] px-4">
            <div className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <h2 className="text-[20px] font-bold text-[#16181d]">Something went wrong</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#16181d]/55">
                    We hit an unexpected error loading the community. Try again, or head back to the
                    feed.
                </p>

                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-95"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        <RotateCcw size={15} />
                        Try again
                    </button>
                    <Link
                        href="/community"
                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-5 py-2.5 text-[14px] font-semibold text-[#16181d]/65 transition-colors hover:bg-black/[0.03]"
                    >
                        <Home size={15} />
                        Community
                    </Link>
                </div>
            </div>
        </div>
    );
}
