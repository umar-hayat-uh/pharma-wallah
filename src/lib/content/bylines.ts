/**
 * Who wrote and who reviewed each educational page — filled in by a PERSON
 * (2026-10-13, AdSense remediation phase 3). See HUMAN_TODO.md.
 *
 * Keyed by URL path (`/guides/dose-calculations`,
 * `/calculation-tools/dilution-calculator`, `/courses/physiology/unit4-the-heart`).
 * Every field is optional and **every field starts empty**: nothing here may be
 * guessed, invented or filled by a script. A byline renders only from what is
 * written here:
 *   - "Written by …" needs `authorName`;
 *   - "Reviewed by … on …" needs `reviewerName` AND `lastReviewed`.
 * With no reviewer the page shows the neutral note in `<ContentByline>` instead.
 *
 * `lastReviewed` is an ISO date (YYYY-MM-DD) of a review that actually happened.
 */
export type Credits = {
  authorName?: string;
  /** As the author states it, e.g. "Pharm-D (4th year), University of Karachi". */
  authorCredentials?: string;
  reviewerName?: string;
  /** e.g. "Registered pharmacist, Pharmacy Council of Pakistan" — as the reviewer states it. */
  reviewerCredentials?: string;
  lastReviewed?: string;
};

export const CREDITS: Record<string, Credits> = {
  // Example of a filled entry (keep commented until real):
  // "/guides/dose-calculations": {
  //   authorName: "", authorCredentials: "",
  //   reviewerName: "", reviewerCredentials: "", lastReviewed: "",
  // },
};

export function creditsFor(path: string): Credits {
  return CREDITS[path] ?? {};
}

/** A review counts only with a reviewer AND a date. */
export function isReviewed(c: Credits): boolean {
  return Boolean(c.reviewerName?.trim() && c.lastReviewed?.trim());
}

export const NEUTRAL_NOTE =
  "Prepared by the PharmaWallah student team. Verify results with your textbook or instructor.";
