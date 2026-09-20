import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityHome } from "@/components/community/pages/CommunityHome";

export const metadata: Metadata = {
    title: "Community — PharmaWallah",
    description:
        "Ask, answer and discuss pharmacy with students and pharmacists: pharmacology, pharmaceutics, clinical practice, calculations, lab work and exams.",
    alternates: { canonical: "/community" },
};

export default function CommunityPage() {
    // The feed reads its sort/filter state from the URL, so it must sit inside a
    // Suspense boundary — useSearchParams opts the subtree into CSR bailout.
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <CommunityHome />
        </Suspense>
    );
}
