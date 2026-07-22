"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { toast } from "react-hot-toast";
import { Loader2, UserCircle2, Globe, Info, X, Sparkles } from "lucide-react";

const MAX_TITLE_LEN = 300;
const MAX_CONTENT_LEN = 20000;

export default function AskQuestionPage() {
    const { user, loading } = useSupabaseUser();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!loading && !user) router.push("/signin");
    }, [loading, user, router]);

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            toast.error("Please enter a question title.");
            return;
        }
        if (trimmedTitle.length > MAX_TITLE_LEN) {
            toast.error(`Title must be ${MAX_TITLE_LEN} characters or fewer.`);
            return;
        }
        if (content.trim().length > MAX_CONTENT_LEN) {
            toast.error(`Details must be ${MAX_CONTENT_LEN} characters or fewer.`);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setSubmitting(true);
        const safetyTimer = setTimeout(() => controller.abort(), 15000);

        try {
            const res = await fetch("/api/qa/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: trimmedTitle,
                    content: content.trim(),
                    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                }),
                signal: controller.signal,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post.");
            const questionId = data?.question?.id;
            if (!questionId) throw new Error("No question ID returned");

            toast.success("Question posted!");
            // Land back on the feed (not the detail page) so the new
            // question is visible in context, highlighted briefly.
            router.push(`/community?posted=${questionId}`);
        } catch (err: any) {
            if (err.name === "AbortError") {
                toast.error("Request timed out. Please try again.");
            } else {
                console.error(err);
                toast.error(err.message || "Something went wrong.");
            }
        } finally {
            clearTimeout(safetyTimer);
            setSubmitting(false);
        }
    }, [title, content, tags, router, submitting]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-4 font-sans text-slate-900 flex justify-center items-start">
            <div className="relative bg-white max-w-2xl w-full rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden mt-2 sm:mt-6">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

                <div className="flex items-center justify-between px-5 sm:px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-600">
                        <Sparkles size={14} />
                        Ask the Community
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="p-5 sm:p-6 flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900">
                        <h3 className="font-bold mb-2 flex items-center gap-1.5">
                            <Info size={16} className="text-blue-600" />
                            Tips on getting good answers quickly
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-blue-800/80">
                            <li>Make sure your question hasn't been asked already</li>
                            <li>Keep your question short and to the point</li>
                            <li>Double-check grammar and spelling</li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                            />
                        ) : (
                            <UserCircle2 className="w-10 h-10 text-gray-400" />
                        )}
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] leading-tight text-slate-800">
                                {user?.user_metadata?.full_name || "Anonymous User"}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5">
                                <Globe size={12} />
                                <span>Public</span>
                            </div>
                        </div>
                    </div>

                    <form id="ask-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Start your question with "What", "How", "Why", etc.'
                                className="font-display w-full text-lg sm:text-xl font-bold placeholder:text-gray-300 placeholder:font-sans placeholder:font-normal border-none focus:outline-none focus:ring-0 px-0"
                                required
                                maxLength={MAX_TITLE_LEN}
                                autoFocus
                                disabled={submitting}
                            />
                            <div className="h-px bg-gray-200 mt-2 w-full"></div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Context & Details</label>
                            <textarea
                                rows={5}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Explain your question in more detail... (optional)"
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all resize-y"
                                maxLength={MAX_CONTENT_LEN}
                                disabled={submitting}
                            />
                            <div className="flex justify-end mt-1">
                                <span className="text-xs text-slate-400">{content.trim().length}/{MAX_CONTENT_LEN}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tags</label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="pharmacology, clinical, calculations"
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
                                disabled={submitting}
                            />
                            <p className="text-xs text-slate-400 mt-1.5">
                                Separate multiple tags with commas. Matched case-insensitively.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 bg-slate-50 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-gray-200 transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        form="ask-form"
                        type="submit"
                        disabled={submitting || !title.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold rounded-2xl px-6 py-2.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all text-sm"
                    >
                        {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                        {submitting ? "Posting..." : "Add Question"}
                    </button>
                </div>
            </div>
        </div>
    );
}