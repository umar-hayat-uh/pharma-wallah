"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { PenSquare } from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CommunitySpace } from "@/lib/community/types";
import { CommunityShell, SpaceCard } from "../CommunityShell";
import { Feed } from "../Feed";
import { SpaceIcon, formatCount } from "../kit";

/** One space: its banner, its feed, and join/leave. */
export function SpaceView({ slug }: { slug: string }) {
    const { user } = useSupabaseUser();
    const [space, setSpace] = useState<CommunitySpace | null>(null);
    const [loading, setLoading] = useState(true);
    const [joinBusy, setJoinBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/spaces");
                const json = await res.json();
                if (cancelled || !res.ok) return;
                setSpace((json.spaces ?? []).find((s: CommunitySpace) => s.slug === slug) ?? null);
            } catch {
                toast.error("Could not load this space");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    async function toggleJoin() {
        if (!space) return;
        if (!user) {
            toast.error("Sign in to join a space.");
            return;
        }
        setJoinBusy(true);
        const next = !space.joined;
        // Optimistic: the member count moves with the button, then rolls back
        // together with it if the request fails.
        setSpace((s) =>
            s ? { ...s, joined: next, member_count: s.member_count + (next ? 1 : -1) } : s
        );
        try {
            const res = next
                ? await fetch("/api/community/membership", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ space_id: space.id }),
                  })
                : await fetch(`/api/community/membership?space_id=${space.id}`, { method: "DELETE" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || "Could not update membership");
        } catch (err: any) {
            setSpace((s) =>
                s ? { ...s, joined: !next, member_count: s.member_count + (next ? -1 : 1) } : s
            );
            toast.error(err?.message || "Could not update membership");
        } finally {
            setJoinBusy(false);
        }
    }

    if (!loading && !space) {
        return (
            <CommunityShell>
                <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                    <p className="text-[18px] font-bold text-[#16181d]">No such space</p>
                    <p className="mt-1 text-[14px] text-[#16181d]/55">
                        This space doesn't exist — it may have been renamed.
                    </p>
                    <Link
                        href="/community/spaces"
                        className="mt-4 inline-flex rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        Browse all spaces
                    </Link>
                </div>
            </CommunityShell>
        );
    }

    return (
        <CommunityShell
            activeSpaceSlug={slug}
            right={space ? <SpaceCard space={space} onToggleJoin={toggleJoin} busy={joinBusy} /> : null}
        >
            {/* Banner */}
            {space && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                    <div
                        className="h-20 sm:h-24"
                        style={{
                            background: `linear-gradient(120deg, ${space.accent}, color-mix(in srgb, ${space.accent} 40%, #21B67A))`,
                        }}
                    />
                    <div className="flex flex-wrap items-end gap-3 p-4">
                        <span className="-mt-12 inline-flex rounded-2xl bg-white p-1.5 shadow-sm">
                            <SpaceIcon icon={space.icon} accent={space.accent} size={26} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-[22px] font-bold leading-tight text-[#16181d]">
                                {space.name}
                            </h1>
                            <p className="text-[13px] text-[#16181d]/55">
                                {formatCount(space.member_count)} members ·{" "}
                                {formatCount(space.post_count)} posts
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={toggleJoin}
                                disabled={joinBusy}
                                className={`rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-colors disabled:opacity-60 ${
                                    space.joined
                                        ? "border border-black/10 text-[#16181d]/70 hover:bg-black/[0.03]"
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
                            <Link
                                href={`/community/submit?space=${space.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-[13.5px] font-semibold text-[#16181d]/70 transition-colors hover:bg-black/[0.03]"
                            >
                                <PenSquare size={15} /> Post
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <Feed
                spaceSlug={slug}
                emptyTitle={space ? `Nothing in ${space.name} yet` : "Nothing here yet"}
                emptyBody="Be the first to post here — an empty space fills up once one person starts."
            />
        </CommunityShell>
    );
}
