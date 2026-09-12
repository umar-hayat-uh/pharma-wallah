"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  Building2,
  FlaskConical,
  Microscope,
  Pill,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import StationTop from "./StationTop";
import { LeafFigure } from "./art";
import { LEAVES, type Leaf } from "./data";

const LEAF_ICONS = {
  notes: Beaker,
  flask: FlaskConical,
  analysis: Microscope,
  hospital: Building2,
  mcq: Target,
  pill: Pill,
} as const;

function LeafCard({ leaf }: { leaf: Leaf }) {
  const Icon = LEAF_ICONS[leaf.icon];
  return (
    <Card className="leaf">
      <Link href={leaf.href} className="contents">
        <div className="sheet" style={{ background: leaf.tint }}>
          <span className="tag">{leaf.term}</span>
          <div className="pg">
            <span className="hd">
              <span className="sw" style={{ background: leaf.swatch }}>
                <Icon className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
              <b>{leaf.sheetTitle}</b>
            </span>
            <span className="fig">
              <LeafFigure art={leaf.art} />
            </span>
            <i className="w" style={{ width: "78%" }} />
            <i />
            <i />
            <i className="w" style={{ width: "62%" }} />
          </div>
        </div>
        <div className="b">
          <h3>{leaf.title}</h3>
          <span className="sub">{leaf.sub}</span>
          <span className="foot">
            Read notes
            <span className="go">
              <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
            </span>
          </span>
        </div>
      </Link>
    </Card>
  );
}

/**
 * 01 · Absorption — everything you take in.
 *
 * The rail of notes scrolls sideways while the section is pinned on desktop,
 * and becomes a native swipe rail (with GSAP Draggable inertia) on touch.
 */
export default function StationAbsorption() {
  return (
    <section className="station" id="learn" data-station="0">
      <div className="wrap">
        <StationTop num="01" label="Absorption" />
        <div className="st-body">
          <h2 data-lines>
            Everything you need
            <br />
            to take in.
          </h2>
          <div>
            <p data-anim>
              Semester-wise notes, slide-spotting decks, past papers and the books library. Written
              by people who sat the same papers you&apos;re about to sit, and organised the way your
              course actually runs.
            </p>
            <div className="st-tags" data-anim>
              <span>500+ resources</span>
              <span>150+ titles</span>
              <span>Chapter PDFs</span>
              <span>Past papers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gal" data-gal>
        <div className="gal-track" data-gal-track>
          {LEAVES.map((leaf) => (
            <LeafCard key={leaf.title} leaf={leaf} />
          ))}
        </div>
      </div>
      <div className="galbar">
        <b data-galbar />
      </div>
    </section>
  );
}
