"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, CornerUpLeft, Minus, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import type { CommunityComment } from "@/lib/community/types";
import { MAX_COMMENT_DEPTH, MAX_COMMENT_LEN } from "@/lib/community/constants";
import { Avatar, Markdown, Pill, TimeAgo } from "./kit";
import { VoteControl } from "./VoteControl";
import { ActionMenu } from "./PostActions";

/**
 * A nested comment thread.
 *
 * Three things make this readable rather than a wall of indentation:
 *  1. **Collapse.** Every comment collapses to a one-line summary, taking its
 *     subtree with it — the single most important control in a deep thread.
 *  2. **A thread line.** The vertical rule to the left of a subtree is a click
 *     target that collapses the parent, which is how Reddit users navigate.
 *  3. **A depth cap.** Past `MAX_COMMENT_DEPTH` the indent stops growing (the
 *     database caps `depth` at the same number), so a deep thread can never
 *     push text off the side of a phone.
 */
export function CommentThread({
    comments,
    postId,
    postAuthorId,
    isLocked,
    canAccept,
    signedIn,
    votePending,
    onVote,
    onReplyAdded,
    onDeleted,
    onEdited,
    onAccept,
}: {
    comments: CommunityComment[];
    postId: string;
    postAuthorId: string | null;
    isLocked: boolean;
    canAccept: boolean;
    signedIn: boolean;
    votePending: Record<string, boolean>;
    onVote: (comment: CommunityComment, direction: 1 | -1) => void;
    onReplyAdded: (parentId: string | null, comment: CommunityComment) => void;
    onDeleted: (id: string) => void;
    onEdited: (id: string, body: string) => void;
    onAccept: (commentId: string | null) => void;
}) {
    return (
        <div className="space-y-1">
            {comments.map((c) => (
                <CommentNode
                    key={c.id}
                    comment={c}
                    postId={postId}
                    postAuthorId={postAuthorId}
                    isLocked={isLocked}
                    canAccept={canAccept}
                    signedIn={signedIn}
                    votePending={votePending}
                    onVote={onVote}
                    onReplyAdded={onReplyAdded}
                    onDeleted={onDeleted}
                    onEdited={onEdited}
                    onAccept={onAccept}
                />
            ))}
        </div>
    );
}

function CommentNode({
    comment,
    postId,
    postAuthorId,
    isLocked,
    canAccept,
    signedIn,
    votePending,
    onVote,
    onReplyAdded,
    onDeleted,
    onEdited,
    onAccept,
}: {
    comment: CommunityComment;
    postId: string;
    postAuthorId: string | null;
    isLocked: boolean;
    canAccept: boolean;
    signedIn: boolean;
    votePending: Record<string, boolean>;
    onVote: (comment: CommunityComment, direction: 1 | -1) => void;
    onReplyAdded: (parentId: string | null, comment: CommunityComment) => void;
    onDeleted: (id: string) => void;
    onEdited: (id: string, body: string) => void;
    onAccept: (commentId: string | null) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);

    const isOP = !!postAuthorId && comment.author?.user_id === postAuthorId;
    // Past the cap the indent stops, so the text keeps its width on a phone.
    const indent = Math.min(comment.depth, MAX_COMMENT_DEPTH);

    const descendantCount = countDescendants(comment);

    if (collapsed) {
        return (
            <div style={{ marginLeft: indent > 0 ? 14 : 0 }}>
                <button
                    type="button"
                    onClick={() => setCollapsed(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] text-[#16181d]/50 transition-colors hover:bg-black/[0.03]"
                >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-black/10 text-[#16181d]/45">
                        <Plus size={12} />
                    </span>
                    <span className="font-semibold text-[#16181d]/70">
                        {comment.author?.display_name ?? "Deleted"}
                    </span>
                    <span>
                        {comment.score} {Math.abs(comment.score) === 1 ? "point" : "points"}
                    </span>
                    {descendantCount > 0 && (
                        <span className="text-[#16181d]/40">
                            · {descendantCount} more {descendantCount === 1 ? "reply" : "replies"}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div style={{ marginLeft: indent > 0 ? 14 : 0 }}>
            <div
                className={`rounded-xl px-2 py-2 transition-colors ${
                    comment.is_accepted ? "bg-[#21B67A]/[0.07] ring-1 ring-[#21B67A]/25" : ""
                }`}
            >
                {/* Byline */}
                <div className="flex items-center gap-1.5 text-[12px] text-[#16181d]/50">
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        aria-label="Collapse this comment"
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[#16181d]/35 transition-colors hover:bg-black/[0.06] hover:text-[#16181d]"
                    >
                        <Minus size={12} />
                    </button>

                    {comment.is_deleted ? (
                        <span className="italic text-[#16181d]/40">[deleted]</span>
                    ) : (
                        <>
                            <Avatar
                                name={comment.author?.display_name ?? null}
                                src={comment.author?.avatar_url}
                                size={20}
                            />
                            <span className="font-semibold text-[#16181d]/80">
                                {comment.author?.display_name ?? "Member"}
                            </span>
                            {isOP && <Pill tone="brand">OP</Pill>}
                            {comment.is_accepted && (
                                <Pill tone="green">
                                    <CheckCircle2 size={10} /> Accepted answer
                                </Pill>
                            )}
                            <span aria-hidden>·</span>
                            <TimeAgo iso={comment.created_at} />
                            {comment.edited_at && <span className="italic">edited</span>}
                        </>
                    )}
                </div>

                {/* Body */}
                <div className="mt-1 pl-[26px]">
                    {comment.is_deleted ? (
                        <p className="text-[14px] italic text-[#16181d]/40">
                            This comment was removed by its author.
                        </p>
                    ) : editing ? (
                        <CommentEditor
                            initialValue={comment.body}
                            submitLabel="Save changes"
                            onCancel={() => setEditing(false)}
                            onSubmit={async (body) => {
                                const res = await fetch(`/api/community/comments/${comment.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ body }),
                                });
                                const json = await res.json();
                                if (!res.ok) throw new Error(json.error || "Could not save");
                                onEdited(comment.id, body);
                                setEditing(false);
                                toast.success("Comment updated");
                            }}
                        />
                    ) : (
                        <div className="text-[14px] leading-relaxed text-[#16181d]/85">
                            <Markdown>{comment.body}</Markdown>
                        </div>
                    )}

                    {/* Actions */}
                    {!comment.is_deleted && !editing && (
                        <div className="mt-1 flex flex-wrap items-center gap-0.5">
                            <VoteControl
                                score={comment.score}
                                userVote={comment.user_vote}
                                disabled={votePending[comment.id]}
                                orientation="row"
                                size="sm"
                                onVote={(direction) => onVote(comment, direction)}
                            />

                            {!isLocked && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!signedIn) {
                                            toast.error("Sign in to reply.");
                                            return;
                                        }
                                        setReplying((r) => !r);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/55 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
                                >
                                    <CornerUpLeft size={14} /> Reply
                                </button>
                            )}

                            {canAccept && (
                                <button
                                    type="button"
                                    onClick={() => onAccept(comment.is_accepted ? null : comment.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                                        comment.is_accepted
                                            ? "text-[#128257] hover:bg-[#21B67A]/10"
                                            : "text-[#16181d]/55 hover:bg-[#21B67A]/10 hover:text-[#128257]"
                                    }`}
                                >
                                    <CheckCircle2 size={14} />
                                    {comment.is_accepted ? "Unaccept" : "Accept answer"}
                                </button>
                            )}

                            <ActionMenu
                                isAuthor={comment.is_author}
                                targetType="comment"
                                targetId={comment.id}
                                onEdit={comment.is_author ? () => setEditing(true) : undefined}
                                onDelete={
                                    comment.is_author
                                        ? async () => {
                                              const res = await fetch(
                                                  `/api/community/comments/${comment.id}`,
                                                  { method: "DELETE" }
                                              );
                                              const json = await res.json().catch(() => ({}));
                                              if (!res.ok) {
                                                  toast.error(json.error || "Could not delete");
                                                  return;
                                              }
                                              onDeleted(comment.id);
                                              toast.success("Comment deleted");
                                          }
                                        : undefined
                                }
                            />
                        </div>
                    )}

                    {replying && (
                        <div className="mt-2">
                            <CommentEditor
                                autoFocus
                                placeholder={`Reply to ${comment.author?.display_name ?? "this comment"}…`}
                                submitLabel="Reply"
                                onCancel={() => setReplying(false)}
                                onSubmit={async (body) => {
                                    const res = await fetch(
                                        `/api/community/posts/${postId}/comments`,
                                        {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ body, parent_id: comment.id }),
                                        }
                                    );
                                    const json = await res.json();
                                    if (!res.ok) throw new Error(json.error || "Could not reply");
                                    onReplyAdded(comment.id, json.comment);
                                    setReplying(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Replies, behind a clickable thread line */}
            {comment.replies.length > 0 && (
                <div className="relative pl-2">
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        aria-label="Collapse this thread"
                        className="group absolute left-[9px] top-0 bottom-0 w-3 cursor-pointer"
                    >
                        <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black/[0.09] transition-colors group-hover:bg-[#1C7BD9]/50" />
                    </button>
                    <div className="pl-3">
                        {comment.replies.map((child) => (
                            <CommentNode
                                key={child.id}
                                comment={child}
                                postId={postId}
                                postAuthorId={postAuthorId}
                                isLocked={isLocked}
                                canAccept={canAccept}
                                signedIn={signedIn}
                                votePending={votePending}
                                onVote={onVote}
                                onReplyAdded={onReplyAdded}
                                onDeleted={onDeleted}
                                onEdited={onEdited}
                                onAccept={onAccept}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Shared textarea for writing, replying and editing. */
export function CommentEditor({
    initialValue = "",
    placeholder = "Share what you know…",
    submitLabel = "Comment",
    autoFocus,
    onSubmit,
    onCancel,
}: {
    initialValue?: string;
    placeholder?: string;
    submitLabel?: string;
    autoFocus?: boolean;
    onSubmit: (body: string) => Promise<void>;
    onCancel?: () => void;
}) {
    const [value, setValue] = useState(initialValue);
    const [busy, setBusy] = useState(false);

    async function submit() {
        const body = value.trim();
        if (!body) {
            toast.error("Write something first.");
            return;
        }
        setBusy(true);
        try {
            await onSubmit(body);
            setValue("");
        } catch (err: any) {
            toast.error(err?.message || "Could not post that");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-xl border border-black/10 bg-white focus-within:border-[#1C7BD9]">
            <textarea
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={autoFocus}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    // ⌘/Ctrl+Enter submits — the shortcut anyone who comments expects.
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        submit();
                    }
                }}
                maxLength={MAX_COMMENT_LEN}
                rows={3}
                placeholder={placeholder}
                className="w-full resize-y rounded-t-xl bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-[#16181d] outline-none placeholder:text-[#16181d]/35"
            />
            <div className="flex items-center gap-2 border-t border-black/[0.06] px-2 py-1.5">
                <span className="text-[11px] text-[#16181d]/35">
                    Markdown supported · {value.length}/{MAX_COMMENT_LEN}
                </span>
                <div className="ml-auto flex gap-1.5">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-[#16181d]/60 transition-colors hover:bg-black/[0.05]"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy || !value.trim()}
                        className="rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-40"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        {busy ? "Posting…" : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Sign-in prompt shown where the composer would be. */
export function SignInToComment() {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <p className="text-[13.5px] text-[#16181d]/60">
                Sign in to join the discussion.
            </p>
            <Link
                href="/signin"
                className="ml-auto rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                style={{
                    background:
                        "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                }}
            >
                Sign in
            </Link>
        </div>
    );
}

function countDescendants(comment: CommunityComment): number {
    return comment.replies.reduce((sum, r) => sum + 1 + countDescendants(r), 0);
}
