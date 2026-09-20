"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PenSquare, Sparkles } from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CommunitySpace } from "@/lib/community/types";
import { CommunityShell } from "../CommunityShell";
import { Feed } from "../Feed";
import { Avatar, SpaceIcon, formatCount } from "../kit";

/**
 * The community front page: one feed across every space, plus a composer entry
 * and the "what is this" context a first-time visitor needs.
 */
export function CommunityHome() {
    const { user } = useSupabaseUser();
    const [spaces, setSpaces] = useState<CommunitySpace[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/spaces");
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) setSpaces(json.spaces ?? []);
            } catch {
                /* context card only */
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const busiest = [...spaces].sort((a, b) => b.post_count - a.post_count).slice(0, 6);

    return (
        <CommunityShell right={<TopSpacesCard spaces={busiest} />}>
            <ComposerEntry signedIn={!!user} />
            <Feed
                emptyTitle="No posts yet"
                emptyBody="This is day one. Ask the question you were going to search for — someone here has met it before."
            />
        </CommunityShell>
    );
}

/** The "what do you want to ask?" row that opens the composer. */
function ComposerEntry({ signedIn }: { signedIn: boolean }) {
    return (
        <div className="mb-3 rounded-2xl border border-black/[0.08] bg-white p-3">
            <div className="flex items-center gap-2.5">
                <Avatar name={null} size={34} />
                <Link
                    href={signedIn ? "/community/submit" : "/signin?redirect=/community/submit"}
                    className="flex-1 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2.5 text-[13.5px] text-[#16181d]/40 transition-colors hover:border-[#1C7BD9]/40 hover:bg-white"
                >
                    Ask a question or share something pharmacy…
                </Link>
                <Link
                    href={signedIn ? "/community/submit" : "/signin?redirect=/community/submit"}
                    aria-label="Create a post"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                        background:
                            "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                    }}
                >
                    <PenSquare size={17} />
                </Link>
            </div>
        </div>
    );
}

function TopSpacesCard({ spaces }: { spaces: CommunitySpace[] }) {
    if (spaces.length === 0) return null;
    return (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#1C7BD9]" />
                <h3 className="text-[13px] font-bold text-[#16181d]">Busiest spaces</h3>
            </div>
            <div className="mt-3 space-y-0.5">
                {spaces.map((s, i) => (
                    <Link
                        key={s.id}
                        href={`/community/s/${s.slug}`}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-black/[0.03]"
                    >
                        <span className="w-4 text-[12px] font-bold tabular-nums text-[#16181d]/30">
                            {i + 1}
                        </span>
                        <SpaceIcon icon={s.icon} accent={s.accent} size={13} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#16181d]/80">
                            {s.name}
                        </span>
                        <span className="text-[11.5px] tabular-nums text-[#16181d]/40">
                            {formatCount(s.post_count)}
                        </span>
                    </Link>
                ))}
            </div>
            <Link
                href="/community/spaces"
                className="mt-2 block rounded-xl border border-black/10 py-2 text-center text-[12.5px] font-semibold text-[#16181d]/65 transition-colors hover:bg-black/[0.03]"
            >
                Browse all spaces
            </Link>
        </div>
    );
}
