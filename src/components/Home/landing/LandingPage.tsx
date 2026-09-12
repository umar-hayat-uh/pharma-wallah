"use client";

import React, { useRef } from "react";
import { JetBrains_Mono } from "next/font/google";

import { OfficialLaunchBanner } from "@/components/Home/tournament";
import { LandingDefs } from "./art";
import { AdBand, IndexPreview, Preloader, ProgressRail } from "./Chrome";
import LandingHero from "./LandingHero";
import StationAbsorption from "./StationAbsorption";
import StationDistribution from "./StationDistribution";
import StationMetabolism from "./StationMetabolism";
import StationElimination from "./StationElimination";
import AiGuide from "./AiGuide";
import CloseCta from "./CloseCta";
import { useLandingMotion } from "./useLandingMotion";

import "./landing.css";

/*
 * Outfit (src/app/layout.tsx) is the product's only sans, and this page
 * inherits it. The mono face is a second, narrow role: the instrument-panel
 * labels — stage numbers, page counts, citations, "STAGE 3 OF 4". Loaded here
 * rather than in the root layout so it is requested on this route alone.
 *
 * To drop it, delete this block and the `mono.variable` class below: every rule
 * in landing.css already falls back to `ui-monospace`.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-pw-mono",
});

/**
 * PharmaWallah's landing page.
 *
 * The page is structured as ADME — what happens to a drug after you take it —
 * and each of the four stations gets exactly one idea, so no two sections
 * animate the same way:
 *
 *   01 Absorption   a pinned rail of notes that travels sideways with scroll
 *   02 Distribution a hover index with a gradient sweep and a trailing preview
 *   03 Metabolism   a pinned, scrubbed MCQ answered in three scroll beats
 *   04 Elimination  a DrawSVG dial and a counting scoreboard
 *
 * All of the motion lives in useLandingMotion; these components are markup with
 * data-attributes for it to address. See .claude/skills/frontend-ui-conventions.
 */
export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);

  return (
    <div ref={root} className={`pw-landing is-loading ${mono.variable}`}>
      {/* A client with no JavaScript never runs the effect that releases
          `is-loading`, so unhide everything for it. */}
      <noscript>
        {/* eslint-disable-next-line react/no-danger */}
        <style>{`.pw-landing.is-loading [data-anim],.pw-landing.is-loading [data-hero-in] > *,.pw-landing.is-loading .stage{visibility:visible}.pw-pre{display:none}`}</style>
      </noscript>

      <LandingDefs />
      <Preloader />

      {/* The site header is `fixed` and ships its own in-flow spacer, so the
          launch banner sits directly under it. */}
      <OfficialLaunchBanner />

      <ProgressRail />
      <LandingHero />

      {/* One container for all four stations so the spine — and the molecule
          riding it — spans the whole ADME journey rather than one section. */}
      <div className="light" data-light>
        <svg className="spine" data-spine preserveAspectRatio="none" aria-hidden="true">
          <path className="track" data-track d="" />
          <path className="live" data-live d="" />
        </svg>
        <span className="mol" data-mol aria-hidden="true">
          <span className="halo" />
          <span className="core" />
        </span>

        <StationAbsorption />
        <AdBand slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_1} label="Advertisement" />
        <StationDistribution />
        <StationMetabolism />
        <AdBand slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_2} label="Advertisement" />
        <StationElimination />
      </div>

      <AiGuide />
      <AdBand slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_3} label="Advertisement" />
      <CloseCta />

      <IndexPreview />
    </div>
  );
}
