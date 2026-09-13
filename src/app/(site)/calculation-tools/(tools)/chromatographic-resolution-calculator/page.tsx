"use client";

import { useMemo, useState } from "react";
import { Filter, RefreshCw } from "lucide-react";
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
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

type Method = "peaks" | "efficiency";

/* ── Formulas (unchanged from the original page) ──────────────────────────── */
function resolutionFromPeaks(t1: string, t2: string, w1: string, w2: string): number | null {
  const t1n = parseFloat(t1);
  const t2n = parseFloat(t2);
  const w1n = parseFloat(w1);
  const w2n = parseFloat(w2);
  if (!isNaN(t1n) && !isNaN(t2n) && !isNaN(w1n) && !isNaN(w2n) && w1n > 0 && w2n > 0) {
    return (2 * (t2n - t1n)) / (w1n + w2n);
  }
  return null;
}

function resolutionFromEfficiency(N: string, k: string, alpha: string) {
  const Nn = parseFloat(N);
  const kn = parseFloat(k);
  const an = parseFloat(alpha);
  if (!isNaN(Nn) && !isNaN(kn) && !isNaN(an) && Nn > 0 && kn > 0 && an > 0) {
    const efficiency = Math.sqrt(Nn) / 4;
    const selectivity = (an - 1) / an;
    const retention = kn / (1 + kn);
    return { R: efficiency * selectivity * retention, efficiency, selectivity, retention };
  }
  return null;
}

/* ── Bands (unchanged) ─────────────────────────────────────────────────────── */
function describe(R: number): { label: string; tone: ResultTone } {
  const label = R < 1.0 ? "Poor" : R < 1.5 ? "Baseline not achieved" : R < 2.0 ? "Good" : "Excellent";
  const tone: ResultTone = R >= 1.5 ? "success" : R >= 1.0 ? "warning" : "danger";
  return { label, tone };
}

const SAMPLES = [
  { name: "HPLC Method", t1: "5.2", t2: "5.8", w1: "0.2", w2: "0.25" },
  { name: "GC Method", t1: "3.5", t2: "4.0", w1: "0.15", w2: "0.18" },
  { name: "Poor Separation", t1: "8.0", t2: "8.3", w1: "0.4", w2: "0.45" },
];

/** toFixed(2) without a "-0.00" for tiny negative values. */
const fmt2 = (v: number) => {
  const s = v.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};

function positiveError(raw: string): string | undefined {
  if (raw.trim() === "") return undefined;
  const v = parseFloat(raw);
  if (isNaN(v)) return "Enter a number.";
  if (v <= 0) return "Must be greater than zero.";
  return undefined;
}

export default function ChromatographicResolutionCalculator() {
  const [method, setMethod] = useState<Method>("peaks");
  const [t1, setT1] = useState("5.2");
  const [t2, setT2] = useState("5.8");
  const [w1, setW1] = useState("0.2");
  const [w2, setW2] = useState("0.25");
  const [N, setN] = useState("10000");
  const [k, setK] = useState("2.5");
  const [alpha, setAlpha] = useState("1.1");

  const peaks = useMemo(() => resolutionFromPeaks(t1, t2, w1, w2), [t1, t2, w1, w2]);
  const efficiency = useMemo(() => resolutionFromEfficiency(N, k, alpha), [N, k, alpha]);
  const R = method === "peaks" ? peaks : efficiency?.R ?? null;
  const band = R !== null && Number.isFinite(R) ? describe(R) : null;

  // Simulated chromatogram — the same Gaussian shapes the original drew (peak-data mode only).
  const peakData = useMemo(() => {
    const data: { time: number; signal: number }[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 20;
      const peak1 = Math.exp(-Math.pow((x - parseFloat(t1)) * 5, 2));
      const peak2 = Math.exp(-Math.pow((x - parseFloat(t2)) * 5, 2));
      data.push({ time: x, signal: Number.isFinite(peak1 + peak2) ? peak1 + peak2 : 0 });
    }
    return data;
  }, [t1, t2]);

  const reset = () => {
    setT1("5.2");
    setT2("5.8");
    setW1("0.2");
    setW2("0.25");
    setN("10000");
    setK("2.5");
    setAlpha("1.1");
  };

  const t1n = parseFloat(t1);
  const t2n = parseFloat(t2);

  return (
    <CalculatorShell
      title="Chromatographic Resolution Calculator"
      subtitle="Calculates the resolution (Rs) between two peaks in HPLC or GC, from peak data or column efficiency."
      icon={Filter}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About resolution">
            <p>
              Resolution (Rs) measures how well two neighbouring peaks are separated: the distance
              between their retention times compared with how wide they are. It is a system-suitability
              requirement in almost every chromatographic assay.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Checking system suitability for an HPLC or GC method",
                "Deciding whether two peaks can be quantified separately",
                "Seeing whether more plates, retention or selectivity would help",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Use baseline (tangent) peak widths, not widths at half height",
                "Retention times and widths must be in the same unit",
                "The efficiency (Purnell) equation is an approximation for closely eluting peaks",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch<Method>
        label="Calculation method"
        value={method}
        onChange={setMethod}
        options={[
          { value: "peaks", label: "From peak data", description: "Retention times and peak widths" },
          { value: "efficiency", label: "From efficiency", description: "Plate number N, k and α" },
        ]}
      />

      <ResultCard
        label="Resolution (Rs)"
        value={R !== null && band ? fmt2(R) : null}
        interpretation={band?.label}
        tone={band?.tone ?? "neutral"}
        empty={
          method === "peaks"
            ? "Enter both retention times and two peak widths greater than zero."
            : "Enter a plate number, retention factor and selectivity, all greater than zero."
        }
      />

      <CalcSection title={method === "peaks" ? "Peak data" : "Column efficiency"}>
        {method === "peaks" ? (
          <>
            <FieldGrid>
              <NumberField
                label="Retention time 1 (t₁)"
                value={t1}
                onChange={setT1}
                unit="min"
                step="0.01"
                hint="The earlier-eluting peak."
              />
              <NumberField
                label="Retention time 2 (t₂)"
                value={t2}
                onChange={setT2}
                unit="min"
                step="0.01"
                hint="The later-eluting peak."
              />
              <NumberField
                label="Peak width 1 (w₁)"
                value={w1}
                onChange={setW1}
                unit="min"
                step="0.01"
                error={positiveError(w1)}
                hint="Width at the baseline, same unit as t."
              />
              <NumberField
                label="Peak width 2 (w₂)"
                value={w2}
                onChange={setW2}
                unit="min"
                step="0.01"
                error={positiveError(w2)}
                hint="Width at the baseline, same unit as t."
              />
            </FieldGrid>
            {!isNaN(t1n) && !isNaN(t2n) && t2n < t1n && (
              <LabNotice tone="warning">
                Retention time 2 is earlier than retention time 1, so Rs comes out negative. Enter
                the later peak as t₂.
              </LabNotice>
            )}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => {
                  const r = resolutionFromPeaks(s.t1, s.t2, s.w1, s.w2);
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setT1(s.t1);
                        setT2(s.t2);
                        setW1(s.w1);
                        setW2(s.w2);
                      }}
                      className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                    >
                      {s.name}
                      {r !== null ? ` · Rs ${r.toFixed(2)}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <FieldGrid>
            <NumberField
              label="Plate number (N)"
              value={N}
              onChange={setN}
              step="1"
              error={positiveError(N)}
              hint="Theoretical plates; HPLC columns are typically 5,000–25,000."
            />
            <NumberField
              label="Retention factor (k)"
              value={k}
              onChange={setK}
              step="0.01"
              error={positiveError(k)}
              hint="(tR − t₀) ÷ t₀ for the later peak; 2–10 is ideal."
            />
            <NumberField
              label="Selectivity (α)"
              value={alpha}
              onChange={setAlpha}
              step="0.01"
              error={positiveError(alpha)}
              hint="k₂ ÷ k₁; must be above 1 for any separation."
            />
          </FieldGrid>
        )}

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {R !== null && band && (
        <CalcSection title="Working">
          {method === "peaks" ? (
            <div>
              <ResultRow label="Separation (t₂ − t₁)" value={(parseFloat(t2) - parseFloat(t1)).toFixed(3)} unit="min" />
              <ResultRow label="Sum of widths (w₁ + w₂)" value={(parseFloat(w1) + parseFloat(w2)).toFixed(3)} unit="min" />
              <ResultRow label="Rs = 2 × separation ÷ sum" value={fmt2(R)} badge={band.label} />
            </div>
          ) : (
            efficiency && (
              <div>
                <ResultRow label="Efficiency term √N ÷ 4" value={efficiency.efficiency.toFixed(3)} />
                <ResultRow label="Selectivity term (α − 1) ÷ α" value={efficiency.selectivity.toFixed(4)} />
                <ResultRow label="Retention term k ÷ (1 + k)" value={efficiency.retention.toFixed(4)} />
                <ResultRow label="Rs (product)" value={fmt2(R)} badge={band.label} />
              </div>
            )
          )}
        </CalcSection>
      )}

      <CalcSection
        title="Simulated peaks"
        description={
          method === "peaks"
            ? "Two idealised peaks at your retention times, on a 0–10 min axis."
            : "The simulation needs retention times — switch to “From peak data” to draw it."
        }
      >
        {method === "peaks" && (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peakData} margin={{ top: 10, right: 12, left: -8, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Time (min)", position: "insideBottom", offset: -12, fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Line type="monotone" dataKey="signal" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CalcSection>

      <CalcSection title="Resolution criteria">
        <div>
          <ResultRow label="Baseline separation (USP requirement)" value="Rs ≥ 1.5" />
          <ResultRow label="About 94% separated" value="Rs = 1.0" />
          <ResultRow label="Significant overlap" value="Rs < 0.8" />
        </div>
        <p className="text-xs text-muted-foreground">
          Bands used here: below 1.0 Poor · 1.0–1.5 Baseline not achieved · 1.5–2.0 Good · 2.0 and above
          Excellent.
        </p>
      </CalcSection>

      <FormulaNote>
        <Formula>Rs = 2 (t₂ − t₁) ÷ (w₁ + w₂)</Formula>
        <p>
          t₁, t₂ = retention times of the two peaks; w₁, w₂ = their widths at the baseline, in the same
          unit. Resolution has no unit.
        </p>
        <Formula>Rs = (√N ÷ 4) × ((α − 1) ÷ α) × (k ÷ (1 + k))</Formula>
        <p>
          N = plate number (efficiency), α = selectivity (k₂/k₁), k = retention factor. This form shows
          which lever to pull: doubling N raises Rs only by √2, while a small increase in α often helps
          far more.
        </p>
        <p className="text-xs">Sources: USP &lt;621&gt;; Snyder, Introduction to Modern Liquid Chromatography.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Minutes or seconds?",
            a: "Either, as long as all four values use the same unit. The units cancel, so Rs is the same number.",
          },
          {
            q: "Why is my resolution negative?",
            a: "Retention time 2 was entered as the earlier peak. Resolution is defined for the later peak minus the earlier one; swap the two values.",
          },
          {
            q: "Which peak width should I use?",
            a: "The baseline width from tangents drawn to the sides of the peak (about 4σ). If your software reports width at half height, use Rs = 1.18 (t₂ − t₁) ÷ (w½,₁ + w½,₂) instead.",
          },
          {
            q: "What value do pharmacopoeias require?",
            a: "USP system suitability usually asks for Rs of at least 1.5 between the analyte and the closest eluting peak, though individual monographs can set their own limit.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
