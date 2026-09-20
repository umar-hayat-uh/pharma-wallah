"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { HelpCircle, Image as ImageIcon, Link2, MessageSquare, ShieldAlert } from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CommunitySpace } from "@/lib/community/types";
import {
    CLINICAL_DISCLAIMER,
    MAX_BODY_LEN,
    MAX_TAGS,
    MAX_TITLE_LEN,
    MIN_TITLE_LEN,
    POST_KINDS,
    type PostKind,
} from "@/lib/community/constants";
import { CommunityShell } from "../CommunityShell";
import { Markdown, SpaceIcon } from "../kit";

const KIND_META: Record<PostKind, { label: string; icon: typeof MessageSquare; hint: string }> = {
    discussion: {
        label: "Discussion",
        icon: MessageSquare,
        hint: "Share notes, start a debate, or post something worth talking about.",
    },
    question: {
        label: "Question",
        icon: HelpCircle,
        hint: "Ask something specific. You'll be able to mark one reply as the accepted answer.",
    },
    link: { label: "Link", icon: Link2, hint: "Share a paper, guideline or article." },
    image: { label: "Image", icon: ImageIcon, hint: "Paste an image URL — a slide, a plate, a structure." },
};

/**
 * The composer.
 *
 * Deliberately one screen with no wizard: a member who wants to ask something
 * should be able to type a title and hit post. The post type is a row of tabs
 * rather than a separate route, so switching from "discussion" to "question"
 * never loses what has been typed.
 */
export function Submit() {
    const { user, loading: authLoading } = useSupabaseUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
    const [spaceId, setSpaceId] = useState<string>("");
    const [kind, setKind] = useState<PostKind>(
        (searchParams.get("kind") as PostKind) && POST_KINDS.includes(searchParams.get("kind") as PostKind)
            ? (searchParams.get("kind") as PostKind)
            : "discussion"
    );
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [flair, setFlair] = useState<string>("");
    const [tags, setTags] = useState("");
    const [preview, setPreview] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/spaces");
                const json = await res.json();
                if (cancelled || !res.ok) return;
                const list: CommunitySpace[] = json.spaces ?? [];
                setSpaces(list);
                // Preselect from ?space=, else the member's first joined space,
                // else nothing — never silently post to a space they didn't pick.
                const requested = searchParams.get("space");
                const match =
                    (requested && list.find((s) => s.slug === requested)) ||
                    list.find((s) => s.joined) ||
                    null;
                if (match) setSpaceId(match.id);
            } catch {
                toast.error("Could not load the spaces list");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    const space = useMemo(() => spaces.find((s) => s.id === spaceId) ?? null, [spaces, spaceId]);

    // A flair from the previous space would be rejected by the API, so clear it.
    useEffect(() => {
        if (flair && space && !space.flairs.includes(flair)) setFlair("");
    }, [space, flair]);

    const tagList = useMemo(
        () =>
            Array.from(
                new Set(
                    tags
                        .split(",")
                        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
                        .filter(Boolean)
                )
            ).slice(0, MAX_TAGS),
        [tags]
    );

    const titleError =
        title.length > 0 && title.trim().length < MIN_TITLE_LEN
            ? `At least ${MIN_TITLE_LEN} characters`
            : null;

    const canSubmit =
        !!spaceId &&
        title.trim().length >= MIN_TITLE_LEN &&
        (kind !== "link" || linkUrl.trim().length > 0) &&
        (kind !== "image" || imageUrl.trim().length > 0) &&
        !busy;

    async function submit() {
        if (!canSubmit) return;
        setBusy(true);
        try {
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    space_id: spaceId,
                    kind,
                    title: title.trim(),
                    body: body.trim(),
                    link_url: kind === "link" ? linkUrl.trim() : undefined,
                    image_url: kind === "image" ? imageUrl.trim() : undefined,
                    flair: flair || undefined,
                    tags: tagList,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Could not publish");
            toast.success("Posted");
            router.push(`/community/post/${json.post.id}`);
        } catch (err: any) {
            toast.error(err?.message || "Could not publish your post");
            setBusy(false);
        }
    }

    if (!authLoading && !user) {
        return (
            <CommunityShell>
                <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                    <p className="text-[18px] font-bold text-[#16181d]">Sign in to post</p>
                    <p className="mt-1 text-[14px] text-[#16181d]/55">
                        You need an account to post in the community. Reading is open to everyone.
                    </p>
                    <Link
                        href="/signin?redirect=/community/submit"
                        className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        Sign in
                    </Link>
                </div>
            </CommunityShell>
        );
    }

    return (
        <CommunityShell right={<PostingTips />}>
            <h1 className="mb-3 text-[22px] font-bold text-[#16181d]">Create a post</h1>

            <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
                {/* Space */}
                <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#16181d]/40">
                    Space
                </label>
                <select
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] font-medium text-[#16181d] outline-none focus:border-[#1C7BD9]"
                >
                    <option value="">Choose a space…</option>
                    {spaces.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
                {space?.tagline && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-[#16181d]/50">
                        <SpaceIcon icon={space.icon} accent={space.accent} size={11} />
                        {space.tagline}
                    </p>
                )}

                {/* Kind */}
                <div className="mt-4 flex gap-1 overflow-x-auto border-b border-black/[0.07] pb-0">
                    {POST_KINDS.map((k) => {
                        const { label, icon: Icon } = KIND_META[k];
                        const active = kind === k;
                        return (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setKind(k)}
                                aria-pressed={active}
                                className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors ${
                                    active
                                        ? "border-[#1C7BD9] text-[#1C7BD9]"
                                        : "border-transparent text-[#16181d]/50 hover:text-[#16181d]"
                                }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>
                <p className="mt-2 text-[12.5px] text-[#16181d]/50">{KIND_META[kind].hint}</p>

                {/* Title */}
                <div className="mt-4">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={MAX_TITLE_LEN}
                        placeholder={
                            kind === "question"
                                ? "What do you want to know? Be specific."
                                : "Give it a clear title"
                        }
                        aria-label="Title"
                        aria-invalid={!!titleError}
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[16px] font-semibold text-[#16181d] outline-none transition-colors ${
                            titleError ? "border-[#c2410c]" : "border-black/10 focus:border-[#1C7BD9]"
                        }`}
                    />
                    <div className="mt-1 flex text-[11.5px]">
                        <span className={titleError ? "text-[#c2410c]" : "text-transparent"}>
                            {titleError ?? "."}
                        </span>
                        <span className="ml-auto tabular-nums text-[#16181d]/35">
                            {title.length}/{MAX_TITLE_LEN}
                        </span>
                    </div>
                </div>

                {/* Kind-specific field */}
                {kind === "link" && (
                    <input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://…"
                        inputMode="url"
                        aria-label="Link URL"
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] text-[#16181d] outline-none focus:border-[#1C7BD9]"
                    />
                )}
                {kind === "image" && (
                    <>
                        <input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://… (direct image link)"
                            inputMode="url"
                            aria-label="Image URL"
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] text-[#16181d] outline-none focus:border-[#1C7BD9]"
                        />
                        <p className="mt-1 text-[11.5px] text-[#16181d]/40">
                            The site has no image hosting yet, so paste a link to an image you have
                            already uploaded somewhere.
                        </p>
                    </>
                )}

                {/* Body */}
                <div className="mt-3">
                    <div className="mb-1 flex items-center">
                        <label className="text-[12px] font-bold uppercase tracking-wider text-[#16181d]/40">
                            {kind === "link" || kind === "image" ? "Context (optional)" : "Body"}
                        </label>
                        <button
                            type="button"
                            onClick={() => setPreview((p) => !p)}
                            className="ml-auto rounded-lg px-2 py-1 text-[12px] font-semibold text-[#16181d]/50 transition-colors hover:bg-black/[0.05]"
                        >
                            {preview ? "Write" : "Preview"}
                        </button>
                    </div>

                    {preview ? (
                        <div className="min-h-[160px] rounded-xl border border-black/10 bg-black/[0.015] px-3 py-2.5 text-[14px] leading-relaxed text-[#16181d]/85">
                            {body.trim() ? (
                                <Markdown>{body}</Markdown>
                            ) : (
                                <p className="text-[#16181d]/35">Nothing to preview yet.</p>
                            )}
                        </div>
                    ) : (
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            maxLength={MAX_BODY_LEN}
                            rows={8}
                            placeholder={
                                kind === "question"
                                    ? "Give the detail: what you tried, what you expected, where it stopped making sense."
                                    : "Markdown supported — **bold**, lists, `code`, > quotes, tables."
                            }
                            aria-label="Body"
                            className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-[#16181d] outline-none focus:border-[#1C7BD9]"
                        />
                    )}
                    <p className="mt-1 text-right text-[11.5px] tabular-nums text-[#16181d]/35">
                        {body.length}/{MAX_BODY_LEN}
                    </p>
                </div>

                {/* Flair */}
                {space && space.flairs.length > 0 && (
                    <div className="mt-3">
                        <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#16181d]/40">
                            Flair
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {space.flairs.map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFlair(flair === f ? "" : f)}
                                    aria-pressed={flair === f}
                                    className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                                        flair === f
                                            ? "border-[#1C7BD9] bg-[#1C7BD9]/10 text-[#1C7BD9]"
                                            : "border-black/10 text-[#16181d]/60 hover:bg-black/[0.03]"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div className="mt-3">
                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#16181d]/40">
                        Tags <span className="normal-case tracking-normal">(up to {MAX_TAGS}, comma separated)</span>
                    </label>
                    <input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="warfarin, cyp450, interactions"
                        aria-label="Tags"
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] text-[#16181d] outline-none focus:border-[#1C7BD9]"
                    />
                    {tagList.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {tagList.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11.5px] font-medium text-[#16181d]/65"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Safety note — a pharmacy community needs this at the point of writing */}
                <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-300/40 bg-amber-50/70 p-3">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-[12.5px] leading-relaxed text-amber-900/85">
                        {CLINICAL_DISCLAIMER} Never include anything that could identify a patient.
                    </p>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit}
                        className="rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        {busy ? "Posting…" : "Post"}
                    </button>
                    <Link
                        href="/community"
                        className="rounded-xl border border-black/10 px-5 py-2.5 text-[14px] font-semibold text-[#16181d]/65 transition-colors hover:bg-black/[0.03]"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </CommunityShell>
    );
}

function PostingTips() {
    return (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
            <h3 className="text-[13px] font-bold text-[#16181d]">Getting a good answer</h3>
            <ul className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-[#16181d]/60">
                <li>
                    <strong className="text-[#16181d]/80">Put the real question in the title.</strong>{" "}
                    "Why does amiodarone raise INR?" beats "Help with pharmacology".
                </li>
                <li>
                    <strong className="text-[#16181d]/80">Show your working.</strong> For a
                    calculation, post the numbers you used — it is usually one step that went wrong.
                </li>
                <li>
                    <strong className="text-[#16181d]/80">Say what you already checked.</strong> It
                    saves everyone repeating the textbook back at you.
                </li>
                <li>
                    <strong className="text-[#16181d]/80">Pick the right space.</strong> A
                    formulation question in Pharmaceutics gets read by people who formulate.
                </li>
            </ul>
        </div>
    );
}
