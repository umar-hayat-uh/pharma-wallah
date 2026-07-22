"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Link2, Flag } from "lucide-react";
import { toast } from "react-hot-toast";

type ActionsMenuProps = {
    isOwner: boolean;
    shareUrl: string;
    onEdit?: () => void;
    onDelete: () => Promise<void> | void;
    deleteLabel?: string;
};

export default function ActionsMenu({ isOwner, shareUrl, onEdit, onDelete, deleteLabel = "this post" }: ActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmingDelete(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleDeleteConfirmed() {
        setDeleting(true);
        try {
            await onDelete();
        } finally {
            setDeleting(false);
            setOpen(false);
            setConfirmingDelete(false);
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="More options"
                aria-expanded={open}
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-slate-600 rounded-full transition-colors"
            >
                <MoreHorizontal size={20} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-20 text-sm">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            toast.success("Link copied!");
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Link2 size={15} />
                        Copy link
                    </button>

                    {isOwner && onEdit && (
                        <button
                            onClick={() => { onEdit(); setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>
                    )}

                    {isOwner && !confirmingDelete && (
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={15} />
                            Delete
                        </button>
                    )}

                    {isOwner && confirmingDelete && (
                        <div className="px-4 py-2">
                            <p className="text-xs text-slate-500 mb-2">Delete {deleteLabel}? This can't be undone.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteConfirmed}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg py-1.5 disabled:opacity-50"
                                >
                                    {deleting ? "Deleting..." : "Confirm"}
                                </button>
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold rounded-lg py-1.5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {!isOwner && (
                        <button
                            onClick={() => {
                                toast.success("Thanks — we'll take a look.");
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Flag size={15} />
                            Report
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}