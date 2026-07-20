"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { Loader2, Send, User, ChevronDown } from "lucide-react";
import AuthCTA from "@/components/course/AuthCTA";

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

interface CachedThread {
  comments: Comment[];
  hasMore: boolean;
  page: number; // highest page fetched
}

// Module‑level cache (survives unmounts during the session)
const cache = new Map<string, CachedThread>();

export default function Comments({ unitId }: { unitId: string }) {
  const { user, loading: authLoading } = useSupabaseUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (pageNum: number, force = false) => {
      // Serve from cache if available and not forced
      if (!force) {
        const cached = cache.get(unitId);
        if (cached && cached.page >= pageNum && pageNum === 0) {
          setComments(cached.comments);
          setHasMore(cached.hasMore);
          setPage(cached.page);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await fetch(
          `/api/comments?unit=${encodeURIComponent(unitId)}&page=${pageNum}`
        );
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        let newComments: Comment[];
        if (pageNum === 0) {
          newComments = data.comments;
          setComments(newComments);
        } else {
          newComments = [...comments, ...data.comments];
          setComments(newComments);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);

        // Update cache
        cache.set(unitId, {
          comments: newComments,
          hasMore: data.hasMore,
          page: pageNum,
        });
      } catch (e) {
        setError("Couldn't load comments.");
      } finally {
        setLoading(false);
      }
    },
    [unitId, comments]
  );

  useEffect(() => {
    setLoading(true);
    // Always fetch page 0 on initial mount (force = false, so cache will be used)
    fetchComments(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]); // only re-run when unitId changes

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post comment.");
        return;
      }

      // Optimistic insertion
      const updatedComments = [data.comment, ...comments];
      setComments(updatedComments);
      setText("");

      // Update cache
      const cached = cache.get(unitId) || { comments: [], hasMore: false, page: 0 };
      cache.set(unitId, {
        ...cached,
        comments: [data.comment, ...cached.comments],
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true); // force fetch for pagination
  };

  if (authLoading) return null;

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* ── Comment form ── */}
      {user ? (
        <div className="flex gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-blue-100 shrink-0 flex items-center justify-center overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white hover:shadow-md disabled:opacity-50 transition"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <AuthCTA />
      )}

      {/* ── Error message ── */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* ── Comment list ── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {comment.authorAvatar ? (
                <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-800">{comment.authorName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2"
            >
              Load more <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}