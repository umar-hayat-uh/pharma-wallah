"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Flag, Link2, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { REPORT_REASONS } from "@/lib/community/constants";

/**
 * The action row under a post or comment: save, share, report, edit, delete.
 *
 * Destructive and outward-facing actions both confirm before they fire —
 * deleting asks inline, and reporting opens a reason sheet rather than sending
 * a bare flag, so the moderation queue arrives grouped and actionable.
 */

export function ActionMenu({
    isAuthor,
    targetType,
    targetId,
    shareUrl,
    shareTitle,
    onEdit,
    onDelete,
}: {
    isAuthor: boolean;
    targetType: "post" | "comment";
    targetId: string;
    shareUrl?: string;
    shareTitle?: string;
    onEdit?: () => void;
    onDelete?: () => Promise<void> | void;
}) {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [reporting, setReporting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onPointerDown(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirming(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setOpen(false);
                setConfirming(false);
            }
        }
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    async function handleDelete() {
        if (!onDelete) return;
        setBusy(true);
        try {
            await onDelete();
        } finally {
            setBusy(false);
            setOpen(false);
            setConfirming(false);
        }
    }

    return (
        <>
            <div className="relative" ref={ref}>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-label="More options"
                    aria-expanded={open}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#16181d]/45 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
                >
                    <MoreHorizontal size={16} />
                </button>

                {open && (
                    <div className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg shadow-black/5">
                        {shareUrl && (
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(shareUrl);
                                        toast.success("Link copied");
                                    } catch {
                                        toast.error("Couldn't copy the link");
                                    }
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[#16181d]/80 transition-colors hover:bg-black/[0.04]"
                            >
                                <Link2 size={15} /> Copy link
                            </button>
                        )}

                        {isAuthor && onEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onEdit();
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[#16181d]/80 transition-colors hover:bg-black/[0.04]"
                            >
                                <Pencil size={15} /> Edit
                            </button>
                        )}

                        {!isAuthor && (
                            <button
                                type="button"
                                onClick={() => {
                                    setReporting(true);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[#16181d]/80 transition-colors hover:bg-black/[0.04]"
                            >
                                <Flag size={15} /> Report
                            </button>
                        )}

                        {isAuthor && onDelete && (
                            <>
                                <div className="my-1 h-px bg-black/[0.07]" />
                                {confirming ? (
                                    <div className="px-3 py-2">
                                        <p className="mb-2 text-[12px] font-medium text-[#16181d]/70">
                                            Delete this {targetType}?
                                        </p>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={busy}
                                                className="flex-1 rounded-lg bg-[#c2410c] px-2 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                                            >
                                                {busy ? "Deleting…" : "Delete"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirming(false)}
                                                className="flex-1 rounded-lg border border-black/10 px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/70"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirming(true)}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[#c2410c] transition-colors hover:bg-[#c2410c]/[0.06]"
                                    >
                                        <Trash2 size={15} /> Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {reporting && (
                <ReportDialog
                    targetType={targetType}
                    targetId={targetId}
                    onClose={() => setReporting(false)}
                />
            )}
        </>
    );
}

function ReportDialog({
    targetType,
    targetId,
    onClose,
}: {
    targetType: "post" | "comment";
    targetId: string;
    onClose: () => void;
}) {
    const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
    const [details, setDetails] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function submit() {
        setBusy(true);
        try {
            const res = await fetch("/api/community/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Could not send the report");
            toast.success("Reported — thanks, a moderator will look at it.");
            onClose();
        } catch (err: any) {
            toast.error(err?.message || "Could not send the report");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#06122480] p-0 sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Report this ${targetType}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
                <h2 className="text-[17px] font-bold text-[#16181d]">Report this {targetType}</h2>
                <p className="mt-1 text-[13px] text-[#16181d]/60">
                    Reports go to the moderators. Pick the closest reason.
                </p>

                <div className="mt-4 space-y-1">
                    {REPORT_REASONS.map((r) => (
                        <label
                            key={r}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-[13px] transition-colors ${
                                reason === r
                                    ? "border-[#1C7BD9]/50 bg-[#1C7BD9]/[0.06] font-semibold text-[#1C7BD9]"
                                    : "border-black/10 text-[#16181d]/75 hover:bg-black/[0.03]"
                            }`}
                        >
                            <input
                                type="radio"
                                name="report-reason"
                                value={r}
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="accent-[#1C7BD9]"
                            />
                            {r}
                        </label>
                    ))}
                </div>

                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Anything else a moderator should know (optional)"
                    className="mt-3 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] text-[#16181d] outline-none transition-colors focus:border-[#1C7BD9]"
                />

                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className="flex-1 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-60"
                        style={{
                            background:
                                "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                        }}
                    >
                        {busy ? "Sending…" : "Send report"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-black/10 px-4 py-2.5 text-[14px] font-semibold text-[#16181d]/70 transition-colors hover:bg-black/[0.03]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Save / unsave toggle, optimistic with rollback. */
export function SaveButton({
    postId,
    saved,
    onChange,
    compact = false,
}: {
    postId: string;
    saved: boolean;
    onChange: (saved: boolean) => void;
    compact?: boolean;
}) {
    const [busy, setBusy] = useState(false);

    async function toggle() {
        if (busy) return;
        setBusy(true);
        const next = !saved;
        onChange(next);
        try {
            const res = await fetch(`/api/community/posts/${postId}/save`, {
                method: next ? "POST" : "DELETE",
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || "Could not save");
            }
        } catch (err: any) {
            onChange(!next); // roll back
            toast.error(err?.message || "Could not save the post");
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                saved
                    ? "text-[#128257] hover:bg-[#21B67A]/10"
                    : "text-[#16181d]/55 hover:bg-black/[0.05] hover:text-[#16181d]"
            }`}
        >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            {!compact && (saved ? "Saved" : "Save")}
        </button>
    );
}

/** Share: the Web Share sheet on a phone, clipboard everywhere else. */
export function ShareButton({ url, title }: { url: string; title: string }) {
    return (
        <button
            type="button"
            onClick={async () => {
                // navigator.share needs a user gesture and a secure context; it is
                // absent on desktop Chrome, so clipboard is the real default.
                if (typeof navigator !== "undefined" && navigator.share) {
                    try {
                        await navigator.share({ title, url });
                        return;
                    } catch {
                        // The member dismissed the sheet — not an error.
                        return;
                    }
                }
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied");
                } catch {
                    toast.error("Couldn't copy the link");
                }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[#16181d]/55 transition-colors hover:bg-black/[0.05] hover:text-[#16181d]"
        >
            <Share2 size={15} /> Share
        </button>
    );
}
