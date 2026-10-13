"use client";

import { useMemo, useRef, useState } from "react";
import { Award, Eraser, FlaskConical, Star } from "lucide-react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND_SURFACE } from "@/components/page-kit/brand";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  CalcLearn,
  AdSlot,
  LabActions,
  LabNotice,
  type LabReportData,
  type LabReportSection,
} from "@/components/calculators";
import { LEARN } from "./_learn";
import { formatFixed } from "@/components/calculators/lab-math";
import {
  AXIS_TICK,
  CHART,
  ChartLegend,
  ChartPanel,
  DataTable,
  ExampleChips,
  PendingCard,
  ReportSteps,
  ResultTable,
  chartSvg,
  makeRows,
  makeTooltip,
  nextRowId,
  niceAxis,
  num,
  paren,
  signedTerm,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  analyseStability,
  interpretation,
  predictPercent,
  shelfLifeDisclaimer,
  C0_PERCENT,
  KINETIC_MODELS,
  LN2_SHEET,
  MAX_OBSERVATIONS,
  MIN_OBSERVATIONS,
  T90_FIRST_ORDER,
  type Order,
  type OrderFit,
} from "./_stability-kinetics";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TIME_UNITS = ["min", "h", "day"];

/**
 * The practical this calculator opens with: Procaine HCl at 50 °C. Inputs only —
 * every % remaining, fit, k, t½ and t90 is calculated from them. The single
 * definition feeds the initial state, Reset and the "load" chip.
 */
const DEFAULT_PRACTICAL = {
  drug: "Procaine HCl",
  temperature: "50",
  a0: "0.597",
  timeUnit: "min",
  rows: [
    ["5", "0.470"],
    ["10", "0.425"],
    ["15", "0.398"],
    ["20", "0.371"],
    ["25", "0.325"],
    ["30", "0.299"],
  ] as [string, string][],
};

const PLOT_TITLE: Record<Order, string> = {
  zero: "Zero-Order Kinetic Plot",
  first: "First-Order Kinetic Plot",
  second: "Second-Order Kinetic Plot",
};

const ORDER_COLOR: Record<Order, string> = { zero: CHART.primary, first: CHART.line, second: CHART.accent };

const blankRow = () => ({ time: "", absorbance: "" });
const defaultRows = () => makeRows(DEFAULT_PRACTICAL.rows.map(([time, absorbance]) => ({ time, absorbance })));

/** % remaining to two decimals, as the practical writes it. */
const pct = (value: number) => formatFixed(value, 2);
/** R² to four decimals in prose; tables show six. */
const r2Text = (value: number | null, decimals = 4) => (value === null ? "undefined" : formatFixed(value, decimals));

/** y = mx + b with the fitted values, x = time. */
function equation(fit: OrderFit): string {
  return `y = ${num(fit.fit.slope, 6)}x ${signedTerm(fit.fit.intercept, 6)}`;
}

/** What y and x stand for in that equation. */
const equationKey = (order: Order, timeUnit: string) => `y = ${KINETIC_MODELS[order].ySymbol}, x = time (${timeUnit})`;

export default function StabilityKineticsCalculatorPage() {
  const [drug, setDrug] = useState(DEFAULT_PRACTICAL.drug);
  const [temperature, setTemperature] = useState(DEFAULT_PRACTICAL.temperature);
  const [a0, setA0] = useState(DEFAULT_PRACTICAL.a0);
  const [timeUnit, setTimeUnit] = useState(DEFAULT_PRACTICAL.timeUnit);
  const [rows, setRows] = useState<TableRow[]>(defaultRows);
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({ time: row.cells.time ?? "", absorbance: row.cells.absorbance ?? "" }));

  const analysis = useMemo(
    () => analyseStability(a0, temperature, cells, submitted),
    // `cells` is derived from `rows` on every render, so `rows` is the real dependency.
    [rows, a0, temperature, submitted],
  );
  const result = analysis.rows;
  const best = analysis.best;
  const derived = analysis.derived;

  const drugName = drug.trim() || "the drug";
  const temp = temperature.trim();
  const atTemp = temp ? ` at ${temp}°C` : "";
  const unitK = best ? KINETIC_MODELS[best.order].kUnit(timeUnit) : "";

  const halfLifeText = derived?.halfLife.ok ? `${num(derived.halfLife.value, 4)} ${timeUnit}` : "not defined";
  const t90Text = derived?.t90.ok ? `${num(derived.t90.value, 4)} ${timeUnit}` : "not defined";
  const kText = best ? `${num(best.k, 5)} ${unitK}` : "—";
  const disclaimer = shelfLifeDisclaimer(drug.trim() || "the drug", temp);

  // ── Worked derivations for the determined order — formula, substitution, result ──
  const working = useMemo(() => {
    if (!best || !derived) return null;
    const model = KINETIC_MODELS[best.order];
    const slope = best.fit.slope;
    const kk = num(best.k, 6);
    const kLines = [
      model.kRule,
      best.order === "second" ? `k = ${num(slope, 6)}` : `k = −${paren(slope, 6)}`,
      `k = ${kk}`,
      `Units = ${unitK}`,
    ];

    const valid = derived.halfLife.ok && derived.t90.ok;
    const h = derived.halfLife.ok ? num(derived.halfLife.value, 6) : "";
    const t = derived.t90.ok ? num(derived.t90.value, 6) : "";
    const halfSub =
      best.order === "zero" ? `t½ = ${C0_PERCENT} / (2 × ${kk})`
      : best.order === "first" ? `t½ = ${LN2_SHEET} / ${kk}`
      : `t½ = 1 / (${kk} × ${C0_PERCENT})`;
    const t90Sub =
      best.order === "zero" ? `t90 = 10 / ${kk}`
      : best.order === "first" ? `t90 = ${T90_FIRST_ORDER} / ${kk}`
      : `t90 = 1/(${kk} × 90) − 1/(${kk} × 100)`;

    return {
      slope: [`Slope = ${num(slope, 6)}`],
      k: kLines,
      halfLife: [...model.halfLifeFormula, ...(valid ? [halfSub, `t½ = ${h} ${timeUnit}`] : [])],
      t90: [...model.t90Formula, ...(valid ? [t90Sub, `t90 = ${t} ${timeUnit}`] : [])],
    };
  }, [best, derived, unitK, timeUnit]);

  // ── Graph data: every coordinate comes from the analysis ──
  const chart = useMemo(() => {
    if (!result || !analysis.fits) return null;
    const times = result.map((r) => r.time);
    const xAxis = niceAxis(times, { includeZero: true });
    const tMin = xAxis.domain[0];
    const tMax = Math.max(...times);

    const plots = analysis.fits.map(({ order, result: fitted }) => {
      const model = KINETIC_MODELS[order];
      const points = result.map((r) => ({ x: r.time, y: model.transform(r.percent), series: "Experimental" }));
      const line = fitted.ok
        ? [tMin, tMax].map((x) => ({ x, y: fitted.value.fit.intercept + fitted.value.fit.slope * x }))
        : [];
      const axis = niceAxis([...points.map((p) => p.y), ...line.map((p) => p.y)]);
      return { order, points, line, axis, fit: fitted.ok ? fitted.value : null };
    });

    // The trend on the % remaining graph is the determined order's line, back-transformed —
    // a straight line only when zero order wins.
    const trend: { x: number; y: number }[] = [];
    if (best) {
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const x = tMin + ((tMax - tMin) * i) / steps;
        const y = predictPercent(best, x);
        if (y !== null && Number.isFinite(y)) trend.push({ x, y });
      }
    }
    const percentPoints = result.map((r) => ({ x: r.time, absorbance: r.absorbance, y: r.percent, series: "Experimental" }));
    const percentAxis = niceAxis([...percentPoints.map((p) => p.y), ...trend.map((p) => p.y)], { includeZero: true });

    return { xAxis, plots, trend, percentPoints, percentAxis };
  }, [result, analysis.fits, best]);

  const PercentTip = useMemo(
    () =>
      makeTooltip([
        { key: "x", label: `Time (${timeUnit})`, format: (v) => String(v) },
        { key: "absorbance", label: "Absorbance", format: (v) => String(v) },
        { key: "y", label: "% Remaining", format: (v) => `${pct(v)} %` },
      ]),
    [timeUnit],
  );
  const plotTips = useMemo(
    () =>
      Object.fromEntries(
        (["zero", "first", "second"] as Order[]).map((order) => [
          order,
          makeTooltip([
            { key: "x", label: `Time (${timeUnit})`, format: (v) => String(v) },
            { key: "y", label: KINETIC_MODELS[order].yLabel, format: (v) => (order === "zero" ? `${pct(v)} %` : num(v, 6)) },
          ]),
        ]),
      ) as Record<Order, ReturnType<typeof makeTooltip>>,
    [timeUnit],
  );

  const interpretationLines = useMemo(() => {
    if (!best || !result) return null;
    return interpretation({
      drug: drug.trim() || "the drug",
      temperature: temp,
      order: best.order,
      r2: r2Text(best.fit.r2),
      rateConstant: `k = ${kText}`,
      halfLife: halfLifeText,
      t90: t90Text,
      falling: result[result.length - 1].percent < result[0].percent,
    });
  }, [best, result, drug, temp, kText, halfLifeText, t90Text]);

  // ── The lab record: Steps 1–10, rendered on screen as "Complete Practical Calculation" ──
  const report = useMemo<LabReportData | null>(() => {
    if (!result || !analysis.fits || !best || !derived || !working || !interpretationLines) return null;

    const fitted = analysis.fits.flatMap((f) => (f.result.ok ? [f.result.value] : []));
    const fitRows = analysis.fits.map(({ order, result: f }) => {
      const model = KINETIC_MODELS[order];
      return f.ok
        ? [model.label, model.plot, num(f.value.fit.slope, 6), num(f.value.fit.intercept, 6), r2Text(f.value.fit.r2, 6), `${num(f.value.k, 5)} ${model.kUnit(timeUnit)}`]
        : [model.label, model.plot, "—", "—", "—", "—"];
    });

    const regression: LabReportSection["formulas"] = analysis.fits.flatMap(({ order, result: f }) => {
      const model = KINETIC_MODELS[order];
      if (!f.ok) return [`${model.label} order: ${f.error}`];
      const v = f.value.fit;
      return [
        `${model.label} order — ${model.plot}  (n = ${v.n})`,
        `  Σx = ${num(v.sumX, 6)}   Σy = ${num(v.sumY, 6)}   Σxy = ${num(v.sumXY, 6)}   Σx² = ${num(v.sumX2, 6)}`,
        `  m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²] = ${num(v.slopeNumerator, 6)} / ${num(v.denominator, 6)} = ${num(v.slope, 6)}`,
        `  b = (Σy − mΣx) / n = ${num(v.intercept, 6)}`,
        `  ${equation(f.value)}   (${equationKey(order, timeUnit)})`,
        `  SSE = Σ(y − ŷ)² = ${num(v.sse, 6)}   SST = Σ(y − ȳ)² = ${num(v.sst, 6)}`,
        `  R² = 1 − SSE/SST = 1 − ${num(v.sse, 6)} / ${num(v.sst, 6)} = ${r2Text(v.r2, 6)}`,
      ];
    });

    const sorted = [...fitted].sort((a, b) => (b.fit.r2 as number) - (a.fit.r2 as number));

    return {
      title: `${drug.trim() || "Drug"} Stability & Kinetics`,
      context: `Pharmaceutics · Accelerated stability${atTemp}`,
      sample: drug.trim() || undefined,
      result: {
        label: `Shelf life (t90)${atTemp}`,
        value: derived.t90.ok ? num(derived.t90.value, 4) : "not defined",
        unit: derived.t90.ok ? timeUnit : undefined,
      },
      warnings: analysis.warnings,
      sections: [
        {
          title: "Step 1 — Initial absorbance",
          rows: [
            { label: "A₀", value: a0.trim() },
            ...(temp ? [{ label: "Temperature", value: temp, unit: "°C" }] : []),
            { label: "Time points", value: String(result.length) },
          ],
        },
        {
          title: "Step 2 — Calculate % drug remaining = (Aₜ / A₀) × 100",
          formulas: result.map((r) => `At ${r.timeRaw} ${timeUnit}:  % Remaining = (${r.absorbanceRaw} / ${a0.trim()}) × 100 = ${pct(r.percent)} %`),
          lines: ["Beer–Lambert law under constant analytical conditions: A ∝ C, so the absorbance ratio is the concentration ratio."],
        },
        {
          title: "Step 3 — Transformed data",
          table: {
            columns: [`Time (${timeUnit})`, "% Remaining", "ln(% Remaining)", "1/% Remaining"],
            rows: result.map((r) => [r.timeRaw, pct(r.percent), num(r.lnPercent, 6), num(r.inversePercent, 6)]),
          },
          lines: ["Values are rounded here for display only; the regression uses them at full precision."],
        },
        {
          title: "Step 4 — Linear regression (least squares, x = time)",
          formulas: regression,
          table: {
            columns: [`Time (${timeUnit})`, ...fitted.map((f) => `Residual, ${KINETIC_MODELS[f.order].label.toLowerCase()} (y − ŷ)`)],
            rows: result.map((r, i) => [r.timeRaw, ...fitted.map((f) => num(f.residuals[i], 4))]),
          },
        },
        {
          title: "Step 5 — Compare R²",
          table: { columns: ["Order", "Plot", "Slope", "Intercept", "R²", "k"], rows: fitRows },
          lines: [
            `Ranked by R²: ${sorted.map((f) => `${KINETIC_MODELS[f.order].label} ${r2Text(f.fit.r2, 6)}`).join("  >  ")}.`,
            `${KINETIC_MODELS[best.order].label} order has the highest R², so its plot is the most linear.`,
          ],
        },
        {
          title: "Step 6 — Determine kinetic order",
          rows: [
            { label: "Determined order", value: `${KINETIC_MODELS[best.order].label} order` },
            { label: "Best R²", value: r2Text(best.fit.r2, 6) },
          ],
        },
        { title: "Step 7 — Calculate rate constant", formulas: [...working.slope, "Therefore:", ...working.k] },
        {
          title: `Step 8 — Calculate half-life (C₀ = ${C0_PERCENT} %)`,
          formulas: working.halfLife,
          lines: derived.halfLife.ok ? undefined : [derived.halfLife.error],
        },
        {
          title: "Step 9 — Calculate t90 (time to 90 % remaining)",
          formulas: working.t90,
          lines: derived.t90.ok ? undefined : [derived.t90.error],
        },
        { title: "Step 10 — Scientific interpretation", lines: interpretationLines },
      ],
      notes: [
        `C₀ is taken as ${C0_PERCENT} %, the practical's convention for % remaining data — not the fitted intercept.`,
        "Every value is rounded for display only; each step uses the full precision of the one before it.",
      ],
      figure: chart
        ? {
            svg: chartSvg({
              xLabel: `Time (${timeUnit})`,
              yLabel: "% Drug Remaining",
              includeZeroY: true,
              series: [
                { name: "Experimental", points: chart.percentPoints, kind: "points", color: CHART.primary },
                { name: `${KINETIC_MODELS[best.order].label}-order fit`, points: chart.trend, kind: "line", color: CHART.line, dashed: true },
              ],
            }),
            width: FIGURE_WIDTH,
            height: FIGURE_HEIGHT,
            caption: `Effect of time on % ${drug.trim() || "drug"} remaining${atTemp} · ${KINETIC_MODELS[best.order].label}-order fit, R² = ${r2Text(best.fit.r2)}`,
          }
        : undefined,
    };
  }, [result, analysis, best, derived, working, interpretationLines, chart, drug, temp, atTemp, a0, timeUnit]);

  // ── Actions ──
  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const loadDefault = () => {
    setDrug(DEFAULT_PRACTICAL.drug);
    setTemperature(DEFAULT_PRACTICAL.temperature);
    setA0(DEFAULT_PRACTICAL.a0);
    setTimeUnit(DEFAULT_PRACTICAL.timeUnit);
    setRows(defaultRows());
  };

  const clearTable = () => {
    setSubmitted(false);
    setRows((current) => current.map((row) => ({ ...row, cells: blankRow() })));
  };

  const reset = () => {
    setSubmitted(false);
    loadDefault();
  };

  const axisX = chart
    ? {
        type: "number" as const,
        dataKey: "x",
        domain: chart.xAxis.domain,
        ticks: chart.xAxis.ticks,
        tickFormatter: (v: number) => tickLabel(v, chart.xAxis.ticks),
        tick: AXIS_TICK,
        stroke: CHART.axis,
        label: { value: `Time (${timeUnit})`, position: "insideBottom" as const, offset: -16, fontSize: 12, fill: CHART.ink },
      }
    : null;

  const bestModel = best ? KINETIC_MODELS[best.order] : null;

  return (
    <CalculatorShell
      title="Drug Stability & Kinetics Calculator"
      subtitle="Turns a Time vs Absorbance stability practical into % drug remaining, fits zero-, first- and second-order plots, picks the order by R², and works out k, half-life and shelf life (t90). Opens with the Procaine HCl practical at 50°C."
      icon={FlaskConical}
      eyebrow="Pharmaceutics"
      aside={
        <>
          <CalcAbout title="About stability kinetics">
            <p>
              A drug held at a raised temperature degrades faster than on the shelf. Following its absorbance with
              time, and fitting the readings to each <strong>order of reaction</strong>, tells you how the rate
              depends on concentration — and from the rate constant, how long the drug takes to fall to 50 %
              (<strong>t½</strong>) and to 90 % (<strong>t90</strong>, the shelf life).
            </p>
            <CalcList
              title="Which plot is straight?"
              items={[
                "Zero order: % remaining vs time",
                "First order: ln(% remaining) vs time",
                "Second order: 1/(% remaining) vs time",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you report"
              items={[
                "A t90 at 50 °C is an accelerated estimate, not the labelled shelf life",
                "When two R² values are close, the order is not strongly decided",
                "A reading above A₀ means more than 100 % remaining — check the blank",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Experimental inputs">
        <FieldGrid>
          <TextField
            label="Drug"
            value={drug}
            onChange={setDrug}
            placeholder="e.g. Procaine HCl"
            hint="Printed on the result card and lab record."
          />
          <NumberField
            label="Temperature"
            value={temperature}
            onChange={setTemperature}
            unit="°C"
            error={analysis.temperatureError}
            placeholder="50"
            hint="An experimental condition — shown throughout, not used in the maths."
          />
          <NumberField
            label="Initial / reference absorbance (A₀)"
            value={a0}
            onChange={setA0}
            unit="AU"
            error={analysis.a0Error}
            placeholder="0.597"
            hint="The absorbance taken as 100 % drug."
          />
          <SelectField label="Time unit" value={timeUnit} onChange={setTimeUnit} options={TIME_UNITS} hint="k, t½ and t90 are reported in this unit." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Experimental data" description="Time | Absorbance — edit any value, add or delete rows. Everything below recalculates as you type.">
        <DataTable
          caption="Sampling times and absorbance readings"
          columns={[
            { key: "time", header: "Time", unit: timeUnit, placeholder: "5", inputClass: "w-[5.5rem]" },
            { key: "absorbance", header: "Absorbance", unit: "AU", placeholder: "0.470", inputClass: "w-[7rem]" },
          ]}
          rows={rows}
          rowHeader={(i) => `T${i + 1}`}
          onCell={(id, key, value) =>
            setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)))
          }
          onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
          onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: blankRow() }])}
          addLabel="Add row"
          minRows={MIN_OBSERVATIONS}
          maxRows={MAX_OBSERVATIONS}
          cellError={(i, key) => analysis.cellErrors[`${i}:${key}`]}
          rowMessage={(i) => {
            const message = analysis.cellErrors[`${i}:time`] ?? analysis.cellErrors[`${i}:absorbance`];
            return message ? { tone: "error", text: message } : undefined;
          }}
        />
        <div className="mt-3 flex flex-col gap-3">
          <ExampleChips items={[{ label: "Procaine HCl at 50 °C — the practical's data", apply: loadDefault }]} />
          <div>
            <Button type="button" variant="outline" size="sm" onClick={clearTable}>
              <Eraser />
              Clear table
            </Button>
          </div>
        </div>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="stability-kinetics" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {analysis.blocking.map((message) => (
          <LabNotice key={message} tone="danger" title="The kinetics cannot be calculated">
            {message}
          </LabNotice>
        ))}

        {report && result && best && bestModel && derived && working && chart && axisX && interpretationLines ? (
          <>
            {analysis.warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">
                {warning}
              </LabNotice>
            ))}

            {/* ── Final result card ── */}
            <section aria-live="polite" className="overflow-hidden rounded-2xl border border-blue-200 bg-card shadow-sm">
              <div className="px-4 py-4 text-white sm:px-6" style={{ background: BRAND_SURFACE }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">Stability result</p>
                <h2 className="mt-1 text-lg font-bold uppercase tracking-wide sm:text-xl">
                  {drug.trim() || "Drug"} stability{temp ? ` — ${temp}°C` : ""}
                </h2>
              </div>
              <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="space-y-3">
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Determined kinetic order</p>
                    <p className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">{bestModel.label} order</p>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      R² = <strong className="text-foreground">{r2Text(best.fit.r2)}</strong>
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shelf life (t90){atTemp}</p>
                    <p className="mt-1 break-words text-3xl font-extrabold leading-none tracking-tight tabular-nums text-foreground sm:text-4xl">
                      {derived.t90.ok ? num(derived.t90.value, 4) : "—"}
                      {derived.t90.ok && <span className="ml-1.5 text-base font-semibold text-muted-foreground">{timeUnit}</span>}
                    </p>
                  </div>
                </div>
                <dl className="divide-y rounded-xl border text-sm">
                  {[
                    ["Temperature", temp ? `${temp}°C` : "—"],
                    ["Initial absorbance", a0.trim()],
                    ["Final % drug remaining", `${pct(result[result.length - 1].percent)} %`],
                    ["Determined kinetic order", `${bestModel.label} order`],
                    ["R²", r2Text(best.fit.r2)],
                    ["Rate constant", kText],
                    ["Half-life", halfLifeText],
                    ["Shelf life (t90)", t90Text],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 px-3.5 py-2">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="text-right font-semibold tabular-nums text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="border-t bg-muted/40 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground sm:px-6">
                Experimental estimate{atTemp} — not the labeled product shelf life.
              </p>
            </section>

            {/* ── % drug remaining ── */}
            <CalcSection title="% drug remaining" description="% Drug Remaining = (Aₜ / A₀) × 100 — Beer–Lambert, A ∝ C.">
              <ResultTable
                caption="Absorbance converted to % drug remaining"
                columns={[`Time (${timeUnit})`, "Absorbance", "% Drug Remaining"]}
                rows={result.map((r) => [r.timeRaw, r.absorbanceRaw, `${pct(r.percent)} %`])}
                highlightColumn={2}
              />
            </CalcSection>

            {/* ── Transformed data ── */}
            <CalcSection
              title="Transformed data"
              description="Y₀ = % Remaining (zero order) · Y₁ = ln(% Remaining) (first order) · Y₂ = 1/% Remaining (second order)."
            >
              <ResultTable
                caption="Zero-, first- and second-order variables"
                columns={[`Time (${timeUnit})`, "% Remaining", "ln(% Remaining)", "1/% Remaining"]}
                rows={result.map((r) => [r.timeRaw, pct(r.percent), num(r.lnPercent, 6), num(r.inversePercent, 6)])}
              />
              <p className="mt-2 text-xs text-muted-foreground">Rounded for display; the regressions use full precision.</p>
            </CalcSection>

            {/* ── Kinetic model analysis ── */}
            <CalcSection title="Kinetic Model Analysis" description="Each plot is fitted by least squares; the highest R² decides the order.">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-max border-collapse text-sm">
                  <caption className="sr-only">Linear regression of the three kinetic plots</caption>
                  <thead className="bg-blue-50/80">
                    <tr>
                      {["Order", "Plot", "Slope", "Intercept", "R²", "k"].map((column) => (
                        <th key={column} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-foreground">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.fits!.map(({ order, result: fitted }) => {
                      const model = KINETIC_MODELS[order];
                      const winner = order === best.order;
                      return (
                        <tr key={order} className={cn("border-t", winner && "bg-green-50/80 font-semibold")}>
                          <td className="whitespace-nowrap px-3 py-2 text-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {winner && <Star aria-label="Best fit" className="h-3.5 w-3.5 fill-green-600 text-green-600" />}
                              {model.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-foreground">{model.plot}</td>
                          {fitted.ok ? (
                            <>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{num(fitted.value.fit.slope, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{num(fitted.value.fit.intercept, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r2Text(fitted.value.fit.r2, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                                {num(fitted.value.k, 5)} <span className="font-normal text-muted-foreground">{model.kUnit(timeUnit)}</span>
                              </td>
                            </>
                          ) : (
                            <td colSpan={4} className="px-3 py-2 text-destructive">{fitted.error}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 rounded-xl border border-l-[3px] border-l-green-600 bg-card px-4 py-3">
                <p className="text-base font-bold uppercase tracking-wide text-foreground">
                  Determined Order of Kinetics: {bestModel.label} order
                </p>
                <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                  Best R²: <strong className="text-foreground">{r2Text(best.fit.r2, 6)}</strong>
                  {analysis.runnerUp && analysis.margin !== null && !analysis.tie && (
                    <> · ahead of {KINETIC_MODELS[analysis.runnerUp].label.toLowerCase()} order by {analysis.margin.toFixed(4)}</>
                  )}
                </p>
              </div>
            </CalcSection>

            {/* ── Graphical kinetic analysis ── */}
            <CalcSection
              title="Graphical Kinetic Analysis"
              description={`Experimental data${atTemp}, plotted from the values above. Hover or tap a point for its exact value.`}
            >
              <div className="space-y-4">
                <ChartPanel
                  title={`Effect of Time on % ${drug.trim() || "Drug"} Remaining${atTemp}`}
                  footer={
                    <div className="space-y-2">
                      <p>Trend: the {bestModel.label.toLowerCase()}-order regression, drawn back as % remaining.</p>
                      <ChartLegend
                        items={[
                          { label: "Experimental", color: CHART.primary, shape: "dot" },
                          { label: `${bestModel.label}-order trend`, color: CHART.line, shape: "dash" },
                        ]}
                      />
                    </div>
                  }
                >
                  <ScatterChart margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis {...axisX} />
                    <YAxis
                      type="number"
                      dataKey="y"
                      domain={chart.percentAxis.domain}
                      ticks={chart.percentAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.percentAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={56}
                      label={{ value: "% Drug Remaining", angle: -90, position: "insideLeft", offset: 8, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <PercentTip active={props.active} payload={props.payload} />} />
                    <Scatter
                      name="Trend"
                      data={chart.trend}
                      line={{ stroke: CHART.line, strokeWidth: 2, strokeDasharray: "6 4" }}
                      shape={() => <g />}
                      legendType="none"
                      tooltipType="none"
                      isAnimationActive={false}
                    />
                    <Scatter name="Experimental" data={chart.percentPoints} fill={CHART.primary} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                  </ScatterChart>
                </ChartPanel>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {chart.plots.map((plot) => {
                    const model = KINETIC_MODELS[plot.order];
                    const winner = plot.order === best.order;
                    const Tip = plotTips[plot.order];
                    const color = ORDER_COLOR[plot.order];
                    return (
                      <ChartPanel
                        key={plot.order}
                        title={
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            {PLOT_TITLE[plot.order]}
                            {winner && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-800">
                                <Award className="h-3 w-3" aria-hidden />
                                Best fit · highest R²
                              </span>
                            )}
                          </span>
                        }
                        className={cn(winner && "border-green-500 ring-1 ring-green-500")}
                        footer={
                          <div className="space-y-2">
                            {plot.fit ? (
                              <p className="font-mono text-[12.5px] text-foreground">
                                {equation(plot.fit)} · R² = {r2Text(plot.fit.fit.r2)}
                                <span className="block font-sans text-[11px] text-muted-foreground">{equationKey(plot.order, timeUnit)}</span>
                              </p>
                            ) : (
                              <p>No regression line for this plot.</p>
                            )}
                            <ChartLegend
                              items={[
                                { label: "Experimental", color, shape: "dot" },
                                { label: "Regression line", color, shape: "line" },
                              ]}
                            />
                          </div>
                        }
                      >
                        <ScatterChart margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                          <XAxis {...axisX} />
                          <YAxis
                            type="number"
                            dataKey="y"
                            domain={plot.axis.domain}
                            ticks={plot.axis.ticks}
                            tickFormatter={(v: number) => tickLabel(v, plot.axis.ticks)}
                            tick={AXIS_TICK}
                            stroke={CHART.axis}
                            width={64}
                            label={{ value: model.yLabel, angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                          />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                          <Scatter
                            name="Regression line"
                            data={plot.line}
                            line={{ stroke: color, strokeWidth: 2 }}
                            shape={() => <g />}
                            legendType="none"
                            tooltipType="none"
                            isAnimationActive={false}
                          />
                          <Scatter name="Experimental" data={plot.points} fill={color} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                        </ScatterChart>
                      </ChartPanel>
                    );
                  })}

                  {/* ── Graph analysis summary ── */}
                  <div className="rounded-2xl border bg-card p-4 sm:p-5">
                    <p className="text-sm font-semibold text-foreground">Graph Analysis</p>
                    <dl className="mt-3 divide-y rounded-xl border text-sm">
                      {analysis.fits!.map(({ order, result: fitted }) => (
                        <div key={order} className={cn("flex items-baseline justify-between gap-4 px-3.5 py-2", order === best.order && "bg-green-50/70")}>
                          <dt className="text-muted-foreground">{KINETIC_MODELS[order].label}-order R²</dt>
                          <dd className="font-semibold tabular-nums text-foreground">{fitted.ok ? r2Text(fitted.value.fit.r2) : "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-green-200 bg-green-50/70 px-3.5 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Best-fit model</p>
                        <p className="mt-0.5 text-lg font-bold uppercase text-foreground">{bestModel.label} order</p>
                      </div>
                      <div className="rounded-xl border px-3.5 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Highest R²</p>
                        <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{r2Text(best.fit.r2)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Regression equation</p>
                    <p className="mt-1 rounded-lg bg-muted px-3 py-2 font-mono text-[12.5px] text-foreground">
                      {equation(best)}
                      <span className="block font-sans text-[11px] text-muted-foreground">{equationKey(best.order, timeUnit)}</span>
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      The kinetic model with the highest R² provides the best linear fit to the experimental data and is
                      therefore selected as the experimentally determined reaction order.
                    </p>
                  </div>
                </div>
              </div>
            </CalcSection>

            {/* ── k, t½, t90 ── */}
            <CalcSection
              title="Rate constant, half-life and shelf life"
              description={`From the ${bestModel.label.toLowerCase()}-order slope, with C₀ = ${C0_PERCENT} % because the data are % remaining.`}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {[
                  { title: "Rate Constant Calculation", lines: [...working.slope, "Therefore:", ...working.k], strong: working.slope.length + 3 /* "k = …" after Therefore, the rule and the substitution */, error: undefined },
                  { title: "Half-life (t½)", lines: working.halfLife, strong: working.halfLife.length - 1, error: derived.halfLife.ok ? undefined : derived.halfLife.error },
                  { title: "Shelf life (t90)", lines: working.t90, strong: working.t90.length - 1, error: derived.t90.ok ? undefined : derived.t90.error },
                ].map((block) => (
                  <div key={block.title} className="min-w-0 rounded-xl border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground">{block.title}</p>
                    <div className="mt-2 space-y-1">
                      {block.lines.map((line, i) => (
                        <p
                          key={i}
                          className={cn(
                            "whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed",
                            i === block.strong && !block.error ? "font-bold text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    {block.error && <p className="mt-2 text-xs text-destructive">{block.error}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50/70 px-4 py-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shelf Life (t90){atTemp}</p>
                <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-foreground">{t90Text}</p>
              </div>
            </CalcSection>

            {/* ── Interpretation ── */}
            <CalcSection title="Final interpretation">
              <div className="space-y-2 text-sm leading-relaxed text-foreground">
                {interpretationLines.slice(0, -1).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <LabNotice tone="info" title="Experimental estimate, not a labeled shelf life" className="mt-3">
                {disclaimer}
              </LabNotice>
            </CalcSection>

            {/* ── Steps 1–10: the same sections Copy / PNG / Print file ── */}
            <CalcSection title="Complete Practical Calculation" description="Every step, exactly as it goes into the lab record.">
              <ReportSteps sections={report.sections} />
            </CalcSection>
          </>
        ) : (
          analysis.blocking.length === 0 && (
            <PendingCard
              submitted={submitted}
              message="Enter A₀ and the time and absorbance of every reading to determine the order of kinetics."
            />
          )
        )}
      </div>

      <FormulaNote title="Scientific principle" defaultOpen>
        <p>
          {drugName === "the drug" ? "The drug" : drugName} undergoes degradation when exposed to elevated temperature.
          A temperature of {temp ? `${temp}°C` : "50°C"} accelerates chemical degradation compared with normal storage
          conditions.
        </p>
        <p>
          Under constant analytical conditions, the decrease in absorbance is assumed to represent a decrease in drug
          concentration according to Beer–Lambert behaviour:
        </p>
        <Formula>Absorbance ↓ → Drug concentration ↓ → % Drug remaining ↓ → Drug degradation ↑</Formula>
        <p>Kinetic analysis is then used to determine the mathematical order of degradation.</p>
      </FormulaNote>

      <FormulaNote title="How the calculator works" defaultOpen={false}>
        <p className="font-semibold text-foreground">1. % drug remaining</p>
        <Formula>% Remaining = (Aₜ / A₀) × 100</Formula>

        <p className="font-semibold text-foreground">2. Three linearised plots, each fitted by least squares</p>
        <Formula>Zero: C = C₀ − kt · First: ln C = ln C₀ − kt · Second: 1/C = 1/C₀ + kt</Formula>
        <p>
          For each plot the slope m and intercept b of y = mx + b come from the least-squares sums, then the predicted
          ŷ, the residuals y − ŷ, SSE = Σ(y − ŷ)², SST = Σ(y − ȳ)² and R² = 1 − SSE/SST. k = −slope for zero and first
          order and k = slope for second order. The order with the highest R² is reported — nothing is assumed.
        </p>

        <p className="font-semibold text-foreground">3. Half-life and shelf life (C₀ = 100 %)</p>
        <Formula>Zero: t½ = 100 / 2k, t90 = 10 / k</Formula>
        <Formula>First: t½ = 0.693 / k, t90 = 0.10536 / k</Formula>
        <Formula>Second: t½ = 1 / (kC₀), t90 = 1/(k × 90) − 1/(k × 100)</Formula>
        <p>
          These assume the drug starts at 100 % at t = 0. The fitted intercept is usually a little different — the first
          reading is taken after degradation has begun — so t90 is a rate-based estimate, not a value read off the
          table. The intercept is shown in the Kinetic Model Analysis table.
        </p>
        <p>Temperature is recorded as the condition of the run. It does not change k: that needs runs at several temperatures and an Arrhenius plot.</p>
      </FormulaNote>

      <CalcLearn content={LEARN} />

      <CalcFaq
        items={[
          {
            q: "Why isn't the order simply first order?",
            a: "Because it has to be measured, not assumed. The calculator fits all three plots and reports the one with the highest R². With the Procaine HCl practical's data, zero order narrowly beats first order — a hard-coded first order would get that wrong.",
          },
          {
            q: "The R² values are very close. Which should I report?",
            a: "The practical's rule is the highest R², and that is what the calculator reports. When the gap is under 0.01 it also says the models are hard to separate — over 50 % degradation and six points, zero and first order often look alike. Following the reaction further, or adding time points, separates them.",
          },
          {
            q: "Why is C₀ = 100 % rather than the intercept?",
            a: "Because the data are expressed as % remaining, and the practical defines the starting amount as 100 %. The intercept of each fitted line is printed in the Kinetic Model Analysis table, so you can see how far it sits from 100.",
          },
          {
            q: "Is the t90 the shelf life printed on the pack?",
            a: "No. It is an experimental degradation estimate at the test temperature. A labeled shelf life comes from long-term studies at the recommended storage condition, usually supported by Arrhenius extrapolation across several temperatures.",
          },
          {
            q: "Does changing the temperature change the answer?",
            a: "No. A single run gives k at that temperature only; the temperature is recorded and shown as the experimental condition. Predicting k at another temperature needs data at several temperatures.",
          },
          {
            q: "How many readings do I need?",
            a: "Two points are the minimum for a straight line, but any two points fit every model exactly (R² = 1), so the order cannot be decided from them. The calculator warns below four readings; the practical uses six.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
