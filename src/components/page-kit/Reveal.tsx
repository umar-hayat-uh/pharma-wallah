"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lift-and-fade a block into place the first time it enters the viewport.
 *
 * IntersectionObserver + a CSS transition on the expo curve, rather than
 * framer-motion's `whileInView`: it costs no library on pages that don't
 * otherwise load one, and it renders the content visible on the server, so a
 * crawler and a no-JS visitor see everything. Only after hydration, and only
 * for blocks still below the fold, does it hide-then-reveal.
 *
 * NEVER wrap an AdSlot in this — a transformed/animated parent breaks AdSense
 * viewability measurement (MEMORY.md gotcha 29). Reveal the siblings instead.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  /** Milliseconds; use ~60–80ms steps for a stagger. */
  delay?: number;
  as?: "div" | "li" | "section" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // "static" = server/first paint: fully visible. "hidden" → "shown" only
  // happens client-side for elements that start below the viewport.
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    // Already on screen at mount: leave it alone rather than flash it out and back.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out-expo motion-reduce:transition-none",
        state === "hidden" && "translate-y-4 opacity-0",
        className,
      )}
      style={delay && state !== "static" ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
