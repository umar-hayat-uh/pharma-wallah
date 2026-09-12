"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A shadcn/ui <Button> dressed as the landing page's pill CTA.
 *
 * The wrapper carries `data-mag` so the GSAP orchestrator can pull the whole
 * control toward the pointer, and the inner `data-fill` span is the wipe that
 * sweeps across on hover. Both are decorative: with JavaScript off this is a
 * plain link, still keyboard reachable and still the right size.
 */
export function MagneticCta({
  href,
  tone = "gradient",
  size = "lg",
  className,
  children,
  ...rest
}: {
  href?: string;
  tone?: "gradient" | "outline" | "invert";
  size?: "lg" | "sm";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "size" | "variant" | "children">) {
  const tones = {
    gradient:
      "text-white bg-[linear-gradient(135deg,#2563EB,#2E9BD6_55%,#22C55E)] hover:bg-[linear-gradient(135deg,#2563EB,#2E9BD6_55%,#22C55E)]",
    outline: "bg-white text-[#0A1122] border border-[#D6DEEB] hover:bg-white",
    invert: "bg-white text-[#1E40AF] hover:bg-white",
  } as const;

  const body = (
    <>
      <span
        data-fill
        aria-hidden="true"
        className={cn(
          "absolute inset-0 origin-left scale-x-0",
          tone === "outline" ? "bg-[rgba(37,99,235,0.08)]" : "bg-white/20",
        )}
      />
      <span className="relative inline-flex items-center gap-2.5">{children}</span>
    </>
  );

  const classes = cn(
    "relative overflow-hidden rounded-full font-semibold shadow-none transition-shadow",
    size === "lg" ? "h-[52px] px-[26px] text-[15px]" : "h-[42px] px-5 text-sm",
    tones[tone],
    className,
  );

  return (
    <span data-mag className="inline-block will-change-transform">
      {href ? (
        <Button asChild className={classes} {...rest}>
          <Link href={href}>{body}</Link>
        </Button>
      ) : (
        <Button className={classes} {...rest}>
          {body}
        </Button>
      )}
    </span>
  );
}
