"use client";

import { useMemo, useState } from "react";
import { Activity, Beaker, RefreshCw, Target, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
  ModeSwitch,
  type ResultTone,
} from "@/components/calculators";

type Method = "absorbance" | "concentration" | "epsilon";
type MolarityUnit = "M" | "mM" | "μM" | "nM";
type PathLengthUnit = "cm" | "mm" | "m";

/* ── Unit conversions (unchanged from the original page) ──────────────────── */
const TO_MOLAR: Record<MolarityUnit, number> = { M: 1, mM: 1000, "μM": 1e6, nM: 1e9 };

function toMolar(conc: number, unit: MolarityUnit): number {
  switch (unit) {
    case "mM":
      return conc / 1000;
    case "μM":
      return conc / 1e6;
    case "nM":
      return conc / 1e9;
    default:
      return conc;
  }
}

function toCm(b: number, unit: PathLengthUnit): number {
  switch (unit) {
    case "mm":
      return b / 10;
    case "m":
      return b * 100;
    default:
      return b;
  }
}

/* ── Quality band (unchanged) ─────────────────────────────────────────────── */
function getAbsorbanceInterpretation(A: number): { text: string; tone: ResultTone } {
  if (A < 0.1) return { text: "Very low – may need higher concentration or longer pathlength", tone: "warning" };
  if (A < 0.5) return { text: "Ideal for accurate measurements", tone: "success" };
  if (A < 1.0) return { text: "Good range", tone: "success" };
  if (A < 2.0) return { text: "High – consider dilution", tone: "warning" };
  return { text: "Too high – dilute sample", tone: "danger" };
}

const SAMPLE_COMPOUNDS = [
  { name: "NADH", epsilon: "6220", lambda: "340", conc: "0.0001", unit: "M", note: "Reduced form at 340 nm" },
  { name: "DNA", epsilon: "6600", lambda: "260", conc: "0.00005", unit: "M", note: "Double‑stranded at 260 nm" },
  { name: "BSA", epsilon: "55000", lambda: "280", conc: "0.0001", unit: "M", note: "Protein at 280 nm" },
  { name: "Methylene Blue", epsilon: "95000", lambda: "665", conc: "0.00001", unit: "M", note: "At 665 nm" },
];

function nonNegativeError(raw: string, allowZero: boolean): string | undefined {
  if (raw.trim() === "") return undefined;
  const v = parseFloat(raw);
  if (isNaN(v)) return "Enter a number.";
  if (v < 0) return "Cannot be negative.";
  if (v === 0 && !allowZero) return "Must be greater than zero.";
  return undefined;
}

export default function BeerLambertCalculator() {
  const [method, setMethod] = useState<Method>("absorbance");
  const [epsilon, setEpsilon] = useState("5000");
  const [concentration, setConcentration] = useState("0.001");
  const [pathLength, setPathLength] = useState("1");
  const [absorbance, setAbsorbance] = useState("0.5");
  const [molarityUnit, setMolarityUnit] = useState<MolarityUnit>("M");
  const [pathLengthUnit, setPathLengthUnit] = useState<PathLengthUnit>("cm");

  /*
   * Derived live. The original ran this in a useEffect and wrote the solved
   * value back into the disabled input (A to 4 dp, c to 8 dp, ε to 0 dp), which
   * re-triggered the effect. The arithmetic and the display precision below are
   * the same; the write-back now happens only when the user switches mode (see
   * changeMethod), which is the only place it was ever visible.
   */
  const result = useMemo(() => {
    const eps = parseFloat(epsilon);
    const conc = parseFloat(concentration);
    const b = parseFloat(pathLength);
    const A = parseFloat(absorbance);
    const concM = toMolar(conc, molarityUnit);
    const bCm = toCm(b, pathLengthUnit);

    if (method === "absorbance") {
      if (isNaN(eps) || isNaN(concM) || isNaN(bCm) || eps < 0 || concM < 0 || bCm < 0) return null;
      const value = eps * concM * bCm;
      if (!Number.isFinite(value)) return null;
      const stored = value.toFixed(4); // what the original wrote into the A field
      return {
        value,
        display: stored,
        stored,
        A: parseFloat(stored),
        eps,
        concM,
        bCm,
        quality: getAbsorbanceInterpretation(value),
      };
    }

    if (method === "concentration") {
      if (isNaN(A) || isNaN(eps) || isNaN(bCm) || !(eps > 0) || !(bCm > 0) || A < 0) return null;
      const value = (A / (eps * bCm)) * TO_MOLAR[molarityUnit];
      if (!Number.isFinite(value)) return null;
      const stored = value.toFixed(8);
      return {
        value,
        display: value.toExponential(4),
        stored,
        A,
        eps,
        concM: toMolar(parseFloat(stored), molarityUnit),
        bCm,
        quality: null,
      };
    }

    if (isNaN(A) || isNaN(concM) || isNaN(bCm) || !(concM > 0) || !(bCm > 0) || A < 0) return null;
    const value = A / (concM * bCm);
    if (!Number.isFinite(value)) return null;
    const stored = value.toFixed(0);
    return { value, display: value.toFixed(4), stored, A, eps: parseFloat(stored), concM, bCm, quality: null };
  }, [method, epsilon, concentration, pathLength, absorbance, molarityUnit, pathLengthUnit]);

  // T = 10^-A × 100 %, from the absorbance the original used at that moment.
  const transmittance = result && !isNaN(result.A) ? Math.pow(10, -result.A) * 100 : null;

  // Calibration line through the origin, 0 → 2 × the working concentration.
  const chartData = useMemo(() => {
    if (!result) return [];
    const data: { conc: number; abs: number }[] = [];
    const maxConc = result.concM * 2;
    for (let i = 0; i <= 20; i++) {
      const c = (i / 20) * maxConc;
      data.push({ conc: c * TO_MOLAR[molarityUnit], abs: result.eps * c * result.bCm });
    }
    return data.every((d) => Number.isFinite(d.conc) && Number.isFinite(d.abs)) ? data : [];
  }, [result, molarityUnit]);

  /** Switching mode keeps the solved value in its field, exactly as the original did. */
  const changeMethod = (next: Method) => {
    if (result && next !== method) {
      if (method === "absorbance") setAbsorbance(result.stored);
      if (method === "concentration") setConcentration(result.stored);
      if (method === "epsilon") setEpsilon(result.stored);
    }
    setMethod(next);
  };

  const reset = () => {
    setEpsilon("5000");
    setConcentration("0.001");
    setPathLength("1");
    setAbsorbance("0.5");
    setMolarityUnit("M");
    setPathLengthUnit("cm");
  };

  const loadSample = (c: (typeof SAMPLE_COMPOUNDS)[number]) => {
    setEpsilon(c.epsilon);
    setConcentration(c.conc);
    setMolarityUnit(c.unit as MolarityUnit);
  };

  const solved = (m: Method) => method === m && result !== null;

  const resultLabel =
    method === "absorbance" ? "Absorbance (A)" : method === "concentration" ? "Concentration (c)" : "Molar absorptivity (ε)";
  const resultUnit = method === "absorbance" ? undefined : method === "concentration" ? molarityUnit : "M⁻¹cm⁻¹";

  return (
    <CalculatorShell
      title="Beer‑Lambert Law Calculator"
      subtitle="Solves A = ε · c · l for absorbance, concentration or molar absorptivity, with transmittance and a calibration line."
      icon={Beaker}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About the Beer‑Lambert law">
            <p>
              The Beer‑Lambert law says that the light a solution absorbs is proportional to how
              concentrated it is and how far the light travels through it. It is the basis of almost
              every UV‑Vis assay in pharmaceutical analysis.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Finding the concentration of a sample from its absorbance",
                "Predicting the absorbance of a solution before you make it",
                "Working out ε from a standard of known concentration",
              ]}
            />
            <CalcList
              tone="caution"
              title="The law assumes"
              items={[
                "Monochromatic light at the absorption maximum",
                "A clear, non‑scattering, homogeneous solution",
                "No association, dissociation or reaction as concentration changes",
                "Absorbance in the linear range — roughly 0.1 to 1.0",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch<Method>
        label="Solve for"
        value={method}
        onChange={changeMethod}
        options={[
          { value: "absorbance", label: "Solve for A", description: "From ε, c and l", icon: TrendingUp },
          { value: "concentration", label: "Solve for concentration", description: "From A, ε and l", icon: Target },
          { value: "epsilon", label: "Solve for ε", description: "From A, c and l", icon: Activity },
        ]}
      />

      <ResultCard
        label={resultLabel}
        value={result ? result.display : null}
        unit={resultUnit}
        interpretation={result?.quality?.text}
        tone={result?.quality?.tone ?? "neutral"}
        empty={
          method === "absorbance"
            ? "Enter ε, a concentration and a path length."
            : method === "concentration"
              ? "Enter an absorbance, and ε and path length above 0."
              : "Enter an absorbance, and a concentration and path length above 0."
        }
      />

      <CalcSection title="Values" description="The field being solved for is filled in for you.">
        <FieldGrid>
          <NumberField
            label="Molar absorptivity ε (M⁻¹cm⁻¹)"
            value={solved("epsilon") ? result!.stored : epsilon}
            onChange={setEpsilon}
            step="1"
            disabled={method === "epsilon"}
            error={method === "epsilon" ? undefined : nonNegativeError(epsilon, method === "absorbance")}
            hint="Also written L·mol⁻¹·cm⁻¹. Found in the monograph or literature for your λmax."
          />
          <NumberField
            label="Concentration c"
            value={solved("concentration") ? result!.stored : concentration}
            onChange={setConcentration}
            units={["M", "mM", "μM", "nM"]}
            unit={molarityUnit}
            onUnitChange={(next) => setMolarityUnit(next as MolarityUnit)}
            disabled={method === "concentration"}
            error={method === "concentration" ? undefined : nonNegativeError(concentration, method === "absorbance")}
            hint="Molar concentration; 1 mM = 0.001 M."
          />
          <NumberField
            label="Path length l"
            value={pathLength}
            onChange={setPathLength}
            units={["cm", "mm", "m"]}
            unit={pathLengthUnit}
            onUnitChange={(next) => setPathLengthUnit(next as PathLengthUnit)}
            step="0.01"
            error={nonNegativeError(pathLength, method === "absorbance")}
            hint="Width of the cuvette — standard cells are 1 cm."
          />
          <NumberField
            label="Absorbance A"
            value={solved("absorbance") ? result!.stored : absorbance}
            onChange={setAbsorbance}
            step="0.001"
            disabled={method === "absorbance"}
            error={method === "absorbance" ? undefined : nonNegativeError(absorbance, true)}
            hint="No unit. Reliable readings are about 0.1–1.0."
          />
        </FieldGrid>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Common compounds</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_COMPOUNDS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => loadSample(c)}
                title={c.note}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
              >
                {c.name} · ε {c.epsilon} · {c.lambda} nm
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
            {method === "absorbance" && (
              <ResultRow
                label={`A = ${result.eps} × ${result.concM} M × ${result.bCm} cm`}
                value={result.display}
              />
            )}
            {method === "concentration" && (
              <ResultRow
                label={`c = ${result.A} ÷ (${result.eps} × ${result.bCm} cm)`}
                value={result.display}
                unit={molarityUnit}
              />
            )}
            {method === "epsilon" && (
              <ResultRow
                label={`ε = ${result.A} ÷ (${result.concM} M × ${result.bCm} cm)`}
                value={result.display}
                unit="M⁻¹cm⁻¹"
              />
            )}
            <ResultRow label="Concentration in mol/L" value={result.concM.toExponential(4)} unit="M" />
            <ResultRow label="Path length in cm" value={result.bCm} unit="cm" />
            {transmittance !== null && <ResultRow label="Transmittance T = 10⁻ᴬ × 100" value={transmittance.toFixed(2)} unit="%" />}
          </div>
        </CalcSection>
      )}

      {chartData.length > 0 && (
        <CalcSection title="Calibration curve" description={`Absorbance against concentration (${molarityUnit}) for this ε and path length.`}>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="conc"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => Number(v.toPrecision(3)).toString()}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} width={44} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Line type="monotone" dataKey="abs" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <FormulaNote>
        <Formula>A = ε · c · l</Formula>
        <Formula>T = 10⁻ᴬ × 100%</Formula>
        <p>
          A = absorbance (no unit), ε = molar absorptivity (L·mol⁻¹·cm⁻¹), c = concentration (mol/L),
          l = path length (cm). Concentration and path length are converted to M and cm before the
          formula is applied; a solved concentration is reported back in the unit you selected.
        </p>
        <p>
          Transmittance is the fraction of light that gets through. An absorbance of 1 lets through
          10%, and 2 lets through only 1% — which is why high readings are unreliable.
        </p>
        <p className="text-xs">Sources: IUPAC; USP General Chapter &lt;857&gt;; Harris, Quantitative Chemical Analysis.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What absorbance range should I aim for?",
            a: "About 0.1 to 1.0. Below 0.1 the reading is close to instrument noise; above 1.0 stray light makes the response non-linear. Dilute or concentrate the sample to land in range.",
          },
          {
            q: "Why is the concentration shown as 7.5758e+1?",
            a: "That is scientific notation: 7.5758 × 10¹ = 75.758 in the unit selected. It keeps very small molar concentrations readable.",
          },
          {
            q: "My ε is given per cm with concentration in g/L — can I use it?",
            a: "Not directly. This calculator uses molar absorptivity. Convert a specific absorbance A(1%, 1 cm) to ε with ε = A(1%, 1 cm) × MW ÷ 10.",
          },
          {
            q: "Does switching mode lose my numbers?",
            a: "No. The value that was being solved for is kept in its field, so you can, for example, compute A and then switch to solving for concentration with that A.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
