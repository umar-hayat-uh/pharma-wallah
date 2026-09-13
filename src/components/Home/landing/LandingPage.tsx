"use client";

import React, { useRef } from "react";
import { Caveat, JetBrains_Mono } from "next/font/google";

import { Pen, Preloader } from "./Chrome";
import Hero from "./Hero";
import IndexSection from "./IndexSection";
import { Close, Instrument, Offline, Tape } from "./Sections";
import { useIndexMotion } from "./useIndexMotion";

import "./landing.css";

/*
 * Outfit (src/app/layout.tsx) is the product's only sans, and this page
 * inherits it — pushed to weights and sizes the rest of the site never uses.
 * The mono face has one narrow role: instrument labels (row numbers, figures,
 * the tape readout). Loaded here so it is requested on this route alone. Every
 * rule in landing.css falls back to `ui-monospace` if it is removed.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-pw-mono",
});

/*
 * Marker handwriting for the whiteboard annotations — the notes, the leader's
 * countdown and the Index numeral. It never carries content a reader needs:
 * every note is aria-hidden decoration. Scoped to this route like the mono
 * face; landing.css falls back to a system script face if it is removed.
 */
const hand = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-pw-hand",
});

/**
 * PharmaWallah's landing page — "The Index", played as a whiteboard video.
 *
 * The whole page is a whiteboard. Marker annotations draw themselves on as you
 * scroll (scrubbed, so scrolling back rewinds them) with a pen riding each
 * stroke. Scrolling is the playback — there is no play button. (A fixed
 * timeline bar with a timecode and chapter seek points was removed on
 * 2026-09-13 at the user's request; see .claude/skills/landing-page-motion.)
 *
 *   Leader      a 3-2-1 film countdown (once per session)
 *   Hero        a headline whose last word cycles, a taped-up worked example
 *   Tape        the platform's figures on a running readout
 *   Index       SIGNATURE — six pillars; a highlighter swipes the active row
 *   Instrument  the tool count, counted up and ringed in red marker; one ruler tick per tool
 *   Offline     the Android app, with its real home screen drawn in markup
 *   Close       "Begin anywhere."
 *
 * Markup and copy live in the section components; all GSAP motion lives in
 * useIndexMotion. Design rationale: .claude/skills/top-design/SKILL.md.
 */
export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useIndexMotion(root);

  return (
    <div ref={root} className={`pw-idx is-loading ${mono.variable} ${hand.variable}`}>
      {/* Without JavaScript the effect that releases `is-loading` never runs. */}
      <noscript>
        <style>{`.pw-idx.is-loading [data-in]{visibility:visible}.pw-idx .pre{display:none}`}</style>
      </noscript>

      <Preloader />
      <Pen />

      {/* The Science Fair 2026 launch strip (OfficialLaunchBanner, in
          src/components/Home/tournament) sat here until the event ended; it was
          removed at the user's request on 2026-09-13. The site header is
          `fixed` and ships its own in-flow spacer, so the hero now sits directly
          beneath it. */}
      <Hero />
      <Tape />
      {/* No ad placements on the landing page, by decision (2026-09-13). The
          NEXT_PUBLIC_ADSENSE_SLOT_HOME_1/2/3 env vars are unused as a result. */}
      <IndexSection />
      <Instrument />
      <Offline />
      <Close />
    </div>
  );
}
