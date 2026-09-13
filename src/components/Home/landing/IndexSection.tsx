"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PILLARS } from "./data";
import { Mark, Note } from "./Marks";

/**
 * The signature section.
 *
 * Six numbered rows, one per pillar of the product. Whichever row is active
 * gets a highlighter swipe behind its title in its own marker colour, grows the
 * title through Outfit's weight axis, opens its description, and re-letters the
 * big hand-drawn numeral held beside the list. Reading down the index, the
 * board changes marker six times.
 *
 * The first row is marked active in the markup, so the section is fully
 * readable before the motion hook runs, with no JavaScript, and under reduced
 * motion. The hook only moves the marker.
 */
export default function IndexSection() {
  const first = PILLARS[0];

  return (
    <section
      className="index wrap"
      data-index
     
      aria-labelledby="pw-idx-index-title"
      style={{ "--hl": first.marker } as React.CSSProperties}
    >
      <div className="index__head">
        <p className="index__kicker mono" data-reveal>
          Index — six ways in
        </p>
        <h2 className="index__title" id="pw-idx-index-title" data-reveal>
          One degree.
          <br />
          <span className="index__six">
            Six instruments.
            <Mark kind="squiggle" color="green" className="index__squiggle" />
          </span>
        </h2>
        <Note className="index__note">pick one ↓</Note>
      </div>

      <div className="index__body">
        <div className="index__aside" aria-hidden="true">
          <span className="index__numeral" data-index-numeral>
            {first.num}
          </span>
        </div>

        <ol className="index__rows">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.num}
              className={i === 0 ? "row is-active" : "row"}
              data-row
              data-num={pillar.num}
              data-marker={pillar.marker}
              style={{ "--row-hl": pillar.marker } as React.CSSProperties}
            >
              <Link href={pillar.href} className="row__link">
                <span className="row__num mono">{pillar.num}</span>
                <span className="row__title">{pillar.title}</span>
                <span className="row__figure mono">{pillar.figure}</span>

                {/* Spans throughout: this all sits inside a link, where a <div>
                    or <p> is invalid nesting. */}
                <span className="row__detail">
                  <span>
                    <span className="row__line">{pillar.line}</span>
                    <span className="row__cta">
                      {pillar.cta}
                      <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
