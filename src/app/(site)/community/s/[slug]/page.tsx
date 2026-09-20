import type { Metadata } from "next";
import { Suspense } from "react";
import { SpaceView } from "@/components/community/pages/SpaceView";

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    // The space's real name lives in the database; deriving a readable title
    // from the slug keeps this a static render with no request-time fetch.
    const name = params.slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return {
        title: `${name} — PharmaWallah Community`,
        description: `Discussion, questions and notes on ${name.toLowerCase()} from pharmacy students and pharmacists.`,
        alternates: { canonical: `/community/s/${params.slug}` },
    };
}

export default function SpacePage({ params }: { params: { slug: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfcfa]" />}>
            <SpaceView slug={params.slug} />
        </Suspense>
    );
}
