import type { AnswerPayload } from "@/lib/battle-royale/types";

/**
 * Each question component exposes its unfinished answer, so when the timer
 * reaches zero the battle can submit whatever the player had so far (a partly
 * matched board still scores its correct pairs). `null` = nothing to submit.
 */
export type DraftHandle = { draft: () => AnswerPayload | null };
