import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

/*
 * Empty, loading and error states — designed, not left to a spinner.
 *
 * All three say what happened *and what to do next* in words, so the state
 * still reads in greyscale and to a screen reader; colour is never the only
 * signal. None of them animates its container, so any of them can sit next to
 * an AdSlot without breaking viewability measurement (MEMORY.md gotcha 29).
 *
 * Server-component safe. `ErrorState`'s `onRetry` is a function, so pass it
 * only from a client component.
 */

type Frame = "plain" | "ruled";

function frameClass(frame: Frame) {
  return frame === "ruled"
    ? "rounded-2xl border border-dashed border-[#16181d]/15 px-6 py-10 dark:border-white/15"
    : "px-2 py-10";
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  label = "Nothing here yet",
  frame = "ruled",
  className,
}: {
  title: string;
  description?: React.ReactNode;
  /** The next step — a <Button>, a link, a "clear search" control. */
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  frame?: Frame;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6", frameClass(frame), className)}>
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#16181d]/[0.04] text-[#16181d]/45 dark:bg-white/[0.06] dark:text-[#f7f5f1]/50"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <Eyebrow>{label}</Eyebrow>
        <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#16181d] dark:text-[#f7f5f1]">{title}</p>
        {description && (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#16181d]/60 dark:text-[#f7f5f1]/60">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "This section didn't load",
  description = "The rest of the page still works. Try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  frame = "ruled",
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  frame?: Frame;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-4 border-l-4 border-l-red-600 sm:flex-row sm:items-center sm:gap-6",
        frameClass(frame),
        frame === "ruled" && "border-solid border-red-600/20 bg-red-50/60 dark:bg-red-950/20",
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <Eyebrow className="text-red-700/80 dark:text-red-300/80">Error</Eyebrow>
        <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#16181d] dark:text-[#f7f5f1]">{title}</p>
        {description && (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#16181d]/65 dark:text-[#f7f5f1]/65">{description}</p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#16181d]/15 bg-[#fcfcfa] px-4 text-sm font-medium text-[#16181d] transition-[border-color,background-color,transform] duration-300 ease-out-expo hover:border-[#16181d]/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9] focus-visible:ring-offset-2 dark:border-white/15 dark:bg-[#16181d] dark:text-[#f7f5f1]"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Skeleton lines in the shape of the content that is coming, with a
 * screen-reader status. The shimmer is `animate-pulse`, which Tailwind already
 * disables under `motion-reduce`.
 */
export function LoadingState({
  label = "Loading",
  lines = 3,
  figures = 0,
  className,
}: {
  label?: string;
  lines?: number;
  /** Render a row of figure placeholders above the lines. */
  figures?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn("py-6", className)}>
      <span className="sr-only">{label}…</span>
      {figures > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-4" aria-hidden="true">
          {Array.from({ length: figures }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="h-9 w-20 animate-pulse rounded-md bg-[#16181d]/[0.07] motion-reduce:animate-none dark:bg-white/[0.08]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[#16181d]/[0.05] motion-reduce:animate-none dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 animate-pulse rounded bg-[#16181d]/[0.06] motion-reduce:animate-none dark:bg-white/[0.07]"
            // Ragged right edge, so it reads as text rather than as bars.
            style={{ width: `${[92, 78, 85, 64, 88][i % 5]}%` }}
          />
        ))}
      </div>
    </div>
  );
}
