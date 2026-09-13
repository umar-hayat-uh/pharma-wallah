import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn Separator, without @radix-ui/react-separator: a hairline needs no
 * JavaScript, and this primitive also ships inside the offline APK.
 */
const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
    /** Purely visual lines are hidden from assistive technology. */
    decorative?: boolean;
  }
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    aria-orientation={decorative ? undefined : orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
