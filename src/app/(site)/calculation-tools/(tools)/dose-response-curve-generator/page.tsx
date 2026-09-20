"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
} from "recharts";
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/calculators";
import { generateCurveData, safeEc50, type CurveParams } from "./_curves";

const COLOR_PALETTE = ["#1C7BD9", "#21B67A", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const SAMPLE_DRUGS = [
  { name: "Morphine", ec50: 10, emax: 100, hill: 1.2 },
  { name: "Aspirin", ec50: 100, emax: 80, hill: 1.0 },
  { name: "Propranolol", ec50: 1, emax: 100, hill: 0.8 },
  { name: "Fentanyl", ec50: 0.1, emax: 100, hill: 1.5 },
  { name: "Diazepam", ec50: 20, emax: 90, hill: 1.1 },
];

type ScaleMode = "linear" | "log";

export default function DoseResponseCurveGenerator() {
  const [curves, setCurves] = useState<CurveParams[]>([
    { id: "1", name: "Drug A", emax: 100, ec50: 10, hill: 1, baseline: 0, color: COLOR_PALETTE[0] },
  ]);
  const [maxConc, setMaxConc] = useState(100);
  const [nextId, setNextId] = useState(2);
  const [scale, setScale] = useState<ScaleMode>("log");

  const { linearData, logData, yDomainMax } = useMemo(
    () => generateCurveData(curves, maxConc),
    [curves, maxConc],
  );

  const addCurve = () => {
    setCurves([
      ...curves,
      {
        id: nextId.toString(),
        name: `Drug ${String.fromCharCode(65 + curves.length)}`,
        emax: 100,
        ec50: 10,
        hill: 1,
        baseline: 0,
        color: COLOR_PALETTE[curves.length % COLOR_PALETTE.length],
      },
    ]);
    setNextId(nextId + 1);
  };

  const removeCurve = (id: string) => {
    if (curves.length <= 1) return;
    setCurves(curves.filter((c) => c.id !== id));
  };

  const updateCurve = (id: string, field: keyof CurveParams, value: number | string) => {
    setCurves(curves.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const loadSample = (index: number) => {
    const drug = SAMPLE_DRUGS[index];
    setCurves([
      {
        id: "1",
        name: drug.name,
        emax: drug.emax,
        ec50: drug.ec50,
        hill: drug.hill,
        baseline: 0,
        color: COLOR_PALETTE[0],
      },
    ]);
  };

  const reset = () => {
    setCurves([
      { id: "1", name: "Drug A", emax: 100, ec50: 10, hill: 1, baseline: 0, color: COLOR_PALETTE[0] },
    ]);
    setMaxConc(100);
    setNextId(2);
  };

  // EC50 markers sit at each curve's own half-maximal effect (baseline + Emax/2),
  // not at a fixed y = 50 — that only coincides when baseline is 0 and Emax is 100.
  const ec50PointsLinear = curves.map((curve) => ({
    conc: curve.ec50,
    effect: curve.baseline + curve.emax / 2,
    name: curve.name,
  }));
  const ec50PointsLog = curves.map((curve) => ({
    logConc: Math.log10(safeEc50(curve.ec50)),
    effect: curve.baseline + curve.emax / 2,
    name: curve.name,
  }));

  const primary = curves[0];
  const showReferenceLines = curves.length <= 2;

  return (
    <CalculatorShell
      title="Dose-Response Curve Generator"
      subtitle="Plots the sigmoid Emax (Hill) equation for one or more drugs on linear and log-dose axes, so potency and efficacy can be compared side by side."
      icon={TrendingUp}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About dose-response curves">
            <p>
              A dose-response curve separates two things students often conflate.{" "}
              <strong>Potency</strong> is where the curve sits on the concentration axis (EC₅₀);{" "}
              <strong>efficacy</strong> is how high it climbs (Emax). A more potent drug is not
              necessarily a more effective one.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Comparing a full agonist with a partial agonist",
                "Showing why the log-dose plot is the one that looks sigmoid",
                "Exploring what the Hill coefficient does to curve steepness",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "These are idealised curves from an equation, not fitted experimental data.",
                "EC₅₀ marks half of that curve's own maximum (baseline + Emax/2), so it is not at y = 50 unless baseline is 0 and Emax is 100.",
                "A Hill coefficient far from 1 implies cooperativity — a single-site model may not be appropriate.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label={curves.length === 1 ? `${primary.name} · EC₅₀` : `${curves.length} curves plotted`}
        value={curves.length === 1 ? String(primary.ec50) : String(curves.length)}
        unit={curves.length === 1 ? "nM" : "curves"}
        interpretation={
          curves.length === 1
            ? `Emax ${primary.emax}%, Hill n = ${primary.hill}, baseline ${primary.baseline}%`
            : curves.map((c) => `${c.name} EC₅₀ ${c.ec50}`).join(" · ")
        }
        tone="neutral"
      />

      <CalcSection title="Scale">
        <ModeSwitch<ScaleMode>
          label="Concentration axis"
          value={scale}
          onChange={setScale}
          options={[
            { value: "log", label: "Log-dose", description: "The classic sigmoid shape" },
            { value: "linear", label: "Linear", description: "True concentration axis" },
          ]}
        />
      </CalcSection>

      <CalcSection
        title={scale === "log" ? "Log-dose scale" : "Linear scale"}
        description={
          scale === "log"
            ? "Effect against log₁₀ concentration. Black dots mark each curve's EC₅₀."
            : "Effect against concentration. Black dots mark each curve's EC₅₀."
        }
      >
        <div className="h-72 w-full sm:h-96">
          {(scale === "log" ? logData : linearData).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={scale === "log" ? logData : linearData}
                margin={{ top: 28, right: 16, left: 4, bottom: 28 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey={scale === "log" ? "logConc" : "conc"}
                  type="number"
                  fontSize={11}
                  tickCount={6}
                  domain={scale === "log" ? ["dataMin", "dataMax"] : [0, maxConc]}
                  tickFormatter={(v: number) => (scale === "log" ? v.toFixed(1) : String(v))}
                  label={{
                    value: scale === "log" ? "log₁₀ concentration (nM)" : "Concentration (nM)",
                    position: "insideBottom",
                    offset: -16,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  domain={[0, yDomainMax]}
                  fontSize={11}
                  width={48}
                  label={{ value: "Effect (%)", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0).toFixed(1)} %`, "Effect"]}
                  labelFormatter={(l) =>
                    scale === "log"
                      ? `log₁₀[C] = ${Number(l).toFixed(2)}`
                      : `[C] = ${Number(l).toFixed(2)} nM`
                  }
                />
                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
                {curves.map((curve) => (
                  <Line
                    key={curve.id}
                    type="monotone"
                    dataKey={curve.id}
                    stroke={curve.color}
                    strokeWidth={2.5}
                    dot={false}
                    name={curve.name}
                    isAnimationActive={false}
                  />
                ))}
                {showReferenceLines &&
                  curves.map((curve) => (
                    <ReferenceLine
                      key={`v-${curve.id}`}
                      x={scale === "log" ? Math.log10(safeEc50(curve.ec50)) : curve.ec50}
                      stroke={curve.color}
                      strokeDasharray="3 3"
                      label={{ value: `${curve.name} EC₅₀`, position: "top", fill: curve.color, fontSize: 10 }}
                    />
                  ))}
                {showReferenceLines &&
                  curves.map((curve) => (
                    <ReferenceLine
                      key={`h-${curve.id}`}
                      y={curve.baseline + curve.emax / 2}
                      stroke={curve.color}
                      strokeDasharray="2 2"
                      strokeOpacity={0.5}
                    />
                  ))}
                <Scatter
                  data={scale === "log" ? ec50PointsLog : ec50PointsLinear}
                  dataKey="effect"
                  fill="#0f172a"
                  shape="circle"
                  legendType="none"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No data — adjust the parameters or add a curve.
            </div>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Black dots mark each curve&apos;s true EC₅₀ point (baseline + Emax/2) — not a fixed y = 50,
          since baseline and Emax vary per drug.
        </p>
      </CalcSection>

      <CalcSection
        title="Curves"
        description="Each drug is one set of Hill parameters. Add a second to compare potency against efficacy."
      >
        <div className="space-y-4">
          {curves.map((curve) => (
            <div key={curve.id} className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: curve.color }}
                  aria-hidden="true"
                />
                <Input
                  value={curve.name}
                  onChange={(e) => updateCurve(curve.id, "name", e.target.value)}
                  aria-label="Curve name"
                  className="h-9 max-w-[16rem] font-medium"
                />
                {curves.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCurve(curve.id)}
                    aria-label={`Remove ${curve.name}`}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FieldGrid>
                <NumberField
                  label="Emax"
                  value={String(curve.emax)}
                  onChange={(v) => updateCurve(curve.id, "emax", parseFloat(v) || 0)}
                  unit="%"
                  step="1"
                  hint="Maximum effect above baseline — efficacy."
                />
                <NumberField
                  label="EC₅₀"
                  value={String(curve.ec50)}
                  onChange={(v) => updateCurve(curve.id, "ec50", parseFloat(v) || 0.001)}
                  unit="nM"
                  step="0.01"
                  hint="Concentration giving half of Emax — potency."
                />
                <NumberField
                  label="Hill coefficient n"
                  value={String(curve.hill)}
                  onChange={(v) => updateCurve(curve.id, "hill", parseFloat(v) || 0.1)}
                  step="0.1"
                  hint="Steepness. n = 1 is a simple single-site curve."
                />
                <NumberField
                  label="Baseline E₀"
                  value={String(curve.baseline)}
                  onChange={(v) => updateCurve(curve.id, "baseline", parseFloat(v) || 0)}
                  unit="%"
                  step="1"
                  hint="Effect present with no drug at all."
                />
              </FieldGrid>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={addCurve}>
            <Plus className="mr-1.5 h-4 w-4" /> Add curve
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Plot settings">
        <FieldGrid>
          <NumberField
            label="Maximum concentration"
            value={String(maxConc)}
            onChange={(v) => setMaxConc(parseFloat(v) || 0)}
            unit="nM"
            step="1"
            min={0}
            hint="Sets the right-hand end of the linear axis only."
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Load a sample drug</span>
          {SAMPLE_DRUGS.map((d, i) => (
            <Button
              key={d.name}
              type="button"
              variant="outline"
              size="sm"
              title={`EC₅₀ ${d.ec50} nM, Emax ${d.emax}%, n = ${d.hill}`}
              onClick={() => loadSample(i)}
            >
              {d.name}
            </Button>
          ))}
        </div>
      </CalcSection>

      {curves.length > 1 && (
        <CalcSection title="Comparison" description="Potency and efficacy of each curve side by side.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Curve</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">EC₅₀ (nM)</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Emax (%)</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Hill n</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Baseline (%)</th>
                </tr>
              </thead>
              <tbody>
                {curves.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{c.ec50}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.emax}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.hill}</td>
                    <td className="py-2 tabular-nums">{c.baseline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcSection>
      )}

      {curves.length === 1 && (
        <CalcSection title="Working" description="Key points read off this curve.">
          <div>
            <ResultRow label="Effect with no drug (baseline)" value={primary.baseline} unit="%" />
            <ResultRow label="Effect at EC₅₀" value={(primary.baseline + primary.emax / 2).toFixed(1)} unit="%" />
            <ResultRow label="Effect approaching saturation" value={(primary.baseline + primary.emax).toFixed(1)} unit="%" />
            <ResultRow label="Concentration for 90% of Emax" value={(safeEc50(primary.ec50) * Math.pow(9, 1 / primary.hill)).toFixed(3)} unit="nM" />
            <ResultRow label="Y-axis plotted to" value={yDomainMax} unit="%" />
          </div>
        </CalcSection>
      )}

      {curves.some((c) => c.baseline + c.emax > 100) && (
        <LabNotice tone="info" title="Y axis extended past 100%">
          Baseline plus Emax exceeds 100% on at least one curve, so the axis has been scaled to{" "}
          {yDomainMax}% rather than clamped — clamping would flatten the top of the curve and
          misrepresent it.
        </LabNotice>
      )}

      <FormulaNote title="How this is calculated">
        <p>Every curve is the sigmoid Emax (Hill) equation:</p>
        <Formula>E = E₀ + (Emax × C ⁿ) / (EC₅₀ ⁿ + C ⁿ)</Formula>
        <p>
          <strong>E₀</strong> is the baseline effect with no drug, <strong>Emax</strong> the maximum
          effect above that baseline, <strong>C</strong> the concentration, <strong>EC₅₀</strong> the
          concentration producing half of Emax, and <strong>n</strong> the Hill coefficient.
        </p>
        <p>
          At C = EC₅₀ the two powered terms are equal, so the fraction is exactly ½ and the effect is
          E₀ + Emax/2 — which is where the markers sit. The concentration needed for 90% of Emax is
          EC₅₀ × 9^(1/n), so a steeper curve (larger n) reaches saturation over a narrower range.
        </p>
        <p>
          Each axis is drawn from 151 points. An EC₅₀ of zero or below is substituted with 0.001 nM to
          keep the logarithm defined.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why does the log-dose plot look sigmoid but the linear one does not?",
            a: "They are the same equation. On a linear axis the curve is a rectangular hyperbola that rises steeply and flattens; taking logs of the concentration stretches the low end and compresses the high end, which straightens the middle into the familiar S-shape and makes EC₅₀ easy to read off.",
          },
          {
            q: "What does the Hill coefficient actually change?",
            a: "Steepness. n = 1 gives a simple single-site curve spanning about two log units from 10% to 90% effect. n above 1 (positive cooperativity, like haemoglobin binding oxygen) makes the curve steeper; n below 1 makes it shallower.",
          },
          {
            q: "Is a lower EC₅₀ always better?",
            a: "No. A low EC₅₀ means high potency — less drug is needed — but says nothing about how large an effect is achievable. A partial agonist can be very potent and still have a low Emax, which is why both numbers are plotted here.",
          },
          {
            q: "Why is the EC₅₀ dot not at 50% on my curve?",
            a: "Because EC₅₀ is half of that curve's own maximum, measured from its baseline. With a baseline of 20% and an Emax of 60%, the half-maximal point is at 50% — but with a baseline of 0 and an Emax of 80%, it is at 40%.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
