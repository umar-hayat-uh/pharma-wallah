"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Beaker,
  Calculator,
  CloudOff,
  Droplet,
  FlaskRound,
  HeartPulse,
  Ruler,
  Scale,
  Search,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import { PILLARS, SAMPLE_TOOLS, STATS } from "./data";
import { Btn } from "./Btn";
import { Mark, Note } from "./Marks";

/* ══════════════════ Tape ══════════════════ */

const TAPE = [
  { num: String(STATS.calculators), label: "Calculators" },
  { num: String(STATS.lessons), label: "Lessons" },
  { num: String(STATS.simulations), label: "Wet labs" },
  { num: String(STATS.pillars), label: "Pillars" },
  { num: "0", label: "Signal needed in the app" },
  { num: "PK", label: "Pharm-D curriculum" },
];

/**
 * A readout tape running under the hero. The track is rendered twice so the
 * loop is seamless; the second copy is hidden from assistive technology so the
 * figures are announced once.
 */
export function Tape() {
  const track = (hidden: boolean) => (
    <div className="tape__track" aria-hidden={hidden || undefined}>
      {TAPE.map((item) => (
        <React.Fragment key={item.label}>
          <span className="tape__item">
            <span className="tape__num">{item.num}</span>
            <span className="mono">{item.label}</span>
          </span>
          <span className="tape__sep" aria-hidden="true" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="tape">
      {track(false)}
      {track(true)}
    </div>
  );
}

/* ══════════════════ The Instrument ══════════════════ */

/** One tick per calculator — the ruler *is* the number. */
const TICKS = Array.from({ length: STATS.calculators });

export function Instrument() {
  return (
    <section className="instrument wrap" data-instrument aria-labelledby="pw-idx-instrument-title">
      <div className="instrument__grid">
        <div className="instrument__read">
          <p className="instrument__kicker mono" data-reveal>
            01 — Calculations
          </p>
          <h2 className="sr-only" id="pw-idx-instrument-title">
            {STATS.calculators} pharmacy calculators
          </h2>
          {/* Counts up from 00 as the section arrives. The final figure is the
              server-rendered text, so it is correct before any JavaScript. */}
          <span className="numeral-wrap">
            <span className="numeral" aria-hidden="true">
              <span data-count={STATS.calculators}>{STATS.calculators}</span>
              <span className="numeral__unit">.</span>
            </span>
            <Mark kind="circle" color="red" className="numeral__circle" />
          </span>
          <div className="ruler" aria-hidden="true">
            {TICKS.map((_, i) => (
              <i key={i} />
            ))}
            <span className="ruler__fill" data-ruler-fill />
          </div>
          <span className="ruler__note" aria-hidden="true">
            <Mark kind="arrowUp" color="red" className="ruler__arrow" />
            <Note color="red">one tick = one calculator</Note>
          </span>
        </div>

        <div className="instrument__side">
          <p className="instrument__lede" data-reveal>
            <strong>Every formula a Pharm-D asks of you</strong> — worked, unit-aware and explained, from
            clearance to isotonicity. The same {STATS.calculators} run with no signal at all in the Android app.
          </p>

          <ol className="readout" data-reveal>
            {SAMPLE_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href}>
                  <span>{tool.name}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>

          <div data-reveal>
            <Btn href="/calculation-tools" magnetic>
              All {STATS.calculators} calculators
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════ Offline ══════════════════ */

/** Real tool names from the app's catalogue, shortened as its cards show them. */
const PHONE_TOOLS: { label: string; Icon: LucideIcon }[] = [
  { label: "GFR", Icon: Activity },
  { label: "IV drip rate", Icon: Droplet },
  { label: "Dilution", Icon: Beaker },
  { label: "Isotonicity", Icon: FlaskRound },
  { label: "Loading dose", Icon: Syringe },
  { label: "BSA", Icon: Ruler },
  { label: "Half-life", Icon: HeartPulse },
  { label: "Molarity", Icon: Beaker },
  { label: "BMI", Icon: Scale },
];

const PHONE_TOOLS_PK: { label: string; Icon: LucideIcon }[] = [
  { label: "Clearance", Icon: Activity },
  { label: "AUC", Icon: Ruler },
  { label: "Bioavailability", Icon: Syringe },
];

export function Offline() {
  return (
    <section className="offline wrap" aria-labelledby="pw-idx-offline-title">
      <div className="offline__grid">
        <div className="offline__copy">
          <p className="mono" data-reveal>
            Android app
          </p>
          <h2 className="offline__title" id="pw-idx-offline-title" data-reveal>
            Works in
            <br />
            <em className="offline__airplane">
              airplane
              <Mark kind="circle" color="orange" className="offline__circle" />
            </em>{" "}
            mode.
          </h2>
          <p className="offline__lede" data-reveal>
            All {STATS.calculators} calculators, installed on your phone. For the lab with no signal, the
            exam hall, and the hospital basement.
          </p>
          <div data-reveal>
            <Btn href="/download" magnetic>
              Get the app
            </Btn>
          </div>
        </div>

        {/* A drawing of the app's real home screen (mobile/app/_components/
            ToolHub.tsx): the app bar, the tool count, search, category chips
            and the 3-up tool grid. Built in markup, not an image: no download,
            no layout shift, sharp at any density. */}
        <div className="phone" data-phone aria-hidden="true">
          <span className="phone__note">
            <Note color="blue">no Wi-Fi? still works</Note>
            <Mark kind="arrow" color="blue" className="phone__arrow" />
          </span>
          <div className="phone__screen">
            <div className="phone__bar">
              <span className="phone__mark">
                <Calculator size={13} strokeWidth={2.4} />
              </span>
              PharmaWallah
              <span className="phone__pill">
                <CloudOff size={10} strokeWidth={2.4} />
                Offline
              </span>
            </div>

            <div className="phone__hero">
              <span className="phone__eyebrow">Pharmacy calculators</span>
              <span className="phone__count">
                {STATS.calculators}
                <i>.</i>
              </span>
            </div>

            <div className="phone__search">
              <Search size={11} strokeWidth={2.4} />
              Search {STATS.calculators} calculators…
            </div>

            <div className="phone__chips">
              <span className="is-on">Pharmaceutics</span>
              <span>Kinetics</span>
              <span>Clinical</span>
            </div>

            <span className="phone__group">Pharmaceutics</span>
            <div className="phone__cells">
              {PHONE_TOOLS.map(({ label, Icon }) => (
                <span key={label} className="phone__cell">
                  <span className="phone__icon">
                    <Icon size={11} strokeWidth={2.4} />
                  </span>
                  {label}
                </span>
              ))}
            </div>
            <span className="phone__group">Pharmacokinetics</span>
            <div className="phone__cells">
              {PHONE_TOOLS_PK.map(({ label, Icon }) => (
                <span key={label} className="phone__cell">
                  <span className="phone__icon">
                    <Icon size={11} strokeWidth={2.4} />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════ Close ══════════════════ */

export function Close() {
  return (
    <section className="close wrap" aria-labelledby="pw-idx-close-title">
      <h2 className="close__title" id="pw-idx-close-title">
        <span className="mask">
          <span data-close-line>Begin</span>
        </span>
        <span className="mask">
          <span data-close-line>
            anywhere<span className="close__dot">.</span>
          </span>
        </span>
        <Mark kind="squiggle" color="blue" className="close__squiggle" />
        <Mark kind="star" color="orange" className="close__star" />
      </h2>

      <div className="close__row">
        <p className="mono">
          {PILLARS.map((p) => p.title).join(" · ")}
        </p>
        <div className="close__ctas">
          <Btn href="/calculation-tools" magnetic>
            Calculators
          </Btn>
          <Btn href="/courses" variant="ghost" magnetic>
            Courses
          </Btn>
          <Btn href="/mcqs-bank" variant="ghost" magnetic>
            MCQ bank
          </Btn>
        </div>
      </div>
    </section>
  );
}
