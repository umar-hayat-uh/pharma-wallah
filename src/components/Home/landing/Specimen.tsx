"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/*
 * Worked examples for the hero's specimen card.
 *
 * The results are COMPUTED from the standard formulas below, never typed in, so
 * the card can never show a wrong answer to a pharmacy student. Each links to
 * the calculator that does the same sum (routes verified 2026-09-13).
 */
type Example = {
  name: string;
  href: string;
  inputs: { label: string; value: string }[];
  formula: string;
  result: string;
  unit: string;
};

const round = (n: number, dp: number) => n.toFixed(dp);

const EXAMPLES: Example[] = [
  (() => {
    const volumeMl = 1000;
    const hours = 8;
    const dropFactor = 20;
    // Drip rate (gtt/min) = volume (mL) × drop factor (gtt/mL) ÷ time (min)
    const rate = (volumeMl * dropFactor) / (hours * 60);
    return {
      name: "IV drip rate",
      href: "/calculation-tools/iv-drip-rate-calculator",
      inputs: [
        { label: "Volume", value: `${volumeMl} mL` },
        { label: "Duration", value: `${hours} h` },
        { label: "Drop factor", value: `${dropFactor} gtt/mL` },
      ],
      formula: "V × DF ÷ t",
      result: round(rate, 1),
      unit: "gtt/min",
    };
  })(),
  (() => {
    const heightCm = 170;
    const weightKg = 65;
    // Mosteller: BSA (m²) = √(height (cm) × weight (kg) ÷ 3600)
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);
    return {
      name: "Body surface area",
      href: "/calculation-tools/bsa-calculator",
      inputs: [
        { label: "Height", value: `${heightCm} cm` },
        { label: "Weight", value: `${weightKg} kg` },
        { label: "Method", value: "Mosteller" },
      ],
      formula: "√(H × W ÷ 3600)",
      result: round(bsa, 2),
      unit: "m²",
    };
  })(),
  (() => {
    const targetMgL = 15;
    const vdLkg = 0.7;
    const weightKg = 70;
    // Loading dose (mg) = target Cp (mg/L) × Vd (L/kg × kg) ÷ F, with F = 1 (IV)
    const dose = (targetMgL * vdLkg * weightKg) / 1;
    return {
      name: "Loading dose",
      href: "/calculation-tools/loading-dose-calculator",
      inputs: [
        { label: "Target Cp", value: `${targetMgL} mg/L` },
        { label: "Vd", value: `${vdLkg} L/kg × ${weightKg} kg` },
        { label: "Route", value: "IV · F = 1" },
      ],
      formula: "Cp × Vd ÷ F",
      result: round(dose, 0),
      unit: "mg",
    };
  })(),
];

/**
 * A lab specimen card beside the headline: a real worked calculation, cycling
 * through three examples.
 *
 * The cycle is driven by the timer bar's own CSS animation — `onAnimationEnd`
 * advances to the next example. That makes pausing free: hovering or focusing
 * the card sets `animation-play-state: paused` in CSS, and under reduced motion
 * the animation is removed, so the card simply stays put (the 01/02/03 buttons
 * still switch examples).
 */
export default function Specimen() {
  const [index, setIndex] = useState(0);
  const example = EXAMPLES[index];

  return (
    <aside className="specimen" data-in aria-label="Worked example">
      <div className="specimen__head mono">
        <span>Worked example</span>
        <span className="specimen__tabs" role="group" aria-label="Choose example">
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex.name}
              type="button"
              className={i === index ? "is-on" : undefined}
              aria-pressed={i === index}
              aria-label={ex.name}
              onClick={() => setIndex(i)}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </span>
      </div>

      {/* Everything that changes is keyed on the example, so it re-enters. */}
      <div key={example.name} className="specimen__body" aria-live="polite">
        <p className="specimen__name">{example.name}</p>

        <dl className="specimen__inputs">
          {example.inputs.map((input) => (
            <div key={input.label}>
              <dt>{input.label}</dt>
              <dd>{input.value}</dd>
            </div>
          ))}
        </dl>

        <p className="specimen__formula mono">= {example.formula}</p>

        <p className="specimen__result">
          <span className="specimen__value">{example.result}</span>
          <span className="specimen__unit mono">{example.unit}</span>
        </p>
      </div>

      <span
        key={`timer-${index}`}
        className="specimen__timer"
        aria-hidden="true"
        onAnimationEnd={() => setIndex((i) => (i + 1) % EXAMPLES.length)}
      />

      <Link href={example.href} className="specimen__link">
        Open the calculator
        <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
      </Link>
    </aside>
  );
}
