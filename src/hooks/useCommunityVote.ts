"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

type TargetType = "post" | "comment";
type VoteValue = 1 | -1;

export type VoteResult = { score: number; user_vote: VoteValue | null };

/**
 * Voting for the community.
 *
 * Differs from the old `useVote` in one important way: the optimistic delta is
 * only ever a *guess*. `/api/community/vote` computes the real score in the
 * database and returns it, and this hook then replaces the guess with that
 * number. Two tabs, a double-tap, or a stale feed therefore converge on the
 * truth instead of drifting — the old hook trusted its own arithmetic and had
 * no way back if the server disagreed.
 *
 * `onResolve` is called twice per vote: once immediately with the predicted
 * state, once with the authoritative state from the server.
 */
export function useCommunityVote(isAuthenticated: boolean) {
    const [pending, setPending] = useState<Record<string, boolean>>({});
    // A ref as well as state: the guard must be readable synchronously, before
    // React has re-rendered, or a fast double-click fires two requests.
    const inFlight = useRef<Set<string>>(new Set());

    const vote = useCallback(
        async (
            targetType: TargetType,
            targetId: string,
            direction: VoteValue,
            currentVote: VoteValue | null,
            currentScore: number,
            onResolve: (next: VoteResult) => void
        ) => {
            if (!isAuthenticated) {
                toast.error("Sign in to vote.");
                return;
            }
            if (inFlight.current.has(targetId)) return;

            inFlight.current.add(targetId);
            setPending((p) => ({ ...p, [targetId]: true }));

            // Predict: same direction again takes the vote back; the opposite
            // direction swings by two; a fresh vote by one.
            const isToggleOff = currentVote === direction;
            const predictedVote: VoteValue | null = isToggleOff ? null : direction;
            const predictedScore =
                currentScore + (isToggleOff ? -direction : currentVote ? direction * 2 : direction);

            onResolve({ score: predictedScore, user_vote: predictedVote });

            try {
                const res = await fetch("/api/community/vote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        target_type: targetType,
                        target_id: targetId,
                        value: direction,
                    }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Vote failed");

                // Authoritative — overwrite the prediction, right or wrong.
                onResolve({ score: json.score, user_vote: json.user_vote ?? null });
            } catch (err: any) {
                onResolve({ score: currentScore, user_vote: currentVote });
                toast.error(err?.message || "Couldn't save your vote.");
            } finally {
                inFlight.current.delete(targetId);
                setPending((p) => {
                    const next = { ...p };
                    delete next[targetId];
                    return next;
                });
            }
        },
        [isAuthenticated]
    );

    return { vote, pending };
}
