/*
 * The miniature figures drawn inside the landing page's mock artefacts.
 *
 * These are hand-written SVG rather than lucide icons on purpose: they stand in
 * for a *page of notes*, not for a concept, so they need the shape of a graph,
 * a bar chart or a reaction scheme at 196x66. Real lucide icons are used
 * everywhere an icon is meant to read as an icon.
 */
import React from "react";
import type { LeafArt } from "./data";

/** Shared gradient defs. Rendered once, near the top of the page. */
export function LandingDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="pw-sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset=".55" stopColor="#2E9BD6" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="pw-dg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="pw-cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset=".5" stopColor="#2E9BD6" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A plasma-concentration curve, bar chart, reaction rings or a workflow. */
export function LeafFigure({ art }: { art: LeafArt }) {
  switch (art) {
    case "bars":
      return (
        <svg viewBox="0 0 196 66" fill="none" aria-hidden="true">
          <rect x="14" y="38" width="15" height="20" rx="3" fill="#BBD3F4" />
          <rect x="40" y="24" width="15" height="34" rx="3" fill="#8FBBF0" />
          <rect x="66" y="12" width="15" height="46" rx="3" fill="#2563EB" />
          <rect x="92" y="28" width="15" height="30" rx="3" fill="#7FD3AE" />
          <rect x="118" y="18" width="15" height="40" rx="3" fill="#22C55E" />
          <rect x="144" y="34" width="15" height="24" rx="3" fill="#A9D9F2" />
          <path d="M8 60 H184" stroke="#D8E5F5" strokeWidth="1" />
        </svg>
      );
    case "rings":
      return (
        <svg viewBox="0 0 196 66" fill="none" aria-hidden="true">
          <circle cx="52" cy="33" r="17" stroke="#2563EB" strokeWidth="2.2" fill="none" />
          <circle cx="86" cy="33" r="17" stroke="#2E9BD6" strokeWidth="2.2" fill="none" />
          <circle cx="120" cy="33" r="17" stroke="#22C55E" strokeWidth="2.2" fill="none" />
          <path d="M137 33 h22" stroke="#C6D9F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "blocks":
      return (
        <svg viewBox="0 0 196 66" fill="none" aria-hidden="true">
          <rect x="12" y="10" width="46" height="20" rx="5" fill="#DCEAFB" />
          <rect x="76" y="10" width="46" height="20" rx="5" fill="#CFE6F7" />
          <rect x="140" y="10" width="44" height="20" rx="5" fill="#D5F0E2" />
          <path d="M58 20h18M122 20h18" stroke="#9DBCE2" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="44" y="42" width="46" height="18" rx="5" fill="#EDF3FB" />
          <rect x="108" y="42" width="46" height="18" rx="5" fill="#EDF3FB" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 196 66" fill="none" aria-hidden="true">
          <path
            d="M8 54 C36 54, 40 14, 70 14 S104 54, 132 54 S168 22, 184 16"
            stroke="url(#pw-cg)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="70" cy="14" r="3.2" fill="#2563EB" />
          <circle cx="132" cy="54" r="3.2" fill="#22C55E" />
          <path d="M8 60 H184M12 6 V60" stroke="#D8E5F5" strokeWidth="1" />
        </svg>
      );
  }
}

/** The larger version of the curve, used on the hero's notes card. */
export function HeroCurve() {
  return (
    <svg viewBox="0 0 200 76" fill="none" aria-hidden="true">
      <path
        d="M8 62 C40 62, 44 18, 74 18 S108 62, 140 62 S176 26, 192 22"
        stroke="url(#pw-cg)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="74" cy="18" r="3.6" fill="#2563EB" />
      <circle cx="140" cy="62" r="3.6" fill="#22C55E" />
      <path d="M8 68 H192" stroke="#CFE0F5" strokeWidth="1" />
      <path d="M12 8 V68" stroke="#CFE0F5" strokeWidth="1" />
    </svg>
  );
}

/** The capsule that splits apart during the preloader. */
export function CapsuleMark() {
  return (
    <svg className="capsule" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path data-cap-a d="M32 18 A18 18 0 0 1 68 18 L68 50 L32 50 Z" fill="url(#pw-cg)" />
      <path
        data-cap-b
        d="M32 50 L68 50 L68 82 A18 18 0 0 1 32 82 Z"
        fill="#EAF1FB"
        stroke="#CFDDF0"
        strokeWidth="1.5"
      />
    </svg>
  );
}
