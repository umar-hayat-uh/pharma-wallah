import Link from "next/link";
import { creditsFor, isReviewed, NEUTRAL_NOTE } from "@/lib/content/bylines";
import { formatDate, reportErrorHref } from "@/lib/content/governance";
import { cn } from "@/lib/utils";

/**
 * The byline under a guide, calculator or course unit (2026-10-13).
 *
 * Renders "Written by … · Reviewed by … on …" ONLY from the fields a person has
 * filled in src/lib/content/bylines.ts. Without a reviewer it shows the neutral
 * note instead — never an implied review. Server-component safe.
 */
export function ContentByline({
  path,
  pageTitle,
  className,
}: {
  path: string;
  /** For the pre-filled "Report an error" subject. */
  pageTitle: string;
  className?: string;
}) {
  const c = creditsFor(path);
  const author = c.authorName?.trim();
  const reviewed = isReviewed(c);

  return (
    <div className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {(author || reviewed) && (
        <p className="mb-1 text-foreground/80">
          {author && (
            <>
              Written by <span className="font-medium text-foreground">{author}</span>
              {c.authorCredentials ? `, ${c.authorCredentials}` : ""}
            </>
          )}
          {author && reviewed && " · "}
          {reviewed && (
            <>
              Reviewed by <span className="font-medium text-foreground">{c.reviewerName}</span>
              {c.reviewerCredentials ? `, ${c.reviewerCredentials}` : ""} on {formatDate(c.lastReviewed!)}
            </>
          )}
        </p>
      )}
      <p>
        {!reviewed && <>{NEUTRAL_NOTE} </>}
        <Link href={reportErrorHref(pageTitle)} className="font-medium text-primary underline-offset-2 hover:underline">
          Report an error
        </Link>{" "}
        ·{" "}
        <Link href="/editorial-policy" className="font-medium text-primary underline-offset-2 hover:underline">
          Editorial policy
        </Link>
      </p>
    </div>
  );
}
