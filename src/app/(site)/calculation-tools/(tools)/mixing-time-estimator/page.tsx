"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
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

/* ── Impeller reference data (unchanged from the original page) ──────────── */
const IMPELLER_DATA = [
  { type: "Rushton turbine", Np: 5.0, application: "Gas dispersion" },
  { type: "Pitched blade", Np: 1.5, application: "Blending" },
  { type: "Propeller", Np: 0.3, application: "Low power blending" },
  { type: "Anchor", Np: 0.3, application: "High viscosity" },
  { type: "Helical ribbon", Np: 0.3, application: "Very viscous" },
];

type MixingObjective = "blending" | "suspension" | "reaction" | "dispersion";

const MIXING_CONSTANTS: Record<MixingObjective, number> = {
  blending: 4,
  suspension: 8,
  reaction: 6,
  dispersion: 10,
};

const OBJECTIVE_OPTIONS = [
  { value: "blending", label: "Blending (K = 4)" },
  { value: "suspension", label: "Solid suspension (K = 8)" },
  { value: "reaction", label: "Chemical reaction (K = 6)" },
  { value: "dispersion", label: "Dispersion (K = 10)" },
];

/* ── Pure calculation — correlations, constants and rounding copied verbatim ── */
interface MixingResult {
  mixingTime: number;
  powerNumber: number;
  reynoldsNumber: number;
  flowRegime: string;
  impellerType: string;
  tone: ResultTone;
  K: number;
}

function computeMixing(
  tankRaw: string,
  impellerRaw: string,
  speedRaw: string,
  viscosityRaw: string,
  densityRaw: string,
  objective: MixingObjective,
): MixingResult | null {
  const D = parseFloat(tankRaw);
  const d = parseFloat(impellerRaw);
  const N = parseFloat(speedRaw);
  const mu = parseFloat(viscosityRaw);
  const rho = parseFloat(densityRaw);

  if (
    !Number.isFinite(D) || !Number.isFinite(d) || !Number.isFinite(N) ||
    !Number.isFinite(mu) || !Number.isFinite(rho) ||
    D <= 0 || d <= 0 || N <= 0 || mu <= 0 || rho <= 0
  ) {
    return null;
  }

  // Impeller Reynolds number — N in revolutions per second.
  const Re = (rho * N * Math.pow(d, 2)) / mu;

  // Power number, estimated from Re against a Rushton turbine reference.
  let Np = 0;
  let flowRegime = "";
  if (Re < 10) {
    Np = 70 / Re;
    flowRegime = "LAMINAR";
  } else if (Re < 10000) {
    Np = 70 / Math.pow(Re, 0.5);
    flowRegime = "TRANSITIONAL";
  } else {
    Np = 5.0;
    flowRegime = "TURBULENT";
  }

  const K = MIXING_CONSTANTS[objective] ?? 4;
  const mixingTime = K * Math.pow(D / d, 2) * (1 / N) * 60;

  let impellerType = "Rushton Turbine";
  if (Re < 100) impellerType = "Anchor / Helical Ribbon";
  else if (Re < 1000) impellerType = "Pitched Blade";
  else impellerType = "Rushton Turbine / Propeller";

  const tone: ResultTone =
    mixingTime < 60 ? "success" : mixingTime < 300 ? "neutral" : mixingTime < 600 ? "warning" : "danger";

  return { mixingTime, powerNumber: Np, reynoldsNumber: Re, flowRegime, impellerType, tone, K };
}

export default function MixingTimeEstimator() {
  const [tankDiameter, setTankDiameter] = useState("");
  const [impellerDiameter, setImpellerDiameter] = useState("");
  const [impellerSpeed, setImpellerSpeed] = useState("");
  const [fluidViscosity, setFluidViscosity] = useState("0.001");
  const [fluidDensity, setFluidDensity] = useState("1000");
  const [mixingType, setMixingType] = useState<MixingObjective>("blending");

  const result = useMemo(
    () => computeMixing(tankDiameter, impellerDiameter, impellerSpeed, fluidViscosity, fluidDensity, mixingType),
    [tankDiameter, impellerDiameter, impellerSpeed, fluidViscosity, fluidDensity, mixingType],
  );

  // Mixing time against a speed sweep, as on the original: 0.5 rps to 2N in steps of N/10.
  const chartData = useMemo(() => {
    if (!result) return [];
    const D = parseFloat(tankDiameter);
    const d = parseFloat(impellerDiameter);
    const N = parseFloat(impellerSpeed);
    const rows: { speed: number; time: number }[] = [];
    for (let n = 0.5; n <= N * 2; n += N / 10) {
      rows.push({ speed: n, time: result.K * Math.pow(D / d, 2) * (1 / n) * 60 });
    }
    return rows;
  }, [result, tankDiameter, impellerDiameter, impellerSpeed]);

  const positiveError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    return n <= 0 ? `${name} must be greater than 0.` : undefined;
  };

  // The impeller cannot be wider than the vessel; typical designs sit at D/3 to D/2.
  const geometryWarning =
    result !== null && parseFloat(impellerDiameter) >= parseFloat(tankDiameter);

  const reset = () => {
    setTankDiameter("");
    setImpellerDiameter("");
    setImpellerSpeed("");
    setFluidViscosity("0.001");
    setFluidDensity("1000");
    setMixingType("blending");
  };

  return (
    <CalculatorShell
      title="Mixing Time Estimator"
      subtitle="Estimates blend time in a stirred tank from the vessel and impeller geometry, and reports the impeller Reynolds number, flow regime and power number."
      icon={Clock}
      eyebrow="Pharmaceutical Engineering"
      aside={
        <>
          <CalcAbout title="About mixing time">
            <p>
              Mixing time is how long a stirred vessel takes to reach a stated degree of uniformity.
              It falls as the impeller turns faster and as the impeller gets larger relative to the
              tank — which is why scale-up keeps the D/d ratio fixed wherever it can.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Comparing blend times between vessel sizes during scale-up",
                "Judging whether an impeller speed is enough for a solution or suspension",
                "Checking which flow regime a viscous batch is actually mixing in",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This is a teaching correlation, not a design tool. Real blend times are measured, not predicted.",
                "The power number is estimated against a Rushton turbine; a propeller or anchor will differ substantially.",
                "The time returned is inconsistent with the speed unit used elsewhere on this page — see the note beside the result.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Estimated mixing time"
        value={result ? result.mixingTime.toFixed(0) : null}
        unit="s"
        interpretation={result ? `${result.flowRegime} regime` : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter the tank and impeller diameters, the impeller speed, and the fluid properties."
      />

      {result && (
        // Reported, not silently corrected: the maths is unchanged from the original
        // page. Recorded in .claude/redesign-tracker.md.
        <LabNotice tone="warning" title="Check this figure before quoting it">
          The Reynolds number below treats the speed as revolutions per <strong>second</strong>, but
          the time correlation multiplies by 60 as though it were revolutions per{" "}
          <strong>minute</strong>. With the speed entered in rps the time shown is therefore 60×
          longer than the correlation t = K(D/d)²/N gives — that would be{" "}
          {(result.mixingTime / 60).toFixed(1)} s. The figure above is left as the original tool
          calculated it; treat it as a relative comparison, not an absolute blend time.
        </LabNotice>
      )}

      {geometryWarning && (
        <LabNotice tone="warning" title="Check the geometry">
          The impeller diameter is not smaller than the tank diameter. A typical stirred vessel uses
          an impeller between a third and a half of the tank diameter.
        </LabNotice>
      )}

      <CalcSection title="Vessel and impeller" description="Geometry, speed and the properties of the batch being mixed.">
        <FieldGrid>
          <NumberField
            label="Tank diameter D"
            value={tankDiameter}
            onChange={setTankDiameter}
            unit="m"
            step="0.01"
            min={0}
            placeholder="e.g. 2"
            hint="Internal diameter of the vessel."
            error={positiveError(tankDiameter, "Tank diameter")}
          />
          <NumberField
            label="Impeller diameter d"
            value={impellerDiameter}
            onChange={setImpellerDiameter}
            unit="m"
            step="0.01"
            min={0}
            placeholder="e.g. 0.7"
            hint="Usually D/3 to D/2."
            error={positiveError(impellerDiameter, "Impeller diameter")}
          />
          <NumberField
            label="Impeller speed N"
            value={impellerSpeed}
            onChange={setImpellerSpeed}
            unit="rps"
            step="0.1"
            min={0}
            placeholder="e.g. 2"
            hint="Revolutions per second. 120 rpm = 2 rps."
            error={positiveError(impellerSpeed, "Impeller speed")}
          />
          <NumberField
            label="Dynamic viscosity μ"
            value={fluidViscosity}
            onChange={setFluidViscosity}
            unit="Pa·s"
            step="0.000001"
            min={0}
            placeholder="e.g. 0.001"
            hint="Water at 20 °C is about 0.001 Pa·s."
            error={positiveError(fluidViscosity, "Viscosity")}
          />
          <NumberField
            label="Density ρ"
            value={fluidDensity}
            onChange={setFluidDensity}
            unit="kg/m³"
            step="0.001"
            min={0}
            placeholder="e.g. 1000"
            hint="Bulk density of the batch."
            error={positiveError(fluidDensity, "Density")}
          />
          <SelectField
            label="Mixing objective"
            value={mixingType}
            onChange={(v) => setMixingType(v as MixingObjective)}
            options={OBJECTIVE_OPTIONS}
            hint="Sets the constant K in the correlation."
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Try an example</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setTankDiameter("2");
              setImpellerDiameter("0.7");
              setImpellerSpeed("2");
              setFluidViscosity("0.001");
              setFluidDensity("1000");
              setMixingType("blending");
            }}
          >
            Aqueous batch, turbulent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setTankDiameter("1");
              setImpellerDiameter("0.5");
              setImpellerSpeed("0.5");
              setFluidViscosity("10");
              setFluidDensity("1200");
              setMixingType("blending");
            }}
          >
            Viscous syrup
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="The intermediate quantities behind the estimate.">
          <div>
            <ResultRow
              label="Impeller Reynolds number Re = ρNd²/μ"
              value={result.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              badge={result.flowRegime}
            />
            <ResultRow label="Power number Np" value={result.powerNumber.toFixed(2)} />
            <ResultRow label="Diameter ratio D/d" value={(parseFloat(tankDiameter) / parseFloat(impellerDiameter)).toFixed(3)} />
            <ResultRow label="(D/d)²" value={Math.pow(parseFloat(tankDiameter) / parseFloat(impellerDiameter), 2).toFixed(3)} />
            <ResultRow label="Mixing constant K" value={result.K} unit={mixingType} />
            <ResultRow label="Mixing time = K × (D/d)² × (1/N) × 60" value={result.mixingTime.toFixed(0)} unit="s" />
            <ResultRow label="Recommended impeller" value={result.impellerType} />
          </div>
        </CalcSection>
      )}

      {chartData.length > 0 && (
        <CalcSection
          title="Mixing time vs. impeller speed"
          description="The same vessel across a range of speeds — mixing time is inversely proportional to N."
        >
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="speed"
                  fontSize={11}
                  tickMargin={8}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: "Impeller speed (rps)", position: "insideBottom", offset: -14, fontSize: 11 }}
                />
                <YAxis fontSize={11} width={58} tickFormatter={(v: number) => v.toFixed(0)} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(0)} s`, "Mixing time"]}
                  labelFormatter={(l) => `N = ${Number(l).toFixed(2)} rps`}
                />
                <Line type="monotone" dataKey="time" stroke="#1C7BD9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Impeller reference" description="Turbulent power numbers and what each impeller is for.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Impeller</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Np (turbulent)</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Typical use</th>
              </tr>
            </thead>
            <tbody>
              {IMPELLER_DATA.map((row) => (
                <tr key={row.type} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{row.type}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.Np.toFixed(1)}</td>
                  <td className="py-2 text-muted-foreground">{row.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>The impeller Reynolds number decides the flow regime:</p>
        <Formula>Re = (ρ × N × d²) / μ</Formula>
        <p>
          Below Re 10 the flow is laminar, from 10 to 10 000 transitional, and above that turbulent.
          The power number is estimated from Re against a Rushton turbine: Np = 70/Re in the laminar
          region, 70/√Re in the transitional region, and a constant 5.0 when turbulent.
        </p>
        <p>The blend time uses a geometric correlation with a constant K set by the mixing duty:</p>
        <Formula>t = K × (D/d)² × (1/N) × 60</Formula>
        <p>
          K is 4 for blending, 6 for a chemical reaction, 8 for solid suspension and 10 for
          dispersion. Note the unit inconsistency flagged beside the result: the factor of 60 assumes
          N in rpm, while Re above assumes rps.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why is the mixing time so long?",
            a: "Because of the ×60 in the correlation. With the speed entered in revolutions per second, the dimensionless form t = K(D/d)²/N gives a time 60 times shorter. The tool reports the original figure and states the discrepancy rather than silently changing it.",
          },
          {
            q: "My impeller runs at 120 rpm — what do I enter?",
            a: "2 rps. Divide rpm by 60. The Reynolds number and the flow regime depend on getting this right.",
          },
          {
            q: "Why does the power number jump at Re 10 000?",
            a: "Above that the flow is fully turbulent and Np becomes independent of Reynolds number — a constant for each impeller geometry (5.0 for a Rushton turbine). Below it, Np still falls with increasing Re.",
          },
          {
            q: "Does a bigger impeller always mix faster?",
            a: "In this correlation yes, because time scales with (D/d)². In practice a larger impeller also needs far more power — power scales with N³d⁵ — so the choice is a trade-off, not a free win.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
