"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CommunitySpace } from "@/lib/community/types";
import { CommunityShell } from "../CommunityShell";
import { SpaceIcon, formatCount } from "../kit";

/** Every space, with join buttons — the directory of the community. */
export function SpacesIndex() {
    const { user } = useSupabaseUser();
    const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/spaces");
                const json = await res.json();
                if (cancelled || !res.ok) return;
                setSpaces(json.spaces ?? []);
            } catch {
                toast.error("Could not load the spaces");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    async function toggleJoin(space: CommunitySpace) {
        if (!user) {
            toast.error("Sign in to join a space.");
            return;
        }
        setBusyId(space.id);
        const next = !space.joined;
        setSpaces((prev) =>
            prev.map((s) =>
                s.id === space.id
                    ? { ...s, joined: next, member_count: s.member_count + (next ? 1 : -1) }
                    : s
            )
        );
        try {
            const res = next
                ? await fetch("/api/community/membership", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ space_id: space.id }),
                  })
                : await fetch(`/api/community/membership?space_id=${space.id}`, { method: "DELETE" });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || "Could not update membership");
            }
        } catch (err: any) {
            setSpaces((prev) =>
                prev.map((s) =>
                    s.id === space.id
                        ? { ...s, joined: !next, member_count: s.member_count + (next ? -1 : 1) }
                        : s
                )
            );
            toast.error(err?.message || "Could not update membership");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <CommunityShell>
            <header className="mb-4">
                <h1 className="text-[24px] font-bold text-[#16181d]">Spaces</h1>
                <p className="mt-1 text-[14px] text-[#16181d]/55">
                    Every corner of the syllabus and the job. Join the ones you want in your feed.
                </p>
            </header>

            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-36 animate-pulse rounded-2xl border border-black/[0.08] bg-white" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {spaces.map((space) => (
                        <div
                            key={space.id}
                            className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-4 transition-all hover:border-black/[0.14] hover:shadow-[0_2px_12px_rgba(6,18,36,0.06)]"
                        >
                            <div className="flex items-start gap-3">
                                <SpaceIcon icon={space.icon} accent={space.accent} size={18} />
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/community/s/${space.slug}`}
                                        className="text-[15.5px] font-bold text-[#16181d] transition-colors hover:text-[#1C7BD9]"
                                    >
                                        {space.name}
                                    </Link>
                                    {space.tagline && (
                                        <p className="text-[12.5px] font-medium text-[#16181d]/45">
                                            {space.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {space.description && (
                                <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#16181d]/60">
                                    {space.description}
                                </p>
                            )}

                            <div className="mt-3 flex items-center gap-3 border-t border-black/[0.06] pt-3">
                                <span className="text-[12px] tabular-nums text-[#16181d]/45">
                                    {formatCount(space.member_count)} members
                                </span>
                                <span className="text-[12px] tabular-nums text-[#16181d]/45">
                                    {formatCount(space.post_count)} posts
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleJoin(space)}
                                    disabled={busyId === space.id}
                                    className={`ml-auto rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60 ${
                                        space.joined
                                            ? "border border-black/10 text-[#16181d]/65 hover:bg-black/[0.03]"
                                            : "text-white"
                                    }`}
                                    style={
                                        space.joined
                                            ? undefined
                                            : {
                                                  background:
                                                      "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                                              }
                                    }
                                >
                                    {space.joined ? "Joined" : "Join"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CommunityShell>
    );
}
