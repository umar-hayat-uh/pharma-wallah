"use client";

import React from "react";

/**
 * A film countdown leader — 3, 2, 1 — with a marker sweep circling the number,
 * then the board is revealed. The page is a whiteboard video; this is the
 * leader before it starts.
 *
 * Plays once per tab session. Skipped entirely under `prefers-reduced-motion`,
 * hidden by <noscript>, and removed by a CSS failsafe if hydration never runs.
 */
export function Preloader() {
  return (
    <div className="pre" data-pre aria-hidden="true">
      <div className="pre__frame">
        <svg className="pre__ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" className="pre__ring-track" />
          <circle cx="100" cy="100" r="88" className="pre__ring-sweep" data-pre-sweep />
          <line x1="100" y1="4" x2="100" y2="196" className="pre__cross" />
          <line x1="4" y1="100" x2="196" y2="100" className="pre__cross" />
        </svg>
        <span className="pre__count" data-pre-count>
          3
        </span>
      </div>
      <span className="pre__label mono">PharmaWallah · Scene 01</span>
    </div>
  );
}

/**
 * The marker pen of a whiteboard video. The motion hook moves it to the tip of
 * whichever stroke is being drawn, and fades it out when nothing is.
 */
export function Pen() {
  return (
    <span className="pen" data-pen aria-hidden="true">
      <svg viewBox="0 0 64 120" width="46" height="86">
        {/* Nib at the origin (bottom-left), so positioning the element puts the
            nib exactly on the stroke. */}
        <g transform="rotate(28 8 112)">
          <path d="M5 112 L11 112 L13 96 L3 96 Z" fill="#22252b" />
          <rect x="1" y="62" width="14" height="34" rx="2" fill="#1c7bd9" />
          <rect x="0" y="6" width="16" height="58" rx="5" fill="#f4f4f1" stroke="#c9c9c3" strokeWidth="1.2" />
          <rect x="0" y="0" width="16" height="16" rx="4" fill="#1c7bd9" />
          <rect x="3" y="24" width="10" height="26" rx="2" fill="#e8e8e2" />
        </g>
      </svg>
    </span>
  );
}
