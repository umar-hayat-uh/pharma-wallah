"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft, UserCircle2, X, MessageSquareText } from "lucide-react";

const MAX_CONTENT_LEN = 20000;

type QuestionSummary = {
    id: string;
    title: string;
    tags: string[];
};

export default function AnswerQuestionPage({ params }: { params: { id: string } }) {
    const { user, loading: authLoading } = useSupabaseUser();
    const router = useRouter();

    const [question, setQuestion] = useState<QuestionSummary | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push("/signin");
    }, [authLoading, user, router]);

    useEffect(() => {
        let cancelled = false;
        async function loadQuestion() {
            setLoadingQuestion(true);
            try {
                const res = await fetch(`/api/qa/questions/${params.id}`);
                const data = await res.json();
                if (cancelled) return;
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (!res.ok) throw new Error(data.error || "Failed to load question");
                setQuestion(data.question);
            } catch (err: any) {
                if (!cancelled) toast.error(err.message || "Failed to load question");
            } finally {
                if (!cancelled) setLoadingQuestion(false);
            }
        }
        if (!authLoading && user) loadQuestion();
        return () => { cancelled = true; };
    }, [params.id, authLoading, user]);

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const trimmed = content.trim();
        if (!trimmed) {
            toast.error("Please write an answer before posting.");
            return;
        }
        if (trimmed.length > MAX_CONTENT_LEN) {
            toast.error(`Answer must be ${MAX_CONTENT_LEN} characters or fewer.`);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setSubmitting(true);
        const safetyTimer = setTimeout(() => controller.abort(), 15000);

        try {
            const res = await fetch("/api/qa/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_id: params.id, content: trimmed }),
                signal: controller.signal,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post your answer.");

            toast.success("Answer posted!");
            router.push(`/community/question/${params.id}`);
        } catch (err: any) {
            if (err.name === "AbortError") {
                toast.error("Request timed out. Please try again.");
            } else {
                toast.error(err.message || "Something went wrong.");
            }
        } finally {
            clearTimeout(safetyTimer);
            setSubmitting(false);
        }
    }, [content, params.id, router, submitting]);

    if (authLoading || loadingQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    if (notFound) {
        return (
            <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center justify-center">
                <div className="bg-white max-w-md w-full rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Question not found</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        This question may have been removed, or the link is incorrect.
                    </p>
                    <button
                        onClick={() => router.push("/community")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-4 font-sans text-slate-900">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.push(`/community/question/${params.id}`)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to question
                </button>

                <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

                    <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-blue-600 mb-1.5">
                                <MessageSquareText size={14} />
                                Writing an answer to
                            </div>
                            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug break-words">
                                {question?.title}
                            </h1>
                            {question?.tags && question.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {question.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push(`/community/question/${params.id}`)}
                            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Cancel"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="px-5 sm:px-6 pt-5 pb-2">
                        <div className="flex items-center gap-3 mb-4">
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100"
                                />
                            ) : (
                                <UserCircle2 className="w-9 h-9 text-gray-400" />
                            )}
                            <span className="font-bold text-sm text-slate-800">
                                {user?.user_metadata?.full_name || "Answering as you"}
                            </span>
                        </div>

                        <form id="answer-form" onSubmit={handleSubmit}>
                            <textarea
                                autoFocus
                                rows={8}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your knowledge — explain your reasoning, cite mechanisms, or walk through the calculation..."
                                maxLength={MAX_CONTENT_LEN}
                                disabled={submitting}
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all resize-y"
                            />
                            <div className="flex justify-end mt-1.5">
                                <span className="text-xs text-slate-400">
                                    {content.trim().length}/{MAX_CONTENT_LEN}
                                </span>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 bg-slate-50 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.push(`/community/question/${params.id}`)}
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            form="answer-form"
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold rounded-2xl px-6 py-2.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all text-sm"
                        >
                            {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                            {submitting ? "Posting..." : "Post Answer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}