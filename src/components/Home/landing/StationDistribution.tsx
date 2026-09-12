"use client";

import React from "react";
import Link from "next/link";
import StationTop from "./StationTop";
import { DISCIPLINES } from "./data";

/**
 * 02 · Distribution — the discipline index.
 *
 * No cards. Hovering a row sweeps a gradient up from its baseline, pushes the
 * title right and floats a preview tile that trails the cursor (the tile itself
 * lives at the page root so it can be `position: fixed`).
 */
export default function StationDistribution() {
  return (
    <section className="station" id="explore" data-station="1">
      <div className="wrap">
        <StationTop num="02" label="Distribution" />
        <div className="st-body">
          <h2 data-lines>
            Ten disciplines.
            <br />
            One index.
          </h2>
          <div>
            <p data-anim>
              From dosage-form design to patient counselling. Every branch of the Pharm-D syllabus,
              with the notes, MCQs and monographs already mapped to it.
            </p>
          </div>
        </div>

        <div className="index" data-index>
          {DISCIPLINES.map((d, i) => (
            <Link
              key={d.title}
              href={d.href}
              className="irow"
              data-title={d.title}
              data-grad={d.grad}
            >
              <span className="sweep" aria-hidden="true" />
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.title}</h3>
              <span className="meta">{d.meta}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
