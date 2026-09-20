"use client";

/**
 * Community — the small shared pieces every surface repeats.
 *
 * Design language is the site's, not Reddit's: Outfit, ink #16181d on board
 * white #fcfcfa, hairline rules, and the brand blue→green gradient for the one
 * strong surface per view (CLAUDE.md §6 rules 12/15 — no black grounds). What
 * is borrowed from Reddit is the *information architecture*: a vote rail, a
 * dense scannable row, a space badge, and a byline that reads
 * "space · author · age".
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Atom,
    Brain,
    Briefcase,
    Building2,
    Calculator,
    FlaskConical,
    GraduationCap,
    Leaf,
    LineChart,
    MessageSquare,
    Microscope,
    Stethoscope,
    type LucideIcon,
} from "lucide-react";

/**
 * The migration stores a lucide icon *name* per space. Mapping it here (rather
 * than importing all of lucide dynamically) keeps the bundle to these twelve
 * icons and means an unknown name degrades to a sensible default instead of
 * crashing the feed.
 */
const SPACE_ICONS: Record<string, LucideIcon> = {
    Brain,
    FlaskConical,
    Stethoscope,
    Atom,
    Leaf,
    LineChart,
    Calculator,
    Building2,
    GraduationCap,
    Briefcase,
    Microscope,
    MessageSquare,
};

export function SpaceIcon({
    icon,
    accent,
    size = 18,
    className = "",
}: {
    icon: string;
    accent: string;
    size?: number;
    className?: string;
}) {
    const Icon = SPACE_ICONS[icon] ?? MessageSquare;
    return (
        <span
            className={`inline-flex items-center justify-center rounded-xl shrink-0 ${className}`}
            style={{
                width: size * 1.9,
                height: size * 1.9,
                // A 12% tint of the space's accent: enough to tell spaces apart
                // at a glance without competing with the brand gradient.
                background: `color-mix(in srgb, ${accent} 12%, white)`,
                color: accent,
            }}
        >
            <Icon size={size} strokeWidth={2.1} />
        </span>
    );
}

/** Initials plate — the site has no uploaded avatars, so this is the default. */
export function Avatar({
    name,
    src,
    size = 28,
}: {
    name: string | null;
    src?: string | null;
    size?: number;
}) {
    const initials = useMemo(() => {
        const clean = (name ?? "").trim();
        if (!clean) return "?";
        const parts = clean.split(/\s+/).slice(0, 2);
        return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
    }, [name]);

    if (src) {
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={src}
                alt=""
                width={size}
                height={size}
                className="rounded-full object-cover shrink-0 ring-1 ring-black/5"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <span
            className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-white ring-1 ring-black/5"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.4,
                background: "linear-gradient(135deg, #1C7BD9, #21B67A)",
            }}
            aria-hidden
        >
            {initials}
        </span>
    );
}

/**
 * Relative time that is hydration-safe: the server renders the absolute date,
 * and the relative form appears after mount. Rendering "2 hours ago" on the
 * server guarantees a mismatch, because the two clocks differ by the request.
 */
export function TimeAgo({ iso, className = "" }: { iso: string; className?: string }) {
    const [relative, setRelative] = useState<string | null>(null);

    useEffect(() => {
        const compute = () => {
            const then = new Date(iso).getTime();
            if (!Number.isFinite(then)) return "";
            const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
            if (seconds < 60) return "just now";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days < 30) return `${days}d ago`;
            const months = Math.floor(days / 30);
            if (months < 12) return `${months}mo ago`;
            return `${Math.floor(months / 12)}y ago`;
        };
        setRelative(compute());
        // Re-tick each minute so a thread left open does not freeze at "just now".
        const timer = setInterval(() => setRelative(compute()), 60_000);
        return () => clearInterval(timer);
    }, [iso]);

    const absolute = new Date(iso).toISOString().slice(0, 10);
    return (
        <time dateTime={iso} title={absolute} className={className} suppressHydrationWarning>
            {relative ?? absolute}
        </time>
    );
}

/** 1200 → "1.2k". Keeps a vote rail one glyph wide at any score. */
export function formatCount(n: number): string {
    const abs = Math.abs(n);
    if (abs < 1000) return String(n);
    if (abs < 1_000_000) return `${(n / 1000).toFixed(abs < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

/**
 * Post and comment bodies are Markdown.
 *
 * react-markdown does NOT render raw HTML unless `rehype-raw` is added — it is
 * deliberately not added here, so a member cannot inject markup into someone
 * else's page. Links are additionally forced to open in a new tab with
 * `noopener`, and any non-http(s) href is stripped rather than rendered.
 */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
    return (
        <div className={`pw-md ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children }) => {
                        const safe =
                            typeof href === "string" && /^https?:\/\//i.test(href) ? href : null;
                        if (!safe) return <span>{children}</span>;
                        return (
                            <a href={safe} target="_blank" rel="noopener noreferrer nofollow">
                                {children}
                            </a>
                        );
                    },
                    // Images in a body are links, not embeds: an arbitrary remote
                    // <img> is a tracking pixel and a layout risk.
                    img: ({ src, alt }) =>
                        typeof src === "string" && /^https?:\/\//i.test(src) ? (
                            <a href={src} target="_blank" rel="noopener noreferrer nofollow">
                                {alt || "View image"}
                            </a>
                        ) : null,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}

/** A tag chip that filters the feed. */
export function TagChip({ tag, spaceSlug }: { tag: string; spaceSlug?: string }) {
    const href = spaceSlug ? `/community/s/${spaceSlug}?tag=${tag}` : `/community?tag=${tag}`;
    return (
        <Link
            href={href}
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#16181d]/70 transition-colors hover:border-[#1C7BD9]/40 hover:text-[#1C7BD9]"
        >
            #{tag}
        </Link>
    );
}

export function Pill({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "brand" | "green" | "amber";
}) {
    const tones: Record<string, string> = {
        neutral: "bg-black/[0.04] text-[#16181d]/70",
        brand: "bg-[#1C7BD9]/10 text-[#1C7BD9]",
        green: "bg-[#21B67A]/12 text-[#128257]",
        amber: "bg-amber-400/15 text-amber-700",
    };
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
        >
            {children}
        </span>
    );
}
