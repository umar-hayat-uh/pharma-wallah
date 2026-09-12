"use client";

import React from "react";
import { Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import StationTop from "./StationTop";
import { DECK_COPY, DECK_NEXT, DECK_OPTIONS, DECK_STEPS } from "./data";

/**
 * 03 · Metabolism — break it down question by question.
 *
 * The section pins for 2400px and the whole answer cycle is scrubbed against
 * that scroll: the timer runs down and the wrong option shakes red, the right
 * one pops green and the explanation rises, then the answered card is dealt off
 * to the right and the next two step forward.
 *
 * The three sizes in landing.css (880px / 790px / 620px tall) exist so the card
 * never falls below the fold on a laptop while the station is pinned.
 */
export default function StationMetabolism() {
  return (
    <section className="station pin" id="practice" data-station="2" data-practice>
      <div className="wrap">
        <StationTop num="03" label="Metabolism" />
        <div className="st-body">
          <h2 data-lines>
            Break it down
            <br />
            question by question.
          </h2>
          <div>
            <p data-anim>
              Ten thousand questions, marked the moment you answer, with the reasoning attached. The
              bank learns which chapters cost you marks and deals more of them.
            </p>
          </div>
        </div>

        <div className="deck-wrap">
          <div>
            <div className="stepper" data-steps>
              {DECK_STEPS.map((t, i) => (
                <div key={t} className={`step${i === 0 ? " on" : ""}`}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t">{t}</span>
                  <i className="ln">
                    <b />
                  </i>
                </div>
              ))}
            </div>

            <div className="copyslot" data-copy>
              {DECK_COPY.map((c) => (
                <p key={c.slice(0, 24)}>{c}</p>
              ))}
            </div>
          </div>

          <div className="deck" data-deck>
            <Card className="qcard stack" data-c3 style={{ transform: "translateY(28px) scale(.94)" }} />
            {/* The question underneath, shown unanswered once the front card is
                dealt away — otherwise "move to the next" ends on a blank card. */}
            <Card className="qcard stack" data-c2 style={{ transform: "translateY(14px) scale(.97)" }}>
              <div className="top">
                <span className="s">{DECK_NEXT.subject}</span>
                <span>{DECK_NEXT.progress}</span>
                <span className="t">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{DECK_NEXT.timer}</span>
                </span>
              </div>
              <p className="q">{DECK_NEXT.question}</p>
              <div className="opts">
                {DECK_NEXT.options.map((o) => (
                  <span key={o.key} className="opt">
                    <span className="k">{o.key}</span>
                    {o.label}
                  </span>
                ))}
              </div>
            </Card>
            <Card className="qcard" data-c1>
              <div className="top">
                <span className="s">Pharmacology</span>
                <span>Q7 / 20</span>
                <span className="t">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span data-timer>00:42</span>
                </span>
              </div>
              <p className="q">
                Which receptor does salbutamol primarily act on to relieve bronchospasm?
              </p>
              <div className="opts" data-opts>
                {DECK_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className="opt"
                    {...(o.key === "B" ? { "data-ok": "" } : {})}
                  >
                    <span className="k">{o.key}</span>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="why" data-why>
                <span className="i">
                  <Sparkles className="h-[17px] w-[17px] text-white" aria-hidden="true" />
                </span>
                <span>
                  <b>Why B</b>
                  <p>
                    Salbutamol is a selective beta-2 agonist. Beta-2 receptors on bronchial smooth
                    muscle raise cyclic AMP and relax the airway; beta-1 selectivity would hit the
                    heart instead.
                  </p>
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
