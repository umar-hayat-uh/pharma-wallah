"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { formatCount } from "./kit";

/**
 * The vote rail. Two orientations from one component:
 *  - `column` for a post card's left edge (Reddit's arrangement)
 *  - `row` for a comment's action line, where vertical space is the scarce one
 *
 * The score colour follows the member's own vote, not the sign of the number —
 * that is what makes "did I vote on this?" readable without reading the arrows.
 */
export function VoteControl({
    score,
    userVote,
    disabled,
    orientation = "column",
    onVote,
    size = "md",
}: {
    score: number;
    userVote: 1 | -1 | null;
    disabled?: boolean;
    orientation?: "column" | "row";
    onVote: (direction: 1 | -1) => void;
    size?: "sm" | "md";
}) {
    const isColumn = orientation === "column";
    const iconSize = size === "sm" ? 18 : 22;

    const scoreColor =
        userVote === 1 ? "text-[#1C7BD9]" : userVote === -1 ? "text-[#c2410c]" : "text-[#16181d]/70";

    const buttonBase =
        "inline-flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <div
            className={
                isColumn
                    ? "flex flex-col items-center gap-0.5 select-none"
                    : "inline-flex items-center gap-0.5 select-none"
            }
        >
            <button
                type="button"
                onClick={() => onVote(1)}
                disabled={disabled}
                aria-label="Upvote"
                aria-pressed={userVote === 1}
                className={`${buttonBase} ${size === "sm" ? "h-7 w-7" : "h-8 w-8"} ${
                    userVote === 1
                        ? "bg-[#1C7BD9]/10 text-[#1C7BD9]"
                        : "text-[#16181d]/45 hover:bg-[#1C7BD9]/10 hover:text-[#1C7BD9]"
                }`}
            >
                <ArrowBigUp size={iconSize} fill={userVote === 1 ? "currentColor" : "none"} />
            </button>

            <span
                className={`tabular-nums font-semibold ${scoreColor} ${
                    size === "sm" ? "text-[12px]" : "text-[13px]"
                } ${isColumn ? "py-0.5" : "px-1"}`}
                // Announced as one value rather than as three controls changing.
                aria-live="polite"
            >
                {formatCount(score)}
            </span>

            <button
                type="button"
                onClick={() => onVote(-1)}
                disabled={disabled}
                aria-label="Downvote"
                aria-pressed={userVote === -1}
                className={`${buttonBase} ${size === "sm" ? "h-7 w-7" : "h-8 w-8"} ${
                    userVote === -1
                        ? "bg-[#c2410c]/10 text-[#c2410c]"
                        : "text-[#16181d]/45 hover:bg-[#c2410c]/10 hover:text-[#c2410c]"
                }`}
            >
                <ArrowBigDown size={iconSize} fill={userVote === -1 ? "currentColor" : "none"} />
            </button>
        </div>
    );
}
