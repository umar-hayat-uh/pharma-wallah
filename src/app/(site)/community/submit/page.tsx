import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { Submit } from "@/components/community/pages/Submit";

export const metadata: Metadata = pageMeta({
    title: "Create a post — PharmaWallah Community",
    description: "Ask a question or start a discussion in the PharmaWallah pharmacy community.",
    path: "/community/submit",
});

export default function SubmitPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <Submit />
        </Suspense>
    );
}
