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
          "grid gap-1 rounded-2xl border bg-muted/60 p-1",
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
                <motion.span
                  layoutId={`mode-pill-${groupId}`}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 rounded-xl border border-blue-100 bg-card shadow-sm"
                />
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
