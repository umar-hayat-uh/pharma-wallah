"use client";

import { useMemo, useState } from "react";
import { Activity, Plus, RefreshCw, Trash2 } from "lucide-react";
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
  type ResultTone,
} from "@/components/calculators";

/** Inputs stay strings so a half-typed value is never silently replaced. */
type PeakInput = { id: number; wavelength: string; absorbance: string };

let nextId = 3;
const DEFAULT_PEAKS: PeakInput[] = [
  { id: 1, wavelength: "260", absorbance: "0.5" },
  { id: 2, wavelength: "280", absorbance: "0.3" },
];

const EXAMPLES = [
  { name: "Pure DNA", peaks: [{ wavelength: 260, abs: 0.66 }, { wavelength: 280, abs: 0.33 }], ratio: 2.0 },
  { name: "Pure RNA", peaks: [{ wavelength: 260, abs: 0.65 }, { wavelength: 280, abs: 0.32 }], ratio: 2.03 },
  { name: "Pure Protein", peaks: [{ wavelength: 280, abs: 0.55 }, { wavelength: 260, abs: 0.28 }], ratio: 0.51 },
  { name: "Contaminated", peaks: [{ wavelength: 260, abs: 0.5 }, { wavelength: 280, abs: 0.4 }], ratio: 1.25 },
];

/* ── Purity bands (unchanged from the original page) ──────────────────────── */
function ratioBand(ratio: number): { label: string; tone: ResultTone } {
  if (ratio < 1.5) return { label: "Protein contamination", tone: "danger" };
  if (ratio < 1.8) return { label: "Possible contamination", tone: "warning" };
  if (ratio < 2.1) return { label: "Pure nucleic acid", tone: "success" };
  return { label: "Phenol contamination", tone: "warning" };
}

export default function UVVisPeakAnalyzer() {
  const [peaks, setPeaks] = useState<PeakInput[]>(DEFAULT_PEAKS);
  const [concentration, setConcentration] = useState("0.001");
  const [pathLength, setPathLength] = useState("1");

  const parsed = useMemo(
    () => peaks.map((p) => ({ wavelength: parseFloat(p.wavelength), absorbance: parseFloat(p.absorbance) })),
    [peaks],
  );

  /*
   * Live results. The original only updated these on "Analyze Peaks" and kept
   * the previous numbers on screen when the new inputs were invalid; here each
   * value is derived from the current inputs, so a stale ratio or ε can no
   * longer be shown. The formulas are unchanged.
   */
  const epsilon = useMemo(() => {
    const conc = parseFloat(concentration);
    const A = parsed.length ? parsed[0].absorbance : 0;
    const b = parseFloat(pathLength);
    if (!isNaN(conc) && !isNaN(A) && !isNaN(b) && conc > 0 && b > 0) {
      const value = A / (conc * b);
      return Number.isFinite(value) ? { value, A, conc, b } : null;
    }
    return null;
  }, [parsed, concentration, pathLength]);

  const purity = useMemo(() => {
    const peak260 = parsed.find((p) => Math.abs(p.wavelength - 260) < 5);
    const peak280 = parsed.find((p) => Math.abs(p.wavelength - 280) < 5);
    if (peak260 && peak280 && peak280.absorbance > 0) {
      const ratio = peak260.absorbance / peak280.absorbance;
      return Number.isFinite(ratio) ? { ratio, peak260, peak280, ...ratioBand(ratio) } : null;
    }
    return null;
  }, [parsed]);

  // Simulated spectrum: a Gaussian band for each peak (unchanged shape).
  const spectrumData = useMemo(() => {
    const data: { wavelength: number; absorbance: number }[] = [];
    for (let wl = 200; wl <= 400; wl += 2) {
      let A = 0;
      parsed.forEach((p) => {
        if (isNaN(p.wavelength) || isNaN(p.absorbance)) return;
        const dist = Math.abs(wl - p.wavelength);
        if (dist < 30) A += p.absorbance * Math.exp(-Math.pow(dist / 10, 2));
      });
      data.push({ wavelength: wl, absorbance: A });
    }
    return data;
  }, [parsed]);

  const reset = () => {
    setPeaks(DEFAULT_PEAKS);
    setConcentration("0.001");
    setPathLength("1");
  };

  const addPeak = () => setPeaks((prev) => [...prev, { id: nextId++, wavelength: "300", absorbance: "0.1" }]);
  const removePeak = (id: number) => setPeaks((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  const updatePeak = (id: number, field: "wavelength" | "absorbance", value: string) =>
    setPeaks((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const loadExample = (ex: (typeof EXAMPLES)[number]) =>
    setPeaks(ex.peaks.map((p) => ({ id: nextId++, wavelength: String(p.wavelength), absorbance: String(p.abs) })));

  const concValue = parseFloat(concentration);
  const pathValue = parseFloat(pathLength);

  return (
    <CalculatorShell
      title="UV‑Vis Peak Analyzer"
      subtitle="Checks nucleic-acid purity from the A260/A280 ratio and works out molar absorptivity (ε) from a peak's absorbance."
      icon={Activity}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About UV‑Vis analysis">
            <p>
              Nucleic acids absorb most strongly at 260 nm (their purine and pyrimidine bases) and
              proteins at 280 nm (tryptophan and tyrosine). The ratio of the two absorbances is a quick
              purity check for a DNA or RNA preparation.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Checking a DNA or RNA extract before PCR or sequencing",
                "Estimating ε for a compound at a known concentration",
                "Sketching how overlapping absorption bands add up",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "The ratio needs one peak within 5 nm of 260 nm and one within 5 nm of 280 nm",
                "ε is always calculated from Peak 1's absorbance",
                "Readings above about 1.0 absorbance lose linearity — dilute first",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard
          label="A260 / A280"
          value={purity ? purity.ratio.toFixed(2) : null}
          interpretation={purity?.label}
          tone={purity?.tone ?? "neutral"}
          empty="Add a peak near 260 nm and one near 280 nm (absorbance above 0)."
        />
        <ResultCard
          label="Molar absorptivity"
          value={epsilon ? epsilon.value.toFixed(0) : null}
          unit="M⁻¹cm⁻¹"
          empty="Enter Peak 1's absorbance, a concentration and a path length above 0."
        />
      </div>

      <CalcSection title="Peak data" description="One row per absorption maximum. Peak 1 is used for ε.">
        <div className="space-y-3">
          {peaks.map((p, idx) => (
            <div key={p.id} className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Peak {idx + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePeak(p.id)}
                  disabled={peaks.length <= 1}
                  aria-label={`Remove peak ${idx + 1}`}
                  className="h-10 text-muted-foreground"
                >
                  <Trash2 />
                  Remove
                </Button>
              </div>
              <FieldGrid>
                <NumberField
                  label={`Peak ${idx + 1} wavelength (λ)`}
                  value={p.wavelength}
                  onChange={(v) => updatePeak(p.id, "wavelength", v)}
                  unit="nm"
                  hint="200–400 nm is plotted."
                />
                <NumberField
                  label={`Peak ${idx + 1} absorbance (A)`}
                  value={p.absorbance}
                  onChange={(v) => updatePeak(p.id, "absorbance", v)}
                  step="0.01"
                  error={p.absorbance.trim() !== "" && isNaN(parseFloat(p.absorbance)) ? "Enter a number." : undefined}
                  hint="Reading at the peak maximum."
                />
              </FieldGrid>
            </div>
          ))}
          <Button variant="outline" onClick={addPeak} className="w-full border-dashed">
            <Plus />
            Add peak
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Sample">
        <FieldGrid>
          <NumberField
            label="Concentration (c)"
            value={concentration}
            onChange={setConcentration}
            unit="M"
            step="1e-6"
            error={concentration.trim() !== "" && !(concValue > 0) ? "Must be greater than zero." : undefined}
            hint="Molar concentration of the solution measured, e.g. 0.001 M = 1 mM."
          />
          <NumberField
            label="Path length (b)"
            value={pathLength}
            onChange={setPathLength}
            unit="cm"
            step="0.1"
            error={pathLength.trim() !== "" && !(pathValue > 0) ? "Must be greater than zero." : undefined}
            hint="Standard cuvettes are 1 cm."
          />
        </FieldGrid>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example spectrum</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                type="button"
                onClick={() => loadExample(ex)}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
              >
                {ex.name} · A260/A280 = {ex.ratio.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {(purity || epsilon) && (
        <CalcSection title="Working">
          <div>
            {purity && (
              <>
                <ResultRow label={`A at ${purity.peak260.wavelength} nm (≈260)`} value={purity.peak260.absorbance} />
                <ResultRow label={`A at ${purity.peak280.wavelength} nm (≈280)`} value={purity.peak280.absorbance} />
                <ResultRow label="A260 ÷ A280" value={purity.ratio.toFixed(2)} badge={purity.label} />
              </>
            )}
            {epsilon && (
              <ResultRow
                label={`ε = ${epsilon.A} ÷ (${epsilon.conc} × ${epsilon.b})`}
                value={epsilon.value.toFixed(0)}
                unit="M⁻¹cm⁻¹"
              />
            )}
          </div>
        </CalcSection>
      )}

      <CalcSection title="Simulated spectrum" description="Each peak drawn as a Gaussian band; overlapping bands add.">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spectrumData} margin={{ top: 10, right: 12, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="wavelength"
                tick={{ fontSize: 12 }}
                label={{ value: "λ (nm)", position: "insideBottom", offset: -12, fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={44}
                label={{ value: "Abs", angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
              />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Line type="monotone" dataKey="absorbance" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CalcSection>

      <CalcSection title="Purity standards (A260/A280)">
        <div>
          <ResultRow label="DNA" value="1.8 – 2.0" />
          <ResultRow label="RNA" value="1.9 – 2.1" />
          <ResultRow label="Protein" value="0.5 – 0.6" />
        </div>
        <p className="text-xs text-muted-foreground">
          Bands used for the reading: below 1.5 protein contamination · 1.5–1.8 possible contamination ·
          1.8–2.1 pure nucleic acid · 2.1 and above phenol contamination.
        </p>
      </CalcSection>

      <FormulaNote>
        <Formula>Purity ratio = A260 ÷ A280</Formula>
        <Formula>ε = A ÷ (c × b)</Formula>
        <p>
          A = absorbance (no unit), c = molar concentration (M), b = path length (cm), ε = molar
          absorptivity (M⁻¹cm⁻¹). The second line is the Beer–Lambert law rearranged for ε.
        </p>
        <p>
          For nucleic-acid concentration, labs use A260 × 50 μg/mL for double-stranded DNA and A260 × 40
          μg/mL for RNA (1 cm path).
        </p>
        <p className="text-xs">Sources: Sambrook et al., Molecular Cloning; Thermo Fisher technical guide.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What A260/A280 ratio means pure DNA?",
            a: "About 1.8 for DNA and about 2.0 for RNA. A lower ratio suggests protein (which absorbs at 280 nm) is still present.",
          },
          {
            q: "Why is my peak not used for the ratio?",
            a: "The calculator looks for a peak within 5 nm of 260 nm and within 5 nm of 280 nm. A peak at 255 or 285 nm is just outside that window.",
          },
          {
            q: "Which peak does ε use?",
            a: "Peak 1, always. Put the peak whose molar absorptivity you want at the top of the list, and enter the concentration in mol/L.",
          },
          {
            q: "Is the spectrum a real measurement?",
            a: "No. It is an illustration built from your peaks as idealised Gaussian bands, to show how nearby bands overlap. Use your instrument's scan for anything you report.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
