"use client";

import { Microscope } from "lucide-react";
import {
  CalculatorShell,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
} from "@/components/calculators";
import { ColonyCounter } from "@/components/calculators/colony/ColonyCounter";

/*
 * COLONY COUNTER & CFU CALCULATOR — offline, on the device.
 *
 * Rebuilt 2026-09-16. The earlier page sent the plate photo to Gemini through
 * /api/scan-colonies and could not work in the offline app. Detection now runs
 * locally with OpenCV.js (bundled, in a Web Worker) — see
 * src/components/calculators/colony/ and scripts/colony-counter.test.mts.
 *
 * CFU/mL = colonies ÷ (dilution × volume) is the same relation the old page
 * used as colonies × dilution factor ÷ volume. The old page's water/food/urine
 * "acceptable" bands were not carried over: they had no stated source.
 */

export default function CfuCalculatorPage() {
  return (
    <CalculatorShell
      title="Colony Counter & CFU Calculator"
      subtitle="Count colonies. Verify your plate. Calculate CFU."
      icon={Microscope}
      eyebrow="Microbiology · PharmaWallah"
      aside={
        <>
          <CalcAbout title="About plate counts">
            <p>
              A colony-forming unit (CFU) is a viable cell, or a clump of cells, that grows into one visible colony.
              Counting colonies on a plate spread with a known volume of a known dilution estimates the viable count in
              the original sample.
            </p>
            <CalcList
              title="For a good photo"
              items={[
                "Top-down, with the whole dish in the frame",
                "Even light, no reflections of the lamp on the lid — photograph with the lid off if your protocol allows",
                "A plain, contrasting background under the dish",
                "Colonies at their final size, before they merge",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Automated counting is an estimate — check every marker",
                "Touching colonies may be counted as one; add the missing ones",
                "A commonly used practical counting range is around 30–300 colonies; follow your laboratory protocol",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ColonyCounter />

      <FormulaNote>
        <Formula>CFU/mL = number of colonies ÷ (dilution fraction × volume plated in mL)</Formula>
        <p>
          The dilution is written as a fraction: 10⁻⁴ is 0.0001. Example: 89 colonies from 0.1 mL of the 10⁻⁴ dilution
          → 89 ÷ (0.0001 × 0.1) = 8,900,000 = 8.9 × 10⁶ CFU/mL. This is the same as colonies × dilution factor ÷
          volume, with a dilution factor of 10 000.
        </p>
        <p>
          Colonies are found with classical image processing: plate detection (Hough circle), background correction,
          thresholding (Otsu or adaptive), morphological clean-up, and distance transform + watershed to separate
          touching colonies. No AI service is used and the image is not uploaded.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Is my plate photo uploaded?",
            a: "No. The image is analysed inside this page on your device, and the tool works without an internet connection in the PharmaWallah app.",
          },
          {
            q: "Can I trust the automatic count?",
            a: "Treat it as a starting point. Zoom in, remove markers on bubbles, dust or lid reflections, and add colonies that were missed. The CFU calculation uses only the final verified count.",
          },
          {
            q: "Two colonies are marked as one.",
            a: "Touching colonies are separated when the shape clearly shows two lobes. When it does not, the region is left as one — remove it and add the colonies individually with Add colony.",
          },
          {
            q: "The detector found nothing, or far too much.",
            a: "Pick Dark or Light Colonies to match your plate, adjust Detection Sensitivity, and use Advanced Detection Settings for the colony size limits. If the dish itself was not found, select the plate manually.",
          },
          {
            q: "What if I counted the plate by hand?",
            a: "Enter the count in CFU Calculation without analysing an image.",
          },
          {
            q: "Which plates should I count?",
            a: "A commonly used practical counting range is around 30–300 colonies, but the appropriate range depends on the laboratory method and protocol.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
