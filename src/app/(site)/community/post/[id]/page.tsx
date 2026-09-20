import type { Metadata } from "next";
import { Suspense } from "react";
import { PostView } from "@/components/community/pages/PostView";

export const metadata: Metadata = {
    title: "Post — PharmaWallah Community",
    description: "A discussion in the PharmaWallah pharmacy community.",
};

export default function PostPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <PostView postId={params.id} />
        </Suspense>
    );
}
