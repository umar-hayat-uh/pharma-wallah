"use client";

import React from "react";
import { HERO_CYCLE, STATS } from "./data";
import { Btn } from "./Btn";
import Specimen from "./Specimen";
import { Mark, Note } from "./Marks";

export default function Hero() {
  return (
    <section className="hero wrap" data-hero aria-labelledby="pw-idx-title">
      {/* The instrument strip that sat here (Pharm-D · Pakistan / tool, lesson and
          lab counts / a live PKT clock) was removed at the user's request on
          2026-09-13; the headline now opens the page. */}
      <div className="hero__stage">
        <h1 className="hero__title" id="pw-idx-title" data-hero-title>
          {/* The sentence as a screen reader should hear it — once, not as four
              words swapping in and out. Everything visual below is aria-hidden. */}
          <span className="sr-only">The whole Pharm-D, {HERO_CYCLE[0]}</span>
          <span className="mask" aria-hidden="true">
            <span data-line>The whole</span>
          </span>
          <span className="mask step" aria-hidden="true">
            <span data-line>Pharm-D,</span>
          </span>
          <span className="mask" aria-hidden="true">
            <span data-line>
              <span className="cycle" data-cycle>
                {HERO_CYCLE.map((word, i) => (
                  <span
                    key={word}
                    className="cycle__word"
                    data-cycle-word
                    style={i === 0 ? undefined : { position: "absolute", left: 0, top: 0, opacity: 0 }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </span>

          {/* Marker underline under the last line — drawn on as the page opens. */}
          <Mark kind="underline" color="blue" className="hero__underline" />
        </h1>

        <Specimen />

        {/* Pointing at the specimen card, in the teacher's handwriting. */}
        <span className="hero__aside-note" aria-hidden="true">
          <Mark kind="arrowUp" color="ink" className="hero__arrow" />
          <Note>a real one — try it</Note>
        </span>
      </div>

      <div className="hero__foot">
        <p className="hero__lede" data-in>
          <strong>{STATS.calculators} calculators, {STATS.lessons} lessons</strong>, spotting slides,{" "}
          {STATS.simulations} wet-lab simulations and a clinical decision-support suite — built for Doctor of
          Pharmacy students.
        </p>
        <div className="hero__ctas" data-in>
          <Btn href="/calculation-tools" magnetic>
            Open the calculators
          </Btn>
          <Btn href="/courses" variant="ghost" magnetic>
            Browse courses
          </Btn>
        </div>
      </div>
    </section>
  );
}
