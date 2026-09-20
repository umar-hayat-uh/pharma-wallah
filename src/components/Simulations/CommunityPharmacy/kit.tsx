"use client";

// ============================================================
// Community Pharmacy Simulation — the small shared controls
// ============================================================
//
// Deliberately plain: a panel, a labelled field, a choice row, a risk chip, a
// dialog. Everything larger composes these, so spacing and focus behaviour are
// decided once.
//
// Two rules that the whole page depends on:
//   - a risk is never communicated by colour alone — `RiskChip` always prints
//     the band's word beside its marker;
//   - every control is a real button or input, reachable and operable from the
//     keyboard, because the workflow has to be completable without a pointer.

import React, { useCallback, useEffect, useId, useRef } from "react";
import { Check, ChevronRight, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

import type { RiskLevel } from "./types";
import { RISK_BANDS } from "./data/constants";

// ─── Panel ───────────────────────────────────────────────────────────────────

export function Panel({
  title,
  eyebrow,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white", className)}>
      {(title || actions || eyebrow) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
            )}
            {title && <h3 className="mt-0.5 text-[15px] font-bold leading-tight text-slate-900">{title}</h3>}
            {description && <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("px-4 py-4 sm:px-5", bodyClassName)}>{children}</div>
    </section>
  );
}

// ─── Risk ────────────────────────────────────────────────────────────────────

/**
 * A risk band, always with its word.
 *
 * The coloured dot is an accelerator for people who can use it; the label is
 * what actually carries the meaning.
 */
export function RiskChip({ level, children, className }: { level: RiskLevel; children?: React.ReactNode; className?: string }) {
  const band = RISK_BANDS[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-bold leading-none",
        band.surface,
        className,
      )}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: band.color }} aria-hidden />
      {children || band.label}
    </span>
  );
}

export function Callout({
  level = "review",
  title,
  children,
  icon: Icon = Info,
}: {
  level?: RiskLevel;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const band = RISK_BANDS[level];
  return (
    <div className={cn("rounded-xl border px-3.5 py-3", band.surface)}>
      <div className="flex gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 text-[13px] leading-relaxed">
          {title && (
            <p className="font-bold">
              {title}
              <span className="sr-only"> — {band.label}</span>
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" }) {
  const variants = {
    primary: "bg-brandBlue text-white hover:bg-[#1668b8]",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "px-3 py-1.5 text-[12.5px]", md: "px-4 py-2.5 text-[13.5px]" };
  return (
    <button type="button" className={cn(BTN_BASE, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

/**
 * The single primary action for the current stage.
 *
 * There is only ever one of these on screen — it is how the page answers
 * "what should I do next as a pharmacist?".
 */
export function PrimaryAction({
  label,
  hint,
  onClick,
  disabled,
  tone = "brand",
  icon: Icon = ChevronRight,
  className,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "brand" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cph-primary group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        tone === "danger"
          ? "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600"
          : "bg-brandBlue text-white hover:bg-[#1668b8] focus-visible:ring-brandBlue",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold leading-tight">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] font-medium leading-snug text-white/80">{hint}</span>}
      </span>
      <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

// ─── Fields ──────────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("cph-field", className)}>
      <label htmlFor={id} className="block text-[11.5px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </label>
      <div className="mt-1.5">{children(id)}</div>
      {hint && !error && <p className="mt-1 text-[12px] leading-snug text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-[12px] font-semibold leading-snug text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20";

// ─── Choice rows ─────────────────────────────────────────────────────────────

/**
 * A selectable row. `multi` renders a checkbox affordance and the ARIA to
 * match; otherwise it is a radio.
 */
export function Choice({
  selected,
  onSelect,
  title,
  description,
  multi,
  disabled,
  tone,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  multi?: boolean;
  disabled?: boolean;
  tone?: RiskLevel;
  className?: string;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1",
        selected ? "border-brandBlue bg-brandBlue/[0.06]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border-2 transition-colors",
          multi ? "rounded-[6px]" : "rounded-full",
          selected ? "border-brandBlue bg-brandBlue text-white" : "border-slate-300 bg-white",
        )}
        aria-hidden
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold leading-snug text-slate-900">{title}</span>
        {description && <span className="mt-0.5 block text-[12.5px] leading-relaxed text-slate-500">{description}</span>}
      </span>
      {tone && <RiskChip level={tone} className="shrink-0" />}
    </button>
  );
}

// ─── Figures ─────────────────────────────────────────────────────────────────

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-[17px] font-extrabold leading-none tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-[12px] leading-snug text-slate-500">{sub}</p>}
    </div>
  );
}

export function KeyValue({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-slate-200 py-1.5 last:border-0">
      <span className="text-[12.5px] text-slate-500">{k}</span>
      <span className="text-right text-[13px] font-semibold text-slate-900">{v}</span>
    </div>
  );
}

// ─── Dialog / bottom sheet ───────────────────────────────────────────────────

/**
 * One dialog component for both shapes: centred on a large screen, a bottom
 * sheet on a phone. Escape closes it and focus moves into it on open, which is
 * the minimum for something that covers the workflow.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    // Move focus in, so the next Tab stays inside the dialog rather than
    // wandering back into the workflow behind it.
    const frame = requestAnimationFrame(() => ref.current?.focus());
    return () => {
      document.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(frame);
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "cph-sheet relative flex w-full flex-col overflow-hidden outline-none sm:max-h-[86vh] sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[16px] font-bold leading-tight text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="border-t border-slate-100 px-4 py-3 sm:px-5">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="my-4 border-slate-100" />;
  return (
    <div className="my-4 flex items-center gap-3">
      <hr className="flex-1 border-slate-100" />
      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <hr className="flex-1 border-slate-100" />
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-200 px-3.5 py-3 text-[13px] leading-relaxed text-slate-500">{children}</p>;
}
