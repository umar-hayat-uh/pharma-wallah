"use client";

import { useMemo, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

type Lethality = "COMPLETE" | "HIGH" | "MODERATE" | "PARTIAL";

/* ── F₀ bands and wording (unchanged from the original page; [citation:n] tags dropped) ── */
function classifyF0(f0Value: number): { lethality: Lethality; sterilizationLevel: string; description: string } {
  if (f0Value >= 12) {
    return {
      lethality: "COMPLETE",
      sterilizationLevel: "Commercial Sterility",
      description: "12‑log reduction of C. botulinum spores (F₀ ≥12)",
    };
  }
  if (f0Value >= 6) {
    return {
      lethality: "HIGH",
      sterilizationLevel: "Medical Sterility",
      description: "6‑log reduction of most pathogens (F₀ ≥6)",
    };
  }
  if (f0Value >= 3) {
    return {
      lethality: "MODERATE",
      sterilizationLevel: "Food Industry Standard",
      description: "Suitable for canned foods (F₀ ≥3)",
    };
  }
  return {
    lethality: "PARTIAL",
    sterilizationLevel: "Pasteurization Level",
    description: "Reduces vegetative cells only (F₀ <3)",
  };
}

const TONE: Record<Lethality, ResultTone> = {
  COMPLETE: "success",
  HIGH: "success",
  MODERATE: "warning",
  PARTIAL: "danger",
};

const Z_OPTIONS = [
  { value: "10", label: "10°C (B. stearothermophilus)" },
  { value: "12", label: "12°C (C. botulinum)" },
  { value: "8", label: "8°C (Thermophiles)" },
];

const TREF_OPTIONS = [
  { value: "121", label: "121°C (Standard)" },
  { value: "115", label: "115°C" },
  { value: "134", label: "134°C" },
];

const EXAMPLES = [
  { name: "Autoclave 121°C · 15 min", T: "121", t: "15" },
  { name: "Low-temp 115°C · 30 min", T: "115", t: "30" },
  { name: "Flash 134°C · 3 min", T: "134", t: "3" },
];

/* F₀ per minute at z = 10 °C, as printed on the original page. */
const F0_TABLE = [
  { temp: "100", f0: "0.008", use: "Pasteurization" },
  { temp: "110", f0: "0.077", use: "Low‑temp" },
  { temp: "115", f0: "0.245", use: "Pharmaceuticals" },
  { temp: "121", f0: "0.975", use: "Standard" },
  { temp: "125", f0: "2.448", use: "HTST" },
  { temp: "130", f0: "7.743", use: "Flash" },
];

export default function SterilizationCalculator() {
  const [temperature, setTemperature] = useState("121");
  const [time, setTime] = useState("");
  const [zValue, setZValue] = useState("10");
  const [referenceTemp, setReferenceTemp] = useState("121");

  /*
   * Derived live. The original recalculated in an effect only while every
   * field was non-empty, so clearing the time left the previous F₀ on screen,
   * and a zero time raised an alert(). Invalid input now simply shows no result
   * (a stale-state fix). The formula and the bands are unchanged.
   */
  const result = useMemo(() => {
    const T = parseFloat(temperature);
    const t = parseFloat(time);
    const Z = parseFloat(zValue);
    const Tref = parseFloat(referenceTemp);
    if (isNaN(T) || isNaN(t) || isNaN(Z) || isNaN(Tref) || t <= 0) return null;

    const exponent = (T - Tref) / Z;
    const lethalRate = Math.pow(10, exponent);
    const f0Value = t * lethalRate;
    if (!Number.isFinite(f0Value)) return null;
    return { T, t, Z, Tref, exponent, lethalRate, f0Value, ...classifyF0(f0Value) };
  }, [temperature, time, zValue, referenceTemp]);

  // The original plotted the lethal rate 10^((T − Tref)/z) at every minute from 0 to 60.
  const chartData = useMemo(() => {
    if (!result) return [];
    const data: { time: number; L: number }[] = [];
    for (let m = 0; m <= 60; m += 1) data.push({ time: m, L: result.lethalRate });
    return data;
  }, [result]);

  const reset = () => {
    setTemperature("121");
    setTime("");
    setZValue("10");
    setReferenceTemp("121");
  };

  const timeValue = parseFloat(time);
  const timeError =
    time.trim() === "" ? undefined : isNaN(timeValue) ? "Enter a number." : timeValue <= 0 ? "Must be greater than zero." : undefined;
  const tempError = temperature.trim() !== "" && isNaN(parseFloat(temperature)) ? "Enter a number." : undefined;

  return (
    <CalculatorShell
      title="Sterilization (F₀) Calculator"
      subtitle="Converts a heat-sterilisation hold time and temperature into F₀ — the equivalent minutes at the reference temperature."
      icon={Clock}
      eyebrow="Microbiology"
      aside={
        <>
          <CalcAbout title="About the F₀ value">
            <p>
              F₀ is the equivalent exposure time, in minutes at 121°C, that produces the same lethal
              effect as the actual time–temperature profile. It lets cycles run at different
              temperatures be compared on one scale, because microbial kill rises logarithmically with
              temperature.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Comparing an autoclave cycle at 115°C or 134°C with the 121°C standard",
                "Checking whether a hold time delivers the overkill target",
                "Learning how the z-value changes the effect of temperature",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This treats the whole time as held at one temperature — heat-up and cool-down are ignored",
                "Use the temperature at the coldest point of the load, not the chamber display",
                "Overkill design in industry targets F₀ ≥ 12 min for a 10⁻⁶ sterility assurance level (SAL)",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="F₀ value"
        value={result ? result.f0Value.toFixed(2) : null}
        unit="min"
        interpretation={result ? `${result.sterilizationLevel} · ${result.lethality} lethality` : undefined}
        tone={result ? TONE[result.lethality] : "neutral"}
        empty="Enter the hold time in minutes (and check the temperature)."
      />

      <CalcSection title="Process parameters">
        <FieldGrid>
          <NumberField
            label="Temperature (T)"
            value={temperature}
            onChange={setTemperature}
            unit="°C"
            step="0.1"
            error={tempError}
            hint="Temperature held during exposure; autoclaves run 115–134°C."
          />
          <NumberField
            label="Time (t)"
            value={time}
            onChange={setTime}
            unit="min"
            step="0.1"
            placeholder="e.g. 15"
            error={timeError}
            hint="Hold time at that temperature."
          />
          <SelectField
            label="z-value"
            value={zValue}
            onChange={setZValue}
            options={Z_OPTIONS}
            hint="°C rise that makes kill 10 times faster."
          />
          <SelectField
            label="Reference temperature (Tref)"
            value={referenceTemp}
            onChange={setReferenceTemp}
            options={TREF_OPTIONS}
            hint="F₀ is defined at 121°C."
          />
        </FieldGrid>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                type="button"
                onClick={() => {
                  setTemperature(ex.T);
                  setTime(ex.t);
                  setZValue("10");
                  setReferenceTemp("121");
                }}
                aria-pressed={temperature === ex.T && time === ex.t && zValue === "10" && referenceTemp === "121"}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/10"
              >
                {ex.name}
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
        <CalcSection title="Working">
          <div>
            <ResultRow label="Exponent (T − Tref) ÷ z" value={Number(result.exponent.toFixed(4))} />
            <ResultRow label="Lethal rate L = 10^exponent" value={Number(result.lethalRate.toPrecision(4))} unit="per min" />
            <ResultRow label="F₀ = t × L" value={result.f0Value.toFixed(2)} unit="min" badge={result.lethality} />
          </div>
          <Formula>
            F₀ = {result.t} × 10^(({result.T} − {result.Tref}) ÷ {result.Z}) = {result.f0Value.toFixed(2)} min
          </Formula>
          <LabNotice tone={result.lethality === "PARTIAL" || result.lethality === "MODERATE" ? "warning" : "info"} title={result.sterilizationLevel}>
            {result.description}
          </LabNotice>
        </CalcSection>
      )}

      {result && (
        <CalcSection
          title="Lethality rate"
          description="L(t) = 10^((T − Tref) ÷ z) over 0–60 min. At a constant temperature the rate is flat; F₀ is the area under this line up to your hold time."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Time (min)", position: "insideBottom", offset: -12, fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} width={48} tickFormatter={(value: number) => value.toLocaleString()} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  formatter={(value) => [typeof value === "number" ? value.toFixed(4) : "N/A", "L(t)"]}
                />
                <Line type="monotone" dataKey="L" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection title="F₀ values per minute" description="Lethality of one minute at each temperature (z = 10°C).">
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[18rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Temp (°C)</th>
                <th className="px-2 py-2 font-medium">F₀ (min)</th>
                <th className="px-2 py-2 font-medium">Application</th>
              </tr>
            </thead>
            <tbody>
              {F0_TABLE.map((row) => (
                <tr key={row.temp} className="border-b border-border/60 last:border-b-0">
                  <td className="px-2 py-2.5 font-medium tabular-nums text-foreground">{row.temp}</td>
                  <td className="px-2 py-2.5 font-mono tabular-nums text-foreground">{row.f0}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <CalcSection title="Sterilization standards">
        <div>
          <ResultRow label="Overkill" value="F₀ ≥ 12" />
          <ResultRow label="C. botulinum" value="F₀ ≥ 2.52" />
          <ResultRow label="Medical" value="F₀ ≥ 8" />
        </div>
        <p className="text-xs text-muted-foreground">
          Bands used for the result: ≥ 12 commercial sterility · 6–12 medical sterility · 3–6 food industry
          standard · below 3 pasteurization level.
        </p>
      </CalcSection>

      <FormulaNote>
        <Formula>F₀ = t × 10^((T − Tref) ÷ z)</Formula>
        <p>
          <strong>t</strong> = time at temperature (min), <strong>T</strong> = process temperature (°C),{" "}
          <strong>Tref</strong> = reference temperature (121°C for F₀), <strong>z</strong> = the temperature
          change that alters the D-value (decimal reduction time) by a factor of 10 — 10°C for the
          sterility indicator <em>B. stearothermophilus</em>.
        </p>
        <p>
          10^((T − Tref) ÷ z) is the lethal rate: how many minutes at the reference temperature one
          minute at T is worth. At 131°C with z = 10, each minute counts as 10.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why does 134°C for 3 minutes give a bigger F₀ than 121°C for 15?",
            a: "Because kill rate rises ten-fold for every z degrees. With z = 10°C, 134°C is 1.3 z-values above 121°C, so each minute is worth about 20 minutes at 121°C — 3 minutes gives an F₀ near 60.",
          },
          {
            q: "Which z-value should I choose?",
            a: "10°C for most steam sterilisation work, as it describes Geobacillus (B.) stearothermophilus spores used as biological indicators. 12°C is sometimes used for C. botulinum in food processing; 8°C for some thermophiles.",
          },
          {
            q: "Is F₀ the same as the log reduction?",
            a: "No. F₀ is minutes of equivalent heating. Divide F₀ by the organism's D₁₂₁ value to get the number of log reductions it delivers — for spores with D₁₂₁ = 1 min, F₀ = 12 gives 12 logs.",
          },
          {
            q: "Can I use this for a real cycle with heat-up and cool-down?",
            a: "Only as an approximation. Validated cycles integrate the lethal rate over the whole measured temperature profile, minute by minute, from a probe in the load.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
