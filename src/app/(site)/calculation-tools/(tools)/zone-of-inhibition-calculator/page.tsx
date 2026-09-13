"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  ResultCard,
  ResultRow,
  FormulaNote,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  TextField,
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

type Susceptibility = "SUSCEPTIBLE" | "INTERMEDIATE" | "RESISTANT";

/* ── Breakpoint bands and wording (unchanged from the original page) ──────── */
function classifyZone(diameter: number): {
  susceptibility: Susceptibility;
  category: string;
  interpretation: string;
  recommendation: string;
} {
  if (diameter >= 20) {
    return {
      susceptibility: "SUSCEPTIBLE",
      category: "High Sensitivity",
      interpretation: "Organism shows excellent response to antibiotic (zone ≥20 mm)",
      recommendation: "First-line treatment option recommended",
    };
  }
  if (diameter >= 15 && diameter < 20) {
    return {
      susceptibility: "INTERMEDIATE",
      category: "Moderate Sensitivity",
      interpretation: "Organism shows intermediate response (15‑19 mm)",
      recommendation: "Consider higher dose or combination therapy",
    };
  }
  return {
    susceptibility: "RESISTANT",
    category: "Resistant",
    interpretation: "Organism shows resistance to this antibiotic (<15 mm)",
    recommendation: "Choose alternative antibiotic therapy",
  };
}

const TONE: Record<Susceptibility, ResultTone> = {
  SUSCEPTIBLE: "success",
  INTERMEDIATE: "warning",
  RESISTANT: "danger",
};

const SAMPLES = [
  { name: "Penicillin vs S. aureus", antibiotic: "Penicillin", organism: "S. aureus", diameter: "32" },
  { name: "Gentamicin vs E. coli", antibiotic: "Gentamicin", organism: "E. coli", diameter: "18" },
  { name: "Vancomycin vs MRSA", antibiotic: "Vancomycin", organism: "MRSA", diameter: "15" },
  { name: "Ciprofloxacin vs P. aeruginosa", antibiotic: "Ciprofloxacin", organism: "P. aeruginosa", diameter: "25" },
];

/* CLSI M100 reference rows, as printed on the original page. */
const CLSI_ROWS = [
  { drug: "Ampicillin", s: "17", i: "14‑16", r: "13" },
  { drug: "Cefotaxime", s: "26", i: "23‑25", r: "22" },
  { drug: "Ciprofloxacin", s: "21", i: "16‑20", r: "15" },
  { drug: "Gentamicin", s: "15", i: "13‑14", r: "12" },
  { drug: "Tetracycline", s: "19", i: "15‑18", r: "14" },
];

/**
 * Deterministic lawn speckle. The original used Math.random() during render, so
 * every re-render reshuffled the dots and the server and client HTML disagreed.
 * Integer-only maths (no sin/cos) keeps Node and the browser byte-identical.
 */
const LAWN_DOTS: { cx: number; cy: number; r: number }[] = (() => {
  let seed = 20260913;
  const next = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed;
  };
  const dots: { cx: number; cy: number; r: number }[] = [];
  while (dots.length < 140) {
    const x = (next() % 9001) / 100 - 45; // −45 … 45
    const y = (next() % 9001) / 100 - 45;
    const r = (next() % 60) / 100 + 0.15;
    if (x * x + y * y <= 45 * 45) dots.push({ cx: 50 + x, cy: 50 + y, r });
  }
  return dots;
})();

/**
 * The Petri dish, drawn in SVG so it scales to any screen width. Zone size
 * follows the original's rule — 3 px per mm on a 320 px dish, capped at
 * 250 px — expressed as a fraction of the dish.
 */
function PetriDish({ diameter }: { diameter: number | null }) {
  const zone = diameter !== null && diameter > 0 ? (Math.min(diameter * 3, 250) / 320) * 100 : 0;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto block w-full max-w-[18rem]" role="img" aria-label={diameter ? `Petri dish with a ${diameter} mm zone of inhibition` : "Petri dish"}>
      <circle cx="50" cy="50" r="49" fill="#cbd5e1" />
      <circle cx="50" cy="50" r="45.5" fill="#fef3c7" />
      <circle cx="50" cy="50" r="44" fill="#fee2e2" />
      {LAWN_DOTS.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#b91c1c" opacity="0.22" />
      ))}
      {zone > 0 && (
        <>
          <circle cx="50" cy="50" r={zone / 2} fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
          <line x1={50 - zone / 2} y1="50" x2={50 + zone / 2} y2="50" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1.5 1" />
          <text x="50" y={50 - Math.max(zone / 2, 8) - 2} textAnchor="middle" fontSize="5" fontWeight="700" fill="#047857" fontFamily="inherit">
            {diameter} mm
          </text>
        </>
      )}
      <line x1="2" y1="50" x2="98" y2="50" stroke="#64748b" strokeWidth="0.3" opacity="0.4" />
      <line x1="50" y1="2" x2="50" y2="98" stroke="#64748b" strokeWidth="0.3" opacity="0.4" />
      {/* Antibiotic disk — white filter paper, as on a real plate. */}
      <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
      <text x="50" y="51.8" textAnchor="middle" fontSize="3.6" fontWeight="700" fill="#334155" fontFamily="inherit">
        AB
      </text>
    </svg>
  );
}

export default function ZoneOfInhibitionCalculator() {
  const [zoneDiameter, setZoneDiameter] = useState("");
  const [antibioticName, setAntibioticName] = useState("");
  const [bacteriaType, setBacteriaType] = useState("");

  /*
   * Live, instead of the old "Analyze Zone" button + alert(). The bands and all
   * wording are exactly what the button produced for a positive diameter.
   */
  const result = useMemo(() => {
    const diameter = parseFloat(zoneDiameter);
    if (isNaN(diameter) || diameter <= 0) return null;
    return { mm: diameter, ...classifyZone(diameter) };
  }, [zoneDiameter]);

  const reset = () => {
    setZoneDiameter("");
    setAntibioticName("");
    setBacteriaType("");
  };

  const diameterValue = parseFloat(zoneDiameter);
  const diameterError =
    zoneDiameter.trim() === ""
      ? undefined
      : isNaN(diameterValue)
        ? "Enter a number."
        : diameterValue <= 0
          ? "Must be greater than zero."
          : undefined;

  const subject = [antibioticName.trim(), bacteriaType.trim()].filter(Boolean).join(" vs ");

  return (
    <CalculatorShell
      title="Zone of Inhibition Calculator"
      subtitle="Reads a Kirby-Bauer disk diffusion zone diameter as susceptible, intermediate or resistant."
      icon={Ruler}
      eyebrow="Microbiology"
      aside={
        <>
          <CalcAbout title="About disk diffusion">
            <p>
              In the Kirby-Bauer test, a paper disk containing an antibiotic is placed on agar spread
              with the organism. The drug diffuses outwards, and where its concentration is high enough
              the organism cannot grow — leaving a clear ring, the zone of inhibition. A wider zone
              generally means a more susceptible organism.
            </p>
            <CalcList
              title="Reading the result"
              items={[
                "Susceptible: effective therapy",
                "Intermediate: possible with higher dose",
                "Resistant: not effective",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This tool uses one general cut-off (≥20 mm S, 15–19 mm I, <15 mm R) for every drug",
                "Real breakpoints are specific to each drug and organism — check CLSI M100 or EUCAST",
                "Measure the full diameter across the disk, in mm, on a standardised 0.5 McFarland lawn",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Zone diameter"
        value={result ? result.mm : null}
        unit="mm"
        interpretation={result ? `${result.susceptibility} · ${result.category}` : undefined}
        tone={result ? TONE[result.susceptibility] : "neutral"}
        empty="Enter the zone diameter in millimetres."
      />

      <CalcSection title="Zone measurement">
        <FieldGrid>
          <NumberField
            label="Zone diameter"
            value={zoneDiameter}
            onChange={setZoneDiameter}
            unit="mm"
            step="0.1"
            placeholder="e.g. 25.5"
            error={diameterError}
            hint="Edge to edge of the clear zone, through the centre of the disk."
          />
          <TextField
            label="Antibiotic name (optional)"
            value={antibioticName}
            onChange={setAntibioticName}
            placeholder="e.g. Amoxicillin"
          />
          <TextField
            label="Bacteria type (optional)"
            value={bacteriaType}
            onChange={setBacteriaType}
            placeholder="e.g. S. aureus"
          />
        </FieldGrid>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example measurement</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setZoneDiameter(sample.diameter);
                  setAntibioticName(sample.antibiotic);
                  setBacteriaType(sample.organism);
                }}
                aria-pressed={zoneDiameter === sample.diameter && antibioticName === sample.antibiotic}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/10"
              >
                {sample.name} · {sample.diameter} mm
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {result && (
        <CalcSection title="Interpretation">
          <div>
            {subject && <ResultRow label="Test" value={subject} />}
            <ResultRow label="Zone diameter" value={result.mm} unit="mm" />
            <ResultRow
              label="Category"
              value={result.category}
              badge={result.susceptibility}
              badgeTone={result.susceptibility === "SUSCEPTIBLE" ? "success" : result.susceptibility === "INTERMEDIATE" ? "warning" : "destructive"}
            />
          </div>
          <LabNotice tone={result.susceptibility === "SUSCEPTIBLE" ? "info" : "warning"} title={result.interpretation}>
            <strong>Recommendation:</strong> {result.recommendation}
          </LabNotice>
        </CalcSection>
      )}

      <CalcSection title="Petri dish visualisation" description="Zone drawn to scale against a standard plate.">
        <PetriDish diameter={result ? result.mm : null} />
      </CalcSection>

      <CalcSection title="CLSI zone diameter breakpoints (mm)" description="Examples of drug-specific breakpoints for comparison.">
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[18rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Antibiotic</th>
                <th className="px-2 py-2 font-medium">S (≥)</th>
                <th className="px-2 py-2 font-medium">I</th>
                <th className="px-2 py-2 font-medium">R (≤)</th>
              </tr>
            </thead>
            <tbody>
              {CLSI_ROWS.map((row) => (
                <tr key={row.drug} className="border-b border-border/60 last:border-b-0">
                  <td className="px-2 py-2.5 font-medium text-foreground">{row.drug}</td>
                  <td className="px-2 py-2.5 tabular-nums text-emerald-700">{row.s}</td>
                  <td className="px-2 py-2.5 tabular-nums text-amber-700">{row.i}</td>
                  <td className="px-2 py-2.5 tabular-nums text-red-700">{row.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">Source: CLSI M100, 2023</p>
      </CalcSection>

      <FormulaNote title="How the zone is read">
        <p>
          There is no formula to calculate — the zone diameter itself is compared with breakpoints. This
          calculator uses one general set:
        </p>
        <div>
          <ResultRow label="Susceptible (S)" value="≥ 20" unit="mm" />
          <ResultRow label="Intermediate (I)" value="15 – 19" unit="mm" />
          <ResultRow label="Resistant (R)" value="< 15" unit="mm" />
        </div>
        <p>
          In practice, breakpoints differ by drug and organism because each antibiotic diffuses through
          agar at a different rate and has a different achievable blood level. The CLSI table shows how
          much they vary — gentamicin is susceptible from 15 mm, cefotaxime only from 26 mm.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "How do I measure the zone?",
            a: "Hold the plate against a dark background and measure the diameter of the clear area, including the disk, to the nearest millimetre with a ruler or caliper. Measure from the back of the plate if the lid obscures the edge.",
          },
          {
            q: "Why does my drug's CLSI breakpoint differ from the result here?",
            a: "This calculator applies one general cut-off to every drug so students can learn the idea of S/I/R. Clinical reports must use the breakpoint for that specific drug–organism pair from the current CLSI M100 or EUCAST tables.",
          },
          {
            q: "What makes a zone unreliable?",
            a: "An inoculum that is too heavy or too light, agar that is not 4 mm deep, plates incubated too long, or disks that have lost potency. The lawn should be confluent and match a 0.5 McFarland standard.",
          },
          {
            q: "What does a zone with colonies inside it mean?",
            a: "Scattered colonies within the zone can indicate a mixed culture or resistant subpopulation. Re-check purity and, if they persist, treat the organism as resistant.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
