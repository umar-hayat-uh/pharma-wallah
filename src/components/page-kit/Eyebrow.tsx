import { cn } from "@/lib/utils";

/**
 * The mono instrument label that sits over every title in the 2026-09-13 design
 * language — the calculator kit, the footer columns and the landing page all use
 * the same one. Kept as a component so a page cannot drift to "almost the same"
 * size or tracking.
 *
 * `dot` is the brandBlue signal mark. Leave it on for the one label that names
 * the page; turn it off for section labels so the signal colour stays sparse.
 */
export function Eyebrow({
  children,
  dot = false,
  tone = "default",
  as: Tag = "p",
  className,
}: {
  children: React.ReactNode;
  dot?: boolean;
  /** `inverse` for labels on the brand gradient surface. */
  tone?: "default" | "inverse";
  as?: "p" | "span" | "div";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.16em]",
        tone === "inverse" ? "text-white/90" : "text-[#16181d]/55 dark:text-[#f7f5f1]/55",
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone === "inverse" ? "bg-white" : "bg-[#1c7bd9]")}
          aria-hidden="true"
        />
      )}
      {children}
    </Tag>
  );
}
