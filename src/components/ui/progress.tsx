import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn Progress, without @radix-ui/react-progress. Calculators use it as a
 * gauge — a result's position within a reference range — so it animates the
 * transform, never the width, and exposes the value as a proper progressbar.
 */
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** 0–100. Values outside are clamped. */
    value?: number | null;
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out-expo",
          indicatorClassName,
        )}
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
