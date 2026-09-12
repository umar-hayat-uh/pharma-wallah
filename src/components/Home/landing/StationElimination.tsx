"use client";

import React from "react";
import StationTop from "./StationTop";
import { ODOMETER, WEAK_TOPICS } from "./data";

/**
 * 04 · Elimination — what is left is what you know.
 *
 * DrawSVG sweeps the ring to 82% while the number counts up, then the four
 * figures and the weak-topic chips follow.
 */
export default function StationElimination() {
  return (
    <section className="station" id="master" data-station="3">
      <div className="wrap">
        <StationTop num="04" label="Elimination" />
        <div className="st-body">
          <h2 data-lines>
            What&apos;s left is
            <br />
            what you know.
          </h2>
          <div>
            <p data-anim>
              Every attempt is scored by topic, not just totalled. You finish knowing which three
              chapters are costing you the marks, and revision stops being a guess.
            </p>
          </div>
        </div>

        <div className="board">
          <div className="dial" data-anim>
            <svg width="240" height="240" viewBox="0 0 240 240" fill="none" aria-hidden="true">
              <circle cx="120" cy="120" r="102" stroke="#E9EFF8" strokeWidth="16" />
              <circle
                data-dial
                cx="120"
                cy="120"
                r="102"
                stroke="url(#pw-dg)"
                strokeWidth="16"
                strokeLinecap="round"
                /* static 82% for no-JS and reduced motion; DrawSVG overrides both */
                strokeDasharray="641"
                strokeDashoffset="115"
                transform="rotate(-90 120 120)"
              />
            </svg>
            <span className="val">
              <b>
                <span data-num="82" data-suffix="%">
                  82%
                </span>
              </b>
              <small>Mock score</small>
            </span>
          </div>

          <div>
            <div className="odo" data-anim>
              {ODOMETER.map((o) => (
                <div className="od" key={o.label}>
                  <b className="gt">
                    <span data-num={o.num} data-suffix={o.suffix}>
                      {o.num.toLocaleString("en-US")}
                      {o.suffix}
                    </span>
                  </b>
                  <small>{o.label}</small>
                </div>
              ))}
            </div>
            <div className="topics" data-anim data-topics>
              {WEAK_TOPICS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
