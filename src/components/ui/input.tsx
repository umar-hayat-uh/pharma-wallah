import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // h-12 is deliberate: a 48px target clears the 44px minimum for thumbs
        // on a phone, and these calculators are used one-handed in a lab.
        "flex h-12 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-base tabular-nums",
        "placeholder:text-muted-foreground/70",
        "transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-foreground/25",
        // A soft halo plus a coloured border, rather than an offset ring that
        // jumps the field's apparent size when it takes focus.
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
