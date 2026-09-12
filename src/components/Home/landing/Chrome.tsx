"use client";

import React from "react";
import { CapsuleMark } from "./art";
import { STATIONS } from "./data";
import { AdSlot } from "@/components/calculators/AdSlot";

/**
 * The capsule that splits, rotates and lifts away on first paint.
 * Skipped entirely under `prefers-reduced-motion`.
 */
export function Preloader() {
  return (
    <div className="pw-pre" data-pre aria-hidden="true">
      <CapsuleMark />
      <span className="pct" data-pct>
        LOADING 0%
      </span>
    </div>
  );
}

/** Which ADME stage you are in, as four bars that fill down the left edge. */
export function ProgressRail() {
  return (
    <div className="rail" data-rail aria-hidden="true">
      {STATIONS.map((s) => (
        <i key={s.num}>
          <b />
          <em>
            {s.num} · {s.label}
          </em>
        </i>
      ))}
    </div>
  );
}

/** The gradient tile that trails the cursor across the discipline index. */
export function IndexPreview() {
  return (
    <span className="pw-preview" data-preview aria-hidden="true">
      <span className="p" data-preview-t />
    </span>
  );
}

/**
 * An ad band.
 *
 * Deliberately never animated and never inside a pinned or transformed parent:
 * an animated opacity or transform on an ad slot breaks AdSense's viewability
 * measurement and risks a policy violation. The 280px reservation means nothing
 * on the page shifts when the ad finally loads.
 */
export function AdBand({ slot, label }: { slot?: string; label: string }) {
  // In production AdSlot renders nothing without a configured slot id, which
  // would leave an empty tinted strip between two sections. Drop the band too.
  if (!slot && process.env.NODE_ENV !== "development") return null;

  return (
    <div className="adband" data-ad-band>
      <div className="ad" data-ad>
        <AdSlot slot={slot} className="min-h-[280px]" label={label} />
      </div>
    </div>
  );
}
