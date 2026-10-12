/**
 * Review status for educational content — the states a page can truthfully be in.
 *
 * Only states the team actually operates are modelled (see
 * docs/content-review-policy.md). In particular `expert-reviewed` cannot be set
 * without naming the reviewer, their qualification and the date: a review badge
 * with nobody behind it is exactly the fabricated credential the policy forbids,
 * and the type makes it impossible to write one by accident.
 */

export type ContentReview =
  /** Not linked, not in the sitemap. */
  | { status: "draft" }
  /** Published after the team's own checks; no independent expert has signed it off. */
  | { status: "team-checked"; checkedOn: string }
  | {
      status: "expert-reviewed";
      reviewer: string;
      /** e.g. "Registered pharmacist (Pharmacy Council of Pakistan)" — as the reviewer states it. */
      qualification: string;
      reviewedOn: string;
    };

export type ContentMeta = {
  /** The byline. The team, unless a named person wrote it and agreed to be named. */
  author: string;
  review: ContentReview;
  /** ISO date of the last substantive change to the content (not to the code around it). */
  updated: string;
};

export const TEAM_AUTHOR = "PharmaWallah team";

/** One line a visitor reads under the byline. */
export function reviewLabel(review: ContentReview): string {
  switch (review.status) {
    case "draft":
      return "Draft — not yet published";
    case "team-checked":
      return "Checked by the PharmaWallah team. Not yet independently reviewed by a pharmacist.";
    case "expert-reviewed":
      return `Reviewed by ${review.reviewer}, ${review.qualification}, on ${formatDate(review.reviewedOn)}.`;
  }
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Where a visitor reports a mistake. The contact form pre-fills its subject from `?subject=`. */
export function reportErrorHref(pageTitle: string): string {
  return `/contact?subject=${encodeURIComponent(`Error report: ${pageTitle}`)}`;
}
