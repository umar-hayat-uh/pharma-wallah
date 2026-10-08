"use client";

import { useMemo, useRef, useState } from "react";
import { Eraser, FlaskConical, Star } from "lucide-react";
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
  AdSlot,
  LabActions,
  LabNotice,
  type LabReportData,
  type LabReportSection,
} from "@/components/calculators";
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
  kUnit,
  predictPercent,
  C0_PERCENT,
  LN2_SHEET,
  MAX_OBSERVATIONS,
  MIN_OBSERVATIONS,
  ORDER_LABEL,
  ORDER_PLOT,
  T90_FIRST_ORDER,
  type Order,
  type OrderFit,
} from "./_stability-kinetics";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TIME_UNITS = ["min", "h", "day"];

/** The practical sheet this calculator reproduces. Inputs only — every result is calculated. */
const SHEET_EXAMPLE = {
  label: "Procaine HCl at 50 °C — A₀ = 0.597, six readings",
  drug: "Procaine HCl",
  temperature: "50",
  a0: "0.597",
  rows: [
    ["5", "0.470"],
    ["10", "0.425"],
    ["15", "0.398"],
    ["20", "0.371"],
    ["25", "0.325"],
    ["30", "0.299"],
  ] as [string, string][],
};

/** The y quantity each order plots, for axis labels and tooltips. */
const Y_LABEL: Record<Order, string> = {
  zero: "% Drug Remaining",
  first: "ln(% Drug Remaining)",
  second: "1/(% Drug Remaining)",
};

const ORDER_COLOR: Record<Order, string> = { zero: CHART.primary, first: CHART.line, second: CHART.accent };

const blankRow = () => ({ time: "", absorbance: "" });

const INITIAL_ROWS = 6;

/** % remaining to two decimals, as the practical writes it. */
const pct = (value: number) => formatFixed(value, 2);
/** R² to four decimals in prose; the comparison table shows six. */
const r2Text = (value: number | null, decimals = 4) => (value === null ? "undefined" : formatFixed(value, decimals));

/** y = intercept + slope·t, the way each plot's line is written on the sheet. */
function equation(fit: OrderFit, timeUnit: string): string {
  const y = fit.order === "zero" ? "%R" : fit.order === "first" ? "ln(%R)" : "1/%R";
  return `${y} = ${num(fit.fit.intercept, 6)} ${signedTerm(fit.fit.slope, 6)}·t  (t in ${timeUnit})`;
}

export default function StabilityKineticsCalculatorPage() {
  const [drug, setDrug] = useState("");
  const [temperature, setTemperature] = useState("");
  const [a0, setA0] = useState("");
  const [timeUnit, setTimeUnit] = useState("min");
  const [rows, setRows] = useState<TableRow[]>(() => makeRows(Array.from({ length: INITIAL_ROWS }, blankRow)));
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
  const unitK = best ? kUnit(best.order, timeUnit) : "";

  const halfLifeText = derived?.halfLife.ok ? `${num(derived.halfLife.value, 4)} ${timeUnit}` : "not defined";
  const t90Text = derived?.t90.ok ? `${num(derived.t90.value, 4)} ${timeUnit}` : "not defined";
  const kText = best ? `${num(best.k, 5)} ${unitK}` : "—";

  // ── Worked derivations for the determined order ──
  const working = useMemo(() => {
    if (!best || !derived) return null;
    const slope = best.fit.slope;
    const k = best.k;
    const kLine =
      best.order === "second"
        ? ["k = slope", `k = ${num(slope, 6)}`, `k = ${num(k, 6)} ${unitK}`]
        : ["k = −slope", `k = −${paren(slope, 6)}`, `k = ${num(k, 6)} ${unitK}`];

    const ok = derived.halfLife.ok && derived.t90.ok;
    const h = derived.halfLife.ok ? num(derived.halfLife.value, 6) : "";
    const t = derived.t90.ok ? num(derived.t90.value, 6) : "";
    const kk = num(k, 6);
    let halfLife: string[];
    let t90: string[];
    if (best.order === "zero") {
      halfLife = ["t½ = C₀ / 2k", ...(ok ? [`t½ = ${C0_PERCENT} / (2 × ${kk})`, `t½ = ${h} ${timeUnit}`] : [])];
      t90 = ["t90 = 0.10 C₀ / k", ...(ok ? [`t90 = (0.10 × ${C0_PERCENT}) / ${kk}`, `t90 = ${t} ${timeUnit}`] : [])];
    } else if (best.order === "first") {
      halfLife = [`t½ = ${LN2_SHEET} / k`, ...(ok ? [`t½ = ${LN2_SHEET} / ${kk}`, `t½ = ${h} ${timeUnit}`] : [])];
      t90 = [`t90 = ${T90_FIRST_ORDER} / k`, ...(ok ? [`t90 = ${T90_FIRST_ORDER} / ${kk}`, `t90 = ${t} ${timeUnit}`] : [])];
    } else {
      halfLife = ["t½ = 1 / (k C₀)", ...(ok ? [`t½ = 1 / (${kk} × ${C0_PERCENT})`, `t½ = ${h} ${timeUnit}`] : [])];
      t90 = [
        "t90 = 1/(k × 90) − 1/(k × 100)  =  1 / (900k)",
        ...(ok ? [`t90 = 1/(${kk} × 90) − 1/(${kk} × 100)`, `t90 = ${t} ${timeUnit}`] : []),
      ];
    }
    return { slope: [`Slope = ${num(slope, 6)}`], k: kLine, halfLife, t90 };
  }, [best, derived, unitK, timeUnit]);

  // ── Graph data ──
  const chart = useMemo(() => {
    if (!result || !analysis.fits) return null;
    const times = result.map((r) => r.time);
    const xAxis = niceAxis(times, { includeZero: true });
    const tMin = xAxis.domain[0];
    const tMax = Math.max(...times);

    const ys: Record<Order, number[]> = {
      zero: result.map((r) => r.percent),
      first: result.map((r) => r.lnPercent),
      second: result.map((r) => r.inversePercent),
    };

    const plots = analysis.fits.map(({ order, result: fitted }) => {
      const points = result.map((r, i) => ({ x: r.time, y: ys[order][i], series: "Experimental" }));
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
    const percentPoints = result.map((r) => ({ x: r.time, y: r.percent, series: "Experimental" }));
    const percentAxis = niceAxis([...percentPoints.map((p) => p.y), ...trend.map((p) => p.y)], { includeZero: true });

    return { xAxis, plots, trend, percentPoints, percentAxis };
  }, [result, analysis.fits, best]);

  const tipFor = (label: string, format: (v: number) => string) =>
    makeTooltip([
      { key: "x", label: `Time (${timeUnit})`, format: (v) => String(v) },
      { key: "y", label, format },
    ]);
  const PercentTip = useMemo(() => tipFor("% remaining", (v) => `${pct(v)} %`), [timeUnit]);
  const LnTip = useMemo(() => tipFor("ln(% remaining)", (v) => num(v, 6)), [timeUnit]);
  const InverseTip = useMemo(() => tipFor("1/% remaining", (v) => num(v, 6)), [timeUnit]);
  const TIPS: Record<Order, ReturnType<typeof tipFor>> = { zero: PercentTip, first: LnTip, second: InverseTip };

  const interpretationLines = useMemo(() => {
    if (!best || !result) return null;
    return interpretation({
      drug: drug.trim() || "the drug",
      temperature: temp,
      order: best.order,
      r2: r2Text(best.fit.r2),
      rateConstant: kText,
      halfLife: halfLifeText,
      t90: t90Text,
      falling: result[result.length - 1].percent < result[0].percent,
    });
  }, [best, result, drug, temp, kText, halfLifeText, t90Text]);

  // ── The lab record: Steps 1–10, rendered on screen as "Complete Practical Calculation" ──
  const report = useMemo<LabReportData | null>(() => {
    if (!result || !analysis.fits || !best || !derived || !working || !interpretationLines) return null;

    const fitRows = analysis.fits.map(({ order, result: fitted }) =>
      fitted.ok
        ? [
            ORDER_LABEL[order],
            ORDER_PLOT[order],
            num(fitted.value.fit.slope, 6),
            num(fitted.value.fit.intercept, 6),
            r2Text(fitted.value.fit.r2, 6),
            `${num(fitted.value.k, 5)} ${kUnit(order, timeUnit)}`,
          ]
        : [ORDER_LABEL[order], ORDER_PLOT[order], "—", "—", "—", "—"],
    );

    const regression: LabReportSection["formulas"] = analysis.fits.flatMap(({ order, result: fitted }) => {
      if (!fitted.ok) return [`${ORDER_LABEL[order]} order: ${fitted.error}`];
      const f = fitted.value.fit;
      return [
        `${ORDER_LABEL[order]} order — ${ORDER_PLOT[order]}  (n = ${f.n})`,
        `  Σx = ${num(f.sumX, 6)}   Σy = ${num(f.sumY, 6)}   Σxy = ${num(f.sumXY, 6)}   Σx² = ${num(f.sumX2, 6)}`,
        `  slope = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²] = ${num(f.slopeNumerator, 6)} / ${num(f.denominator, 6)} = ${num(f.slope, 6)}`,
        `  intercept = (Σy − slope·Σx) / n = ${num(f.intercept, 6)}`,
        `  R² = 1 − SSE/SST = 1 − ${num(f.sse, 6)} / ${num(f.sst, 6)} = ${r2Text(f.r2, 6)}`,
      ];
    });

    const sorted = analysis.fits
      .flatMap((f) => (f.result.ok ? [f.result.value] : []))
      .sort((a, b) => (b.fit.r2 as number) - (a.fit.r2 as number));

    return {
      title: `${drug.trim() || "Drug"} Stability Kinetics`,
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
          title: "Step 1 — Initial (reference) absorbance",
          rows: [
            { label: "A₀", value: a0.trim() },
            ...(temp ? [{ label: "Temperature", value: temp, unit: "°C" }] : []),
            { label: "Time points", value: String(result.length) },
          ],
        },
        {
          title: "Step 2 — % drug remaining = (Aₜ / A₀) × 100",
          formulas: result.map((r) => `t = ${r.timeRaw} ${timeUnit}:  (${r.absorbanceRaw} / ${a0.trim()}) × 100 = ${pct(r.percent)} %`),
          lines: ["Beer–Lambert law under constant analytical conditions: A ∝ C, so the absorbance ratio is the concentration ratio."],
        },
        {
          title: "Step 3 — Transformed values",
          table: {
            columns: [`Time (${timeUnit})`, "Absorbance", "% Remaining", "ln(% Remaining)", "1/% Remaining"],
            rows: result.map((r) => [r.timeRaw, r.absorbanceRaw, pct(r.percent), num(r.lnPercent, 6), num(r.inversePercent, 6)]),
          },
        },
        {
          title: "Step 4 — Linear regression (least squares, x = time)",
          formulas: regression,
        },
        {
          title: "Step 5 — Compare R²",
          table: { columns: ["Order", "Plot", "Slope", "Intercept", "R²", "k"], rows: fitRows },
          lines: [`Ranked by R²: ${sorted.map((f) => `${ORDER_LABEL[f.order]} ${r2Text(f.fit.r2, 6)}`).join("  >  ")}`],
        },
        {
          title: "Step 6 — Order of kinetics",
          rows: [
            { label: "Determined order", value: `${ORDER_LABEL[best.order]} order` },
            { label: "Best R²", value: r2Text(best.fit.r2, 6) },
          ],
          lines: ["The order whose linearised plot has the highest R² is taken as the best fit."],
        },
        { title: "Step 7 — Rate constant", formulas: [...working.slope, ...working.k] },
        { title: "Step 8 — Half-life (C₀ = 100 %)", formulas: working.halfLife, lines: derived.halfLife.ok ? undefined : [derived.halfLife.error] },
        { title: "Step 9 — Shelf life, t90 (time to 90 % remaining)", formulas: working.t90, lines: derived.t90.ok ? undefined : [derived.t90.error] },
        { title: "Step 10 — Interpretation", lines: interpretationLines },
      ],
      notes: [
        "C₀ is taken as 100 %, the practical's convention for % remaining data — not the fitted intercept.",
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
                { name: `${ORDER_LABEL[best.order]}-order fit`, points: chart.trend, kind: "line", color: CHART.line, dashed: true },
              ],
            }),
            width: FIGURE_WIDTH,
            height: FIGURE_HEIGHT,
            caption: `Effect of time on % ${drug.trim() || "drug"} remaining${atTemp} · ${ORDER_LABEL[best.order]}-order fit, R² = ${r2Text(best.fit.r2)}`,
          }
        : undefined,
    };
  }, [result, analysis, best, derived, working, interpretationLines, chart, drug, temp, atTemp, a0, timeUnit]);

  // ── Actions ──
  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const clearTable = () => {
    setSubmitted(false);
    setRows((current) => current.map((row) => ({ ...row, cells: blankRow() })));
  };

  const reset = () => {
    setSubmitted(false);
    setDrug("");
    setTemperature("");
    setA0("");
    setTimeUnit("min");
    setRows(makeRows(Array.from({ length: INITIAL_ROWS }, blankRow)));
  };

  const applyExample = () => {
    setDrug(SHEET_EXAMPLE.drug);
    setTemperature(SHEET_EXAMPLE.temperature);
    setA0(SHEET_EXAMPLE.a0);
    setTimeUnit("min");
    setRows(makeRows(SHEET_EXAMPLE.rows.map(([time, absorbance]) => ({ time, absorbance }))));
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

  return (
    <CalculatorShell
      title="Drug Stability Kinetics Calculator"
      subtitle="Turns a Time vs Absorbance stability practical into % drug remaining, fits zero-, first- and second-order plots, picks the order by R², and works out k, half-life and shelf life (t90)."
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
      <CalcSection title="Experiment inputs">
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
            hint="An experimental condition — shown, not used in the maths."
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

      <CalcSection title="Experimental data" description="Time | Absorbance — one row per sampling point.">
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
          <ExampleChips items={[{ label: SHEET_EXAMPLE.label, apply: applyExample }]} />
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

        {report && result && best && derived && working && chart && axisX && interpretationLines ? (
          <>
            {analysis.warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">
                {warning}
              </LabNotice>
            ))}

            {/* ── Result card ── */}
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Determined order of kinetics</p>
                    <p className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
                      {ORDER_LABEL[best.order]} order
                    </p>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      Best R² = <strong className="text-foreground">{r2Text(best.fit.r2)}</strong>
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Shelf life (t90){atTemp}
                    </p>
                    <p className="mt-1 break-words text-3xl font-extrabold leading-none tracking-tight tabular-nums text-foreground sm:text-4xl">
                      {derived.t90.ok ? num(derived.t90.value, 4) : "—"}
                      {derived.t90.ok && <span className="ml-1.5 text-base font-semibold text-muted-foreground">{timeUnit}</span>}
                    </p>
                  </div>
                </div>
                <dl className="divide-y rounded-xl border text-sm">
                  {[
                    ["Temperature", temp ? `${temp} °C` : "—"],
                    ["Initial absorbance (A₀)", a0.trim()],
                    ["Final % drug remaining", `${pct(result[result.length - 1].percent)} %`],
                    ["Kinetic order", `${ORDER_LABEL[best.order]} order`],
                    ["R²", r2Text(best.fit.r2)],
                    ["Rate constant (k)", kText],
                    ["Half-life (t½)", halfLifeText],
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
                An experimental accelerated-degradation estimate{atTemp}, not the labelled shelf life of {drugName}.
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

            {/* ── R² comparison ── */}
            <CalcSection title="Order of kinetics — compare R²" description="Each plot is fitted by least squares; the highest R² decides the order.">
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
                      const winner = order === best.order;
                      return (
                        <tr key={order} className={cn("border-t", winner && "bg-green-50/80 font-semibold")}>
                          <td className="whitespace-nowrap px-3 py-2 text-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {winner && <Star aria-label="Best fit" className="h-3.5 w-3.5 fill-green-600 text-green-600" />}
                              {ORDER_LABEL[order]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-foreground">{ORDER_PLOT[order]}</td>
                          {fitted.ok ? (
                            <>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{num(fitted.value.fit.slope, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{num(fitted.value.fit.intercept, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r2Text(fitted.value.fit.r2, 6)}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                                {num(fitted.value.k, 5)} <span className="font-normal text-muted-foreground">{kUnit(order, timeUnit)}</span>
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
                  Determined order of kinetics: {ORDER_LABEL[best.order]} order
                </p>
                <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                  Best R² = <strong className="text-foreground">{r2Text(best.fit.r2, 6)}</strong>
                  {analysis.runnerUp && analysis.margin !== null && (
                    <> · ahead of {ORDER_LABEL[analysis.runnerUp].toLowerCase()} order by {analysis.margin.toFixed(4)}</>
                  )}
                </p>
              </div>
            </CalcSection>

            {/* ── Graphs ── */}
            <CalcSection title="Graphs" description="Hover or tap a point for its exact value. The best-fit order is highlighted.">
              <div className="space-y-4">
                <ChartPanel
                  title={`Effect of Time on % ${drug.trim() || "Drug"} Remaining${atTemp}`}
                  footer={
                    <div className="space-y-2">
                      <p>Dashed: the {ORDER_LABEL[best.order].toLowerCase()}-order fit, drawn back as % remaining.</p>
                      <ChartLegend
                        items={[
                          { label: "Experimental", color: CHART.primary, shape: "dot" },
                          { label: `${ORDER_LABEL[best.order]}-order trend`, color: CHART.line, shape: "dash" },
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
                      isAnimationActive={false}
                    />
                    <Scatter name="Experimental" data={chart.percentPoints} fill={CHART.primary} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                  </ScatterChart>
                </ChartPanel>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {chart.plots.map((plot) => {
                    const winner = plot.order === best.order;
                    const Tip = TIPS[plot.order];
                    const color = ORDER_COLOR[plot.order];
                    return (
                      <ChartPanel
                        key={plot.order}
                        title={`${winner ? "★ Best fit — " : ""}${ORDER_LABEL[plot.order]} order: ${Y_LABEL[plot.order]} vs Time`}
                        className={cn(winner && "ring-2 ring-green-500 ring-offset-2")}
                        footer={
                          plot.fit ? (
                            <p className="font-mono text-[12.5px] text-foreground">
                              {equation(plot.fit, timeUnit)} · R² = {r2Text(plot.fit.fit.r2)}
                            </p>
                          ) : (
                            "No regression line for this plot."
                          )
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
                            label={{ value: Y_LABEL[plot.order], angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                          />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                          <Scatter
                            name="Regression line"
                            data={plot.line}
                            line={{ stroke: color, strokeWidth: 2 }}
                            shape={() => <g />}
                            legendType="none"
                            isAnimationActive={false}
                          />
                          <Scatter name="Experimental" data={plot.points} fill={color} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                        </ScatterChart>
                      </ChartPanel>
                    );
                  })}
                </div>
              </div>
            </CalcSection>

            {/* ── k, t½, t90 ── */}
            <CalcSection
              title="Rate constant, half-life and shelf life"
              description={`From the ${ORDER_LABEL[best.order].toLowerCase()}-order slope, with C₀ = 100 % because the data are % remaining.`}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {[
                  { title: "Rate constant (k)", lines: [...working.slope, "Therefore:", ...working.k], error: undefined },
                  { title: "Half-life (t½)", lines: working.halfLife, error: derived.halfLife.ok ? undefined : derived.halfLife.error },
                  { title: "Shelf life (t90)", lines: working.t90, error: derived.t90.ok ? undefined : derived.t90.error },
                ].map((block) => (
                  <div key={block.title} className="min-w-0 rounded-xl border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground">{block.title}</p>
                    <div className="mt-2 space-y-1">
                      {block.lines.map((line, i) => (
                        <p
                          key={i}
                          className={cn(
                            "whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed",
                            i === block.lines.length - 1 && !block.error ? "font-bold text-foreground" : "text-muted-foreground",
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
                <p className="text-base font-bold text-foreground sm:text-lg">
                  Shelf Life (t90){atTemp} = <span className="tabular-nums">{t90Text}</span>
                </p>
              </div>
            </CalcSection>

            {/* ── Interpretation ── */}
            <CalcSection title="Interpretation">
              <div className="space-y-2 text-sm leading-relaxed text-foreground">
                {interpretationLines.slice(0, -1).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <LabNotice tone="info" title="Accelerated estimate, not a labelled shelf life">
                {interpretationLines[interpretationLines.length - 1]}
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
              message="Enter A₀ and at least three time points with their absorbance to determine the order of kinetics."
            />
          )
        )}
      </div>

      <FormulaNote title="Scientific principle" defaultOpen={false}>
        <p>
          Procaine HCl, an ester local anaesthetic, degrades in solution — chiefly by hydrolysis of its ester bond — and
          raising the temperature to 50 °C speeds that degradation up compared with normal storage. Following the
          drug at a raised temperature is an <strong>accelerated stability</strong> study.
        </p>
        <p>
          The fall in absorbance is taken as the fall in drug concentration, which holds while the Beer–Lambert law
          remains valid (same wavelength, cell and dilution, and degradation products that do not absorb there):
        </p>
        <Formula>Absorbance ↓ → Drug concentration ↓ → % drug remaining ↓ → degradation ↑</Formula>
        <p>
          Kinetic analysis then finds the mathematical order of degradation — how the rate depends on how much drug is
          left — and from it the rate constant, half-life and shelf life.
        </p>
      </FormulaNote>

      <FormulaNote title="How the calculator works" defaultOpen={false}>
        <p className="font-semibold text-foreground">1. % drug remaining</p>
        <Formula>% Remaining = (Aₜ / A₀) × 100</Formula>

        <p className="font-semibold text-foreground">2. Three linearised plots, each fitted by least squares</p>
        <Formula>Zero: %R = %R₀ − kt · First: ln %R = ln %R₀ − kt · Second: 1/%R = 1/%R₀ + kt</Formula>
        <p>
          Slope and intercept come from the textbook sums; R² = 1 − SSE/SST. k = −slope for zero and first order and
          k = +slope for second order. The order with the highest R² is reported — nothing is assumed in advance.
        </p>

        <p className="font-semibold text-foreground">3. Half-life and shelf life (C₀ = 100 %)</p>
        <Formula>Zero: t½ = C₀ / 2k, t90 = 0.10 C₀ / k</Formula>
        <Formula>First: t½ = 0.693 / k, t90 = 0.10536 / k</Formula>
        <Formula>Second: t½ = 1 / (kC₀), t90 = 1/(90k) − 1/(100k)</Formula>
        <p>
          These assume the drug starts at 100 % at t = 0. The fitted intercept is usually a little different — the first
          reading is taken after degradation has begun — so t90 is a rate-based estimate, not a value read off the
          table.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why isn't the order simply first order?",
            a: "Because it has to be measured, not assumed. The calculator fits all three plots and reports the one with the highest R². With the Procaine HCl sheet's data, zero order (R² ≈ 0.9927) narrowly beats first order (≈ 0.9902) — a hard-coded first order would get that wrong.",
          },
          {
            q: "The R² values are very close. Which should I report?",
            a: "The practical's rule is the highest R², and that is what the calculator reports. When the gap is under 0.01 it also says the models are hard to separate — over 50 % degradation and six points, zero and first order often look alike. Following the reaction further, or adding time points, separates them.",
          },
          {
            q: "Why is C₀ = 100 % rather than the intercept?",
            a: "Because the data are expressed as % remaining, and the practical defines the starting amount as 100 %. The intercept of the fitted line is printed in the R² table, so you can see how far it sits from 100.",
          },
          {
            q: "Is the t90 the shelf life printed on the pack?",
            a: "No. It is an accelerated-degradation estimate at the test temperature. A labelled shelf life comes from long-term studies at the recommended storage condition, usually supported by Arrhenius extrapolation across several temperatures.",
          },
          {
            q: "Does the temperature change the calculation?",
            a: "No. A single run gives k at that temperature only; the temperature is recorded as the experimental condition. Predicting k at another temperature needs runs at several temperatures and an Arrhenius plot.",
          },
          {
            q: "Are the rounded values used in the next step?",
            a: "No. Every calculation runs at full precision and values are rounded only for display, so the % remaining shown to two decimals is not what the regression uses.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
