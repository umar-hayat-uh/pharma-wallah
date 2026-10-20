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
          {/* The visible lines ARE the heading text, so a crawler, a screen
              reader and a copy-paste all get "Pharmacy maths, Solved." once.
              Until 2026-10-12 the h1 held an sr-only copy plus aria-hidden
              lines plus all four cycle words as text, and its textContent read
              "The whole Pharm-D, Solved.The wholePharm-D,Solved.Measured.…" —
              the run-on string the AdSense audit flagged. The {" "} between
              block lines keeps the words apart in textContent (a space between
              blocks does not render). The alternate cycle words are drawn from
              a data attribute by CSS (::before in landing.css), so they never
              enter the document text; the motion hook only moves the spans. */}
          <span className="mask">
            <span data-line>Pharmacy</span>
          </span>{" "}
          <span className="mask step">
            <span data-line>maths,</span>
          </span>{" "}
          <span className="mask">
            <span data-line>
              <span className="cycle" data-cycle>
                {HERO_CYCLE.map((word, i) =>
                  i === 0 ? (
                    <span key={word} className="cycle__word" data-cycle-word>
                      {word}
                    </span>
                  ) : (
                    <span
                      key={word}
                      className="cycle__word cycle__word--alt"
                      data-cycle-word
                      data-word={word}
                      aria-hidden="true"
                      style={{ position: "absolute", left: 0, top: 0, opacity: 0 }}
                    />
                  ),
                )}
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
          <strong>{STATS.calculators} pharmacy calculators</strong> that show their formula and working, for
          Doctor of Pharmacy students in Pakistan — plus {STATS.lessons} course lessons, spotting slides,{" "}
          {STATS.virtualLabs} 3D virtual labs and a clinical reference desk.
        </p>
        <div className="hero__ctas" data-in>
          <Btn href="/calculation-tools" magnetic>
            Open the calculators
          </Btn>
          <Btn href="/calculation-tools/how-to-use" variant="ghost" magnetic>
            How to use them
          </Btn>
        </div>
      </div>
    </section>
  );
}
