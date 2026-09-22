"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small shared pieces of the desktop chrome.
 *
 * Deliberately plain: Tailwind + the shadcn tokens already in globals.css, no
 * framer-motion and no GSAP. The calculators themselves bring the only heavy UI
 * this app has, and the frame around them should cost nothing.
 */

/** A page header: eyebrow, title, one line of explanation. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-[1.9rem] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        {lead && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{lead}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** The standard card surface used across every desktop section. */
export function Panel({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * A search box. Controlled, with a clear button and a "/" shortcut, because a
 * desktop program is used from the keyboard.
 */
export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;
      if (typing) return;
      if (event.key === "/") {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        aria-label={label}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- a search-first page in a desktop app
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-[15px] font-medium transition-[border-color,box-shadow] duration-200 hover:border-foreground/25 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Nothing matched — say what was searched for, and offer a way out. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="max-w-md">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

/** A quiet, self-dismissing status line. Announced to assistive technology. */
export function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);

  const flash = useCallback((text: string, ms = 4200) => {
    setMessage(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(""), ms);
  }, []);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const toast = (
    <p
      aria-live="polite"
      data-print="hide"
      className={cn(
        "pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-opacity duration-300",
        message ? "opacity-100" : "opacity-0",
      )}
      style={{ background: "rgba(12, 28, 52, 0.94)" }}
    >
      {message}
    </p>
  );

  return { flash, toast };
}

/** A labelled figure, used on the dashboard. */
export function Figure({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold leading-none tracking-[-0.04em] tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
