"use client";

import { useId, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModeOption<T extends string> = {
  value: T;
  label: string;
  /** One short line under the label, e.g. "Mass, MW and coefficients". */
  description?: string;
  icon?: LucideIcon;
};

/**
 * A segmented control for a calculator's modes.
 *
 * A radiogroup rather than tabs: switching mode changes which inputs the one
 * calculation uses, it does not reveal a separate panel of content. Arrow keys
 * move between options, as the ARIA radiogroup pattern expects.
 *
 * Built here instead of adding @radix-ui/react-tabs, which is not installed and
 * would be one more dependency inside the APK.
 */
export function ModeSwitch<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ModeOption<T>[];
  label: string;
  className?: string;
}) {
  const groupId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          // The track is deliberately tinted with the brand gradient at low
          // alpha. A glass pane is only visible against something — on the old
          // near-white `bg-muted/60` track the selected pill had nothing to
          // refract and read as a flat white box.
          "grid gap-1 rounded-2xl border border-white/70 p-1",
          "bg-[linear-gradient(135deg,rgba(28,123,217,0.22)_0%,rgba(33,182,122,0.22)_100%)]",
          "shadow-[inset_0_1px_3px_rgba(15,23,42,0.10)]",
          options.length === 2 && "grid-cols-2",
          options.length === 3 && "grid-cols-1 sm:grid-cols-3",
          options.length >= 4 && "grid-cols-2 lg:grid-cols-4",
          className,
        )}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  move(index, 1);
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  move(index, -1);
                }
              }}
              className={cn(
                "relative min-h-[48px] rounded-xl px-3 py-2 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {selected && (
                /*
                 * Liquid glass on the selected segment (user request, 2026-09-20).
                 *
                 * backdrop-filter IS used here, and that does not break §6 rule 16:
                 * the rule bans it on `position: fixed` elements, where the browser
                 * re-blurs scrolling content every frame (MEMORY gotcha 51). This
                 * pill is absolutely positioned inside normal flow over a static
                 * parent, and is ~48px tall, so the filter resolves once per state
                 * change rather than per scroll frame.
                 *
                 * The fill is left translucent on purpose: the brand-tinted track
                 * has to read *through* the pane, otherwise it looks like a plain
                 * white card. The two light layers animate `transform` only, are
                 * clipped by the pill, and stop under prefers-reduced-motion.
                 */
                <motion.span
                  layoutId={`mode-pill-${groupId}`}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-xl",
                    // A real pane of glass: translucent fill, the backdrop blurred
                    // and saturated behind it, a bright specular rim on the lit
                    // edge and a soft drop shadow so it floats off the track.
                    "bg-[linear-gradient(135deg,rgba(255,255,255,0.70)_0%,rgba(255,255,255,0.38)_52%,rgba(255,255,255,0.58)_100%)]",
                    // Vibrancy comes from backdrop-saturate, not the blur — the
                    // track behind is flat, so blur alone would be a no-op.
                    "backdrop-blur-2xl backdrop-saturate-[1.8]",
                    // Touch devices (phones, and the Android WebView in the APK)
                    // drop the filter entirely and get the same look from a
                    // pre-saturated fill. A backdrop-filter is the one effect
                    // this project has already measured as a scroll-lag source
                    // (MEMORY gotcha 51), and the APK has to hold 60fps on
                    // low-end hardware.
                    "[@media(hover:none)]:backdrop-filter-none",
                    "[@media(hover:none)]:bg-[linear-gradient(135deg,rgba(255,255,255,0.78)_0%,rgba(226,241,252,0.52)_52%,rgba(228,247,239,0.70)_100%)]",
                    "transform-gpu",
                    "border border-white/90",
                    "shadow-[0_10px_22px_-12px_rgba(15,23,42,0.55),0_2px_6px_-2px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.55)]",
                  )}
                >
                  {/* Caustic pool — the light that gathers inside a lens. */}
                  <span
                    className="pointer-events-none absolute -inset-1/3 transform-gpu animate-calc-tide rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,255,255,0)_70%)] will-change-transform motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  {/* Specular highlight travelling across the pane. */}
                  <span
                    className="pointer-events-none absolute inset-y-0 w-2/5 transform-gpu animate-calc-sheen bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.95)_50%,rgba(255,255,255,0)_100%)] will-change-transform motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                </motion.span>
              )}
              <span className="relative flex items-center gap-2">
                {Icon && (
                  <Icon className={cn("h-4 w-4 shrink-0", selected ? "text-blue-600" : "text-muted-foreground")} />
                )}
                <span className="text-sm font-semibold leading-tight">{option.label}</span>
              </span>
              {option.description && (
                <span className="relative mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </MotionConfig>
  );
}
