import type { Metadata } from "next";
import { Suspense } from "react";
import { PostView } from "@/components/community/pages/PostView";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isValidUUID } from "@/lib/community/pure";

const FALLBACK: Metadata = {
    title: "Post — PharmaWallah Community",
    description: "A discussion in the PharmaWallah pharmacy community.",
};

/**
 * Each post's own title and an excerpt of its body. The post itself renders on
 * the client, so without this every post shared one static title — to a crawler,
 * one page repeated. Anon client: RLS decides visibility, the same as the feed.
 * Any failure falls back to the generic title rather than failing the page.
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    if (!isValidUUID(params.id)) return FALLBACK;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from("community_posts")
            .select("title, body, is_deleted")
            .eq("id", params.id)
            .maybeSingle();
        if (!data || data.is_deleted) return { ...FALLBACK, robots: { index: false, follow: true } };

        const excerpt = String(data.body ?? "").replace(/[#*_>`\[\]()!]/g, "").replace(/\s+/g, " ").trim();
        const title = `${data.title} — PharmaWallah Community`;
        const description = excerpt
            ? excerpt.length > 155 ? `${excerpt.slice(0, 152).trimEnd()}…` : excerpt
            : FALLBACK.description!;
        return { title, description, openGraph: { title, description, type: "article" } };
    } catch {
        return FALLBACK;
    }
}

export default function PostPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <PostView postId={params.id} />
        </Suspense>
    );
}
