import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn Alert. Used by calculators for clinical cautions ("not validated in
 * pregnancy", "dose exceeds the usual maximum") — which is why the warning and
 * danger variants carry a coloured rule on the leading edge, not just a tint:
 * the rule survives a washed-out phone screen in daylight.
 */
const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground [&>svg]:text-primary",
        info: "border-primary/25 bg-primary/5 text-foreground [&>svg]:text-primary",
        warning:
          "border-amber-300/70 border-l-4 border-l-amber-500 bg-amber-50 text-amber-950 [&>svg]:text-amber-600",
        destructive:
          "border-red-300/70 border-l-4 border-l-red-600 bg-red-50 text-red-950 [&>svg]:text-red-600",
        success:
          "border-emerald-300/70 border-l-4 border-l-emerald-600 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-tight tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed opacity-90 [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
