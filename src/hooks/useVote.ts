import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

type TargetType = "question" | "answer";

/**
 * Handles upvote/downvote against /api/qa/votes with optimistic UI updates.
 * `onScoreChange` receives the delta to apply immediately; if the request
 * fails, the same negative delta is replayed to roll back.
 */
export function useVote(isAuthenticated: boolean) {
    const [pending, setPending] = useState<Record<string, boolean>>({});

    const vote = useCallback(
        async (
            targetId: string,
            targetType: TargetType,
            voteType: "up" | "down",
            currentUserVote: "up" | "down" | null,
            onScoreChange: (delta: number) => void
        ) => {
            if (!isAuthenticated) {
                toast.error("Sign in to vote.");
                return;
            }
            if (pending[targetId]) return;

            setPending((p) => ({ ...p, [targetId]: true }));

            const isRemovingVote = currentUserVote === voteType;
            // Optimistic delta: toggling off removes the previous vote's weight;
            // switching direction removes the old and applies the new (net 2);
            // casting fresh applies just the new vote's weight.
            let delta = 0;
            if (isRemovingVote) delta = voteType === "up" ? -1 : 1;
            else if (currentUserVote) delta = voteType === "up" ? 2 : -2;
            else delta = voteType === "up" ? 1 : -1;

            onScoreChange(delta);

            try {
                if (isRemovingVote) {
                    const res = await fetch(
                        `/api/qa/votes?target_id=${targetId}&target_type=${targetType}`,
                        { method: "DELETE" }
                    );
                    if (!res.ok) throw new Error("Failed to remove vote");
                } else {
                    const res = await fetch("/api/qa/votes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ target_id: targetId, target_type: targetType, vote_type: voteType }),
                    });
                    if (!res.ok) throw new Error("Failed to save vote");
                }
            } catch (err) {
                onScoreChange(-delta); // roll back
                toast.error("Couldn't save your vote. Please try again.");
            } finally {
                setPending((p) => ({ ...p, [targetId]: false }));
            }
        },
        [isAuthenticated, pending]
    );

    return { vote, pending };
}