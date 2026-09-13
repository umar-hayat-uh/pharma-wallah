"use client";

import { useMemo, useRef, useState } from "react";
import { FlaskRound, Thermometer } from "lucide-react";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabReport,
  LabActions,
  TextField,
  LabNotice,
  ResultRow,
  type LabReportData,
  type LabReportSection,
  toNumber,
  fieldError,
  formatSig,
  formatFixed,
} from "@/components/calculators";

// ─── WATER DENSITY ───────────────────────────────────────────────────────────

/**
 * Density of air-free water at 1 atm, g/mL (CRC Handbook / Kell). Only offered
 * as a suggestion: the student's entered water density is always what the
 * calculation uses, because a lab manual may prescribe its own value.
 */
const WATER_DENSITY: Record<number, number> = {
  15: 0.9991, 16: 0.99894, 17: 0.99877, 18: 0.9986, 19: 0.99841, 20: 0.99821, 21: 0.99799, 22: 0.99777,
  23: 0.99754, 24: 0.9973, 25: 0.99705, 26: 0.99679, 27: 0.99652, 28: 0.99624, 29: 0.99595, 30: 0.99565,
};
const WATER_T_MIN = 15;
const WATER_T_MAX = 30;

/** Linear interpolation between whole-degree table values; null outside 15–30 °C. */
function waterDensityAt(temperature: number): number | null {
  if (temperature < WATER_T_MIN || temperature > WATER_T_MAX) return null;
  const lower = Math.floor(temperature);
  if (lower === WATER_T_MAX) return WATER_DENSITY[WATER_T_MAX];
  const fraction = temperature - lower;
  return WATER_DENSITY[lower] + (WATER_DENSITY[lower + 1] - WATER_DENSITY[lower]) * fraction;
}

/** A nominal bottle volume this far off the water-calibrated one is worth pointing out. */
const VOLUME_MISMATCH_PERCENT = 0.5;
const TEMP_MIN = -10;
const TEMP_MAX = 100;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Decimal places typed, so a difference of weighings is reported to the same place. */
function decimalsOf(raw: string): number {
  const trimmed = raw.trim();
  if (/e/i.test(trimmed)) return 4;
  const point = trimmed.indexOf(".");
  return point === -1 ? 0 : Math.min(trimmed.length - point - 1, 6);
}

function temperatureError(raw: string): string | undefined {
  if (raw.trim() === "") return undefined;
  const value = toNumber(raw);
  if (value === null) return "Enter a number.";
  if (value < TEMP_MIN || value > TEMP_MAX) return `Enter a temperature between ${TEMP_MIN} and ${TEMP_MAX} °C.`;
  return undefined;
}

type Computed = {
  w1: number; w2: number; w3: number; rhoWater: number;
  temperature: number | null; volume: number | null;
  massDecimals: number;
  massWater: number; massSample: number; rd: number; rhoSample: number;
  byVolume: { rhoWater: number; rhoSample: number; differencePercent: number } | null;
};

function compute(w1Raw: string, w2Raw: string, w3Raw: string, rhoRaw: string, tempRaw: string, volRaw: string): Computed | null {
  const w1 = toNumber(w1Raw);
  const w2 = toNumber(w2Raw);
  const w3 = toNumber(w3Raw);
  const rhoWater = toNumber(rhoRaw);
  if (w1 === null || w2 === null || w3 === null || rhoWater === null) return null;
  if (w1 <= 0 || w2 <= w1 || w3 <= w1 || rhoWater <= 0) return null;

  if (temperatureError(tempRaw)) return null;
  const temperature = tempRaw.trim() === "" ? null : toNumber(tempRaw);

  let volume: number | null = null;
  if (volRaw.trim() !== "") {
    volume = toNumber(volRaw);
    if (volume === null || volume <= 0) return null;
  }

  const massWater = w2 - w1;
  const massSample = w3 - w1;
  const rd = massSample / massWater;
  const rhoSample = rd * rhoWater;

  const byVolume = volume
    ? {
        rhoWater: massWater / volume,
        rhoSample: massSample / volume,
        differencePercent: (Math.abs(massWater / volume - rhoWater) / rhoWater) * 100,
      }
    : null;

  return {
    w1, w2, w3, rhoWater, temperature, volume,
    massDecimals: Math.max(decimalsOf(w1Raw), decimalsOf(w2Raw), decimalsOf(w3Raw)),
    massWater, massSample, rd, rhoSample, byVolume,
  };
}

// ─── EXAMPLES ────────────────────────────────────────────────────────────────
// 25 mL bottle, W₁ 20.500 g, W₂ 45.450 g → 24.950 g of water.
//   Glycerin-like: W₃ 51.950 g → 31.450 / 24.950 = 1.2605
//   Ethanol-like:  W₃ 40.200 g → 19.700 / 24.950 = 0.7896

const EXAMPLES = [
  { label: "Glycerin-like liquid (25 mL bottle)", w1: "20.500", w2: "45.450", w3: "51.950", temp: "20", volume: "25", sample: "Glycerin" },
  { label: "Ethanol-like liquid (25 mL bottle)", w1: "20.500", w2: "45.450", w3: "40.200", temp: "20", volume: "25", sample: "Ethanol" },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function RelativeDensityBottleCalculator() {
  const [submitted, setSubmitted] = useState(false);
  const [sample, setSample] = useState("");
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [w3, setW3] = useState("");
  const [rhoWater, setRhoWater] = useState("1.000");
  const [temperature, setTemperature] = useState("");
  const [volume, setVolume] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () => compute(w1, w2, w3, rhoWater, temperature, volume),
    [w1, w2, w3, rhoWater, temperature, volume],
  );

  const tempValue = temperatureError(temperature) || temperature.trim() === "" ? null : toNumber(temperature);
  const suggestedWater = tempValue === null ? null : waterDensityAt(tempValue);
  const suggestedText = suggestedWater === null ? "" : suggestedWater.toFixed(5);
  const enteredWater = toNumber(rhoWater);
  const suggestionMatches = suggestedWater !== null && enteredWater !== null && Math.abs(enteredWater - Number(suggestedText)) < 5e-6;

  const report: LabReportData | null = useMemo(() => {
    if (!result) return null;
    const r = result;
    const mass = (value: number) => formatFixed(value, r.massDecimals);
    const rd4 = formatFixed(r.rd, 4);
    const rhoWaterText = rhoWater.trim();

    const sections: LabReportSection[] = [
      {
        title: "Given data",
        rows: [
          { label: "Mass of empty bottle (W₁)", value: w1.trim(), unit: "g" },
          { label: "Mass of bottle + water (W₂)", value: w2.trim(), unit: "g" },
          { label: "Mass of bottle + sample (W₃)", value: w3.trim(), unit: "g" },
          { label: "Density of water (ρ water)", value: rhoWaterText, unit: "g/mL" },
          ...(r.temperature !== null ? [{ label: "Temperature", value: temperature.trim(), unit: "°C" }] : []),
          r.volume !== null
            ? { label: "Bottle volume (nominal)", value: volume.trim(), unit: "mL" }
            : { label: "Bottle volume (nominal)", value: "not entered" },
        ],
      },
      {
        title: "Mass of water",
        formulas: ["Mass of water = W₂ − W₁", `= ${w2.trim()} g − ${w1.trim()} g = ${mass(r.massWater)} g`],
      },
      {
        title: "Mass of sample",
        formulas: ["Mass of sample = W₃ − W₁", `= ${w3.trim()} g − ${w1.trim()} g = ${mass(r.massSample)} g`],
      },
      {
        title: "Relative density (specific gravity)",
        formulas: [
          "Relative density = Mass of sample / Mass of water = (W₃ − W₁) / (W₂ − W₁)",
          `= ${mass(r.massSample)} g / ${mass(r.massWater)} g = ${rd4}`,
        ],
        lines: ["Grams divide by grams, so relative density has no unit."],
      },
      {
        title: "Density of sample",
        formulas: [
          "Density of sample = Relative density × Density of water",
          `= ${rd4} × ${rhoWaterText} g/mL = ${formatFixed(r.rhoSample, 4)} g/mL`,
        ],
        rows: [{ label: "Density of sample", value: formatFixed(r.rhoSample, 4), unit: "g/mL" }],
      },
    ];

    if (r.byVolume && r.volume !== null) {
      const v = r.byVolume;
      const mismatch = v.differencePercent > VOLUME_MISMATCH_PERCENT;
      sections.push({
        title: "Volume-based densities",
        formulas: [
          `Density of water = Mass of water / V = ${mass(r.massWater)} g / ${volume.trim()} mL = ${formatFixed(v.rhoWater, 4)} g/mL`,
          `Density of sample = Mass of sample / V = ${mass(r.massSample)} g / ${volume.trim()} mL = ${formatFixed(v.rhoSample, 4)} g/mL`,
        ],
        table: {
          columns: ["Quantity", "Water-calibrated (RD × ρ water)", "From nominal volume"],
          rows: [
            ["Density of water", `${rhoWaterText} g/mL (entered)`, `${formatFixed(v.rhoWater, 4)} g/mL`],
            ["Density of sample", `${formatFixed(r.rhoSample, 4)} g/mL`, `${formatFixed(v.rhoSample, 4)} g/mL`],
          ],
        },
        rows: [{ label: "Water density from volume vs entered", value: formatSig(v.differencePercent, 3), unit: "% difference" }],
        lines: [
          mismatch
            ? `The two water densities differ by more than ${VOLUME_MISMATCH_PERCENT}%. The bottle's nominal volume may differ from its true (calibrated) volume; the water-calibrated density is the more reliable result.`
            : `The two water densities agree within ${VOLUME_MISMATCH_PERCENT}%, so the bottle's nominal volume is consistent with its calibration by water.`,
        ],
      });
    }

    const comparison =
      Math.abs(r.rd - 1) < 0.0005
        ? `Relative density ≈ 1: the sample has almost the same density as water at this temperature.`
        : r.rd > 1
          ? `Relative density ${rd4} > 1: the sample is denser than water — a bottle-full of it weighs ${rd4} times as much as the same bottle-full of water.`
          : `Relative density ${rd4} < 1: the sample is lighter than water — a bottle-full of it weighs ${rd4} times as much as the same bottle-full of water.`;

    sections.push({
      title: "Reading the result",
      lines: [
        comparison,
        "For orientation only, approximate values near 20 °C: glycerin ≈ 1.26, ethanol ≈ 0.79. The limits that apply to a substance are given in its pharmacopoeial monograph, at a stated temperature.",
        r.temperature !== null
          ? `Measured at ${temperature.trim()} °C. Report relative density together with the temperature — it changes as liquids expand on warming.`
          : "No temperature was entered. Relative density depends on temperature, so record it with the result.",
      ],
    });

    return {
      title: "Density & Relative Density",
      context: "Physical Pharmacy Lab — Pycnometry",
      sample: sample.trim() || undefined,
      result: { label: "Relative density (specific gravity)", value: rd4 },
      sections,
      notes: [
        "Sample and water are assumed to be weighed at the same temperature, each filling the bottle to the capillary with no air bubbles.",
        "Air-buoyancy corrections are not applied.",
      ],
    };
  }, [result, w1, w2, w3, rhoWater, temperature, volume, sample]);

  // ── Validation ──
  const show = submitted;
  const n1 = toNumber(w1);
  const n2 = toNumber(w2);
  const n3 = toNumber(w3);
  const errors = {
    w1: fieldError(w1, { show }),
    w2:
      fieldError(w2, { show }) ??
      (show && n1 !== null && n2 !== null && n1 > 0 && n2 <= n1 ? "Bottle + water must be heavier than the empty bottle." : undefined),
    w3:
      fieldError(w3, { show }) ??
      (show && n1 !== null && n3 !== null && n1 > 0 && n3 <= n1 ? "Bottle + sample must be heavier than the empty bottle." : undefined),
    rhoWater: fieldError(rhoWater, { show }),
    temperature: temperatureError(temperature),
    volume: fieldError(volume, { show, required: false }),
  };

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setW1(""); setW2(""); setW3("");
    setRhoWater("1.000"); setTemperature(""); setVolume("");
  };

  const mismatch = result?.byVolume ? result.byVolume.differencePercent > VOLUME_MISMATCH_PERCENT : false;

  return (
    <CalculatorShell
      title="Density & Relative Density Bottle Calculator"
      subtitle="Relative density (specific gravity) and density of a liquid from three weighings of a pycnometer."
      icon={FlaskRound}
      eyebrow="Physical Pharmacy"
      aside={
        <>
          <CalcAbout title="About the density bottle">
            <p>
              A <strong>relative density bottle</strong> (pycnometer, specific gravity bottle) holds exactly the same
              volume every time it is filled to its capillary. Weighing it empty, full of water and full of sample gives
              two masses of the <em>same volume</em> — and their ratio is the relative density.
            </p>
            <p>
              Because it is mass divided by mass, relative density is <strong>dimensionless</strong>. It is also
              temperature-dependent: liquids expand on warming, so both the sample and the water should be at the same,
              recorded temperature.
            </p>
            <CalcList
              title="Good technique"
              items={[
                "Fill until liquid rises through the stopper's capillary, so the volume is exact",
                "Wipe the outside dry before weighing — a film of liquid adds mass",
                "Tap out air bubbles; a trapped bubble displaces liquid",
                "Let the filled bottle reach thermal equilibrium, e.g. in a water bath",
                "Use the same bottle and stopper for all three weighings",
              ]}
            />
            <CalcList
              tone="caution"
              title="Common errors"
              items={[
                "Handling the bottle with bare hands warms it and the liquid",
                "Weighing a bottle that is not fully dry inside for W₁",
                "Using the nominal volume instead of calibrating with water",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Experiment">
        <TextField
          label="Sample name (optional)"
          value={sample}
          onChange={setSample}
          placeholder="e.g. Glycerin BP — Bench 4"
          hint="Printed on the lab result card."
        />
      </CalcSection>

      <CalcSection title="Weighings" description="All three with the same bottle and stopper, to the balance's full precision.">
        <FieldGrid>
          <NumberField label="Mass of empty bottle (W₁)" value={w1} onChange={setW1} unit="g" min={0} error={errors.w1} hint="Clean and dry, with stopper." />
          <NumberField label="Mass of bottle + water (W₂)" value={w2} onChange={setW2} unit="g" min={0} error={errors.w2} hint="Filled to the capillary." />
          <NumberField label="Mass of bottle + sample (W₃)" value={w3} onChange={setW3} unit="g" min={0} error={errors.w3} hint="Filled to the capillary." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Conditions" description="Water density is used for the sample's density; temperature and volume are optional.">
        <FieldGrid>
          <NumberField
            label="Density of water"
            value={rhoWater}
            onChange={setRhoWater}
            unit="g/mL"
            min={0}
            error={errors.rhoWater}
            hint="1.000 unless your manual gives a value at the working temperature."
          />
          <NumberField
            label="Temperature (optional)"
            value={temperature}
            onChange={setTemperature}
            unit="°C"
            error={errors.temperature}
            hint="Enter 15–30 °C to see the density of water at that temperature."
          />
          <NumberField
            label="Bottle volume (optional)"
            value={volume}
            onChange={setVolume}
            unit="mL"
            min={0}
            error={errors.volume}
            hint="Nominal volume — used for a second, volume-based density."
          />
        </FieldGrid>

        {suggestedWater !== null && tempValue !== null && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Thermometer className="h-4 w-4 text-blue-600" aria-hidden="true" />
            {suggestionMatches ? (
              <span>
                Water at {formatSig(tempValue, 4)} °C: <span className="font-semibold tabular-nums text-foreground">{suggestedText}</span> g/mL —{" "}
                <span className="font-medium text-green-700">in use</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setRhoWater(suggestedText)}
                className="min-h-[44px] rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Water at {formatSig(tempValue, 4)} °C: <span className="tabular-nums">{suggestedText}</span> g/mL — Use
              </button>
            )}
          </div>
        )}

        <Examples
          items={EXAMPLES.map((example) => ({
            label: example.label,
            apply: () => {
              setW1(example.w1); setW2(example.w2); setW3(example.w3);
              setTemperature(example.temp); setVolume(example.volume); setSample(example.sample);
            },
          }))}
        />
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="relative-density-bottle" />

      <div ref={reportRef} className="scroll-mt-24 space-y-4">
        {report && result ? (
          <>
            <LabReport data={report} />
            <CalcSection title="At a glance">
              <div>
                <ResultRow label="Relative density (specific gravity)" value={formatFixed(result.rd, 4)} />
                <ResultRow label="Density of sample (RD × ρ water)" value={formatFixed(result.rhoSample, 4)} unit="g/mL" />
                {result.byVolume && (
                  <ResultRow
                    label="Density of sample (from bottle volume)"
                    value={formatFixed(result.byVolume.rhoSample, 4)}
                    unit="g/mL"
                    badge={mismatch ? "Check volume" : undefined}
                    badgeTone="warning"
                  />
                )}
                <ResultRow label="Mass of water (W₂ − W₁)" value={formatFixed(result.massWater, result.massDecimals)} unit="g" />
                <ResultRow label="Mass of sample (W₃ − W₁)" value={formatFixed(result.massSample, result.massDecimals)} unit="g" />
              </div>
              {mismatch && result.byVolume && (
                <LabNotice tone="info" title="Nominal volume differs from the water calibration">
                  Water density from the bottle volume is {formatFixed(result.byVolume.rhoWater, 4)} g/mL, which differs
                  from the {rhoWater.trim()} g/mL you entered by {formatSig(result.byVolume.differencePercent, 3)}%. The
                  bottle&apos;s nominal volume may differ from its true (calibrated) volume — calibrating with water is
                  the more reliable method.
                </LabNotice>
              )}
            </CalcSection>
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : n1 !== null && n1 > 0 && ((n2 !== null && n2 <= n1) || (n3 !== null && n3 <= n1))
                  ? "The filled bottle must weigh more than the empty bottle — check W₂ and W₃."
                  : "Enter the three weighings and the density of water."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>Mass of water = W₂ − W₁</Formula>
        <Formula>Mass of sample = W₃ − W₁</Formula>
        <Formula>Relative density = (W₃ − W₁) / (W₂ − W₁)</Formula>
        <Formula>Density of sample = Relative density × Density of water</Formula>
        <p>
          The bottle holds the same volume of water and of sample, so the ratio of their masses equals the ratio of
          their densities. Multiplying by the density of water at the working temperature turns that ratio into the
          sample&apos;s density in g/mL. If a nominal bottle volume is entered, density is also calculated directly as
          mass / volume; it is only as good as the volume printed on the bottle.
        </p>
        <p>
          Example (25 mL bottle): W₁ = 20.500 g, W₂ = 45.450 g, W₃ = 51.950 g gives 31.450 g / 24.950 g = 1.2605.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Is relative density the same as specific gravity?", a: "In pharmacy practice, yes — both mean the mass of a volume of the substance divided by the mass of an equal volume of water. Because grams divide by grams it has no unit, while density is in g/mL." },
          { q: "Why must the bottle be filled up to the capillary?", a: "The capillary in the stopper defines the volume. Liquid that stops short, or that overflows and is left on the outside, changes the mass without changing the nominal volume and throws off the ratio." },
          { q: "Why does temperature matter?", a: "Liquids expand as they warm, so the same bottle holds slightly less mass of a warmer liquid. Water itself changes from 0.99910 g/mL at 15 °C to 0.99565 g/mL at 30 °C. Pharmacopoeial relative densities are quoted at a stated temperature, commonly 20 °C or 25 °C." },
          { q: "Which density should I report — water-calibrated or from the volume?", a: "The water-calibrated value (relative density × density of water). The volume printed on a bottle is nominal; weighing it full of water measures its true volume at the working temperature, so the volume-based density is useful only as a cross-check." },
          { q: "What if my relative density is below 1?", a: "The sample is lighter than water — ethanol, many volatile oils and liquid paraffin fractions are examples. It is not an error, as long as W₃ is still heavier than the empty bottle." },
        ]}
      />
    </CalculatorShell>
  );
}

function Examples({ items }: { items: { label: string; apply: () => void }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Try a worked example</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.apply}
            className="min-h-[44px] rounded-full border bg-background px-3.5 py-2 text-left text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
