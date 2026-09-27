/**
 * Battle Royale — small shared pieces. Server-component safe (no hooks).
 *
 * Visual language is the site's (page kit): warm board white, ink #16181d,
 * brandBlue #1C7BD9 / brandGreen #21B67A, the gradient only for strong
 * surfaces (with the navy scrim from page-kit/brand.ts), Outfit throughout,
 * mono eyebrows, tabular figures. The event spec's #2563EB/#4ADE80 are close
 * but not the product's tokens; the product wins, as it did for the Molecular
 * Lab, the pharmacy counter and the desktop app.
 */
import { Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHECK_IN_STATUS_LABEL,
  FINAL_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  REGISTRATION_STATUS_LABEL,
  SESSION_STATUS_LABEL,
} from "@/lib/battle-royale/constants";
import type { CheckInStatus, FinalStatus, PaymentStatus, RegistrationStatus, SessionStatus } from "@/lib/battle-royale/types";

export const INK = "#16181d";

/** The event mark: the PharmaWallah capsule-and-book in a white tile, crowned. */
export function Crest({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true">
      <span className="flex h-full w-full items-center justify-center rounded-[28%] bg-white shadow-[0_8px_24px_-8px_rgba(6,18,36,.45)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192x192.png" alt="" width={size * 0.7} height={size * 0.7} className="h-[70%] w-[70%]" />
      </span>
      <span
        className="absolute -right-[14%] -top-[14%] flex items-center justify-center rounded-full bg-[#f5b301] text-[#3b2a00] ring-2 ring-white"
        style={{ width: size * 0.42, height: size * 0.42 }}
      >
        <Crown style={{ width: size * 0.24, height: size * 0.24 }} strokeWidth={2.4} />
      </span>
    </span>
  );
}

type Tone = "neutral" | "blue" | "green" | "amber" | "red";

const TONES: Record<Tone, string> = {
  neutral: "bg-[#16181d]/[0.06] text-[#16181d]/75 ring-[#16181d]/10",
  blue: "bg-[#1C7BD9]/10 text-[#1462b0] ring-[#1C7BD9]/20",
  green: "bg-[#21B67A]/12 text-[#0f7a50] ring-[#21B67A]/25",
  amber: "bg-amber-100 text-amber-800 ring-amber-300/60",
  red: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RegistrationBadge({ value }: { value: RegistrationStatus }) {
  return <StatusBadge tone={value === "registered" ? "blue" : "red"}>{REGISTRATION_STATUS_LABEL[value]}</StatusBadge>;
}
export function PaymentBadge({ value }: { value: PaymentStatus }) {
  return <StatusBadge tone={value === "unpaid" ? "amber" : "green"}>{PAYMENT_STATUS_LABEL[value]}</StatusBadge>;
}
export function CheckInBadge({ value }: { value: CheckInStatus }) {
  return (
    <StatusBadge tone={value === "checked_in" ? "green" : value === "late" ? "amber" : "neutral"}>
      {CHECK_IN_STATUS_LABEL[value]}
    </StatusBadge>
  );
}
export function SessionBadge({ value }: { value: SessionStatus }) {
  const tone: Tone = value === "live" ? "green" : value === "open" ? "blue" : value === "cancelled" ? "red" : "neutral";
  return <StatusBadge tone={tone}>{SESSION_STATUS_LABEL[value]}</StatusBadge>;
}
export function FinalBadge({ value }: { value: FinalStatus }) {
  const tone: Tone = value === "winner" ? "amber" : value === "qualified" ? "green" : value === "not_qualified" ? "red" : "neutral";
  return (
    <StatusBadge tone={tone}>
      {value === "winner" && <Crown className="h-3 w-3" />}
      {FINAL_STATUS_LABEL[value]}
    </StatusBadge>
  );
}

export const inputClass =
  "block h-12 w-full rounded-xl border border-[#16181d]/15 px-3.5 text-[15px] text-[#16181d] shadow-sm transition placeholder:text-[#16181d]/35 focus:border-[#1C7BD9] focus:outline-none focus:ring-4 focus:ring-[#1C7BD9]/15 disabled:opacity-60 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100";

export const selectClass = cn(inputClass, "appearance-none pr-9");

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-[#16181d]">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-[#16181d]/45">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#16181d]/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Notice({
  tone = "blue",
  title,
  children,
  className,
  icon,
}: {
  tone?: "blue" | "green" | "amber" | "red";
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const styles = {
    blue: "border-[#1C7BD9]/25 bg-[#1C7BD9]/[0.06] text-[#0f4f8f]",
    green: "border-[#21B67A]/30 bg-[#21B67A]/[0.08] text-[#0d6a45]",
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
  }[tone];
  return (
    <div role={tone === "red" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border px-4 py-3.5 text-sm", styles, className)}>
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("leading-relaxed", title && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />;
}

/** Placeholder rows while a panel loads. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-xl bg-[#16181d]/[0.06]" style={{ opacity: 1 - i * 0.14 }} />
      ))}
    </div>
  );
}

/** A labelled figure: "Total score / 142". */
export function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[#16181d]/10 bg-white p-4", className)}>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#16181d]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#16181d]/55">{sub}</p>}
    </div>
  );
}

/** A primary button with the brand surface, usable as a <button> or wrapper. */
export const primaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(28,123,217,.8)] transition-[filter,transform] duration-300 ease-out-expo hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C7BD9]/30 disabled:pointer-events-none disabled:opacity-55";

export const secondaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#16181d]/15 bg-white px-6 text-[15px] font-semibold text-[#16181d] transition-[border-color,background-color,transform] duration-300 ease-out-expo hover:border-[#16181d]/30 hover:bg-[#16181d]/[0.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C7BD9]/20 disabled:pointer-events-none disabled:opacity-55";
