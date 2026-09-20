"use client";

import { useMemo, useState } from "react";
import { Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  ResultCard,
  ResultRow,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

/* ── Typical moisture contents (values unchanged from the original page) ─── */
const MATERIAL_DATA = [
  { material: "Food grains", initial: "0.20", final: "0.14", note: "Wheat, rice" },
  { material: "Ceramics", initial: "0.25", final: "0.02", note: "Clay, tiles" },
  { material: "Pharmaceuticals", initial: "0.15", final: "0.05", note: "Granules, powders" },
  { material: "Wood", initial: "0.40", final: "0.12", note: "Lumber" },
  { material: "Textiles", initial: "0.30", final: "0.08", note: "Fabric" },
];

/* ── Pure calculation — formula, phase bands and rounding copied verbatim ── */
interface DryingResult {
  dryingRate: number;
  avgRate: number;
  moistureRemoved: number;
  dryingPhase: string;
  tone: ResultTone;
}

function computeDrying(
  x1Raw: string,
  x2Raw: string,
  tRaw: string,
  mRaw: string,
  aRaw: string,
): DryingResult | null {
  const X1 = parseFloat(x1Raw);
  const X2 = parseFloat(x2Raw);
  const t = parseFloat(tRaw);
  const M = parseFloat(mRaw);
  const A = parseFloat(aRaw);

  if (
    !Number.isFinite(X1) || !Number.isFinite(X2) || !Number.isFinite(t) ||
    !Number.isFinite(M) || !Number.isFinite(A) || t <= 0 || M <= 0 || A <= 0
  ) {
    return null;
  }

  const moistureRemoved = M * (X1 - X2);
  const dryingRate = moistureRemoved / t / A;
  const avgRate = moistureRemoved / t;

  // The phase is read off the final moisture content alone, as in the original.
  let dryingPhase = "";
  let tone: ResultTone = "neutral";
  if (X2 > 0.5) {
    dryingPhase = "CONSTANT RATE PERIOD";
    tone = "success";
  } else if (X2 > 0.1) {
    dryingPhase = "FIRST FALLING RATE PERIOD";
    tone = "warning";
  } else {
    dryingPhase = "SECOND FALLING RATE PERIOD";
    tone = "danger";
  }

  return { dryingRate, avgRate, moistureRemoved, dryingPhase, tone };
}

export default function DryingRateCalculator() {
  const [initialMoisture, setInitialMoisture] = useState("");
  const [finalMoisture, setFinalMoisture] = useState("");
  const [dryingTime, setDryingTime] = useState("");
  const [materialMass, setMaterialMass] = useState("");
  const [dryingArea, setDryingArea] = useState("");

  const result = useMemo(
    () => computeDrying(initialMoisture, finalMoisture, dryingTime, materialMass, dryingArea),
    [initialMoisture, finalMoisture, dryingTime, materialMass, dryingArea],
  );

  const chartData = useMemo(() => {
    if (!result) return [];
    const X1 = parseFloat(initialMoisture);
    const X2 = parseFloat(finalMoisture);
    const t = parseFloat(dryingTime);
    const M = parseFloat(materialMass);
    const A = parseFloat(dryingArea);

    // The original stepped from X1 down to X2 by (X1 − X2)/20. When X1 equals X2
    // that step is zero and the loop never terminated, freezing the tab; when
    // X1 < X2 the step is negative and the loop never ran. Both are guarded here.
    // For X1 > X2 the points produced are identical to the original's.
    const span = X1 - X2;
    if (span <= 0) return [];

    const rows: { moisture: number; rate: number }[] = [];
    const step = span / 20;
    for (let mc = X1; mc >= X2; mc -= step) {
      rows.push({ moisture: mc, rate: (M * (X1 - mc)) / (t * A) });
    }
    return rows;
  }, [result, initialMoisture, finalMoisture, dryingTime, materialMass, dryingArea]);

  const positiveError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    return n <= 0 ? `${name} must be greater than 0.` : undefined;
  };

  const moistureError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    return Number.isFinite(parseFloat(raw)) ? undefined : `Enter ${name} as a number.`;
  };

  const applyMaterial = (m: (typeof MATERIAL_DATA)[number]) => {
    setInitialMoisture(m.initial);
    setFinalMoisture(m.final);
  };

  const reset = () => {
    setInitialMoisture("");
    setFinalMoisture("");
    setDryingTime("");
    setMaterialMass("");
    setDryingArea("");
  };

  // Drying towards a wetter state is physically meaningless; the number is still
  // shown (it is what the formula gives) but it is called out.
  const reverseDrying =
    result !== null && parseFloat(finalMoisture) > parseFloat(initialMoisture);

  return (
    <CalculatorShell
      title="Drying Rate Calculator"
      subtitle="Finds the drying rate per unit area from the moisture removed, the drying time and the exposed area, and names the drying period."
      icon={Droplets}
      eyebrow="Pharmaceutical Engineering"
      aside={
        <>
          <CalcAbout title="About drying rate">
            <p>
              Drying rate N is the mass of water removed per unit time per unit of exposed surface.
              It sets how long a batch must stay in the dryer and how much energy that costs — and it
              is not constant: once the surface stops being fully wet, the rate falls away.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Sizing a tray or fluid-bed dryer for a granulation",
                "Comparing drying performance between batches or materials",
                "Estimating how long a load needs to reach target moisture",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Moisture contents here are mass ratios (kg water per kg dry solid), not percentages. Enter 0.25, not 25.",
                "This gives the average rate over the whole run. The instantaneous rate is higher at the start and lower at the end.",
                "The drying period named below is read from the final moisture content alone — it is a rough label, not a measurement of the critical moisture content.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Drying rate N"
        value={result ? result.dryingRate.toFixed(3) : null}
        unit="kg/m²·h"
        interpretation={result ? result.dryingPhase : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter both moisture contents, the drying time, the dry mass and the drying area."
      />

      {reverseDrying && (
        <LabNotice tone="warning" title="Final moisture is higher than the initial moisture">
          The rate below is negative, which means the material would be gaining water rather than
          drying. Check the two moisture contents — X₁ is the wetter, starting value.
        </LabNotice>
      )}

      <CalcSection
        title="Drying parameters"
        description="Moisture contents as mass ratios (kg water per kg dry solid), plus the batch and dryer geometry."
      >
        <FieldGrid>
          <NumberField
            label="Initial moisture X₁"
            value={initialMoisture}
            onChange={setInitialMoisture}
            unit="kg/kg"
            step="0.001"
            placeholder="e.g. 0.25"
            hint="Moisture content at the start of the run."
            error={moistureError(initialMoisture, "initial moisture")}
          />
          <NumberField
            label="Final moisture X₂"
            value={finalMoisture}
            onChange={setFinalMoisture}
            unit="kg/kg"
            step="0.001"
            placeholder="e.g. 0.05"
            hint="Target moisture content at the end."
            error={moistureError(finalMoisture, "final moisture")}
          />
          <NumberField
            label="Drying time t"
            value={dryingTime}
            onChange={setDryingTime}
            unit="h"
            step="0.1"
            min={0}
            placeholder="e.g. 8"
            hint="Total time in the dryer."
            error={positiveError(dryingTime, "Drying time")}
          />
          <NumberField
            label="Dry mass M"
            value={materialMass}
            onChange={setMaterialMass}
            unit="kg"
            step="0.01"
            min={0}
            placeholder="e.g. 100"
            hint="Bone-dry mass of solid, not the wet batch weight."
            error={positiveError(materialMass, "Dry mass")}
          />
          <NumberField
            label="Drying area A"
            value={dryingArea}
            onChange={setDryingArea}
            unit="m²"
            step="0.01"
            min={0}
            placeholder="e.g. 10"
            hint="Total surface exposed to the drying air."
            error={positiveError(dryingArea, "Drying area")}
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Typical material</span>
          {MATERIAL_DATA.map((m) => (
            <Button
              key={m.material}
              type="button"
              variant="outline"
              size="sm"
              title={`${m.note}: X₁ ${m.initial} → X₂ ${m.final}`}
              onClick={() => applyMaterial(m)}
            >
              {m.material}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="Each step of the calculation.">
          <div>
            <ResultRow label="Moisture removed = M × (X₁ − X₂)" value={result.moistureRemoved.toFixed(2)} unit="kg" />
            <ResultRow label="Average rate = removed ÷ t" value={result.avgRate.toFixed(2)} unit="kg/h" />
            <ResultRow label="Drying rate N = average ÷ A" value={result.dryingRate.toFixed(3)} unit="kg/m²·h" />
            <ResultRow label="Drying period" value={result.dryingPhase} />
          </div>
        </CalcSection>
      )}

      {chartData.length > 0 && (
        <CalcSection
          title="Cumulative water removed"
          description="Water taken off per unit area as the moisture content falls from X₁ to X₂, on the original page's linear assumption."
        >
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="moisture"
                  fontSize={11}
                  tickMargin={8}
                  reversed
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: "Moisture content (kg/kg)", position: "insideBottom", offset: -14, fontSize: 11 }}
                />
                <YAxis fontSize={11} width={52} tickFormatter={(v: number) => v.toFixed(2)} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(3)} kg/m²·h`, "Rate"]}
                  labelFormatter={(l) => `X = ${Number(l).toFixed(3)} kg/kg`}
                />
                <Line type="monotone" dataKey="rate" stroke="#21B67A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Typical moisture contents" description="Starting points when a measured value is not to hand.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Material</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">X₁</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">X₂</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Example</th>
              </tr>
            </thead>
            <tbody>
              {MATERIAL_DATA.map((m) => (
                <tr key={m.material} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{m.material}</td>
                  <td className="py-2 pr-3 tabular-nums">{m.initial}</td>
                  <td className="py-2 pr-3 tabular-nums">{m.final}</td>
                  <td className="py-2 text-muted-foreground">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <Formula>N = [M × (X₁ − X₂)] / (t × A)</Formula>
        <p>
          <strong>M</strong> is the bone-dry mass of solid (kg), <strong>X₁</strong> and{" "}
          <strong>X₂</strong> the initial and final moisture contents as mass ratios (kg water per kg
          dry solid), <strong>t</strong> the drying time (h) and <strong>A</strong> the exposed area
          (m²).
        </p>
        <p>
          M × (X₁ − X₂) is the water removed in kg; dividing by t gives the average rate in kg/h; and
          dividing again by A gives the rate per unit area, which is what lets two dryers of different
          sizes be compared. The rate is shown to three decimals, the two intermediate figures to two.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Should I enter moisture as a percentage?",
            a: "No — as a ratio. 25% moisture on a dry basis is 0.25 kg water per kg dry solid. Entering 25 will give a rate a hundred times too high.",
          },
          {
            q: "Dry basis or wet basis?",
            a: "Dry basis. M is the bone-dry mass of solid and X is kg water per kg of that dry solid, so a material can exceed 1.0 kg/kg. Wet-basis figures must be converted first: X = w / (1 − w).",
          },
          {
            q: "Why is my rate lower than the rate I measured at the start of the run?",
            a: "This is the average over the whole run. Drying starts in the constant-rate period, where the surface is fully wet and the rate is highest, then falls once internal diffusion controls it. The average always sits below the initial rate.",
          },
          {
            q: "What does the drying period label mean here?",
            a: "It is a rough classification based only on the final moisture content: above 0.5 kg/kg the run is still in the constant-rate period, 0.1–0.5 the first falling-rate period, below 0.1 the second. A real determination needs the critical moisture content from a drying curve.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
