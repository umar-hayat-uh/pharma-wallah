"use client";

import { useMemo, useState } from "react";
import { Thermometer } from "lucide-react";
import {
  BarChart,
  Bar,
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
  SelectField,
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

/* ── Reference tables (content unchanged from the original page) ─────────── */
const TYPICAL_U_VALUES = [
  { fluids: "Water to water", value: "850–1700" },
  { fluids: "Steam to water", value: "1500–4000" },
  { fluids: "Oil to water", value: "100–350" },
  { fluids: "Gas to gas", value: "10–50" },
  { fluids: "Condensing steam", value: "2000–6000" },
];

const EXCHANGER_TYPES = [
  { type: "Double pipe", area: "0.1–2 m²" },
  { type: "Shell & tube", area: "5–1000 m²" },
  { type: "Plate & frame", area: "0.1–2000 m²" },
  { type: "Air cooled", area: "10–500 m²" },
  { type: "Spiral", area: "0.5–200 m²" },
];

const EXAMPLES = [
  { label: "Jacketed vessel", q: "50000", dT: "20", u: "500" },
  { label: "Small condenser", q: "1000", dT: "10", u: "100" },
  { label: "Plant-scale duty", q: "5000000", dT: "25", u: "800" },
];

/* ── Pure calculation — band thresholds and rounding copied verbatim ─────── */
interface AreaResult {
  area: number;
  interpretation: string;
  heatExchangerType: string;
  tone: ResultTone;
}

function classifyArea(area: number): Omit<AreaResult, "area"> {
  // Bands and wording are the original's, unchanged.
  if (area < 5) {
    return {
      interpretation: "Small heat exchanger required",
      heatExchangerType: "Compact / Small Scale",
      tone: "success",
    };
  }
  if (area < 50) {
    return {
      interpretation: "Medium sized heat exchanger",
      heatExchangerType: "Shell & Tube (Medium)",
      tone: "success",
    };
  }
  if (area < 200) {
    return {
      interpretation: "Large heat exchanger required",
      heatExchangerType: "Shell & Tube (Large)",
      tone: "warning",
    };
  }
  return {
    interpretation: "Very large industrial heat exchanger",
    heatExchangerType: "Plate & Frame or Multiple Units",
    tone: "danger",
  };
}

function computeArea(qRaw: string, dTRaw: string, uRaw: string): AreaResult | null {
  const Q = parseFloat(qRaw);
  const dT = parseFloat(dTRaw);
  const U = parseFloat(uRaw);

  // The original alerted on this case; here the result simply stays empty, so a
  // stale figure from earlier inputs can no longer be left on screen.
  if (!Number.isFinite(Q) || !Number.isFinite(dT) || !Number.isFinite(U) || Q <= 0 || dT <= 0 || U <= 0) {
    return null;
  }

  const area = Q / (U * dT);
  return { area, ...classifyArea(area) };
}

export default function HeatTransferAreaCalculator() {
  const [heatLoad, setHeatLoad] = useState("");
  const [deltaT, setDeltaT] = useState("");
  const [coefficient, setCoefficient] = useState("");
  const [loadUnit, setLoadUnit] = useState<"si" | "imperial">("si");

  const result = useMemo(
    () => computeArea(heatLoad, deltaT, coefficient),
    [heatLoad, deltaT, coefficient],
  );

  // Area against a sweep of U, as on the original page: 0.2U to 2U in steps of U/10.
  const chartData = useMemo(() => {
    if (!result) return [];
    const U = parseFloat(coefficient);
    const Q = parseFloat(heatLoad);
    const dT = parseFloat(deltaT);
    const rows: { U: string; area: number }[] = [];
    for (let u = U * 0.2; u <= U * 2; u += U / 10) {
      rows.push({ U: u.toFixed(0), area: Q / (u * dT) });
    }
    return rows;
  }, [result, coefficient, heatLoad, deltaT]);

  const positiveError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    return n <= 0 ? `${name} must be greater than 0.` : undefined;
  };

  const applyExample = (ex: (typeof EXAMPLES)[number]) => {
    setHeatLoad(ex.q);
    setDeltaT(ex.dT);
    setCoefficient(ex.u);
  };

  const reset = () => {
    setHeatLoad("");
    setDeltaT("");
    setCoefficient("");
    setLoadUnit("si");
  };

  return (
    <CalculatorShell
      title="Heat Transfer Area Calculator"
      subtitle="Sizes the heat-transfer surface a duty needs from A = Q ÷ (U × ΔT), and shows how that area changes with the overall coefficient."
      icon={Thermometer}
      eyebrow="Pharmaceutical Engineering"
      aside={
        <>
          <CalcAbout title="About heat transfer area">
            <p>
              A heat exchanger is sized by the surface it must present. For a given duty Q, the area
              falls as the overall coefficient U rises and as the driving temperature difference ΔT
              widens — so a dirty exchanger (low U) or a small ΔT needs a much larger surface.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Sizing a jacketed vessel, condenser or reboiler",
                "Checking whether an existing exchanger can carry a new duty",
                "Seeing how fouling (a lower U) drives up the area needed",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "ΔT here is the mean temperature difference. For counter-current flow use the LMTD, not the inlet difference.",
                "U must already include the fouling resistances you expect in service.",
                "This gives a clean sizing estimate — it does not allow for flow arrangement correction factors (F).",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Heat transfer area required"
        value={result ? result.area.toFixed(2) : null}
        unit="m²"
        interpretation={result ? result.heatExchangerType : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter the heat load, the temperature difference and the overall coefficient (all above 0)."
      />

      {result && (
        <LabNotice tone="info" title={result.heatExchangerType}>
          {result.interpretation}.
        </LabNotice>
      )}

      <CalcSection
        title="Heat exchanger parameters"
        description="The duty to be transferred, the mean temperature difference driving it, and the overall coefficient."
      >
        <FieldGrid>
          <NumberField
            label="Heat load Q"
            value={heatLoad}
            onChange={setHeatLoad}
            step="0.001"
            min={0}
            placeholder="e.g. 50000"
            hint="The duty the exchanger must transfer."
            error={positiveError(heatLoad, "Heat load")}
          />
          <SelectField
            label="Heat load unit"
            value={loadUnit}
            onChange={(v) => setLoadUnit(v as "si" | "imperial")}
            options={[
              { value: "si", label: "W" },
              { value: "imperial", label: "BTU/h" },
            ]}
            hint="Display only — see the note below."
          />
          <NumberField
            label="Mean temperature difference ΔT"
            value={deltaT}
            onChange={setDeltaT}
            unit={loadUnit === "si" ? "°C" : "°F"}
            step="0.1"
            min={0}
            placeholder="e.g. 20"
            hint="Use the LMTD for a counter-current exchanger."
            error={positiveError(deltaT, "Temperature difference")}
          />
          <NumberField
            label="Overall coefficient U"
            value={coefficient}
            onChange={setCoefficient}
            unit="W/m²K"
            step="0.1"
            min={0}
            placeholder="e.g. 500"
            hint="Include fouling. Typical values are in the table below."
            error={positiveError(coefficient, "Overall coefficient")}
          />
        </FieldGrid>

        {/* The original offered this selector but never converted anything; it is kept so
            the page behaves identically, and the limitation is now stated rather than
            implied. Recorded in .claude/redesign-tracker.md. */}
        <LabNotice tone="warning" title="Enter SI units">
          The area is always calculated as Q ÷ (U × ΔT) in SI units and reported in m². The unit
          selector changes the ΔT label only — it does not convert BTU/h to watts. Convert the heat
          load yourself before entering it (1 BTU/h = 0.2931 W).
        </LabNotice>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Try an example</span>
          {EXAMPLES.map((ex) => (
            <Button key={ex.label} type="button" variant="outline" size="sm" onClick={() => applyExample(ex)}>
              {ex.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="How this area was arrived at.">
          <div>
            <ResultRow label="Heat load Q" value={parseFloat(heatLoad)} unit={loadUnit === "si" ? "W" : "BTU/h"} />
            <ResultRow label="Overall coefficient U" value={parseFloat(coefficient)} unit="W/m²K" />
            <ResultRow label="Temperature difference ΔT" value={parseFloat(deltaT)} unit={loadUnit === "si" ? "°C" : "°F"} />
            <ResultRow label="U × ΔT" value={(parseFloat(coefficient) * parseFloat(deltaT)).toFixed(2)} unit="W/m²" />
            <ResultRow label="Area = Q ÷ (U × ΔT)" value={result.area.toFixed(2)} unit="m²" />
            <ResultRow label="Exchanger class" value={result.heatExchangerType} />
          </div>
        </CalcSection>
      )}

      {chartData.length > 0 && (
        <CalcSection
          title="Required area vs. U-value"
          description="The same duty across a range of overall coefficients — the case for keeping surfaces clean."
        >
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="U"
                  tick={{ fontSize: 11 }}
                  label={{ value: "U (W/m²K)", position: "insideBottom", offset: -2, fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} width={48} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)} m²`, "Area"]}
                  labelFormatter={(l) => `U = ${l} W/m²K`}
                />
                <Bar dataKey="area" fill="#1C7BD9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Reference tables" description="Typical overall coefficients and the areas real exchangers cover.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="overflow-x-auto">
            <p className="mb-2 text-[13px] font-semibold text-foreground/90">Typical U-values (W/m²K)</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Fluids</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">U range</th>
                </tr>
              </thead>
              <tbody>
                {TYPICAL_U_VALUES.map((row) => (
                  <tr key={row.fluids} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3">{row.fluids}</td>
                    <td className="py-2 font-medium tabular-nums">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <p className="mb-2 text-[13px] font-semibold text-foreground/90">Exchanger types by area</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Typical area</th>
                </tr>
              </thead>
              <tbody>
                {EXCHANGER_TYPES.map((row) => (
                  <tr key={row.type} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3">{row.type}</td>
                    <td className="py-2 font-medium tabular-nums">{row.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>The required surface follows directly from the rate equation Q = U · A · ΔT:</p>
        <Formula>A = Q / (U × ΔT)</Formula>
        <p>
          <strong>Q</strong> is the heat load (W), <strong>U</strong> the overall heat-transfer
          coefficient (W/m²K) and <strong>ΔT</strong> the mean temperature difference (K or °C — the
          interval is the same size in both). The area is reported in m², rounded to two decimals.
        </p>
        <p>
          U already bundles the film coefficients on both sides, the wall conduction and the fouling
          resistances, which is why it — not the metal — usually decides the size of the exchanger.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Which ΔT should I enter?",
            a: "The mean temperature difference across the exchanger. For counter-current or co-current flow that is the log mean temperature difference (LMTD), not the difference at the inlet. Using the inlet difference will undersize the exchanger.",
          },
          {
            q: "Why does the answer change so much with U?",
            a: "Area is inversely proportional to U, so halving the coefficient doubles the surface needed. The chart shows this for your duty — it is the reason fouling is treated so seriously in plant operation.",
          },
          {
            q: "Can I enter the heat load in BTU/h?",
            a: "Not directly. The calculation is done in SI throughout and the selector only relabels the ΔT field, so convert first: 1 BTU/h = 0.2931 W.",
          },
          {
            q: "Does this include a correction factor?",
            a: "No. Shell-and-tube exchangers with multiple passes need an F correction factor applied to the LMTD. This tool gives the clean counter-current sizing, which is the usual starting point.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
