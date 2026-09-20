"use client";

import { useMemo, useState } from "react";
import { Wind } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
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

/* ── Fluid property presets (values unchanged from the original page) ────── */
const FLUID_PRESETS = [
  { fluid: "Water (20°C)", short: "Water", density: "998", viscosity: "0.001002" },
  { fluid: "Air (20°C)", short: "Air", density: "1.204", viscosity: "0.0000181" },
  { fluid: "Ethanol", short: "Ethanol", density: "789", viscosity: "0.0012" },
  { fluid: "Glycerin", short: "Glycerin", density: "1260", viscosity: "1.49" },
  { fluid: "Oil (SAE 30)", short: "Oil", density: "920", viscosity: "0.29" },
];

/* ── Pure calculation — thresholds, correlations and rounding copied verbatim ── */
interface ReynoldsResult {
  re: number;
  flowRegime: string;
  description: string;
  fFactor: number;
  tone: ResultTone;
}

function computeReynolds(
  densityRaw: string,
  velocityRaw: string,
  diameterRaw: string,
  viscosityRaw: string,
): ReynoldsResult | null {
  const rho = parseFloat(densityRaw);
  const v = parseFloat(velocityRaw);
  const D = parseFloat(diameterRaw);
  const mu = parseFloat(viscosityRaw);

  if (
    !Number.isFinite(rho) || !Number.isFinite(v) || !Number.isFinite(D) || !Number.isFinite(mu) ||
    rho <= 0 || v <= 0 || D <= 0 || mu <= 0
  ) {
    return null;
  }

  const re = (rho * v * D) / mu;

  // Bands, wording and the friction-factor correlations are the original's.
  if (re < 2000) {
    return {
      re,
      flowRegime: "LAMINAR FLOW",
      description: "Smooth, predictable flow with parallel streamlines",
      fFactor: 64 / re,
      tone: "success",
    };
  }
  if (re < 4000) {
    return {
      re,
      flowRegime: "TRANSITIONAL FLOW",
      description: "Unstable flow regime between laminar and turbulent",
      fFactor: 0.316 / Math.pow(re, 0.25),
      tone: "warning",
    };
  }
  return {
    re,
    flowRegime: "TURBULENT FLOW",
    description: "Chaotic flow with eddies and mixing",
    fFactor: 0.316 / Math.pow(re, 0.25),
    tone: "danger",
  };
}

const formatRe = (re: number) => re.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function ReynoldsNumberCalculator() {
  const [density, setDensity] = useState("1000");
  const [velocity, setVelocity] = useState("");
  const [diameter, setDiameter] = useState("");
  const [viscosity, setViscosity] = useState("0.001");

  const result = useMemo(
    () => computeReynolds(density, velocity, diameter, viscosity),
    [density, velocity, diameter, viscosity],
  );

  // Re against a velocity sweep, as on the original: 0.1 m/s to 2v in steps of v/10.
  const chartData = useMemo(() => {
    if (!result) return [];
    const rho = parseFloat(density);
    const v = parseFloat(velocity);
    const D = parseFloat(diameter);
    const mu = parseFloat(viscosity);
    const rows: { velocity: number; Re: number }[] = [];
    for (let vel = 0.1; vel <= v * 2; vel += v / 10) {
      rows.push({ velocity: vel, Re: (rho * vel * D) / mu });
    }
    return rows;
  }, [result, density, velocity, diameter, viscosity]);

  const positiveError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    return n <= 0 ? `${name} must be greater than 0.` : undefined;
  };

  const reset = () => {
    setDensity("1000");
    setVelocity("");
    setDiameter("");
    setViscosity("0.001");
  };

  return (
    <CalculatorShell
      title="Reynolds Number Calculator"
      subtitle="Works out Re = ρvD/μ for pipe flow, names the flow regime and gives the Darcy friction factor for that regime."
      icon={Wind}
      eyebrow="Pharmaceutical Engineering"
      aside={
        <>
          <CalcAbout title="About the Reynolds number">
            <p>
              Re compares inertial forces with viscous forces. Below about 2000 viscosity wins and the
              flow stays in orderly layers; above about 4000 inertia wins and the flow breaks into
              eddies. The regime decides pressure drop, heat transfer and how well a fluid mixes.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Sizing pipework or choosing a pump duty",
                "Deciding whether flow in a jacket or coil will mix well",
                "Scaling a process up and needing to keep the same regime",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This is the pipe-flow Reynolds number, with D the internal diameter. Stirred tanks use the impeller form (ND²ρ/μ) instead.",
                "The 2000/4000 boundaries are conventional, not sharp — transition depends on entry conditions and roughness.",
                "μ here is the dynamic viscosity in Pa·s. If you have kinematic viscosity (m²/s), multiply by density first.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Reynolds number (Re)"
        value={result ? formatRe(result.re) : null}
        unit="dimensionless"
        interpretation={result ? result.flowRegime : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter density, velocity, diameter and viscosity (all above 0) to find the flow regime."
      />

      {result && (
        <LabNotice tone={result.re < 2000 ? "info" : result.re < 4000 ? "warning" : "danger"} title={result.flowRegime}>
          {result.description}. Darcy friction factor f = {result.fFactor.toFixed(4)}.
        </LabNotice>
      )}

      <CalcSection title="Flow parameters" description="Fluid properties and the pipe conditions.">
        <FieldGrid>
          <NumberField
            label="Density ρ"
            value={density}
            onChange={setDensity}
            unit="kg/m³"
            step="0.001"
            min={0}
            placeholder="e.g. 1000"
            hint="Water at 20 °C is 998 kg/m³."
            error={positiveError(density, "Density")}
          />
          <NumberField
            label="Velocity v"
            value={velocity}
            onChange={setVelocity}
            unit="m/s"
            step="0.01"
            min={0}
            placeholder="e.g. 2.5"
            hint="Mean velocity across the pipe cross-section."
            error={positiveError(velocity, "Velocity")}
          />
          <NumberField
            label="Diameter D"
            value={diameter}
            onChange={setDiameter}
            unit="m"
            step="0.001"
            min={0}
            placeholder="e.g. 0.1"
            hint="Internal diameter. 50 mm pipe = 0.05 m."
            error={positiveError(diameter, "Diameter")}
          />
          <NumberField
            label="Dynamic viscosity μ"
            value={viscosity}
            onChange={setViscosity}
            unit="Pa·s"
            step="0.000001"
            min={0}
            placeholder="e.g. 0.001"
            hint="Water at 20 °C is about 0.001 Pa·s."
            error={positiveError(viscosity, "Viscosity")}
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Common fluids</span>
          {FLUID_PRESETS.map((f) => (
            <Button
              key={f.fluid}
              type="button"
              variant="outline"
              size="sm"
              title={`ρ ${f.density} kg/m³ · μ ${f.viscosity} Pa·s`}
              onClick={() => {
                setDensity(f.density);
                setViscosity(f.viscosity);
              }}
            >
              {f.short}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="The substitution behind the number.">
          <div>
            <ResultRow label="ρ × v × D" value={(parseFloat(density) * parseFloat(velocity) * parseFloat(diameter)).toPrecision(6)} />
            <ResultRow label="÷ μ" value={parseFloat(viscosity)} unit="Pa·s" />
            <ResultRow label="Reynolds number" value={formatRe(result.re)} badge={result.flowRegime.replace(" FLOW", "")} />
            <ResultRow
              label="Friction factor f"
              value={result.fFactor.toFixed(4)}
              unit={result.re < 2000 ? "64 / Re" : "0.316 / Re^0.25"}
            />
          </div>
        </CalcSection>
      )}

      {chartData.length > 0 && (
        <CalcSection
          title="Reynolds number vs. velocity"
          description="How the regime changes as the same fluid is pushed faster through the same pipe."
        >
          <div className="h-60 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="velocity"
                  fontSize={11}
                  tickMargin={8}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: "Velocity (m/s)", position: "insideBottom", offset: -14, fontSize: 11 }}
                />
                <YAxis
                  fontSize={11}
                  width={62}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 }), "Re"]}
                  labelFormatter={(l) => `v = ${Number(l).toFixed(2)} m/s`}
                />
                <ReferenceLine y={2000} stroke="#f59e0b" strokeDasharray="4 3" />
                <ReferenceLine y={4000} stroke="#ef4444" strokeDasharray="4 3" />
                <Line type="monotone" dataKey="Re" stroke="#1C7BD9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Dashed lines mark the laminar/transitional boundary (Re 2000) and the transitional/turbulent
            boundary (Re 4000).
          </p>
        </CalcSection>
      )}

      <CalcSection title="Flow regime guide">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Regime</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Reynolds number</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Friction factor used</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Laminar</td>
                <td className="py-2 pr-3 tabular-nums">Re &lt; 2000</td>
                <td className="py-2 font-mono text-xs">f = 64 / Re</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Transitional</td>
                <td className="py-2 pr-3 tabular-nums">2000 – 4000</td>
                <td className="py-2 font-mono text-xs">f = 0.316 / Re^0.25</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Turbulent</td>
                <td className="py-2 pr-3 tabular-nums">Re ≥ 4000</td>
                <td className="py-2 font-mono text-xs">f = 0.316 / Re^0.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <Formula>Re = (ρ × v × D) / μ</Formula>
        <p>
          <strong>ρ</strong> density (kg/m³), <strong>v</strong> mean velocity (m/s),
          <strong> D</strong> internal diameter (m), <strong>μ</strong> dynamic viscosity (Pa·s). The
          units cancel, so Re is dimensionless.
        </p>
        <p>
          The friction factor is the Darcy f. In laminar flow it is exact: f = 64/Re. Above Re 2000
          this tool uses the Blasius correlation f = 0.316·Re^−0.25, which was fitted for smooth pipes
          in turbulent flow (roughly Re 4000 to 10⁵) — so treat the value in the transitional band, and
          far above 10⁵, as indicative only.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "My viscosity is in centipoise — what do I enter?",
            a: "Divide by 1000. Water is about 1 cP = 0.001 Pa·s. If you have kinematic viscosity in centistokes, convert to m²/s (÷10⁶) and multiply by the density to get Pa·s.",
          },
          {
            q: "Why does the friction factor jump at Re 2000?",
            a: "Because the correlation changes there. f = 64/Re is exact for laminar flow; Blasius is an empirical turbulent fit. The two do not meet smoothly, which mirrors the physical instability of the transition region.",
          },
          {
            q: "Can I use this for a stirred tank?",
            a: "No. A mixing vessel uses the impeller Reynolds number, Re = ND²ρ/μ, with N the impeller speed and D the impeller diameter. Use the Mixing Time Estimator for that.",
          },
          {
            q: "What velocity should I use if I only know the flow rate?",
            a: "Divide the volumetric flow rate (m³/s) by the pipe's cross-sectional area, πD²/4. A 0.1 m pipe has an area of 0.00785 m².",
          },
        ]}
      />
    </CalculatorShell>
  );
}
