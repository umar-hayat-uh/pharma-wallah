"use client";

import Link from "next/link";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { CommunityShell } from "../CommunityShell";
import { Feed } from "../Feed";

/** The member's saved posts. Private by RLS — never another member's list. */
export function SavedView() {
    const { user, loading } = useSupabaseUser();

    if (!loading && !user) {
        return (
            <CommunityShell>
                <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                    <p className="text-[18px] font-bold text-[#16181d]">Sign in to see saved posts</p>
                    <p className="mt-1 text-[14px] text-[#16181d]/55">
                        Saved posts are private to your account.
                    </p>
                    <Link
                        href="/signin?redirect=/community/saved"
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
        <CommunityShell>
            <header className="mb-3">
                <h1 className="text-[24px] font-bold text-[#16181d]">Saved</h1>
                <p className="mt-1 text-[14px] text-[#16181d]/55">
                    Only you can see this list.
                </p>
            </header>
            <Feed
                savedOnly
                emptyTitle="Nothing saved yet"
                emptyBody="Tap Save on any post and it lands here — useful for revision threads you want to come back to."
            />
        </CommunityShell>
    );
}
