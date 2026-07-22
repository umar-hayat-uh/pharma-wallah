"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useVote } from "@/hooks/useVote";
import ActionsMenu from "@/components/community/ActionsMenu";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft, UserCircle2, Clock, Tag, Eye, ArrowBigUp, ArrowBigDown, Share2 } from "lucide-react";
import Link from "next/link";

type Profile = { full_name: string | null; avatar_url: string | null };

type Answer = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile | null;
  votes: number;
  user_vote: "up" | "down" | null;
};

type Question = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  views: number;
  score: number;
  profiles: Profile | null;
  answers: Answer[];
  user_vote: "up" | "down" | null;
};

const MAX_CONTENT_LEN = 20000;

export default function QuestionPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  const { vote, pending } = useVote(!!user);

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/signin");
  }, [authLoading, user, router]);

  const fetchQuestion = useCallback(async (id: string, retries = 3) => {
    setLoading(true);
    setError(null);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`/api/qa/questions/${id}`);
        const data = await res.json();

        if (res.status === 404 && attempt < retries) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        if (!res.ok) throw new Error(data.error || "Failed to load question");

        if (isMounted.current) {
          setQuestion(data.question);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        if (attempt === retries && isMounted.current) {
          setError(err.message);
          toast.error(err.message);
        }
        if (attempt < retries) await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (isMounted.current) setLoading(false);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    if (!authLoading && user) fetchQuestion(params.id);
    return () => { isMounted.current = false; };
  }, [params.id, authLoading, user, fetchQuestion]);

  function handleQuestionVote(direction: "up" | "down") {
    if (!question) return;
    vote(question.id, "question", direction, question.user_vote, (delta) => {
      setQuestion((prev) =>
        prev ? { ...prev, score: prev.score + delta, user_vote: prev.user_vote === direction ? null : direction } : prev
      );
    });
  }

  function handleAnswerVote(answerId: string, direction: "up" | "down") {
    if (!question) return;
    const answer = question.answers.find((a) => a.id === answerId);
    if (!answer) return;
    vote(answerId, "answer", direction, answer.user_vote, (delta) => {
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((a) =>
                a.id === answerId ? { ...a, votes: a.votes + delta, user_vote: a.user_vote === direction ? null : direction } : a
              ),
            }
          : prev
      );
    });
  }

  function startEditQuestion() {
    if (!question) return;
    setEditTitle(question.title);
    setEditContent(question.content);
    setEditingQuestion(true);
  }

  async function saveQuestionEdit() {
    if (!question) return;
    const title = editTitle.trim();
    if (!title) { toast.error("Title is required."); return; }
    setSavingQuestion(true);
    try {
      const res = await fetch(`/api/qa/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editContent.trim(), tags: question.tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes");
      setQuestion((prev) => (prev ? { ...prev, title: data.question.title, content: data.question.content } : prev));
      setEditingQuestion(false);
      toast.success("Question updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleDeleteQuestion() {
    if (!question) return;
    try {
      const res = await fetch(`/api/qa/questions/${question.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
      toast.success("Question deleted");
      router.push("/community");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question");
    }
  }

  function startEditAnswer(a: Answer) {
    setEditingAnswerId(a.id);
    setEditAnswerContent(a.content);
  }

  async function saveAnswerEdit(answerId: string) {
    const content = editAnswerContent.trim();
    if (!content) { toast.error("Answer can't be empty."); return; }
    setSavingAnswer(true);
    try {
      const res = await fetch(`/api/qa/answers/${answerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes");
      setQuestion((prev) =>
        prev ? { ...prev, answers: prev.answers.map((a) => (a.id === answerId ? { ...a, content: data.answer.content } : a)) } : prev
      );
      setEditingAnswerId(null);
      toast.success("Answer updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingAnswer(false);
    }
  }

  async function handleDeleteAnswer(answerId: string) {
    try {
      const res = await fetch(`/api/qa/answers/${answerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
      setQuestion((prev) => (prev ? { ...prev, answers: prev.answers.filter((a) => a.id !== answerId) } : prev));
      toast.success("Answer deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete answer");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center justify-center">
        <div className="bg-white max-w-2xl w-full rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            {error === "Question not found" ? "Question not found" : "Oops! Something went wrong"}
          </h2>
          <p className="text-slate-500 mb-6">
            {error === "Question not found"
              ? "The question you're looking for doesn't exist or may have been removed."
              : "We couldn't load this question. Please try again later."}
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

  if (!question) return null;

  const isQuestionOwner = user.id === question.user_id;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/community/question/${question.id}` : "";

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-3 sm:px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/community")}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Community
        </button>

        {/* Question card */}
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  onClick={() => handleQuestionVote("up")}
                  disabled={pending[question.id]}
                  aria-pressed={question.user_vote === "up"}
                  aria-label="Upvote question"
                  className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 ${question.user_vote === "up" ? "text-blue-600" : "text-gray-400"}`}
                >
                  <ArrowBigUp size={24} className={question.user_vote === "up" ? "fill-blue-600" : ""} />
                </button>
                <span className="font-black text-slate-800">{question.score ?? 0}</span>
                <button
                  onClick={() => handleQuestionVote("down")}
                  disabled={pending[question.id]}
                  aria-pressed={question.user_vote === "down"}
                  aria-label="Downvote question"
                  className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 ${question.user_vote === "down" ? "text-red-600" : "text-gray-400"}`}
                >
                  <ArrowBigDown size={24} className={question.user_vote === "down" ? "fill-red-600" : ""} />
                </button>
              </div>

              {question.profiles?.avatar_url ? (
                <img src={question.profiles.avatar_url} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover mt-1 shrink-0" />
              ) : (
                <UserCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-gray-400 mt-1 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">{question.profiles?.full_name || "Anonymous"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={13} />{new Date(question.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Eye size={13} />{question.views} views</span>
                  </div>
                  <ActionsMenu
                    isOwner={isQuestionOwner}
                    shareUrl={shareUrl}
                    onEdit={startEditQuestion}
                    onDelete={handleDeleteQuestion}
                    deleteLabel="this question"
                  />
                </div>

                {editingQuestion ? (
                  <div className="space-y-3 mt-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={300}
                      className="w-full font-display text-xl font-bold border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <textarea
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={MAX_CONTENT_LEN}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveQuestionEdit}
                        disabled={savingQuestion}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm rounded-xl px-4 py-2 shadow-sm disabled:opacity-50"
                      >
                        {savingQuestion && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuestion(false)}
                        disabled={savingQuestion}
                        className="bg-gray-100 hover:bg-gray-200 text-slate-600 font-bold text-sm rounded-xl px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-3 break-words leading-snug">
                      {question.title}
                    </h1>
                    {question.content && (
                      <p className="text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">{question.content}</p>
                    )}
                  </>
                )}

                {!editingQuestion && question.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {question.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full border border-blue-100">
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Answers card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-slate-800">
              {question.answers?.length || 0} {question.answers?.length === 1 ? "Answer" : "Answers"}
            </h2>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {question.answers?.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No answers yet. Be the first to answer!</p>
          ) : (
            <div className="space-y-6">
              {question.answers.map((answer) => {
                const isAnswerOwner = user.id === answer.user_id;
                return (
                  <div key={answer.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => handleAnswerVote(answer.id, "up")}
                          disabled={pending[answer.id]}
                          aria-pressed={answer.user_vote === "up"}
                          aria-label="Upvote answer"
                          className={`p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 ${answer.user_vote === "up" ? "text-blue-600" : "text-gray-400"}`}
                        >
                          <ArrowBigUp size={20} className={answer.user_vote === "up" ? "fill-blue-600" : ""} />
                        </button>
                        <span className="text-sm font-black text-slate-700">{answer.votes ?? 0}</span>
                        <button
                          onClick={() => handleAnswerVote(answer.id, "down")}
                          disabled={pending[answer.id]}
                          aria-pressed={answer.user_vote === "down"}
                          aria-label="Downvote answer"
                          className={`p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 ${answer.user_vote === "down" ? "text-red-600" : "text-gray-400"}`}
                        >
                          <ArrowBigDown size={20} className={answer.user_vote === "down" ? "fill-red-600" : ""} />
                        </button>
                      </div>

                      {answer.profiles?.avatar_url ? (
                        <img src={answer.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <UserCircle2 className="w-8 h-8 text-gray-400 shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-1">
                            <span className="font-bold text-slate-700">{answer.profiles?.full_name || "Anonymous"}</span>
                            <span>•</span>
                            <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                          </div>
                          <ActionsMenu
                            isOwner={isAnswerOwner}
                            shareUrl={shareUrl}
                            onEdit={() => startEditAnswer(answer)}
                            onDelete={() => handleDeleteAnswer(answer.id)}
                            deleteLabel="this answer"
                          />
                        </div>

                        {editingAnswerId === answer.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={4}
                              value={editAnswerContent}
                              onChange={(e) => setEditAnswerContent(e.target.value)}
                              maxLength={MAX_CONTENT_LEN}
                              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveAnswerEdit(answer.id)}
                                disabled={savingAnswer}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm rounded-xl px-4 py-1.5 disabled:opacity-50"
                              >
                                {savingAnswer && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAnswerId(null)}
                                disabled={savingAnswer}
                                className="bg-gray-100 hover:bg-gray-200 text-slate-600 font-bold text-sm rounded-xl px-4 py-1.5"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{answer.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href={`/community/question/${question.id}/answer`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              Write an Answer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}