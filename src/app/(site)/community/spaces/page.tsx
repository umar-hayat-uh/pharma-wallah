import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { SpacesIndex } from "@/components/community/pages/SpacesIndex";

export const metadata: Metadata = pageMeta({
  title: "Spaces — PharmaWallah Community",
  description:
    "Every space in the PharmaWallah community: pharmacology, pharmaceutics, clinical pharmacy, calculations, lab work, exams and careers.",
  path: "/community/spaces",
});

export default function SpacesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <SpacesIndex />
        </Suspense>
    );
}
