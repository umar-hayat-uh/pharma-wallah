"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  createdAt: string;
}

export default function BlogComments({ postSlug }: { postSlug: string }) {
  const { isSignedIn, user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/comments?postSlug=${postSlug}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setError("Please sign in to comment.");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, content: newComment.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const added = await res.json();
      setComments((prev) => [added, ...prev]);
      setNewComment("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isSignedIn ? "Write your comment or review..." : "Sign in to leave a comment"}
            rows={3}
            disabled={!isSignedIn}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-sm"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex justify-end">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                  Sign in to comment
                </button>
              </SignInButton>
            ) : (
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Comment
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <img
                  src={c.userAvatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.userName)}
                  alt={c.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-sm">{c.userName}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed break-words">{c.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs">
                      <Heart className="w-3.5 h-3.5" /> {c.likes}
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-xs">
                      <MessageCircle className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}