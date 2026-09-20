/**
 * Community — shared constants.
 *
 * Every limit the API clamps against lives here rather than in each route, so
 * the composer's character counters and the server's rejection thresholds can
 * never drift apart (the old Q&A pages hard-coded them in both places).
 */

export const POST_KINDS = ["discussion", "question", "link", "image"] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const FEED_SORTS = ["hot", "new", "top", "rising"] as const;
export type FeedSort = (typeof FEED_SORTS)[number];

export const TOP_RANGES = ["day", "week", "month", "year", "all"] as const;
export type TopRange = (typeof TOP_RANGES)[number];

export const COMMENT_SORTS = ["top", "new", "old"] as const;
export type CommentSort = (typeof COMMENT_SORTS)[number];

export const REPORT_REASONS = [
    "Not pharmacy-related",
    "Asking for personal medical advice",
    "Patient-identifiable information",
    "Misinformation or unsafe advice",
    "Spam or self-promotion",
    "Harassment or abuse",
    "Copyright / exam material",
    "Other",
] as const;

// ─── Limits (server clamps to exactly these) ────────────────────────────────
export const MAX_TITLE_LEN = 300;
export const MIN_TITLE_LEN = 4;
export const MAX_BODY_LEN = 20000;
export const MAX_COMMENT_LEN = 10000;
export const MAX_TAGS = 5;
export const MAX_TAG_LEN = 40;
export const MAX_BIO_LEN = 300;
export const MAX_REPORT_DETAILS_LEN = 1000;

export const FEED_LIMIT = 20;
export const MAX_FEED_LIMIT = 50;
export const COMMENT_ROOT_LIMIT = 30;
export const MAX_COMMENT_ROOT_LIMIT = 100;

/** The UI indents to this depth; the DB trigger caps `depth` at the same value. */
export const MAX_COMMENT_DEPTH = 8;

/**
 * `rising` needs a recency window, otherwise it just re-reads `hot`. A post
 * counts as rising if it landed inside this window and has any traction.
 */
export const RISING_WINDOW_HOURS = 12;

/** Link posts are rendered as an outbound anchor — only these schemes are allowed. */
export const ALLOWED_LINK_PROTOCOLS = ["http:", "https:"];

/**
 * A pharmacy community carries a standing safety line: it teaches, it does not
 * treat. Shown on the composer and under every clinical-space post.
 */
export const CLINICAL_DISCLAIMER =
    "Educational discussion between students and pharmacists — not medical advice, and never a substitute for a prescriber or a patient's own pharmacist.";
