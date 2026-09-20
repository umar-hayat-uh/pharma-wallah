"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Bookmark,
    Compass,
    Home,
    PenSquare,
    ShieldCheck,
    TrendingUp,
    Users,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import type { CommunityMe, CommunitySpace } from "@/lib/community/types";
import { CLINICAL_DISCLAIMER } from "@/lib/community/constants";
import { Avatar, SpaceIcon, formatCount } from "./kit";

/**
 * The three-column frame every community page sits in.
 *
 * Left rail  — navigation and the member's spaces (sticky, desktop only)
 * Centre     — the page itself
 * Right rail — context: the member's card, the space list, the rules
 *
 * On a phone the rails collapse: navigation becomes a scrollable strip of
 * spaces above the feed, and the right rail's content moves below it, because
 * a member on a phone wants the feed first and the context afterwards.
 */
export function CommunityShell({
    children,
    right,
    activeSpaceSlug,
}: {
    children: React.ReactNode;
    right?: React.ReactNode;
    activeSpaceSlug?: string;
}) {
    const { user } = useSupabaseUser();
    const pathname = usePathname();
    const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
    const [me, setMe] = useState<CommunityMe | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/spaces");
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) setSpaces(json.spaces ?? []);
            } catch {
                // The rail is navigation, not content — a failure leaves the
                // page perfectly usable, so it fails quietly (§6 rule 8).
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!user) {
            setMe(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/community/me");
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) setMe(json.me ?? null);
            } catch {
                /* the member card is optional chrome */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const joined = spaces.filter((s) => s.joined);
    const rest = spaces.filter((s) => !s.joined);

    const navItems = [
        { href: "/community", label: "Home", icon: Home },
        { href: "/community/spaces", label: "All spaces", icon: Compass },
        { href: "/community?sort=top&range=week", label: "Top this week", icon: TrendingUp },
        ...(user ? [{ href: "/community/saved", label: "Saved", icon: Bookmark }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#fcfcfa]">
            <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-6">
                {/* ── Left rail ───────────────────────────────────────── */}
                <aside className="hidden w-56 shrink-0 lg:block">
                    <div className="sticky top-24">
                        <Link
                            href="/community/submit"
                            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-95"
                            style={{
                                background:
                                    "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                            }}
                        >
                            <PenSquare size={16} />
                            Create post
                        </Link>

                        <nav className="space-y-0.5">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active =
                                    href === "/community"
                                        ? pathname === "/community"
                                        : pathname.startsWith(href.split("?")[0]) &&
                                          href.split("?")[0] !== "/community";
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                                            active
                                                ? "bg-[#1C7BD9]/10 text-[#1C7BD9]"
                                                : "text-[#16181d]/65 hover:bg-black/[0.04] hover:text-[#16181d]"
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {joined.length > 0 && (
                            <RailSection title="Your spaces">
                                {joined.map((s) => (
                                    <SpaceLink key={s.id} space={s} active={s.slug === activeSpaceSlug} />
                                ))}
                            </RailSection>
                        )}

                        <RailSection title={joined.length > 0 ? "Discover" : "Spaces"}>
                            {rest.slice(0, 12).map((s) => (
                                <SpaceLink key={s.id} space={s} active={s.slug === activeSpaceSlug} />
                            ))}
                        </RailSection>
                    </div>
                </aside>

                {/* ── Centre ──────────────────────────────────────────── */}
                <main className="min-w-0 flex-1 lg:max-w-[720px]">
                    {/* Phone / tablet space strip — the left rail's job, horizontally */}
                    {spaces.length > 0 && (
                        <div className="mb-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <Link
                                href="/community"
                                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                                    !activeSpaceSlug
                                        ? "border-transparent bg-[#16181d] text-white"
                                        : "border-black/10 bg-white text-[#16181d]/65"
                                }`}
                            >
                                All
                            </Link>
                            {spaces.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/community/s/${s.slug}`}
                                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                                        activeSpaceSlug === s.slug
                                            ? "border-transparent bg-[#16181d] text-white"
                                            : "border-black/10 bg-white text-[#16181d]/65"
                                    }`}
                                >
                                    {s.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {children}

                    {/* The right rail's content, below the feed, on small screens */}
                    {right && <div className="mt-6 space-y-3 xl:hidden">{right}</div>}
                </main>

                {/* ── Right rail ──────────────────────────────────────── */}
                <aside className="hidden w-[320px] shrink-0 xl:block">
                    <div className="sticky top-24 space-y-3">
                        {me && <MemberCard me={me} />}
                        {right}
                        <SafetyCard />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-5">
            <h3 className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#16181d]/35">
                {title}
            </h3>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function SpaceLink({ space, active }: { space: CommunitySpace; active?: boolean }) {
    return (
        <Link
            href={`/community/s/${space.slug}`}
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                active ? "bg-black/[0.05] text-[#16181d]" : "text-[#16181d]/65 hover:bg-black/[0.04]"
            }`}
        >
            <SpaceIcon icon={space.icon} accent={space.accent} size={12} />
            <span className="truncate">{space.name}</span>
        </Link>
    );
}

function MemberCard({ me }: { me: CommunityMe }) {
    return (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-center gap-3">
                <Avatar name={me.display_name} src={me.avatar_url} size={40} />
                <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#16181d]">
                        {me.display_name ?? "Member"}
                    </p>
                    {me.handle && (
                        <p className="truncate text-[12px] text-[#16181d]/50">u/{me.handle}</p>
                    )}
                </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-3 text-center">
                <Stat label="Karma" value={me.karma} />
                <Stat label="Posts" value={me.post_count} />
                <Stat label="Comments" value={me.comment_count} />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-[16px] font-bold tabular-nums text-[#16181d]">{formatCount(value)}</p>
            <p className="text-[11px] font-medium text-[#16181d]/45">{label}</p>
        </div>
    );
}

/** Standing pharmacy-safety note. A drug community needs this on every page. */
function SafetyCard() {
    return (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#128257]" />
                <h3 className="text-[13px] font-bold text-[#16181d]">Before you post</h3>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#16181d]/60">
                {CLINICAL_DISCLAIMER}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#16181d]/60">
                Never post anything that could identify a patient — no names, record numbers or dates
                of birth.
            </p>
        </div>
    );
}

/** Reusable "about this space" card for the right rail. */
export function SpaceCard({
    space,
    onToggleJoin,
    busy,
}: {
    space: CommunitySpace;
    onToggleJoin?: () => void;
    busy?: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
            <div
                className="h-14"
                style={{
                    background: `linear-gradient(120deg, ${space.accent}, color-mix(in srgb, ${space.accent} 45%, #21B67A))`,
                }}
            />
            <div className="p-4">
                <div className="-mt-9 mb-2">
                    <span className="inline-flex rounded-2xl bg-white p-1 shadow-sm">
                        <SpaceIcon icon={space.icon} accent={space.accent} size={20} />
                    </span>
                </div>
                <h2 className="text-[16px] font-bold text-[#16181d]">{space.name}</h2>
                {space.tagline && (
                    <p className="mt-0.5 text-[12.5px] font-medium text-[#16181d]/50">
                        {space.tagline}
                    </p>
                )}
                {space.description && (
                    <p className="mt-2 text-[13px] leading-relaxed text-[#16181d]/65">
                        {space.description}
                    </p>
                )}

                <div className="mt-3 flex gap-4 border-t border-black/[0.06] pt-3">
                    <div>
                        <p className="text-[15px] font-bold tabular-nums text-[#16181d]">
                            {formatCount(space.member_count)}
                        </p>
                        <p className="text-[11px] font-medium text-[#16181d]/45">Members</p>
                    </div>
                    <div>
                        <p className="text-[15px] font-bold tabular-nums text-[#16181d]">
                            {formatCount(space.post_count)}
                        </p>
                        <p className="text-[11px] font-medium text-[#16181d]/45">Posts</p>
                    </div>
                </div>

                {onToggleJoin && (
                    <button
                        type="button"
                        onClick={onToggleJoin}
                        disabled={busy}
                        className={`mt-3 w-full rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-60 ${
                            space.joined
                                ? "border border-black/10 text-[#16181d]/70 hover:bg-black/[0.03]"
                                : "text-white"
                        }`}
                        style={
                            space.joined
                                ? undefined
                                : {
                                      background:
                                          "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)",
                                  }
                        }
                    >
                        {space.joined ? "Leave space" : "Join space"}
                    </button>
                )}

                {space.rules.length > 0 && (
                    <div className="mt-4 border-t border-black/[0.06] pt-3">
                        <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#16181d]/35">
                            <Users size={12} /> Space rules
                        </h3>
                        <ol className="space-y-1.5">
                            {space.rules.map((rule, i) => (
                                <li
                                    key={i}
                                    className="flex gap-2 text-[12.5px] leading-relaxed text-[#16181d]/60"
                                >
                                    <span className="font-bold text-[#16181d]/30">{i + 1}.</span>
                                    {rule}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
