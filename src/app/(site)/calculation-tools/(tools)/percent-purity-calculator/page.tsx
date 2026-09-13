"use client";

import { useMemo, useState } from "react";
import { Percent, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

type Status = "compliant" | "non-compliant" | "marginal";

/* ── Classification bands and wording (unchanged from the original page) ─── */
function classify(purity: number): { status: Status; message: string; interpretation: string } {
  if (purity >= 98.0 && purity <= 102.0) {
    return {
      status: "compliant",
      message: "Meets pharmacopoeial standards",
      interpretation:
        "The assay result is within the accepted range (98‑102%). The sample is suitable for use.",
    };
  }
  if (purity >= 95.0 && purity < 98.0) {
    return {
      status: "marginal",
      message: "Borderline – investigate",
      interpretation:
        "The purity is slightly below specification. Check for analytical errors, impurity interference, or degradation.",
    };
  }
  return {
    status: "non-compliant",
    message: "Fails quality standards – reject",
    interpretation:
      "The assay result is outside acceptable limits. The sample may be adulterated, degraded, or incorrectly prepared.",
  };
}

const TONE: Record<Status, ResultTone> = {
  compliant: "success",
  marginal: "warning",
  "non-compliant": "danger",
};

const EXAMPLES = [
  { label: "Aspirin", W: "0.5", V: "24.5", N: "0.1", E: "0.1802" },
  { label: "Ascorbic Acid", W: "1.0", V: "48.2", N: "0.05", E: "0.1761" },
  { label: "Paracetamol", W: "0.3", V: "15.8", N: "0.1", E: "0.1512" },
  { label: "NaCl", W: "0.2", V: "34.2", N: "0.1", E: "0.05844" },
  { label: "Amoxicillin", W: "0.5", V: "21.3", N: "0.1", E: "0.3644", D: "5" },
];

const COLORS = ["#2563eb", "#ef4444"];

/** A positive-number check that only speaks once something has been typed. */
function positiveError(raw: string): string | undefined {
  if (raw.trim() === "") return undefined;
  const value = parseFloat(raw);
  if (isNaN(value)) return "Enter a number.";
  if (value <= 0) return "Must be greater than zero.";
  return undefined;
}

export default function PercentPurityCalculator() {
  const [sampleWeight, setSampleWeight] = useState("");
  const [titrantVolume, setTitrantVolume] = useState("");
  const [titrantNormality, setTitrantNormality] = useState("");
  const [equivalentFactor, setEquivalentFactor] = useState("");
  const [dilutionFactor, setDilutionFactor] = useState("1");

  const errors = {
    W: positiveError(sampleWeight),
    V: positiveError(titrantVolume),
    N: positiveError(titrantNormality),
    E: positiveError(equivalentFactor),
    // The original treated a blank or zero D as 1; a negative dilution factor is meaningless.
    D: parseFloat(dilutionFactor) < 0 ? "Cannot be negative." : undefined,
  };

  /*
   * Live, instead of the old "Calculate Purity" button + alert(). For any valid
   * input the number is exactly what the button produced.
   */
  const result = useMemo(() => {
    const W = parseFloat(sampleWeight);
    const V = parseFloat(titrantVolume);
    const N = parseFloat(titrantNormality);
    const E = parseFloat(equivalentFactor);
    const D = parseFloat(dilutionFactor) || 1;

    if (isNaN(W) || isNaN(V) || isNaN(N) || isNaN(E) || W <= 0 || V <= 0 || N <= 0 || E <= 0) return null;
    if (D < 0) return null;

    const purity = (V * N * E * D * 100) / W;
    if (!Number.isFinite(purity)) return null;

    return { W, V, N, E, D, purity, ...classify(purity) };
  }, [sampleWeight, titrantVolume, titrantNormality, equivalentFactor, dilutionFactor]);

  const reset = () => {
    setSampleWeight("");
    setTitrantVolume("");
    setTitrantNormality("");
    setEquivalentFactor("");
    setDilutionFactor("1");
  };

  const loadExample = (ex: (typeof EXAMPLES)[number]) => {
    setSampleWeight(ex.W);
    setTitrantVolume(ex.V);
    setTitrantNormality(ex.N);
    setEquivalentFactor(ex.E);
    setDilutionFactor(ex.D || "1");
  };

  // The pie can only show 0–100 %; a result above 100 % is called out in words instead.
  const pieData = result
    ? [
        { name: "Purity", value: Math.max(0, Math.min(result.purity, 100)) },
        { name: "Impurity", value: Math.max(0, 100 - result.purity) },
      ]
    : [];

  return (
    <CalculatorShell
      title="Percent Purity (Assay) Calculator"
      subtitle="Works out the % purity of a drug sample from a titration, and checks it against assay limits."
      icon={Percent}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About titrimetric assay">
            <p>
              In a titrimetric assay, the volume of titrant of known concentration needed to react
              completely with the sample tells you how much analyte the sample contains. Dividing that
              amount by the weight taken gives the purity as a percentage.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Calculating an acid–base, redox or precipitation assay in a practical",
                "Checking a raw material against its monograph limits",
                "You know the titrant normality and the equivalent factor from the monograph",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before trusting the number"
              items={[
                "W and E must use the same mass unit (g with g/mEq, or mg with mg/mEq)",
                "A back-titration or blank correction must be applied to V first",
                "The 98–102% band used here is the IP range — USP and BP limits differ",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Purity"
        value={result ? result.purity.toFixed(2) : null}
        unit="%"
        interpretation={result?.message}
        tone={result ? TONE[result.status] : "neutral"}
        empty="Enter the sample weight, titrant volume, normality and equivalent factor."
      />

      <CalcSection title="Titration data">
        <FieldGrid>
          <NumberField
            label="Sample weight (W)"
            value={sampleWeight}
            onChange={setSampleWeight}
            unit="g"
            step="0.001"
            placeholder="e.g. 0.5"
            error={errors.W}
            hint="Accurately weighed sample, in the same mass unit as E."
          />
          <NumberField
            label="Titrant volume (V)"
            value={titrantVolume}
            onChange={setTitrantVolume}
            unit="mL"
            step="0.01"
            placeholder="e.g. 24.5"
            error={errors.V}
            hint="Burette reading at the end point (blank-corrected)."
          />
          <NumberField
            label="Titrant normality (N)"
            value={titrantNormality}
            onChange={setTitrantNormality}
            unit="N"
            step="0.001"
            placeholder="e.g. 0.1"
            error={errors.N}
            hint="Standardised strength of the titrant, e.g. 0.1 N NaOH."
          />
          <NumberField
            label="Equivalent factor (E)"
            value={equivalentFactor}
            onChange={setEquivalentFactor}
            unit="g/mEq"
            step="0.0001"
            placeholder="e.g. 0.1802"
            error={errors.E}
            hint="Weight of analyte equivalent to 1 mEq of titrant — MW ÷ n ÷ 1000."
          />
          <NumberField
            label="Dilution factor (D)"
            value={dilutionFactor}
            onChange={setDilutionFactor}
            step="1"
            error={errors.D}
            hint="1 if you titrated the whole sample; e.g. 5 if you titrated a 1-in-5 aliquot. Blank or 0 counts as 1."
          />
        </FieldGrid>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => loadExample(ex)}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
              >
                {ex.label} · V {ex.V} mL
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
            <ResultRow label="Milliequivalents of titrant (V × N)" value={(result.V * result.N).toFixed(4)} unit="mEq" />
            <ResultRow
              label="Analyte found (V × N × E × D)"
              value={(result.V * result.N * result.E * result.D).toFixed(4)}
              unit="g"
            />
            <ResultRow label="Dilution factor used" value={result.D} />
            <ResultRow label="Purity" value={result.purity.toFixed(2)} unit="%" />
          </div>
          <Formula>
            % purity = ({result.V} × {result.N} × {result.E} × {result.D} × 100) ÷ {result.W} ={" "}
            {result.purity.toFixed(2)}%
          </Formula>
          <LabNotice tone={result.status === "compliant" ? "info" : "warning"} title="Interpretation">
            {result.interpretation}
          </LabNotice>
        </CalcSection>
      )}

      {result && (
        <CalcSection title="Composition">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {result.purity > 100 && (
            <p className="text-xs text-muted-foreground">
              The result is above 100%, so the chart shows the sample as 100% analyte. A figure above
              100% usually means a wrong equivalent factor, unit mismatch or titration error.
            </p>
          )}
        </CalcSection>
      )}

      <CalcSection title="Pharmacopoeial limits">
        <div>
          <ResultRow label="USP" value="90 – 110" unit="%" />
          <ResultRow label="BP" value="95 – 105" unit="%" />
          <ResultRow label="IP" value="98 – 102" unit="%" />
        </div>
        <p className="text-xs text-muted-foreground">
          This calculator grades against 98–102% (compliant), 95–98% (borderline) and anything else
          (fails). Always check the individual monograph.
        </p>
      </CalcSection>

      <FormulaNote>
        <Formula>% Purity = (V × N × E × D × 100) ÷ W</Formula>
        <p>
          <strong>V</strong> = titrant volume (mL), <strong>N</strong> = titrant normality (mEq/mL),{" "}
          <strong>E</strong> = equivalent factor — the milliequivalent weight of the analyte
          (for molecular weight M reacting with n equivalents, E = M ÷ n), <strong>D</strong> =
          dilution factor, <strong>W</strong> = sample weight.
        </p>
        <p>
          V × N gives the milliequivalents of titrant used; multiplying by E converts that to the mass
          of analyte it reacted with. Dividing by the weight taken and multiplying by 100 gives the
          percentage.
        </p>
        <p className="text-xs">Sources: USP General Chapter &lt;541&gt;, European Pharmacopoeia 2.5.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What units should W and E be in?",
            a: "The same mass unit. If E is written in g/mEq (e.g. 0.1802 for aspirin), enter W in grams; if E is in mg/mEq (180.2), enter W in milligrams. Mixing them makes the result 1000 times too big or too small.",
          },
          {
            q: "How do I find the equivalent factor?",
            a: "Most monographs state it directly, e.g. \"each mL of 0.1 M NaOH is equivalent to 18.02 mg of C₉H₈O₄\". Otherwise divide the molecular weight by the number of equivalents that react per molecule.",
          },
          {
            q: "When do I need a dilution factor?",
            a: "When you dissolve the sample, make it up to volume, and titrate only part of it. If you dissolved in 100 mL and titrated a 20 mL aliquot, D = 5.",
          },
          {
            q: "Why is my purity above 100%?",
            a: "Usually a unit mismatch between W and E, a normality that was not standardised, or an overshot end point. Results slightly over 100% can be real within assay error, which is why limits such as 98–102% extend above 100.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
