"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function CommunityError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter();

    useEffect(() => {
        console.error("Community section error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white max-w-md w-full rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                <p className="text-sm text-slate-500 mb-6">
                    We hit an unexpected error loading this page. You can try again, or head back to the community feed.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm rounded-2xl px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
                    >
                        <RotateCcw size={16} />
                        Try again
                    </button>
                    <button
                        onClick={() => router.push("/community")}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-600 font-bold text-sm rounded-2xl px-5 py-2.5 transition-colors"
                    >
                        <Home size={16} />
                        Community
                    </button>
                </div>
            </div>
        </div>
    );
}