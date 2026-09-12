"use client";

import React from "react";
import { BookOpen, Sparkles, Target, Link2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MagneticCta } from "./MagneticCta";
import { HeroCurve } from "./art";
import { HERO_RINGS, HERO_STATS } from "./data";

/**
 * "Pharmacy, understood."
 *
 * The visual is the product itself — a page of notes, a marked MCQ and a drug
 * monograph — rather than an illustration of studying. Every element the GSAP
 * orchestrator touches is addressed by a data-attribute so this file stays
 * markup and LandingPage.tsx stays motion.
 */
export default function LandingHero() {
  return (
    <section className="hero" data-hero>
      <span
        className="aura"
        data-aura
        style={{ width: 620, height: 620, left: -260, top: -260, background: "#3B82F6" }}
      />
      <span
        className="aura"
        data-aura
        style={{ width: 520, height: 520, right: -240, bottom: -260, background: "#22C55E" }}
      />
      {/* The molecular lattice. Nodes and bonds are generated at runtime so the
          network fits whatever size the hero ends up being. */}
      <svg className="bonds" data-bonds aria-hidden="true" />

      <div className="wrap hero-in" data-hero-in>
        <div>
          <Badge variant="outline" className="kicker">
            <span className="pip" aria-hidden="true" />
            Pharm-D · UOK &amp; HEC aligned
          </Badge>

          <h1 aria-label="Pharmacy, understood.">
            <span className="line">
              <span>Pharmacy,</span>
            </span>
            <span className="line">
              <span className="swap" data-swap>
                <span className="w gt" data-word-live>
                  understood.
                </span>
                <span className="w gt ghost" data-word-next aria-hidden="true">
                  understood.
                </span>
              </span>
            </span>
          </h1>

          <p className="lede">
            Notes that follow your semester. Ten thousand MCQs that mark themselves. A drug library
            and an AI guide that cite the page they came from. One platform, built around how
            pharmacy is actually examined.
          </p>

          <div className="hero-acts">
            <MagneticCta href="/signup">Start learning free</MagneticCta>
            <MagneticCta href="/ai-guide" tone="outline">
              <Sparkles className="h-[17px] w-[17px]" aria-hidden="true" />
              Ask the AI Guide
            </MagneticCta>
          </div>

          <div className="hero-meta">
            {HERO_STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <span className="vr" aria-hidden="true" />}
                <span className="m">
                  <b data-num={s.num} data-suffix={s.suffix}>
                    {s.num.toLocaleString("en-US")}
                    {s.suffix}
                  </b>
                  <small>{s.label}</small>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="stage" data-stage>
          {/* a page of notes — back left */}
          <Card className="pcard p-notes" data-cap-top>
            <div className="ph">
              <span className="dot" style={{ background: "var(--blue)" }}>
                <BookOpen className="h-3 w-3" aria-hidden="true" />
              </span>
              PHARMACOLOGY · SEM 5
            </div>
            <div className="body">
              <i className="w" style={{ height: 12, width: "70%" }} />
              <div className="fig">
                <HeroCurve />
              </div>
              <i />
              <i />
              <i className="w" style={{ width: "86%" }} />
              <i />
              <i />
            </div>
          </Card>

          {/* a marked MCQ — front right */}
          <Card className="pcard p-mcq" data-cap-bot>
            <div className="ph">
              <span className="dot" style={{ background: "var(--cyan)" }}>
                <Target className="h-3 w-3" aria-hidden="true" />
              </span>
              MCQ BANK · Q7/20
            </div>
            <div className="body">
              <p className="q">Salbutamol relieves bronchospasm mainly through which receptor?</p>
              <span className="o">
                <span className="k">A</span>Beta-1 adrenergic
              </span>
              <span className="o ok">
                <span className="k">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
                Beta-2 adrenergic
              </span>
              <span className="o">
                <span className="k">C</span>Muscarinic M3
              </span>
            </div>
          </Card>

          {/* a monograph chip — bottom left */}
          <Card className="pcard p-drug" data-rl>
            <span className="i">
              <Link2 className="h-[17px] w-[17px]" aria-hidden="true" />
            </span>
            <span>
              <b>Salbutamol</b>
              <small>SABA · 100 MCG/PUFF</small>
            </span>
          </Card>

          {HERO_RINGS.map((r) => (
            <span key={r.text} className="ringlbl" data-rl style={r.style}>
              {r.text}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="scrollcue"
        data-cue
        data-scroll-to="#learn"
        aria-label="Scroll to the first section"
      >
        <span>SCROLL</span>
        <span className="bar" aria-hidden="true" />
      </button>
    </section>
  );
}
