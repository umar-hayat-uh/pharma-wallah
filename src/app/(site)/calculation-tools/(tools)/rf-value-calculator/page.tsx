"use client";

import dynamic from "next/dynamic";
import { Camera, Ruler, ScanLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalculatorShell,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
} from "@/components/calculators";
import { TLCAnalyzer } from "@/components/calculators/tlc/TLCAnalyzer";

// The distance tab carries Recharts; load it only when a student opens that tab.
const DistanceMode = dynamic(() => import("./_DistanceMode").then((m) => m.DistanceMode), {
  ssr: false,
  loading: () => <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>,
});

/*
 * TLC Rf ANALYZER — Rf values from a photo of the plate, or from distances.
 *
 * Rebuilt 2026-09-16. The photo analyzer lives in
 * src/components/calculators/tlc/ (pure maths, geometry and detection with
 * node tests in scripts/tlc-rf.test.mts; React UI beside them). It runs
 * entirely on the device — no API, no upload, no CDN — so it works inside the
 * offline Android app. The original distance calculator is the second tab,
 * unchanged, in _DistanceMode.tsx.
 */

export default function RfValueCalculator() {
  return (
    <CalculatorShell
      title="TLC Rf Analyzer"
      subtitle="Calculate Rf values from a TLC plate image — mark the baseline, solvent front and spots on your phone — or from distances you measured with a ruler."
      icon={ScanLine}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About TLC and Rf values">
            <p>
              The retention factor (Rf) is the distance a compound travels up the plate divided by the
              distance the solvent front travels, both measured from the origin line. It is normally
              between 0 and 1, and the ideal working range is 0.2–0.8.
            </p>
            <CalcList
              title="For a good photo"
              items={[
                "Mark the solvent front in pencil as soon as the plate comes out",
                "Photograph square-on, on a plain background, in even light",
                "Visualise first — iodine, a stain, or a UV lamp — then photograph straight away",
                "Keep the whole plate in the frame",
              ]}
            />
            <CalcList
              tone="caution"
              title="What changes Rf"
              items={[
                "Stationary phase and plate activity",
                "Mobile phase composition",
                "Temperature and chamber saturation",
                "Measure both distances from the origin, in the same unit",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <Tabs defaultValue="photo">
        <TabsList className="grid h-auto grid-cols-2 sm:inline-grid sm:w-auto">
          <TabsTrigger value="photo" className="h-11">
            <Camera className="h-4 w-4" />
            Analyse a plate photo
          </TabsTrigger>
          <TabsTrigger value="distances" className="h-11">
            <Ruler className="h-4 w-4" />
            Enter distances
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photo" forceMount>
          <TLCAnalyzer />
        </TabsContent>
        <TabsContent value="distances">
          <DistanceMode />
        </TabsContent>
      </Tabs>

      <FormulaNote>
        <Formula>Rf = distance travelled by compound ÷ distance travelled by solvent front</Formula>
        <p>
          Both distances are measured from the origin line, in the same unit — the unit cancels, so Rf
          has none. That is why the photo analyzer can work in image pixels: 210 px ÷ 350 px = 0.60,
          exactly as 4.2 cm ÷ 7.0 cm. A spot that stays on the origin has Rf 0; one that runs with the
          solvent front has Rf 1.
        </p>
        <p className="text-xs">Sources: Merck TLC guide; Vogel&apos;s Textbook of Practical Organic Chemistry.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Is my photo uploaded anywhere?",
            a: "No. The image is opened, straightened, analysed and measured inside this page on your device. Nothing is sent to a server, and the analyzer works in airplane mode in the PharmaWallah app. A plate is only kept if you press Save analysis, and then only in this browser.",
          },
          {
            q: "Why are distances shown in pixels?",
            a: "Rf is a ratio, so any unit works as long as both distances use the same one. Pixels are measured straight from the photo. If you also want centimetres, enter the solvent-front distance you measured on the plate under Physical distance calibration.",
          },
          {
            q: "The detector missed a spot or found something that isn't one.",
            a: "Detection is only a suggestion. Adjust the sensitivity, choose whether your spots are dark or bright under UV, and re-detect — or add, move and delete spots by hand. Only spots you confirm are used in the results.",
          },
          {
            q: "My photo is taken at an angle.",
            a: "Use Prepare plate → Perspective. Find plate places the four corners automatically when it can; otherwise drag them onto the plate's corners and press Correct perspective. Rotate and Crop cover the simpler cases.",
          },
          {
            q: "Where do I measure the spot from?",
            a: "From the origin line to the centre of the spot (or its densest point if it is streaked), and from the origin to the solvent front for the other distance.",
          },
          {
            q: "What is a good Rf value?",
            a: "Between about 0.2 and 0.8. Spots very near the origin or the solvent front are poorly separated; change the solvent polarity to move them into range.",
          },
          {
            q: "Can I identify a compound from its Rf alone?",
            a: "Not reliably. Rf depends on the plate, solvent and conditions. Run the unknown next to a reference standard on the same plate and compare them directly.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
