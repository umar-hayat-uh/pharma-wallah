"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Loader2, Send, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentCommentId: string | null;
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  currentUserId?: string;
  isSignedIn: boolean;
  onLike: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
}

function Avatar({ name, src, size = "sm" }: { name: string; src?: string; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-10 h-10" : "w-8 h-8";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-2 ring-white shadow-sm`}>
      {initials}
    </div>
  );
}

function CommentItem({ comment, replies, currentUserId, isSignedIn, onLike, onReply }: CommentItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const hasLiked = currentUserId ? comment.likedBy?.includes(currentUserId) : false;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    await onReply(comment._id, replyText.trim());
    setReplyText("");
    setReplySubmitting(false);
    setShowReplyBox(false);
    setShowReplies(true);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar name={comment.userName} src={comment.userAvatar} />
        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{comment.userName}</span>
              <span className="text-[10px] text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5 px-1">
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-xs font-medium transition-all ${
                hasLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-400 hover:text-red-400"
              }`}
              title={isSignedIn ? (hasLiked ? "Unlike" : "Like") : "Sign in to like"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${hasLiked ? "fill-current scale-110" : ""}`}
              />
              <span>{comment.likes > 0 ? comment.likes : ""}</span>
              {comment.likes > 0 && <span className="sr-only">likes</span>}
            </button>

            {isSignedIn ? (
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  Reply
                </button>
              </SignInButton>
            )}

            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors ml-auto"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyBox && (
            <div className="mt-3 flex gap-2 items-end pl-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit();
                  }
                }}
              />
              <button
                onClick={handleReplySubmit}
                disabled={replySubmitting || !replyText.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-semibold disabled:opacity-50 transition-all hover:-translate-y-0.5"
              >
                {replySubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Nested replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-blue-100 space-y-3">
              {replies.map((reply) => (
                <div key={reply._id} className="flex gap-3">
                  <Avatar name={reply.userName} src={reply.userAvatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="bg-blue-50/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-blue-100/80">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{reply.userName}</span>
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words">{reply.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <button
                        onClick={() => onLike(reply._id)}
                        className={`flex items-center gap-1 text-xs font-medium transition-all ${
                          currentUserId && reply.likedBy?.includes(currentUserId)
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${currentUserId && reply.likedBy?.includes(currentUserId) ? "fill-current" : ""}`}
                        />
                        {reply.likes > 0 && <span>{reply.likes}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogComments({ postSlug }: { postSlug: string }) {
  const { isSignedIn, user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/comments?postSlug=${postSlug}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) { setError("Please sign in to comment."); return; }
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

  const handleLike = async (commentId: string) => {
    if (!isSignedIn) return;
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const alreadyLiked = c.likedBy?.includes(user!.id);
        return {
          ...c,
          likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
          likedBy: alreadyLiked
            ? c.likedBy.filter((id) => id !== user!.id)
            : [...(c.likedBy ?? []), user!.id],
        };
      })
    );

    try {
      await fetch("/api/blog/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
    } catch {
      // Revert on error
      fetchComments();
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, content, parentCommentId }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      const added = await res.json();
      setComments((prev) => [...prev, added]);
    } catch (err) {
      console.error(err);
    }
  };

  // Separate top-level comments from replies
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: string) =>
    comments
      .filter((c) => c.parentCommentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex gap-3 items-start">
          {isSignedIn && user ? (
            <Avatar name={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()} src={user.imageUrl} size="md" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex-1 space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isSignedIn ? "Share your thoughts or questions…" : "Sign in to join the discussion"}
              rows={3}
              disabled={!isSignedIn}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-sm bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed"
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <div className="flex justify-end">
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <button type="button" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                    Sign in to comment
                  </button>
                </SignInButton>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post Comment
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Comments count */}
      {topLevel.length > 0 && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
          {topLevel.length} {topLevel.length === 1 ? "Comment" : "Comments"}
        </p>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No comments yet</p>
          <p className="text-xs mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              replies={getReplies(comment._id)}
              currentUserId={user?.id}
              isSignedIn={!!isSignedIn}
              onLike={handleLike}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}