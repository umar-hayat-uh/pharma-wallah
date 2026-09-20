"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Eye,
    Lock,
    MessageSquare,
    Loader2,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useCommunityVote } from "@/hooks/useCommunityVote";
import type { CommunityComment, CommunityPost, CommunitySpace } from "@/lib/community/types";
import {
    COMMENT_SORTS,
    MAX_BODY_LEN,
    MAX_TITLE_LEN,
    type CommentSort,
} from "@/lib/community/constants";
import { CommunityShell, SpaceCard } from "../CommunityShell";
import { CommentEditor, CommentThread, SignInToComment } from "../CommentThread";
import { ActionMenu, SaveButton, ShareButton } from "../PostActions";
import { VoteControl } from "../VoteControl";
import { Avatar, Markdown, Pill, SpaceIcon, TagChip, TimeAgo, formatCount } from "../kit";

type FullPost = CommunityPost & { space_rules?: string[]; space_description?: string | null };

export function PostView({ postId }: { postId: string }) {
    const { user } = useSupabaseUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [post, setPost] = useState<FullPost | null>(null);
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [commentSort, setCommentSort] = useState<CommentSort>("top");
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [editing, setEditing] = useState(searchParams.get("edit") === "1");

    const { vote, pending } = useCommunityVote(!!user);

    // ─── Load ───────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/community/posts/${postId}`);
                const json = await res.json();
                if (cancelled) return;
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (!res.ok) throw new Error(json.error || "Could not load the post");
                setPost(json.post);
            } catch (err: any) {
                if (!cancelled) toast.error(err?.message || "Could not load the post");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [postId]);

    const loadComments = useCallback(
        async (sort: CommentSort) => {
            setLoadingComments(true);
            try {
                const res = await fetch(
                    `/api/community/posts/${postId}/comments?sort=${sort}`
                );
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Could not load comments");
                setComments(json.comments ?? []);
            } catch (err: any) {
                toast.error(err?.message || "Could not load comments");
            } finally {
                setLoadingComments(false);
            }
        },
        [postId]
    );

    useEffect(() => {
        loadComments(commentSort);
    }, [loadComments, commentSort]);

    // ─── Comment tree mutations (local, so nothing refetches) ───────────
    const insertComment = useCallback(
        (parentId: string | null, comment: CommunityComment) => {
            setComments((prev) => {
                if (!parentId) return [{ ...comment, replies: [] }, ...prev];
                const graft = (nodes: CommunityComment[]): CommunityComment[] =>
                    nodes.map((n) =>
                        n.id === parentId
                            ? { ...n, replies: [{ ...comment, replies: [] }, ...n.replies], reply_count: n.reply_count + 1 }
                            : { ...n, replies: graft(n.replies) }
                    );
                return graft(prev);
            });
            setPost((p) => (p ? { ...p, comment_count: p.comment_count + 1 } : p));
        },
        []
    );

    const patchComment = useCallback((id: string, patch: Partial<CommunityComment>) => {
        setComments((prev) => {
            const walk = (nodes: CommunityComment[]): CommunityComment[] =>
                nodes.map((n) =>
                    n.id === id ? { ...n, ...patch } : { ...n, replies: walk(n.replies) }
                );
            return walk(prev);
        });
    }, []);

    const markDeleted = useCallback(
        (id: string) => {
            // Soft delete keeps the node so its replies stay attached — the API
            // does the same server-side.
            patchComment(id, { is_deleted: true, body: "", author: null });
            setPost((p) => (p ? { ...p, comment_count: Math.max(p.comment_count - 1, 0) } : p));
        },
        [patchComment]
    );

    const acceptAnswer = useCallback(
        async (commentId: string | null) => {
            try {
                const res = await fetch(`/api/community/posts/${postId}/accept`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ comment_id: commentId }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Could not mark the answer");

                setPost((p) => (p ? { ...p, accepted_comment_id: json.accepted_comment_id } : p));
                setComments((prev) => {
                    const walk = (nodes: CommunityComment[]): CommunityComment[] =>
                        nodes.map((n) => ({
                            ...n,
                            is_accepted: n.id === json.accepted_comment_id,
                            replies: walk(n.replies),
                        }));
                    return walk(prev);
                });
                toast.success(commentId ? "Marked as the accepted answer" : "Accepted answer cleared");
            } catch (err: any) {
                toast.error(err?.message || "Could not mark the answer");
            }
        },
        [postId]
    );

    // ─── States ─────────────────────────────────────────────────────────
    if (notFound) {
        return (
            <CommunityShell>
                <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-16 text-center">
                    <p className="text-[18px] font-bold text-[#16181d]">This post isn't here</p>
                    <p className="mt-1 text-[14px] text-[#16181d]/55">
                        It may have been deleted, or the link may be wrong.
                    </p>
                    <Link
                        href="/community"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        <ArrowLeft size={15} /> Back to the community
                    </Link>
                </div>
            </CommunityShell>
        );
    }

    if (loading || !post) {
        return (
            <CommunityShell>
                <div className="h-64 animate-pulse rounded-2xl border border-black/[0.08] bg-white" />
            </CommunityShell>
        );
    }

    const canAccept = post.is_author && post.kind === "question";
    const shareUrl =
        typeof window !== "undefined" ? window.location.href.split("?")[0] : `/community/post/${post.id}`;

    return (
        <CommunityShell
            activeSpaceSlug={post.space.slug}
            right={
                <SpaceCard
                    space={
                        {
                            ...post.space,
                            tagline: null,
                            description: post.space_description ?? null,
                            flairs: [],
                            rules: post.space_rules ?? [],
                            member_count: 0,
                            post_count: 0,
                            is_default: false,
                        } as CommunitySpace
                    }
                />
            }
        >
            <button
                type="button"
                onClick={() => router.back()}
                className="mb-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-[#16181d]/55 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
            >
                <ArrowLeft size={15} /> Back
            </button>

            {/* ── The post ───────────────────────────────────────────── */}
            <article className="rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5">
                <div className="flex gap-4">
                    <div className="hidden sm:block">
                        <VoteControl
                            score={post.score}
                            userVote={post.user_vote}
                            disabled={pending[post.id]}
                            onVote={(direction) =>
                                vote("post", post.id, direction, post.user_vote, post.score, ({ score, user_vote }) =>
                                    setPost((p) => (p ? { ...p, score, user_vote } : p))
                                )
                            }
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        {/* Byline */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[#16181d]/55">
                            <Link
                                href={`/community/s/${post.space.slug}`}
                                className="inline-flex items-center gap-1.5 font-semibold text-[#16181d]/80 transition-colors hover:text-[#1C7BD9]"
                            >
                                <SpaceIcon icon={post.space.icon} accent={post.space.accent} size={13} />
                                {post.space.name}
                            </Link>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Avatar
                                    name={post.author?.display_name ?? null}
                                    src={post.author?.avatar_url}
                                    size={20}
                                />
                                <span className="font-medium">
                                    {post.author?.display_name ?? "Deleted member"}
                                </span>
                                {post.author && post.author.karma > 0 && (
                                    <span className="text-[#16181d]/40">
                                        · {formatCount(post.author.karma)} karma
                                    </span>
                                )}
                            </span>
                            <span aria-hidden>·</span>
                            <TimeAgo iso={post.created_at} />
                            {post.edited_at && <span className="italic">edited</span>}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {post.kind === "question" && (
                                <Pill tone={post.accepted_comment_id ? "green" : "brand"}>
                                    {post.accepted_comment_id ? (
                                        <>
                                            <CheckCircle2 size={10} /> Answered
                                        </>
                                    ) : (
                                        "Question"
                                    )}
                                </Pill>
                            )}
                            {post.flair && <Pill>{post.flair}</Pill>}
                            {post.is_locked && (
                                <Pill tone="amber">
                                    <Lock size={10} /> Locked
                                </Pill>
                            )}
                        </div>

                        {editing ? (
                            <PostEditor
                                post={post}
                                onCancel={() => setEditing(false)}
                                onSaved={(patch) => {
                                    setPost((p) => (p ? { ...p, ...patch } : p));
                                    setEditing(false);
                                }}
                            />
                        ) : (
                            <>
                                <h1 className="mt-1.5 text-[22px] font-bold leading-tight text-[#16181d] sm:text-[26px]">
                                    {post.title}
                                </h1>

                                {post.kind === "link" && post.link_url && (
                                    <a
                                        href={post.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-[13px] font-medium text-[#1C7BD9] transition-colors hover:bg-[#1C7BD9]/[0.06]"
                                    >
                                        <ExternalLink size={14} className="shrink-0" />
                                        <span className="truncate">{post.link_url}</span>
                                    </a>
                                )}

                                {post.kind === "image" && post.image_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={post.image_url}
                                        alt=""
                                        className="mt-3 w-full rounded-xl border border-black/[0.07]"
                                    />
                                )}

                                {post.body && (
                                    <div className="mt-3 text-[15px] leading-relaxed text-[#16181d]/85">
                                        <Markdown>{post.body}</Markdown>
                                    </div>
                                )}
                            </>
                        )}

                        {post.tags.length > 0 && !editing && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {post.tags.map((t) => (
                                    <TagChip key={t} tag={t} spaceSlug={post.space.slug} />
                                ))}
                            </div>
                        )}

                        {/* Action line */}
                        {!editing && (
                            <div className="mt-3 flex flex-wrap items-center gap-0.5 border-t border-black/[0.06] pt-2">
                                <span className="sm:hidden">
                                    <VoteControl
                                        score={post.score}
                                        userVote={post.user_vote}
                                        disabled={pending[post.id]}
                                        orientation="row"
                                        size="sm"
                                        onVote={(direction) =>
                                            vote("post", post.id, direction, post.user_vote, post.score, ({ score, user_vote }) =>
                                                setPost((p) => (p ? { ...p, score, user_vote } : p))
                                            )
                                        }
                                    />
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/55">
                                    <MessageSquare size={15} />
                                    {formatCount(post.comment_count)} comments
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/45">
                                    <Eye size={15} />
                                    {formatCount(post.view_count)}
                                </span>
                                <ShareButton url={shareUrl} title={post.title} />
                                <SaveButton
                                    postId={post.id}
                                    saved={post.saved}
                                    onChange={(saved) => setPost((p) => (p ? { ...p, saved } : p))}
                                />
                                <span className="ml-auto">
                                    <ActionMenu
                                        isAuthor={post.is_author}
                                        targetType="post"
                                        targetId={post.id}
                                        shareUrl={shareUrl}
                                        shareTitle={post.title}
                                        onEdit={post.is_author ? () => setEditing(true) : undefined}
                                        onDelete={
                                            post.is_author
                                                ? async () => {
                                                      const res = await fetch(
                                                          `/api/community/posts/${post.id}`,
                                                          { method: "DELETE" }
                                                      );
                                                      const json = await res.json().catch(() => ({}));
                                                      if (!res.ok) {
                                                          toast.error(json.error || "Could not delete");
                                                          return;
                                                      }
                                                      toast.success("Post deleted");
                                                      router.push("/community");
                                                  }
                                                : undefined
                                        }
                                    />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* ── Composer ───────────────────────────────────────────── */}
            <div className="mt-3">
                {post.is_locked ? (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800">
                        <Lock size={15} /> This post is locked — no new comments.
                    </div>
                ) : user ? (
                    <CommentEditor
                        placeholder={
                            post.kind === "question"
                                ? "Answer this question. Show your reasoning."
                                : "Add to the discussion…"
                        }
                        submitLabel={post.kind === "question" ? "Post answer" : "Comment"}
                        onSubmit={async (body) => {
                            const res = await fetch(`/api/community/posts/${post.id}/comments`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ body }),
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.error || "Could not comment");
                            insertComment(null, json.comment);
                            toast.success("Posted");
                        }}
                    />
                ) : (
                    <SignInToComment />
                )}
            </div>

            {/* ── Comments ───────────────────────────────────────────── */}
            <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-[14px] font-bold text-[#16181d]">
                        {formatCount(post.comment_count)}{" "}
                        {post.comment_count === 1 ? "comment" : "comments"}
                    </h2>
                    <div className="ml-auto flex items-center gap-1">
                        {COMMENT_SORTS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setCommentSort(s)}
                                aria-pressed={commentSort === s}
                                className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold capitalize transition-colors ${
                                    commentSort === s
                                        ? "bg-[#1C7BD9]/10 text-[#1C7BD9]"
                                        : "text-[#16181d]/50 hover:bg-black/[0.04]"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {loadingComments ? (
                    <div className="flex items-center gap-2 px-2 py-8 text-[13px] text-[#16181d]/45">
                        <Loader2 size={15} className="animate-spin" /> Loading comments…
                    </div>
                ) : comments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/[0.12] px-6 py-10 text-center">
                        <p className="text-[14px] font-semibold text-[#16181d]/70">
                            {post.kind === "question" ? "No answers yet" : "No comments yet"}
                        </p>
                        <p className="mt-1 text-[13px] text-[#16181d]/45">
                            {post.kind === "question"
                                ? "If you know this one, help them out."
                                : "Start the conversation."}
                        </p>
                    </div>
                ) : (
                    <CommentThread
                        comments={comments}
                        postId={post.id}
                        postAuthorId={post.author?.user_id ?? null}
                        isLocked={post.is_locked}
                        canAccept={canAccept}
                        signedIn={!!user}
                        votePending={pending}
                        onVote={(comment, direction) =>
                            vote(
                                "comment",
                                comment.id,
                                direction,
                                comment.user_vote,
                                comment.score,
                                ({ score, user_vote }) => patchComment(comment.id, { score, user_vote })
                            )
                        }
                        onReplyAdded={insertComment}
                        onDeleted={markDeleted}
                        onEdited={(id, body) =>
                            patchComment(id, { body, edited_at: new Date().toISOString() })
                        }
                        onAccept={acceptAnswer}
                    />
                )}
            </div>
        </CommunityShell>
    );
}

/** Inline edit form for a post's title, body and tags. */
function PostEditor({
    post,
    onCancel,
    onSaved,
}: {
    post: CommunityPost;
    onCancel: () => void;
    onSaved: (patch: Partial<CommunityPost>) => void;
}) {
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const [tags, setTags] = useState(post.tags.join(", "));
    const [busy, setBusy] = useState(false);

    const tagList = useMemo(
        () => tags.split(",").map((t) => t.trim()).filter(Boolean),
        [tags]
    );

    async function save() {
        setBusy(true);
        try {
            const res = await fetch(`/api/community/posts/${post.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body, tags: tagList }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Could not save");
            onSaved({ title, body, tags: tagList, edited_at: new Date().toISOString() });
            toast.success("Post updated");
        } catch (err: any) {
            toast.error(err?.message || "Could not save your changes");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-2 space-y-2">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LEN}
                aria-label="Title"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[17px] font-bold text-[#16181d] outline-none focus:border-[#1C7BD9]"
            />
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={MAX_BODY_LEN}
                rows={8}
                aria-label="Body"
                className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-[#16181d] outline-none focus:border-[#1C7BD9]"
            />
            <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags, comma separated"
                aria-label="Tags"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] text-[#16181d] outline-none focus:border-[#1C7BD9]"
            />
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={save}
                    disabled={busy || !title.trim()}
                    className="rounded-xl px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50"
                    style={{
                        background:
                            "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                    }}
                >
                    {busy ? "Saving…" : "Save changes"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-black/10 px-4 py-2 text-[13.5px] font-semibold text-[#16181d]/65 transition-colors hover:bg-black/[0.03]"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
