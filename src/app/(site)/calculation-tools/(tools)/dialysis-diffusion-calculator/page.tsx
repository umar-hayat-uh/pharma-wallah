"use client";

import { useMemo, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  TextField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabActions,
  LabNotice,
  ModeSwitch,
  formatFixed,
  formatSig,
  toNumber,
  type LabReportData,
  type LabReportSection,
} from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CalibrationFields,
  ChartLegend,
  ChartPanel,
  DataTable,
  ExampleChips,
  PendingCard,
  ReportSteps,
  ResultTable,
  StatTiles,
  StepBlock,
  chartSvg,
  makeRows,
  makeTooltip,
  nextRowId,
  niceAxis,
  num,
  paren,
  precise,
  signedTerm,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  analyseDiffusion,
  rateConstant,
  LN_ERROR,
  MAX_ROWS,
  MIN_ROWS,
  type Interpretation,
  type RowResult,
  type TimeUnit,
} from "./_diffusion";

// ─── EXAMPLES (inputs only — every result is calculated) ─────────────────────

type Example = {
  label: string;
  a: string;
  b: string;
  unit: string;
  c1: string;
  v1: string;
  v2: string;
  timeUnit: TimeUnit;
  rows: [string, string][];
};

const EXAMPLES: Example[] = [
  {
    label: "Minutes, C1 = 1000 µg/mL (7 readings)",
    a: "0.0021",
    b: "0.0452",
    unit: "µg/mL",
    c1: "1000",
    v1: "5",
    v2: "1500",
    timeUnit: "min",
    rows: [["0", "0.0021"], ["10", "0.0233"], ["20", "0.0406"], ["30", "0.057"], ["40", "0.0694"], ["50", "0.0819"], ["60", "0.0908"]],
  },
  {
    label: "Seconds, C1 = 5000 µg/mL (7 readings)",
    a: "0.0021",
    b: "0.0452",
    unit: "µg/mL",
    c1: "5000",
    v1: "5",
    v2: "1500",
    timeUnit: "s",
    rows: [["0", "0.0021"], ["300", "0.057"], ["600", "0.1056"], ["900", "0.1546"], ["1200", "0.1955"], ["1500", "0.2385"], ["1800", "0.2728"]],
  },
];

const DEFAULT_TIMES = ["0", "5", "10", "15", "20", "25", "30"];
const defaultRows = () => makeRows(DEFAULT_TIMES.map((time) => ({ time, abs: "" })));

const TIME_LABEL: Record<TimeUnit, string> = { min: "min", s: "s" };
const INTERPRETATION_LABEL: Record<Interpretation, string> = {
  k: "k = −slope (practical method)",
  slope: "Report slope only (no rate constant)",
};

/** A graph/regression axis label, e.g. "Time (min)". */
const axisLabel = (axis: TimeUnit) => `Time (${TIME_LABEL[axis]})`;

export default function DialysisDiffusionCalculatorPage() {
  const [sample, setSample] = useState("");
  const [intercept, setIntercept] = useState("");
  const [slope, setSlope] = useState("");
  const [unit, setUnit] = useState("µg/mL");
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("5");
  const [v2, setV2] = useState("1500");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("min");
  const [rows, setRows] = useState<TableRow[]>(defaultRows);
  const [axis, setAxis] = useState<TimeUnit>("min");
  const [interpretation, setInterpretation] = useState<Interpretation>("k");
  const [conversionNote, setConversionNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({ time: row.cells.time ?? "", abs: row.cells.abs ?? "" }));
  const analysis = useMemo(
    () => analyseDiffusion({ a: intercept, b: slope, c1, v1, v2, timeUnit, axis, interpretation, rows: cells, show: submitted }),
    [intercept, slope, c1, v1, v2, timeUnit, axis, interpretation, rows, submitted],
  );
  const { fit, vf } = analysis;
  const results = analysis.rows;
  const rate = fit && interpretation === "k" ? rateConstant(fit.slope, axis) : null;
  const tUnit = TIME_LABEL[axis];
  const perT = axis === "min" ? "min⁻¹" : "s⁻¹";

  /**
   * Switching the entry unit converts the typed times (× 60 or ÷ 60) and says
   * so. Re-reading "10" as 10 s after it was typed as 10 min would be a silent
   * unit change in the student's data.
   */
  const changeTimeUnit = (next: TimeUnit) => {
    if (next === timeUnit) return;
    setRows((current) =>
      current.map((row) => {
        const raw = row.cells.time ?? "";
        const value = toNumber(raw);
        if (value === null) return row;
        const converted = next === "s" ? value * 60 : value / 60;
        return { ...row, cells: { ...row.cells, time: precise(converted) } };
      }),
    );
    setTimeUnit(next);
    setConversionNote(
      next === "s"
        ? "Entered times were converted from minutes to seconds: Time (s) = Time (min) × 60."
        : "Entered times were converted from seconds to minutes: Time (min) = Time (s) ÷ 60.",
    );
  };

  // ── Worked steps for one row: shown on screen and filed on the record ──
  const rowSteps = (row: RowResult) => {
    const Y = cells[row.index].abs.trim();
    const a = intercept.trim();
    const b = slope.trim();
    const typedTime = cells[row.index].time.trim();
    const steps: { label: string; lines: string[]; error?: string }[] = [
      timeUnit === "min"
        ? { label: "Time in seconds", lines: ["Time (s) = Time (min) × 60", `Time (s) = ${typedTime} × 60 = ${num(row.timeSec)} s`] }
        : { label: "Time in minutes", lines: ["Time (min) = Time (s) ÷ 60", `Time (min) = ${typedTime} ÷ 60 = ${num(row.timeMin)} min`] },
      {
        label: "C2 from the calibration line",
        lines: ["C2 = (Y − a) / slope b", `C2 = (${Y} − ${paren(a)}) / ${paren(b)}`, `C2 = ${num(row.absorbance - (toNumber(a) ?? 0))} / ${paren(b)} = ${num(row.c2)} ${unit}`],
        error: row.warning,
      },
      { label: "C2/C1 (unitless)", lines: [`C2/C1 = ${num(row.c2)} / ${c1.trim()} = ${num(row.ratio)}`] },
      { label: "Volume factor", lines: ["Volume factor = 1 + V2/V1", `Volume factor = 1 + ${v2.trim()} / ${v1.trim()} = ${num(vf ?? 0)}`] },
      { label: "B (volume-corrected ratio)", lines: ["B = (C2/C1) × Volume factor", `B = ${num(row.ratio)} × ${num(vf ?? 0)} = ${num(row.B)}`] },
      { label: "1 − B", lines: [`1 − B = 1 − ${paren(row.B)} = ${num(row.oneMinusB)}`] },
      row.lnValue === null
        ? { label: "ln(1 − B)", lines: [`ln(1 − B) = ln(${num(row.oneMinusB)})`], error: LN_ERROR }
        : { label: "ln(1 − B)", lines: [`ln(1 − B) = ln(${num(row.oneMinusB)}) = ${num(row.lnValue)}`] },
    ];
    return steps;
  };

  // ── Report: one description for the screen details, Copy, PNG and Print ──
  const report = useMemo<{ data: LabReportData; regression: LabReportSection[]; tableRows: string[][] } | null>(() => {
    if (!results || vf === null) return null;
    const u = unit;
    const xOf = (row: RowResult) => (axis === "min" ? row.timeMin : row.timeSec);
    const xText = (row: RowResult) => (axis === timeUnit ? cells[row.index].time.trim() : num(xOf(row)));

    const regression: LabReportSection[] = [];
    if (fit) {
      const { n, sumX, sumY, sumXY, sumX2, meanY, slope: m, intercept: c, sse, sst, r2, predicted, slopeNumerator, denominator } = fit;
      const used = analysis.used;
      const X = used.map(xText);
      const Yln = used.map((row) => num(row.lnValue!));
      regression.push(
        {
          title: "Regression data — ln(1 − B) against time",
          table: {
            columns: ["Row", `t (${tUnit})`, "ln(1 − B)", "t × ln(1 − B)", "t²"],
            rows: used.map((row, i) => [String(row.index + 1), X[i], Yln[i], num(xOf(row) * row.lnValue!), num(xOf(row) ** 2)]),
          },
          rows: [{ label: "Points used (n)", value: String(n) }],
          lines: analysis.excluded.map((e) => `Row ${e.index + 1} excluded: ${e.reason}.`),
        },
        { title: "ΣX (time)", formulas: [`ΣX = ${X.join(" + ")}`, `ΣX = ${num(sumX)} ${tUnit}`] },
        { title: "ΣY (ln(1 − B))", formulas: [`ΣY = ${Yln.map((y) => paren(y)).join(" + ")}`, `ΣY = ${num(sumY)}`] },
        { title: "ΣXY", formulas: [`ΣXY = ${used.map((_, i) => `(${X[i]} × ${paren(Yln[i])})`).join(" + ")}`, `ΣXY = ${num(sumXY)}`] },
        { title: "ΣX²", formulas: [`ΣX² = ${X.map((x) => `${paren(x)}²`).join(" + ")}`, `ΣX² = ${num(sumX2)}`] },
        {
          title: "Slope calculation",
          formulas: [
            "m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]",
            `m = [${n} × ${paren(sumXY)} − (${num(sumX)})(${num(sumY)})] / [${n} × ${num(sumX2)} − (${num(sumX)})²]`,
            `m = (${num(n * sumXY)} − ${paren(sumX * sumY)}) / (${num(n * sumX2)} − ${num(sumX * sumX)})`,
            `m = ${num(slopeNumerator)} / ${num(denominator)} = ${num(m)} ${perT}`,
          ],
        },
        {
          title: "Intercept calculation",
          formulas: ["c = [Σy − mΣx] / n", `c = [${num(sumY)} − ${paren(m)} × ${num(sumX)}] / ${n}`, `c = (${num(sumY)} − ${paren(m * sumX)}) / ${n} = ${num(c)}`],
        },
        {
          title: "Regression equation",
          formulas: ["ln(1 − B) = m·t + c", `ln(1 − B) = ${num(m)}·t ${signedTerm(c)}`],
          lines: [`t is time in ${axis === "min" ? "minutes" : "seconds"}.`],
        },
        {
          title: "R² calculation",
          table: {
            columns: ["Row", "y = ln(1 − B)", "ŷ = m·t + c", "(y − ŷ)²", "(y − ȳ)²"],
            rows: used.map((row, i) => [String(row.index + 1), Yln[i], num(predicted[i]), num((row.lnValue! - predicted[i]) ** 2), num((row.lnValue! - meanY) ** 2)]),
          },
          formulas: [
            `SSE = Σ(y − ŷ)² = ${num(sse)}`,
            `SST = Σ(y − ȳ)² = ${num(sst)}`,
            "R² = 1 − [Σ(y − ŷ)² / Σ(y − ȳ)²]",
            r2 === null ? "R² is undefined because SST = 0." : `R² = 1 − (${num(sse)} / ${num(sst)}) = ${num(r2, 6)}`,
          ],
        },
        rate
          ? {
              title: "Rate constant — k = −slope (practical method)",
              formulas: [
                "k = −slope",
                `k = −${paren(m)} = ${num(rate.k)} ${rate.unit}`,
                axis === "min" ? `k (s⁻¹) = k (min⁻¹) ÷ 60 = ${num(rate.k)} ÷ 60 = ${num(rate.kOther)} s⁻¹` : `k (min⁻¹) = k (s⁻¹) × 60 = ${num(rate.k)} × 60 = ${num(rate.kOther)} min⁻¹`,
              ],
            }
          : {
              title: "Slope — reported without a rate constant",
              rows: [{ label: "Slope (m)", value: num(m), unit: perT }],
              lines: ["Interpretation selected: report slope only. No rate constant is calculated."],
            },
      );
    }

    const tableRows = results.map((row) => [
      num(row.timeMin),
      num(row.timeSec),
      cells[row.index].abs.trim(),
      num(row.c2),
      num(row.ratio),
      num(vf),
      num(row.B),
      num(row.oneMinusB),
      row.lnValue === null ? "⚠ not defined" : num(row.lnValue),
    ]);

    const perRow: LabReportSection[] = results.map((row) => ({
      title: `Row ${row.index + 1} — t = ${num(row.timeMin)} min (${num(row.timeSec)} s)`,
      formulas: rowSteps(row).flatMap((step) => [...step.lines, ...(step.error ? [`⚠ ${step.error}`] : [])]),
    }));

    const lineSeries = fit
      ? [
          { x: fit.xMin, y: fit.slope * fit.xMin + fit.intercept },
          { x: fit.xMax, y: fit.slope * fit.xMax + fit.intercept },
        ]
      : [];
    const r2Text = fit ? (fit.r2 === null ? "undefined" : formatFixed(fit.r2, 4)) : "";

    const data: LabReportData = {
      title: "Dialysis Membrane / Diffusion",
      context: `Biopharmaceutics · ${INTERPRETATION_LABEL[interpretation]}`,
      sample: sample.trim() || undefined,
      result: fit
        ? rate
          ? { label: "Rate constant k = −slope (practical method)", value: formatSig(rate.k, 4), unit: rate.unit }
          : { label: `Slope of ln(1 − B) vs time`, value: num(fit.slope, 4), unit: perT }
        : { label: "Slope of ln(1 − B) vs time", value: "cannot be calculated" },
      warnings: [...(analysis.regressionError ? [analysis.regressionError] : []), ...analysis.warnings],
      sections: [
        {
          title: "Method",
          rows: [
            { label: "Practical interpretation", value: INTERPRETATION_LABEL[interpretation] },
            { label: "Time entered in", value: timeUnit === "min" ? "minutes" : "seconds" },
            { label: "Graph / regression time axis", value: axisLabel(axis) },
          ],
          lines: ["Time → Absorbance → C2 → C2/C1 → volume factor → B → 1 − B → ln(1 − B) → graph → slope."],
        },
        {
          title: "Inputs",
          rows: [
            { label: "Calibration intercept a", value: intercept.trim(), unit: "AU" },
            { label: "Calibration slope b", value: slope.trim(), unit: `AU/${u}` },
            { label: "Initial / donor concentration C1", value: c1.trim(), unit: u },
            { label: "V1", value: v1.trim(), unit: "mL" },
            { label: "V2", value: v2.trim(), unit: "mL" },
          ],
          formulas: ["Y = a + bX  →  C2 = (Y − a) / b", `Volume factor = 1 + V2/V1 = 1 + ${v2.trim()} / ${v1.trim()} = ${num(vf)}`],
        },
        {
          title: "Result table",
          table: {
            columns: ["Time (min)", "Time (s)", "Absorbance (AU)", `C2 (${u})`, "C2/C1", "Volume factor", "B", "1 − B", "ln(1 − B)"],
            rows: tableRows,
          },
        },
        ...perRow,
        ...regression,
      ],
      notes: [
        ...analysis.notes,
        "Slope b (calibration) and B (volume-corrected ratio) are different quantities.",
        "Values are rounded for display only; every step uses full precision.",
      ],
      figure: fit
        ? {
            svg: chartSvg({
              xLabel: axisLabel(axis),
              yLabel: "ln(1 − B)",
              includeZeroY: true,
              series: [
                { name: "Fitted line", points: lineSeries, kind: "line", color: CHART.line },
                { name: "ln(1 − B)", points: analysis.points, kind: "points", color: CHART.primary },
              ],
            }),
            width: FIGURE_WIDTH,
            height: FIGURE_HEIGHT,
            caption: `ln(1 − B) = ${num(fit.slope, 5)}·t ${signedTerm(fit.intercept, 5)}   R² = ${r2Text}${rate ? `   k = ${formatSig(rate.k, 4)} ${rate.unit}` : ""}`,
          }
        : undefined,
    };
    return { data, regression, tableRows };
  }, [analysis, axis, timeUnit, interpretation, unit, sample, intercept, slope, c1, v1, v2]);

  // ── Chart data ──
  const chart = useMemo(() => {
    if (!fit) return null;
    const points = analysis.points.map((p) => ({ ...p, series: "Reading" }));
    const line = [fit.xMin, fit.xMax].map((x) => ({ x, y: fit.slope * x + fit.intercept, series: "Fitted line" }));
    const xAxis = niceAxis(points.map((p) => p.x), { includeZero: true });
    const yAxis = niceAxis([...points.map((p) => p.y), ...line.map((p) => p.y)], { includeZero: true });
    return { points, line, xAxis, yAxis };
  }, [fit, analysis.points]);

  const Tip = useMemo(
    () =>
      makeTooltip([
        { key: "x", label: axisLabel(axis), format: (v) => formatSig(v, 5) },
        { key: "y", label: "ln(1 − B)", format: (v) => formatSig(v, 5) },
      ]),
    [axis],
  );

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setIntercept("");
    setSlope("");
    setUnit("µg/mL");
    setC1("");
    setV1("5");
    setV2("1500");
    setTimeUnit("min");
    setRows(defaultRows());
    setAxis("min");
    setInterpretation("k");
    setConversionNote("");
  };

  const otherTimeUnit: TimeUnit = timeUnit === "min" ? "s" : "min";
  const equationText = fit ? `ln(1 − B) = ${num(fit.slope, 5)}·t ${signedTerm(fit.intercept, 5)}` : "";

  return (
    <CalculatorShell
      title="Dialysis Membrane / Diffusion Calculator"
      subtitle="The practical sheet's method, step by step: absorbance → C2 → C2/C1 → volume factor → B → ln(1 − B), then the graph against time, its slope and the rate constant."
      icon={Waves}
      eyebrow="Biopharmaceutics"
      aside={
        <>
          <CalcAbout title="About the dialysis practical">
            <p>
              A drug solution (volume <strong>V1</strong>, concentration <strong>C1</strong>) is placed inside a dialysis
              membrane and dipped into a receptor medium (volume <strong>V2</strong>). Samples of the receptor are read on a
              UV spectrophotometer at timed intervals and converted to concentration <strong>C2</strong> with a calibration line.
            </p>
            <p>
              The sheet corrects each ratio C2/C1 for the two volumes, B = (C2/C1) × [1 + V2/V1], and plots ln(1 − B)
              against time. A straight line with a negative slope describes diffusion across the membrane.
            </p>
            <CalcList
              title="Before you start"
              items={[
                "Enter the calibration line of the same drug, in the same medium and wavelength",
                "C1 must be in the same concentration unit as the calibration's X",
                "Record time at each withdrawal — minutes or seconds, both work",
              ]}
            />
            <CalcList
              tone="caution"
              title="Read the result carefully"
              items={[
                "If B reaches 1, ln(1 − B) is undefined — that reading is left out of the graph",
                "Slope b of the calibration is not B of the practical",
                "k is quoted in min⁻¹ or s⁻¹ — the unit follows the time axis you choose",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Experiment">
        <FieldGrid>
          <TextField label="Drug / membrane (optional)" value={sample} onChange={setSample} placeholder="e.g. Paracetamol, cellophane membrane" hint="Printed on the lab record." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Calibration curve" description="Regression equation Y = a + bX (Y = absorbance, X = concentration)">
        <CalibrationFields intercept={intercept} slope={slope} unit={unit} onIntercept={setIntercept} onSlope={setSlope} onUnit={setUnit} show={submitted} />
        <LabNotice>
          <strong>Slope b</strong> converts absorbance to concentration. <strong>B (volume-corrected ratio)</strong> is
          calculated later as (C2/C1) × [1 + V2/V1]. They are different quantities.
        </LabNotice>
      </CalcSection>

      <CalcSection title="Concentration and volumes">
        <FieldGrid>
          <NumberField
            label="Initial / donor concentration (C1)"
            value={c1}
            onChange={setC1}
            unit={unit}
            error={analysis.fieldErrors.c1}
            hint="C1 and C2 must be in the same unit — C2/C1 is unitless."
          />
          <div className="hidden sm:block" aria-hidden />
          <NumberField label="V1" value={v1} onChange={setV1} unit="mL" error={analysis.fieldErrors.v1} hint="The practical sheet uses 5 mL." />
          <NumberField label="V2" value={v2} onChange={setV2} unit="mL" error={analysis.fieldErrors.v2} hint="The practical sheet uses 1500 mL." />
        </FieldGrid>
        <p className="rounded-lg border border-l-[3px] border-l-primary bg-muted/60 px-3 py-2 font-mono text-[13px] text-foreground">
          Volume factor = 1 + V2/V1 = {vf !== null ? `1 + ${v2.trim()} / ${v1.trim()} = ${num(vf)}` : "—"}
        </p>
      </CalcSection>

      <CalcSection title="Time table" description="Time | Absorbance — add a row for every sample withdrawn">
        <ModeSwitch<TimeUnit>
          label="Enter time in"
          value={timeUnit}
          onChange={changeTimeUnit}
          options={[
            { value: "min", label: "Enter time in minutes", description: "Seconds = minutes × 60" },
            { value: "s", label: "Enter time in seconds", description: "Minutes = seconds ÷ 60" },
          ]}
        />
        {conversionNote && <LabNotice>{conversionNote}</LabNotice>}
        <DataTable
          caption="Sampling times and absorbances"
          columns={[
            { key: "time", header: "Time", unit: TIME_LABEL[timeUnit], placeholder: "0" },
            {
              key: "other",
              header: "Time",
              unit: TIME_LABEL[otherTimeUnit],
              computed: (i) => {
                const raw = cells[i]?.time ?? "";
                const value = toNumber(raw);
                if (value === null || value < 0) return "—";
                return num(timeUnit === "min" ? value * 60 : value / 60);
              },
            },
            { key: "abs", header: "Absorbance (Y)", unit: "AU", placeholder: "0.000" },
          ]}
          rows={rows}
          rowHeader={(i) => `Row ${i + 1}`}
          onCell={(id, key, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)))}
          onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
          onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: { time: "", abs: "" } }])}
          addLabel="Add time point"
          minRows={MIN_ROWS}
          maxRows={MAX_ROWS}
          cellError={(i, key) => analysis.cellErrors[`${i}:${key}`]}
          rowMessage={(i) => {
            const message = analysis.cellErrors[`${i}:time`] ?? analysis.cellErrors[`${i}:abs`];
            if (message) return { tone: "error", text: message };
            const row = results?.[i];
            if (row?.error) return { tone: "error", text: row.error };
            if (row?.warning) return { tone: "warning", text: row.warning };
            return undefined;
          }}
        />
        <p className="text-xs text-muted-foreground">
          {MIN_ROWS}–{MAX_ROWS} rows. Times must increase from row to row; rows are never re-ordered for you.
        </p>
        <ExampleChips
          items={EXAMPLES.map((example) => ({
            label: example.label,
            apply: () => {
              setIntercept(example.a);
              setSlope(example.b);
              setUnit(example.unit);
              setC1(example.c1);
              setV1(example.v1);
              setV2(example.v2);
              setTimeUnit(example.timeUnit);
              setConversionNote("");
              setRows(makeRows(example.rows.map(([time, abs]) => ({ time, abs }))));
            },
          }))}
        />
      </CalcSection>

      <CalcSection title="Practical interpretation" description="How the slope of ln(1 − B) against time is reported">
        <ModeSwitch<Interpretation>
          label="Practical interpretation"
          value={interpretation}
          onChange={setInterpretation}
          options={[
            { value: "k", label: INTERPRETATION_LABEL.k, description: "Rate constant in min⁻¹ or s⁻¹" },
            { value: "slope", label: INTERPRETATION_LABEL.slope, description: "Slope, intercept and R² only" },
          ]}
        />
      </CalcSection>

      <LabActions report={report?.data ?? null} onCalculate={calculate} onReset={reset} fileName="dialysis-diffusion" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {report && results && vf !== null ? (
          <>
            <p className="rounded-xl border border-l-[3px] border-l-blue-600 bg-card px-3.5 py-2.5 text-sm text-foreground">
              Method: <strong>{INTERPRETATION_LABEL[interpretation]}</strong> · time axis {axisLabel(axis)}
            </p>

            {analysis.regressionError && (
              <LabNotice tone="danger" title="The regression cannot be calculated">{analysis.regressionError}</LabNotice>
            )}
            {analysis.warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}
            {analysis.excluded.length > 0 && (
              <LabNotice tone="warning" title="Rows left out of the graph and regression">
                {analysis.excluded.map((e) => (
                  <span key={e.index} className="block">Row {e.index + 1} excluded: {e.reason}.</span>
                ))}
              </LabNotice>
            )}

            <StatTiles
              tiles={[
                { label: "Slope (m)", value: fit ? num(fit.slope, 4) : "—", unit: fit ? perT : undefined },
                { label: "Intercept (c)", value: fit ? num(fit.intercept, 4) : "—", note: fit ? "ln(1 − B) at t = 0" : undefined },
                { label: "R²", value: fit && fit.r2 !== null ? formatFixed(fit.r2, 4) : "—", note: fit && fit.r2 === null ? "undefined (SST = 0)" : undefined },
                {
                  label: "k = −slope",
                  value: rate ? formatSig(rate.k, 4) : "—",
                  unit: rate ? rate.unit : undefined,
                  note: interpretation === "slope" ? "not reported (slope only)" : rate ? `= ${formatSig(rate.kOther, 4)} ${rate.otherUnit}` : undefined,
                  featured: true,
                },
                { label: "Volume factor", value: formatSig(vf, 6), note: "1 + V2/V1" },
                { label: "Points used (n)", value: fit ? String(fit.n) : String(analysis.used.length), note: `of ${results.length} rows` },
              ]}
            />

            <ResultTable
              caption="Dialysis diffusion result table"
              columns={["Time (min)", "Time (s)", "Absorbance (AU)", `C2 (${unit})`, "C2/C1", "Volume factor", "B", "1 − B", "ln(1 − B)"]}
              rows={report.tableRows}
              highlightColumn={8}
            />

            <ModeSwitch<TimeUnit>
              label="Time axis"
              value={axis}
              onChange={setAxis}
              options={[
                { value: "min", label: "Time axis: minutes", description: "Slope in min⁻¹" },
                { value: "s", label: "Time axis: seconds", description: "Slope in s⁻¹" },
              ]}
            />

            {fit && chart && (
              <>
                <p className="rounded-xl border border-l-[3px] border-l-blue-600 bg-card px-3.5 py-3 font-mono text-[15px] font-semibold text-foreground">
                  {equationText}
                </p>
                <ChartPanel
                  title={`ln(1 − B) vs ${axisLabel(axis)}`}
                  footer={
                    <div className="space-y-2">
                      <p className="font-mono text-[13px] text-foreground">
                        {equationText} · R² = {fit.r2 === null ? "undefined" : formatFixed(fit.r2, 4)}
                        {rate ? ` · k = ${formatSig(rate.k, 4)} ${rate.unit}` : ""}
                      </p>
                      <ChartLegend
                        items={[
                          { label: "ln(1 − B) readings", color: CHART.primary, shape: "dot" },
                          { label: "Fitted line", color: CHART.line, shape: "line" },
                        ]}
                      />
                    </div>
                  }
                >
                  <ScatterChart margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: axisLabel(axis), position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      domain={chart.yAxis.domain}
                      ticks={chart.yAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.yAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={56}
                      label={{ value: "ln(1 − B)", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                    <Scatter name="Fitted line" data={chart.line} line={{ stroke: CHART.line, strokeWidth: 2 }} shape={() => <g />} legendType="none" isAnimationActive={false} />
                    <Scatter name="ln(1 − B)" data={chart.points} fill={CHART.primary} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                  </ScatterChart>
                </ChartPanel>

                {rate && (
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Rate constant — k = −slope (practical method)</p>
                    <p className="mt-2 whitespace-pre-line break-words font-mono text-[13px] leading-relaxed text-foreground">
                      {`k = −${paren(fit.slope)} = ${num(rate.k)} ${rate.unit}\n`}
                      {axis === "min"
                        ? `k (s⁻¹) = k (min⁻¹) ÷ 60 = ${num(rate.k)} ÷ 60 = ${num(rate.kOther)} s⁻¹`
                        : `k (min⁻¹) = k (s⁻¹) × 60 = ${num(rate.k)} × 60 = ${num(rate.kOther)} min⁻¹`}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Calculation details — each row</p>
              {results.map((row) => (
                <StepBlock
                  key={row.index}
                  title={`Row ${row.index + 1} — t = ${num(row.timeMin)} min (${num(row.timeSec)} s), Y = ${cells[row.index].abs.trim()} AU`}
                  badge={
                    row.lnValue === null
                      ? { text: "ln not defined", tone: "error" }
                      : row.warning
                        ? { text: `ln = ${formatSig(row.lnValue, 4)}`, tone: "warning" }
                        : { text: `ln = ${formatSig(row.lnValue, 4)}`, tone: "ok" }
                  }
                  steps={rowSteps(row)}
                />
              ))}
            </div>

            {report.regression.length > 0 && (
              <FormulaNote title="Regression calculation and slope (step by step)">
                <ReportSteps sections={report.regression} />
              </FormulaNote>
            )}
          </>
        ) : (
          <PendingCard submitted={submitted} message="Enter the calibration line, C1, V1, V2 and every row's time and absorbance." />
        )}
      </div>

      <FormulaNote>
        <Formula>Time (s) = Time (min) × 60</Formula>
        <Formula>C2 = (Y − a) / b &nbsp;(from Y = a + bX)</Formula>
        <Formula>Volume factor = 1 + V2/V1</Formula>
        <Formula>B = (C2/C1) × [1 + V2/V1]</Formula>
        <Formula>ln value = ln(1 − B) &nbsp;— defined only when 1 − B &gt; 0</Formula>
        <Formula>ln(1 − B) = m·t + c, &nbsp;m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²], &nbsp;c = [Σy − mΣx] / n</Formula>
        <Formula>k = −slope &nbsp;(when the practical interprets the negative slope as the rate constant)</Formula>
        <p>
          With V1 = 5 mL and V2 = 1500 mL the volume factor is 1 + 1500/5 = 301. Slope b belongs to the calibration line;
          B is the volume-corrected ratio. R² = 1 − SSE/SST for the ln(1 − B) line.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why does a row say ln(1 − B) cannot be calculated?", a: "B has reached or passed 1, so 1 − B is zero or negative and has no logarithm. Check the absorbance, C1 and the volumes. That row is left out of the graph and the regression, and the calculator says so." },
          { q: "Is slope b the same as B?", a: "No. Slope b is the calibration line's slope (absorbance per unit concentration). B is the practical's volume-corrected ratio, (C2/C1) × [1 + V2/V1]. They only share a letter." },
          { q: "Should I plot minutes or seconds?", a: "Either — the sheet records both. The slope and k change unit with the axis (k in s⁻¹ is k in min⁻¹ divided by 60); the intercept and R² do not change." },
          { q: "What if my practical does not call −slope the rate constant?", a: "Choose “Report slope only”. The slope, intercept and R² are still calculated, and no rate constant is shown anywhere." },
        ]}
      />
    </CalculatorShell>
  );
}
