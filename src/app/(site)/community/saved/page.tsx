import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedView } from "@/components/community/pages/SavedView";

export const metadata: Metadata = {
    title: "Saved — PharmaWallah Community",
    description: "Posts you saved in the PharmaWallah community.",
    // A private, per-member list has nothing to offer a crawler.
    robots: { index: false, follow: false },
};

export default function SavedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <SavedView />
        </Suspense>
    );
}
