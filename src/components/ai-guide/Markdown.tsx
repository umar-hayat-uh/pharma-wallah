"use client";

import { memo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight } from "lucide-react";

/**
 * Renders one answer.
 *
 * `rehype-raw` is deliberately NOT used, so any HTML the model emits stays
 * inert text — the same decision the community made for member-written
 * markdown. Model output is untrusted input like any other.
 *
 * Styling lives in `ai-guide.css` under `.pw-ai-md`, not in `prose-*`
 * utilities: @tailwindcss/typography is not installed in this project, so
 * those classes generate nothing (verified 2026-09-20).
 */

/** Only these schemes may become a link; everything else renders as plain text. */
function safeHref(href: string | undefined): { href: string; internal: boolean } | null {
  if (!href) return null;
  const trimmed = href.trim();

  // In-app route — keep the student inside the app rather than opening a tab.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { href: trimmed, internal: true };
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { href: url.toString(), internal: false };
    }
  } catch {
    // Not an absolute URL — anchors and relative fragments are not useful in a
    // chat answer, so they are dropped rather than guessed at.
  }
  return null;
}

function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="pw-ai-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const target = safeHref(href);
            // A rejected scheme (javascript:, data:) keeps its text but loses
            // its link — the reader still sees what was written.
            if (!target) return <span>{children}</span>;

            if (target.internal) {
              return (
                <Link href={target.href} className="pw-ai-internal">
                  {children}
                  <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
                </Link>
              );
            }
            return (
              <a href={target.href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          // Tables need a scroll container of their own or a wide comparison
          // pushes the whole message column sideways on a phone.
          table: ({ children }) => (
            <div className="pw-ai-tablewrap">
              <table>{children}</table>
            </div>
          ),
          img: ({ alt }) => <span className="text-[13px] italic opacity-70">{alt || "image"}</span>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Memoised: a streaming answer re-renders its parent on every chunk, and the
 *  finished turns above it must not re-parse their markdown each time. */
export default memo(MarkdownBody);
