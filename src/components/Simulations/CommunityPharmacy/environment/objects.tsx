"use client";

// ============================================================
// The pharmacy, drawn
// ============================================================
//
// Every object on this page is an SVG drawn here — no photographs, no image
// files. They are flat, clinical and low-contrast on purpose: the environment
// has to read as a real counter without competing with the panel the student
// is actually working in.
//
// Each drawing that carries information has `role="img"` and a `<title>`, so a
// screen reader gets the same fact a sighted student does. Purely decorative
// pieces are `aria-hidden`.

import React from "react";
import { cn } from "@/lib/utils";

import type { Medicine } from "../types";

const BLUE = "#1C7BD9";
const GREEN = "#21B67A";
const LINE = "#CBD5E1";
const BODY = "#E2E8F0";
const PAPER = "#F8FAFC";

// ─── A medicine pack ─────────────────────────────────────────────────────────

/**
 * A carton, drawn at whatever size the caller gives it.
 *
 * The accent band is the shelf bay's colour, so a pack picked from the
 * antibiotics bay still looks like it came from there once it is in the tray.
 */
export function PackArt({
  accent = BLUE,
  form = "Tablet",
  width = 56,
  className,
  label,
}: {
  accent?: string;
  form?: Medicine["form"];
  width?: number;
  className?: string;
  label?: string;
}) {
  const height = Math.round(width * 1.28);
  const bottle = form === "Suspension" || form === "Syrup" || form === "Drops";
  const tube = form === "Cream" || form === "Ointment";
  const inhaler = form === "Inhaler";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 72"
      className={className}
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}
      {bottle ? (
        <>
          <rect x="21" y="3" width="14" height="8" rx="2" fill={accent} />
          <path d="M20 11h16l4 8v46a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V19z" fill="#fff" stroke={LINE} />
          <rect x="19" y="28" width="18" height="24" rx="2" fill={PAPER} stroke={LINE} />
          <rect x="22" y="33" width="12" height="2" rx="1" fill={accent} />
          <rect x="22" y="38" width="9" height="1.6" rx="0.8" fill={LINE} />
          <rect x="22" y="42" width="11" height="1.6" rx="0.8" fill={LINE} />
        </>
      ) : tube ? (
        <>
          <rect x="22" y="2" width="12" height="7" rx="2" fill={accent} />
          <path d="M18 9h20v54a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#fff" stroke={LINE} />
          <rect x="18" y="55" width="20" height="8" fill={accent} opacity="0.85" />
          <rect x="22" y="20" width="12" height="2" rx="1" fill={accent} />
          <rect x="22" y="25" width="8" height="1.6" rx="0.8" fill={LINE} />
        </>
      ) : inhaler ? (
        <>
          <rect x="18" y="6" width="20" height="40" rx="6" fill="#fff" stroke={LINE} />
          <rect x="18" y="6" width="20" height="9" rx="6" fill={accent} />
          <path d="M22 46h16v14a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill={accent} opacity="0.85" />
          <rect x="22" y="22" width="12" height="2" rx="1" fill={accent} />
          <rect x="22" y="27" width="9" height="1.6" rx="0.8" fill={LINE} />
        </>
      ) : (
        <>
          <rect x="8" y="6" width="40" height="60" rx="4" fill="#fff" stroke={LINE} />
          <rect x="8" y="6" width="40" height="11" rx="4" fill={accent} />
          <rect x="8" y="14" width="40" height="3" fill={accent} opacity="0.55" />
          <rect x="13" y="24" width="30" height="3" rx="1.5" fill={accent} opacity="0.85" />
          <rect x="13" y="31" width="22" height="2.2" rx="1.1" fill={LINE} />
          <rect x="13" y="36" width="26" height="2.2" rx="1.1" fill={LINE} />
          {/* Barcode — what the scanner reads. */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={14 + i * 3.6} y={50} width={i % 3 === 0 ? 2 : 1.2} height="11" fill="#334155" opacity="0.65" />
          ))}
        </>
      )}
    </svg>
  );
}

// ─── The shelf wall ──────────────────────────────────────────────────────────

/** A single bay's row of packs, drawn as coloured spines. */
export function BayArt({ accent, count = 7 }: { accent: string; count?: number }) {
  const packs = Array.from({ length: count }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 34" className="h-8 w-full" aria-hidden>
      <rect x="0" y="30" width="120" height="4" rx="2" fill={BODY} />
      {packs.map((i) => {
        const w = 12 + ((i * 7) % 5);
        const x = 3 + i * 16.4;
        const h = 20 + ((i * 11) % 8);
        return (
          <g key={i}>
            <rect x={x} y={30 - h} width={w} height={h} rx="2" fill="#fff" stroke={LINE} strokeWidth="0.8" />
            <rect x={x} y={30 - h} width={w} height="4.5" rx="2" fill={accent} opacity={0.75 + (i % 3) * 0.08} />
            <rect x={x + 2} y={30 - h + 9} width={Math.max(3, w - 4)} height="1.4" rx="0.7" fill={LINE} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── The patient ─────────────────────────────────────────────────────────────

/**
 * A drawn figure, not a photograph and not a caricature.
 *
 * There are no facial features: this stands for a person at the window without
 * inventing one, which is both more professional and avoids implying anything
 * about a patient the case does not state.
 */
export function PatientFigure({
  skin,
  hair,
  shirt,
  size = 72,
  className,
  name,
}: {
  skin: string;
  hair: string;
  shirt: string;
  size?: number;
  className?: string;
  name?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} role="img" aria-label={name ? `${name}, at the counter` : "Patient at the counter"}>
      {name && <title>{name}</title>}
      <circle cx="40" cy="40" r="39" fill="#F1F5F9" />
      <path d="M40 44c13 0 23 9 25 21H15c2-12 12-21 25-21z" fill={shirt} />
      <path d="M33 36h14v12a7 7 0 0 1-14 0z" fill={skin} />
      <circle cx="40" cy="29" r="15" fill={skin} />
      <path d="M25 29a15 15 0 0 1 30 0c0-3-3-5-6-6-4-1-6 1-11 1-5 0-9-1-13 5z" fill={hair} />
      <path d="M40 65v-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// ─── Bench equipment ─────────────────────────────────────────────────────────

const benchSvg = "h-7 w-7";

export function ScannerArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <path d="M8 22l6-16h4l6 16z" fill="#475569" opacity="0.15" />
      <rect x="10" y="4" width="12" height="9" rx="2" fill="#475569" />
      <rect x="13" y="13" width="6" height="13" rx="2" fill="#64748B" />
      <path d="M12 16h2M12 19h2M12 22h2" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M8 8h-3M24 8h3M7 4l-2-1M25 4l2-1" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ScaleArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <rect x="4" y="18" width="24" height="9" rx="2.5" fill="#64748B" />
      <rect x="7" y="21" width="11" height="4" rx="1" fill="#0F172A" />
      <rect x="9" y="22.2" width="7" height="1.6" rx="0.8" fill={GREEN} />
      <rect x="7" y="13" width="18" height="5" rx="1.5" fill="#94A3B8" />
      <rect x="9" y="10" width="14" height="3.5" rx="1.2" fill="#CBD5E1" />
      <circle cx="23" cy="23" r="1.6" fill="#CBD5E1" />
    </svg>
  );
}

export function PrinterArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <rect x="5" y="12" width="22" height="12" rx="2.5" fill="#64748B" />
      <rect x="9" y="5" width="14" height="7" rx="1.5" fill="#94A3B8" />
      <rect x="9" y="20" width="14" height="8" rx="1" fill="#FFFDF6" stroke={LINE} />
      <path d="M11 23h10M11 25.5h7" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="15.5" r="1.3" fill={GREEN} />
    </svg>
  );
}

export function TrayArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <path d="M4 12h24l-2.5 12a2.5 2.5 0 0 1-2.5 2H9a2.5 2.5 0 0 1-2.5-2z" fill="#CBD5E1" />
      <path d="M6 14h20l-2 9.5H8z" fill="#F1F5F9" />
      <circle cx="13" cy="19" r="2" fill={BLUE} opacity="0.65" />
      <circle cx="19" cy="19" r="2" fill={GREEN} opacity="0.65" />
      <circle cx="16" cy="22" r="2" fill={BLUE} opacity="0.4" />
    </svg>
  );
}

export function CalculatorArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <rect x="7" y="4" width="18" height="24" rx="2.5" fill="#64748B" />
      <rect x="9.5" y="7" width="13" height="5" rx="1" fill="#0F172A" />
      <rect x="11" y="8.5" width="9" height="2" rx="1" fill={GREEN} opacity="0.8" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={9.5 + c * 4.6} y={14.5 + r * 4.2} width="3.6" height="3.2" rx="0.8" fill="#CBD5E1" />),
      )}
    </svg>
  );
}

export function ReferenceArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <rect x="5" y="6" width="6" height="21" rx="1.2" fill={BLUE} opacity="0.8" />
      <rect x="12" y="8" width="5.5" height="19" rx="1.2" fill={GREEN} opacity="0.8" />
      <rect x="18.5" y="5" width="6" height="22" rx="1.2" fill="#94A3B8" />
      <rect x="6.5" y="10" width="3" height="1.4" rx="0.7" fill="#fff" opacity="0.9" />
      <rect x="13.2" y="12" width="3" height="1.4" rx="0.7" fill="#fff" opacity="0.9" />
      <rect x="20" y="9" width="3" height="1.4" rx="0.7" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function RxPadArt() {
  return (
    <svg viewBox="0 0 32 32" className={benchSvg} aria-hidden>
      <rect x="7" y="4" width="18" height="24" rx="2" fill="#FFFDF6" stroke={LINE} />
      <path d="M10 10h5M10 14h12M10 18h12M10 22h8" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 7.5c0 1.5 1.5 1.5 1.5 3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 9.2h3.4" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Counter furniture ───────────────────────────────────────────────────────

/** A labelled object on the bench that opens a drawer of the control panel. */
export function BenchButton({
  art,
  label,
  onClick,
  active,
  badge,
}: {
  art: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-w-[76px] flex-col items-center gap-1 rounded-xl border px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2",
        active ? "border-brandBlue bg-brandBlue/[0.06]" : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-white",
      )}
    >
      {art}
      <span className="text-[10.5px] font-bold leading-tight text-slate-600">{label}</span>
      {badge != null && (
        <span className="absolute right-1.5 top-1.5 min-w-[16px] rounded-full bg-brandBlue px-1 text-center text-[9.5px] font-bold leading-[16px] text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
