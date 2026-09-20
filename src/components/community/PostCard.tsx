"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Lock, MessageSquare, Pin } from "lucide-react";
import type { CommunityPost } from "@/lib/community/types";
import { Avatar, Markdown, Pill, SpaceIcon, TagChip, TimeAgo, formatCount } from "./kit";
import { VoteControl } from "./VoteControl";
import { ActionMenu, SaveButton, ShareButton } from "./PostActions";

/**
 * One row of the feed.
 *
 * Two densities, because a study feed is read two different ways: `card` when
 * browsing a space (body excerpt, image, room to judge a post), `compact` when
 * scanning a long list (one line per post, Reddit's "compact" view).
 *
 * The whole row is clickable, but nested interactive elements are not wrapped
 * in the <Link> — a link inside a link is invalid HTML and breaks middle-click.
 * Navigation is handled on the row instead, with the title still a real anchor
 * so the URL previews on hover and opens in a new tab.
 */
export function PostCard({
    post,
    density = "card",
    onVote,
    onSaveChange,
    onDelete,
    votePending,
    showSpace = true,
}: {
    post: CommunityPost;
    density?: "card" | "compact";
    onVote: (direction: 1 | -1) => void;
    onSaveChange: (saved: boolean) => void;
    onDelete?: () => Promise<void> | void;
    votePending?: boolean;
    showSpace?: boolean;
}) {
    const router = useRouter();
    const href = `/community/post/${post.id}`;
    const shareUrl =
        typeof window !== "undefined" ? `${window.location.origin}${href}` : href;

    const isCompact = density === "compact";

    function openPost(e: React.MouseEvent) {
        // Let the browser handle modified clicks and any click that landed on a
        // real control — only a plain click on dead space navigates.
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if ((e.target as HTMLElement).closest("a,button,input,textarea,label")) return;
        router.push(href);
    }

    return (
        <article
            onClick={openPost}
            className="group relative cursor-pointer rounded-2xl border border-black/[0.08] bg-white transition-all hover:border-black/[0.14] hover:shadow-[0_2px_12px_rgba(6,18,36,0.06)]"
        >
            <div className={`flex gap-3 ${isCompact ? "p-3" : "p-4"}`}>
                {/* Vote rail */}
                <div className="hidden sm:block">
                    <VoteControl
                        score={post.score}
                        userVote={post.user_vote}
                        disabled={votePending}
                        onVote={onVote}
                        size={isCompact ? "sm" : "md"}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    {/* Byline: space · author · age */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#16181d]/55">
                        {showSpace && (
                            <>
                                <Link
                                    href={`/community/s/${post.space.slug}`}
                                    className="inline-flex items-center gap-1.5 font-semibold text-[#16181d]/80 transition-colors hover:text-[#1C7BD9]"
                                >
                                    <SpaceIcon icon={post.space.icon} accent={post.space.accent} size={12} />
                                    {post.space.name}
                                </Link>
                                <span aria-hidden>·</span>
                            </>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                            <Avatar
                                name={post.author?.display_name ?? null}
                                src={post.author?.avatar_url}
                                size={18}
                            />
                            <span className="font-medium text-[#16181d]/70">
                                {post.author?.display_name ?? "Deleted member"}
                            </span>
                        </span>
                        <span aria-hidden>·</span>
                        <TimeAgo iso={post.created_at} />
                        {post.edited_at && <span className="italic">edited</span>}

                        <span className="ml-auto flex items-center gap-1.5">
                            {post.is_pinned && (
                                <Pill tone="green">
                                    <Pin size={10} /> Pinned
                                </Pill>
                            )}
                            {post.is_locked && (
                                <Pill tone="amber">
                                    <Lock size={10} /> Locked
                                </Pill>
                            )}
                        </span>
                    </div>

                    {/* Flair + title */}
                    <div className="flex flex-wrap items-baseline gap-2">
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
                    </div>

                    <h2
                        className={`mt-1 font-bold leading-snug text-[#16181d] ${
                            isCompact ? "text-[15px]" : "text-[17px] sm:text-[19px]"
                        }`}
                    >
                        <Link href={href} className="transition-colors hover:text-[#1C7BD9]">
                            {post.title}
                        </Link>
                    </h2>

                    {/* Body / link / image preview */}
                    {!isCompact && post.kind === "link" && post.link_url && (
                        <a
                            href={post.link_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-1.5 text-[12px] font-medium text-[#1C7BD9] transition-colors hover:bg-[#1C7BD9]/[0.06]"
                        >
                            <ExternalLink size={13} className="shrink-0" />
                            <span className="truncate">{hostOf(post.link_url)}</span>
                        </a>
                    )}

                    {!isCompact && post.kind === "image" && post.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={post.image_url}
                            alt=""
                            loading="lazy"
                            className="mt-2 max-h-80 w-full rounded-xl border border-black/[0.07] object-cover"
                        />
                    )}

                    {!isCompact && post.body && post.kind !== "image" && (
                        <div className="relative mt-2 max-h-28 overflow-hidden text-[14px] leading-relaxed text-[#16181d]/70">
                            <Markdown>{post.body}</Markdown>
                            {/* Fade rather than an ellipsis: the excerpt is cut at 500
                                chars server-side, so there may be more of any shape. */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    )}

                    {post.tags.length > 0 && !isCompact && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {post.tags.map((t) => (
                                <TagChip key={t} tag={t} />
                            ))}
                        </div>
                    )}

                    {/* Action line */}
                    <div className="mt-2 flex flex-wrap items-center gap-0.5">
                        {/* Phone: the rail moves here, where the thumb is */}
                        <span className="sm:hidden">
                            <VoteControl
                                score={post.score}
                                userVote={post.user_vote}
                                disabled={votePending}
                                orientation="row"
                                onVote={onVote}
                                size="sm"
                            />
                        </span>

                        <Link
                            href={href}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/55 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
                        >
                            <MessageSquare size={15} />
                            {formatCount(post.comment_count)}
                            <span className="hidden sm:inline">
                                {post.comment_count === 1 ? "comment" : "comments"}
                            </span>
                        </Link>

                        <ShareButton url={shareUrl} title={post.title} />
                        <SaveButton postId={post.id} saved={post.saved} onChange={onSaveChange} />

                        <span className="ml-auto">
                            <ActionMenu
                                isAuthor={post.is_author}
                                targetType="post"
                                targetId={post.id}
                                shareUrl={shareUrl}
                                shareTitle={post.title}
                                onEdit={post.is_author ? () => router.push(`${href}?edit=1`) : undefined}
                                onDelete={post.is_author ? onDelete : undefined}
                            />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

/** "https://www.nejm.org/doi/x" → "nejm.org". Falls back to the raw string. */
function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}
