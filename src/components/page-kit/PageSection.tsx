import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[96rem]",
} as const;

/**
 * A titled band of a page.
 *
 * The section heading is a ruled row, not a card: a hairline across the full
 * width, the mono label and a count or action on the right, the title beneath.
 * That is what lets a long page (the calculator hub has ten categories) read as
 * an index rather than a stack of boxes.
 *
 * Server-component safe. It deliberately has no entrance animation of its own:
 * sections often contain an `AdSlot`, and an ad must never sit inside an
 * animated or transformed parent (MEMORY.md gotcha 29). Wrap individual
 * non-ad children in <Reveal> instead.
 */
export function PageSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  width = "default",
  ruled = true,
  as: Tag = "section",
  className,
  bodyClassName,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned in the heading row: a count ("16 tools"), a link, a filter. */
  action?: React.ReactNode;
  children: React.ReactNode;
  width?: keyof typeof WIDTHS;
  /** The hairline above the heading. Turn off for the first section under a hero. */
  ruled?: boolean;
  as?: "section" | "div" | "aside";
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeading = eyebrow || title || description || action;
  const headingId = id && title ? `${id}-title` : undefined;

  return (
    <Tag
      id={id}
      aria-labelledby={headingId}
      // scroll-margin so an in-page anchor lands below the fixed site header.
      className={cn("mx-auto w-full scroll-mt-24 px-5 py-10 sm:px-6 sm:py-14 lg:px-8", WIDTHS[width], className)}
    >
      {hasHeading && (
        <div className={cn("mb-6 sm:mb-8", ruled && "border-t border-[#16181d]/10 pt-5 dark:border-white/10")}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : <span />}
            {action && (
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#16181d]/50 tabular-nums dark:text-[#f7f5f1]/50">
                {action}
              </div>
            )}
          </div>
          {title && (
            <h2
              id={headingId}
              className="mt-3 text-[clamp(1.5rem,1.15rem+1.4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#16181d] [text-wrap:balance] dark:text-[#f7f5f1]"
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#16181d]/60 [text-wrap:pretty] dark:text-[#f7f5f1]/60">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}
