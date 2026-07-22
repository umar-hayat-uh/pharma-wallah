"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useVote } from "@/hooks/useVote";
import { useCachedFetch } from "@/hooks/Usecachedfetch";
import ActionsMenu from "@/components/community/ActionsMenu";
import { formatDistanceToNow } from "date-fns";
import {
    MessageSquare,
    TrendingUp,
    Search,
    PenSquare,
    ArrowBigUp,
    ArrowBigDown,
    Share2,
    UserCircle2,
    Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TAGS = [
    "pharmacology",
    "biochemistry",
    "physiology",
    "clinical",
    "calculations",
    "drug-interactions",
];

type QuestionListItem = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    score: number;
    answers_count: number;
    user_vote: "up" | "down" | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
};

export default function CommunityPage() {
    return (
        <Suspense fallback={<CommunityFeedSkeleton />}>
            <CommunityFeedInner />
        </Suspense>
    );
}

function CommunityFeedSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto space-y-4 pt-2">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-40 shadow-sm"
                    />
                ))}
            </div>
        </div>
    );
}

function CommunityFeedInner() {
    const { user } = useSupabaseUser();
    const { vote, pending } = useVote(!!user);
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("posted");

    // ---- Hydration safety: delay client‑only values until after mount ----
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Build share URL only after mount – otherwise fall back to empty string
    const getShareUrl = (questionId: string) =>
        mounted ? `${window.location.origin}/community/question/${questionId}` : "";

    const [page, setPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const limit = 10;

    const cacheKey = `questions:p${page}:t${selectedTag ?? "all"}`;
    const { data, setData, loading, isRevalidating, error } = useCachedFetch<{
        questions: QuestionListItem[];
        total: number;
    }>(
        cacheKey,
        async () => {
            const url = `/api/qa/questions?page=${page}&limit=${limit}${selectedTag ? `&tag=${selectedTag}` : ""
                }`;
            const res = await fetch(url);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load questions");
            return { questions: json.questions || [], total: json.total || 0 };
        },
        [page, selectedTag]
    );

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    useEffect(() => {
        if (!highlightId) return;
        const t = setTimeout(() => router.replace("/community"), 4000);
        return () => clearTimeout(t);
    }, [highlightId, router]);

    const questions = data?.questions ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    function handleVote(q: QuestionListItem, direction: "up" | "down") {
        vote(q.id, "question", direction, q.user_vote, (delta) => {
            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        questions: prev.questions.map((item) =>
                            item.id === q.id
                                ? {
                                    ...item,
                                    score: item.score + delta,
                                    user_vote:
                                        item.user_vote === direction ? null : direction,
                                }
                                : item
                        ),
                    }
                    : prev
            );
        });
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/qa/questions/${id}`, { method: "DELETE" });
            if (!res.ok)
                throw new Error((await res.json()).error || "Failed to delete");
            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        questions: prev.questions.filter((q) => q.id !== id),
                        total: prev.total - 1,
                    }
                    : prev
            );
            toast.success("Question deleted");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete question");
        }
    }

    return (
        <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4 pt-10 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto flex gap-6 justify-center">
                {/* LEFT SIDEBAR - Desktop Only */}
                <aside className="hidden md:block w-44 shrink-0">
                    <div className="sticky top-6">
                        <Link
                            href="/community/ask"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 hover:shadow-lg text-white px-4 py-2.5 rounded-2xl font-extrabold text-sm mb-6 transition-all shadow-md w-max"
                        >
                            <PenSquare size={16} />
                            Ask Question
                        </Link>

                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-2 tracking-wide">
                            Spaces & Tags
                        </h3>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => {
                                    setSelectedTag(null);
                                    setPage(1);
                                }}
                                className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedTag
                                    ? "bg-blue-50 text-blue-700 font-bold"
                                    : "hover:bg-gray-100 text-slate-600"
                                    }`}
                            >
                                All Questions
                            </button>
                            {TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedTag(tag);
                                        setPage(1);
                                    }}
                                    className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${selectedTag === tag
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-gray-100 text-slate-600"
                                        }`}
                                >
                                    {tag.replace("-", " ")}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN FEED */}
                <main className="flex-1 max-w-2xl w-full min-w-0">
                    {highlightId && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl px-4 py-3 mb-4">
                            <Sparkles size={16} />
                            Your question was posted — it's live below.
                        </div>
                    )}

                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden mb-4 shadow-sm">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                        <div className="flex items-center gap-3 p-4">
                            {/* Avatar: always show placeholder until mounted, then use real avatar */}
                            {mounted && user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <UserCircle2 className="w-9 h-9 text-gray-400" />
                            )}
                            <Link
                                href={user ? "/community/ask" : "/signin"}
                                className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors rounded-full px-4 py-2.5 text-sm text-slate-400 text-left border border-gray-200"
                            >
                                What do you want to ask or share?
                            </Link>
                        </div>
                    </div>

                    {/* Mobile: Ask button + scrollable tags */}
                    <div className="md:hidden mb-3">
                        <Link
                            href="/community/ask"
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white px-4 py-2.5 rounded-2xl font-extrabold text-sm mb-3 shadow-md w-full"
                        >
                            <PenSquare size={16} />
                            Ask Question
                        </Link>
                        <div className="flex overflow-x-auto gap-2 pb-1 -mx-3 px-3 scrollbar-hide">
                            <button
                                onClick={() => {
                                    setSelectedTag(null);
                                    setPage(1);
                                }}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!selectedTag
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-gray-300"
                                    }`}
                            >
                                All
                            </button>
                            {TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedTag(selectedTag === tag ? null : tag);
                                        setPage(1);
                                    }}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${selectedTag === tag
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-600 border-gray-300"
                                        }`}
                                >
                                    {tag.replace("-", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feed */}
                    <div
                        className={`space-y-4 transition-opacity ${isRevalidating ? "opacity-60" : "opacity-100"
                            }`}
                    >
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-40 shadow-sm"
                                />
                            ))
                        ) : questions.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-slate-400 shadow-sm">
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="font-semibold text-slate-500">
                                    No questions found
                                </p>
                                <p className="text-sm mt-1">
                                    Be the first to ask in this space!
                                </p>
                            </div>
                        ) : (
                            questions.map((q: QuestionListItem) => (
                                <div
                                    key={q.id}
                                    className={`relative rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all ${q.id === highlightId
                                        ? "border-emerald-300 ring-2 ring-emerald-100"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {q.profiles?.avatar_url ? (
                                                    <img
                                                        src={q.profiles.avatar_url}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <UserCircle2 className="w-8 h-8 text-gray-400" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-slate-800">
                                                        {q.profiles?.full_name || "Anonymous"}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {formatDistanceToNow(new Date(q.created_at), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <ActionsMenu
                                                isOwner={!!user && user.id === q.user_id}
                                                shareUrl={getShareUrl(q.id)}
                                                onDelete={() => handleDelete(q.id)}
                                                deleteLabel="this question"
                                            />
                                        </div>

                                        <Link
                                            href={`/community/question/${q.id}`}
                                            className="block group"
                                        >
                                            <h2 className="font-display text-lg font-bold mb-1 group-hover:text-blue-700 transition-colors text-slate-900 leading-snug">
                                                {q.title}
                                            </h2>
                                            <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                {q.content}
                                            </p>
                                        </Link>

                                        {q.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {q.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-slate-50 rounded-full border border-gray-200">
                                                    <button
                                                        onClick={() => handleVote(q, "up")}
                                                        disabled={pending[q.id]}
                                                        aria-pressed={q.user_vote === "up"}
                                                        aria-label="Upvote"
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 rounded-l-full border-r border-gray-200 transition-colors disabled:opacity-50 ${q.user_vote === "up"
                                                            ? "text-blue-600 bg-blue-50"
                                                            : "text-slate-500"
                                                            }`}
                                                    >
                                                        <ArrowBigUp
                                                            size={18}
                                                            className={
                                                                q.user_vote === "up"
                                                                    ? "fill-blue-600 text-blue-600"
                                                                    : "text-blue-500"
                                                            }
                                                        />
                                                        <span className="text-sm font-bold">
                                                            {q.score ?? 0}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote(q, "down")}
                                                        disabled={pending[q.id]}
                                                        aria-pressed={q.user_vote === "down"}
                                                        aria-label="Downvote"
                                                        className={`px-3 py-1.5 hover:bg-gray-200 rounded-r-full transition-colors disabled:opacity-50 ${q.user_vote === "down"
                                                            ? "text-red-600 bg-red-50"
                                                            : "text-slate-500"
                                                            }`}
                                                    >
                                                        <ArrowBigDown
                                                            size={18}
                                                            className={
                                                                q.user_vote === "down"
                                                                    ? "fill-red-600 text-red-600"
                                                                    : ""
                                                            }
                                                        />
                                                    </button>
                                                </div>

                                                <Link
                                                    href={`/community/question/${q.id}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <MessageSquare size={18} />
                                                    <span className="text-sm font-bold">
                                                        {q.answers_count || 0}
                                                    </span>
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(
                                                            `${window.location.origin}/community/question/${q.id}`
                                                        );
                                                        toast.success("Link copied!");
                                                    }}
                                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-gray-100 rounded-full transition-colors"
                                                    aria-label="Share"
                                                >
                                                    <Share2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {totalPages > 1 && !loading && (
                            <div className="flex justify-center gap-2 mt-8 pb-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="px-4 py-2 border border-gray-300 bg-white rounded-full text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-full text-sm font-bold">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-4 py-2 border border-gray-300 bg-white rounded-full text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR - Desktop Only */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="sticky top-6">
                        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-display font-bold text-slate-800">
                                        Trending in Pharmacy
                                    </h3>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="hover:text-blue-700 cursor-pointer font-medium transition-colors">
                                        How to calculate IV drip rates accurately?
                                    </li>
                                    <li className="hover:text-blue-700 cursor-pointer font-medium transition-colors">
                                        Pharmacokinetics vs Pharmacodynamics
                                    </li>
                                    <li className="hover:text-blue-700 cursor-pointer font-medium transition-colors">
                                        Understanding first-pass metabolism
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}