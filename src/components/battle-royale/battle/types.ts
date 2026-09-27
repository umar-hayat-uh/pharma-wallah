/**
 * Each timed item exposes its unfinished answer, so when its timer reaches
 * zero the station can keep whatever the player had so far (a half-matched
 * board still scores its correct pairs). `null` = nothing entered.
 */
export type DraftHandle = { draft: () => { matches: string[] } | { choice: "A" | "B" | "C" | "D" } | null };
