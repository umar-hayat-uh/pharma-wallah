"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { MagneticCta } from "./MagneticCta";

/** The last frame: start where you are, free. */
export default function CloseCta() {
  return (
    <section className="close">
      <div className="wrap">
        <div className="closebox" data-anim data-close>
          <span className="glow" aria-hidden="true" />
          <div>
            <h2 data-lines>
              Start where you are.
              <br />
              Free.
            </h2>
            <p>
              No card, no trial clock. Open the semester you&apos;re in and the notes are already
              there.
            </p>
          </div>
          <MagneticCta href="/signup" tone="invert">
            Create your account
            <ArrowRight className="h-[17px] w-[17px]" aria-hidden="true" />
          </MagneticCta>
        </div>
      </div>
    </section>
  );
}
