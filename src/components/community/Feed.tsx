"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    Flame,
    LayoutList,
    Rows3,
    Search,
    Sparkles,
    TrendingUp,
    Clock,
    Loader2,
    Inbox,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useCommunityVote } from "@/hooks/useCommunityVote";
import type { CommunityPost } from "@/lib/community/types";
import { FEED_SORTS, TOP_RANGES, type FeedSort } from "@/lib/community/constants";
import { PostCard } from "./PostCard";

const SORT_META: Record<FeedSort, { label: string; icon: typeof Flame }> = {
    hot: { label: "Hot", icon: Flame },
    new: { label: "New", icon: Sparkles },
    top: { label: "Top", icon: TrendingUp },
    rising: { label: "Rising", icon: Clock },
};

type FeedProps = {
    /** Restrict to one space. Omitted on the front page. */
    spaceSlug?: string;
    /** "Saved" view — requires a signed-in member. */
    savedOnly?: boolean;
    emptyTitle?: string;
    emptyBody?: string;
};

export function Feed({ spaceSlug, savedOnly, emptyTitle, emptyBody }: FeedProps) {
    const { user } = useSupabaseUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // The feed's state lives in the URL, so a sort or a search is shareable and
    // the back button steps through them — the old page kept it in useState and
    // lost it on every navigation.
    const sort = (searchParams.get("sort") as FeedSort) ?? "hot";
    const range = searchParams.get("range") ?? "week";
    const tag = searchParams.get("tag");
    const kind = searchParams.get("kind");
    const unanswered = searchParams.get("unanswered") === "1";
    const query = searchParams.get("q") ?? "";

    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [nextPage, setNextPage] = useState<number | null>(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [density, setDensity] = useState<"card" | "compact">("card");
    const [searchDraft, setSearchDraft] = useState(query);

    const { vote, pending } = useCommunityVote(!!user);

    // Density is a per-reader preference, not page state — remembered locally.
    useEffect(() => {
        try {
            const saved = localStorage.getItem("pw-community-density");
            if (saved === "compact" || saved === "card") setDensity(saved);
        } catch {
            // Private browsing / blocked storage — the default is fine.
        }
    }, []);

    useEffect(() => setSearchDraft(query), [query]);

    const buildUrl = useCallback(
        (page: number) => {
            const p = new URLSearchParams();
            p.set("sort", sort);
            p.set("page", String(page));
            if (sort === "top") p.set("range", range);
            if (spaceSlug) p.set("space", spaceSlug);
            if (tag) p.set("tag", tag);
            if (kind) p.set("kind", kind);
            if (unanswered) p.set("unanswered", "1");
            if (query) p.set("q", query);
            if (savedOnly) p.set("saved", "1");
            return `/api/community/posts?${p.toString()}`;
        },
        [sort, range, spaceSlug, tag, kind, unanswered, query, savedOnly]
    );

    // A request id guards against a slow first page overwriting a fast second
    // filter — the same race the encyclopedia hit (MEMORY gotcha 73's neighbour).
    const requestId = useRef(0);

    useEffect(() => {
        const id = ++requestId.current;
        setLoading(true);
        setPosts([]);
        (async () => {
            try {
                const res = await fetch(buildUrl(1));
                const json = await res.json();
                if (id !== requestId.current) return;
                if (!res.ok) throw new Error(json.error || "Could not load the feed");
                setPosts(json.posts ?? []);
                setNextPage(json.next_page ?? null);
            } catch (err: any) {
                if (id !== requestId.current) return;
                toast.error(err?.message || "Could not load the feed");
                setPosts([]);
                setNextPage(null);
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        })();
    }, [buildUrl]);

    const loadMore = useCallback(async () => {
        if (nextPage === null || loadingMore) return;
        setLoadingMore(true);
        const id = requestId.current;
        try {
            const res = await fetch(buildUrl(nextPage));
            const json = await res.json();
            if (id !== requestId.current) return;
            if (!res.ok) throw new Error(json.error || "Could not load more");
            // De-duplicate: a post that moved between pages while the member was
            // reading would otherwise appear twice with the same React key.
            setPosts((prev) => {
                const seen = new Set(prev.map((p) => p.id));
                return [...prev, ...(json.posts ?? []).filter((p: CommunityPost) => !seen.has(p.id))];
            });
            setNextPage(json.next_page ?? null);
        } catch (err: any) {
            toast.error(err?.message || "Could not load more");
        } finally {
            setLoadingMore(false);
        }
    }, [buildUrl, nextPage, loadingMore]);

    // Infinite scroll, with an explicit button underneath as the fallback for
    // keyboard and screen-reader users (an observer alone strands them).
    const sentinel = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = sentinel.current;
        if (!node || nextPage === null) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "600px" }
        );
        io.observe(node);
        return () => io.disconnect();
    }, [loadMore, nextPage]);

    function setParam(next: Record<string, string | null>) {
        const p = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(next)) {
            if (value === null) p.delete(key);
            else p.set(key, value);
        }
        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }

    function patchPost(id: string, patch: Partial<CommunityPost>) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }

    async function deletePost(id: string) {
        try {
            const res = await fetch(`/api/community/posts/${id}`, { method: "DELETE" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || "Could not delete");
            setPosts((prev) => prev.filter((p) => p.id !== id));
            toast.success("Post deleted");
        } catch (err: any) {
            toast.error(err?.message || "Could not delete the post");
        }
    }

    return (
        <div>
            {/* ── Controls ─────────────────────────────────────────────── */}
            <div className="mb-3 rounded-2xl border border-black/[0.08] bg-white p-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {FEED_SORTS.map((s) => {
                        const { label, icon: Icon } = SORT_META[s];
                        const active = sort === s;
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setParam({ sort: s })}
                                aria-pressed={active}
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                                    active
                                        ? "bg-[#1C7BD9]/10 text-[#1C7BD9]"
                                        : "text-[#16181d]/60 hover:bg-black/[0.04] hover:text-[#16181d]"
                                }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}

                    <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
                        {sort === "top" && (
                            <select
                                value={range}
                                onChange={(e) => setParam({ range: e.target.value })}
                                aria-label="Top of what period"
                                className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/70 outline-none focus:border-[#1C7BD9]"
                            >
                                {TOP_RANGES.map((r) => (
                                    <option key={r} value={r}>
                                        {r === "all" ? "All time" : `This ${r}`}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                const next = density === "card" ? "compact" : "card";
                                setDensity(next);
                                try {
                                    localStorage.setItem("pw-community-density", next);
                                } catch {
                                    /* storage unavailable — preference is per-session then */
                                }
                            }}
                            aria-label={density === "card" ? "Switch to compact view" : "Switch to card view"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#16181d]/50 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
                        >
                            {density === "card" ? <Rows3 size={16} /> : <LayoutList size={16} />}
                        </button>
                    </div>
                </div>

                {/* Search + filters */}
                <form
                    className="mt-2 flex items-center gap-2 border-t border-black/[0.06] pt-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setParam({ q: searchDraft.trim() || null });
                    }}
                >
                    <div className="relative flex-1">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#16181d]/35"
                        />
                        <input
                            value={searchDraft}
                            onChange={(e) => setSearchDraft(e.target.value)}
                            placeholder={spaceSlug ? "Search this space" : "Search the community"}
                            aria-label="Search posts"
                            className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-[13px] text-[#16181d] outline-none transition-colors focus:border-[#1C7BD9]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setParam({ unanswered: unanswered ? null : "1", kind: null })}
                        aria-pressed={unanswered}
                        className={`shrink-0 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                            unanswered
                                ? "bg-[#21B67A]/15 text-[#128257]"
                                : "border border-black/10 text-[#16181d]/60 hover:bg-black/[0.04]"
                        }`}
                    >
                        Unanswered
                    </button>
                </form>

                {(tag || query || kind) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-black/[0.06] pt-2 text-[12px]">
                        <span className="text-[#16181d]/50">Filtered by</span>
                        {tag && <FilterChip label={`#${tag}`} onClear={() => setParam({ tag: null })} />}
                        {kind && <FilterChip label={kind} onClear={() => setParam({ kind: null })} />}
                        {query && (
                            <FilterChip label={`"${query}"`} onClear={() => setParam({ q: null })} />
                        )}
                    </div>
                )}
            </div>

            {/* ── Feed ─────────────────────────────────────────────────── */}
            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 animate-pulse rounded-2xl border border-black/[0.08] bg-white"
                        />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                    <Inbox className="mx-auto mb-3 text-[#16181d]/20" size={40} />
                    <p className="text-[16px] font-bold text-[#16181d]">
                        {emptyTitle ?? "Nothing here yet"}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#16181d]/55">
                        {emptyBody ??
                            (query
                                ? "No post matches that search. Try a different term, or clear the filter."
                                : "Be the first to start a discussion here.")}
                    </p>
                    {!savedOnly && (
                        <Link
                            href={spaceSlug ? `/community/submit?space=${spaceSlug}` : "/community/submit"}
                            className="mt-4 inline-flex items-center rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white"
                            style={{
                                background:
                                    "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                            }}
                        >
                            Create a post
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            density={density}
                            showSpace={!spaceSlug}
                            votePending={pending[post.id]}
                            onVote={(direction) =>
                                vote(
                                    "post",
                                    post.id,
                                    direction,
                                    post.user_vote,
                                    post.score,
                                    ({ score, user_vote }) =>
                                        patchPost(post.id, { score, user_vote })
                                )
                            }
                            onSaveChange={(saved) => patchPost(post.id, { saved })}
                            onDelete={() => deletePost(post.id)}
                        />
                    ))}

                    <div ref={sentinel} aria-hidden className="h-px" />

                    {nextPage !== null && (
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white py-3 text-[13px] font-semibold text-[#16181d]/60 transition-colors hover:bg-black/[0.02] disabled:opacity-60"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" /> Loading…
                                </>
                            ) : (
                                "Load more posts"
                            )}
                        </button>
                    )}

                    {nextPage === null && posts.length > 6 && (
                        <p className="py-6 text-center text-[13px] text-[#16181d]/40">
                            That's everything here.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-full bg-[#1C7BD9]/10 px-2.5 py-1 font-semibold text-[#1C7BD9] transition-colors hover:bg-[#1C7BD9]/15"
        >
            {label}
            <span aria-hidden className="text-[14px] leading-none">
                ×
            </span>
            <span className="sr-only">Clear this filter</span>
        </button>
    );
}
