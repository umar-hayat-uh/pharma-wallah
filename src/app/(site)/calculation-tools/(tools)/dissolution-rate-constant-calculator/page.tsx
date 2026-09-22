"use client";

import { useMemo, useRef, useState } from "react";
import { Droplets, Eraser } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
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
  ModeSwitch,
  type LabReportData,
} from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CONCENTRATION_UNITS,
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
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  analyseDissolutionRate,
  averagedRange,
  formatDecimal,
  formatValue,
  MAX_OBSERVATIONS,
  MIN_OBSERVATIONS,
  type AverageBasis,
  type Notation,
} from "./_dissolution-rate";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TIME_UNITS = ["s", "min", "h"];

/** The practical sheet this calculator reproduces. Inputs only — every result is calculated. */
const SHEET_EXAMPLE = {
  label: "Practical sheet — Cs = 3.5, seven readings",
  cs: "3.5",
  rows: [
    ["0", "0"],
    ["10", "0.000877352"],
    ["20", "0.001009193"],
    ["30", "0.001005587"],
    ["40", "0.001013718"],
    ["50", "0.001167060"],
    ["60", "0.000942714"],
  ] as [string, string][],
};

const BASIS_OPTIONS: { value: AverageBasis; label: string; description: string }[] = [
  { value: "sheet", label: "Practical sheet rows", description: "Interior rows only" },
  { value: "all", label: "All observations", description: "Every row with a value" },
];

const NOTATION_OPTIONS: { value: Notation; label: string; description: string }[] = [
  { value: "scientific", label: "Scientific", description: "2.91833 × 10⁻⁴" },
  { value: "decimal", label: "Decimal", description: "0.000291833" },
];

const blankRow = () => ({ time: "", reading: "" });

const INITIAL_ROWS = 5;

export default function DissolutionRateConstantCalculatorPage() {
  const [sample, setSample] = useState("");
  const [cs, setCs] = useState("");
  const [unit, setUnit] = useState("mg/mL");
  const [timeUnit, setTimeUnit] = useState("min");
  const [rows, setRows] = useState<TableRow[]>(() => makeRows(Array.from({ length: INITIAL_ROWS }, blankRow)));
  const [basis, setBasis] = useState<AverageBasis>("sheet");
  const [notation, setNotation] = useState<Notation>("scientific");
  const [submitted, setSubmitted] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({ time: row.cells.time ?? "", reading: row.cells.reading ?? "" }));

  const analysis = useMemo(
    () => analyseDissolutionRate(cs, cells, basis, submitted),
    // `cells` is derived from `rows` on every render, so `rows` is the real dependency.
    [rows, cs, basis, submitted],
  );
  const result = analysis.rows;

  /** Display helper: the student's notation choice, applied to a computed value. */
  const show = (value: number, sig = 6) => formatValue(value, notation, sig);
  /**
   * Cs − C is always decimal. It sits at the same order of magnitude as Cs, so
   * "3.49912 × 10⁰" would only make the column harder to read.
   */
  const showDenominator = (value: number) => formatDecimal(value, 10, true);

  const average = analysis.average?.ok ? analysis.average.value : null;
  const intervals = result ? result.filter((row) => row.rate?.ok).length : 0;

  // ── The calculation table: the practical sheet's seven columns, in its order ──
  const table = useMemo(() => {
    if (!result) return null;
    return {
      columns: [
        `Time (${timeUnit})`,
        `Corrected Reading (${unit})`,
        `Midpoint (${unit})`,
        `dC/dt (${unit}/${timeUnit})`,
        `Cs − C (${unit})`,
        "k = x/y  (x = dC/dt)",
        "k = x/y  (x = midpoint)",
      ],
      body: result.map((row) => [
        row.timeRaw,
        row.readingRaw,
        show(row.midpoint),
        row.rate === null ? "—" : row.rate.ok ? show(row.rate.value) : "⚠ undefined",
        showDenominator(row.csMinusC),
        row.kRate === null ? "—" : row.kRate.ok ? show(row.kRate.value) : "⚠ undefined",
        row.kMidpoint.ok ? show(row.kMidpoint.value) : "⚠ undefined",
      ]),
    };
  }, [result, notation, unit, timeUnit]);

  // ── Worked steps, one block per observation ──
  const steps = useMemo(() => {
    if (!result) return null;
    return result.map((row, index) => {
      const last = index === result.length - 1;
      const a = last ? cells[index - 1].reading : cells[index].reading;
      const b = last ? cells[index].reading : cells[index + 1].reading;
      const denominator = showDenominator(row.csMinusC);

      return [
        {
          label: last ? "Midpoint = (C previous + C current) / 2" : "Midpoint = (C₁ + C₂) / 2",
          lines: [`(${a} + ${b}) / 2 = ${show(row.midpoint)}`],
        },
        {
          label: "dC/dt = (C₂ − C₁) / (t₂ − t₁)",
          lines:
            row.rate === null
              ? ["— (no following time point)"]
              : [
                  `(${cells[index + 1].reading} − ${cells[index].reading}) / (${cells[index + 1].time} − ${cells[index].time})`,
                  row.rate.ok ? `= ${show(row.rate.value)} ${unit}/${timeUnit}` : "= undefined",
                ],
          error: row.rate && !row.rate.ok ? row.rate.error : undefined,
        },
        {
          label: "Cs − C  (C is this row's corrected reading)",
          lines: [`${cs.trim()} − ${cells[index].reading} = ${denominator}`],
        },
        {
          label: "k = x / y   with x = dC/dt",
          lines:
            row.kRate === null
              ? ["— (dC/dt is not defined on the final row)"]
              : row.kRate.ok
                ? [`${show(row.rate!.ok ? row.rate!.value : 0)} / ${denominator} = ${show(row.kRate.value)}`]
                : ["undefined"],
          error: row.kRate && !row.kRate.ok ? row.kRate.error : undefined,
        },
        {
          label: "k = x / y   with x = midpoint",
          lines: row.kMidpoint.ok
            ? [`${show(row.midpoint)} / ${denominator} = ${show(row.kMidpoint.value)}`]
            : ["undefined"],
          error: row.kMidpoint.ok ? undefined : row.kMidpoint.error,
        },
      ];
    });
  }, [result, notation, cs, unit, timeUnit]);

  // ── Graph data ──
  const chart = useMemo(() => {
    if (!result) return null;
    const times = result.map((row) => row.time);
    const xAxis = niceAxis(times, { includeZero: true });

    const concentration = result.map((row) => ({ x: row.time, y: row.reading }));
    const midpoint = result.map((row) => ({ x: row.time, y: row.midpoint }));
    const rate = result.filter((row) => row.rate?.ok).map((row) => ({ x: row.time, y: (row.rate as { ok: true; value: number }).value }));
    const k = result.filter((row) => row.kMidpoint.ok).map((row) => ({ x: row.time, y: (row.kMidpoint as { ok: true; value: number }).value }));

    return {
      xAxis,
      concentration: { data: concentration, axis: niceAxis(concentration.map((p) => p.y), { includeZero: true }) },
      midpoint: { data: midpoint, axis: niceAxis(midpoint.map((p) => p.y), { includeZero: true }) },
      rate: { data: rate, axis: niceAxis(rate.map((p) => p.y), { includeZero: true }) },
      k: { data: k, axis: niceAxis([...k.map((p) => p.y), ...(average ? [average.value] : [])], { includeZero: true }) },
    };
  }, [result, average]);

  const tipFor = (label: string, sig = 6) =>
    makeTooltip([
      { key: "x", label: `Time (${timeUnit})`, format: (v) => String(v) },
      { key: "y", label, format: (v) => formatValue(v, notation, sig) },
    ]);

  const ConcentrationTip = useMemo(() => tipFor(`Corrected conc. (${unit})`), [unit, timeUnit, notation]);
  const MidpointTip = useMemo(() => tipFor(`Midpoint (${unit})`), [unit, timeUnit, notation]);
  const RateTip = useMemo(() => tipFor(`dC/dt (${unit}/${timeUnit})`), [unit, timeUnit, notation]);
  const KTip = useMemo(() => tipFor("k (midpoint method)"), [unit, timeUnit, notation]);

  // ── The lab record: one description, rendered on screen, copied, drawn and printed ──
  const report = useMemo<LabReportData | null>(() => {
    if (!result || !table) return null;
    const range = averagedRange(result.length, basis);
    const averagedRows = average ? average.indexes.map((i) => result[i]) : [];

    return {
      title: "Dissolution Rate Constant",
      context: "Pharmaceutics · Dissolution practical",
      sample: sample.trim() || undefined,
      result: {
        label: "Average dissolution rate constant (k, midpoint method)",
        value: average ? show(average.value) : "not available",
      },
      warnings: [...analysis.warnings, ...(analysis.average && !analysis.average.ok ? [analysis.average.error] : [])],
      sections: [
        {
          title: "Result",
          rows: [
            { label: "Average k (midpoint method)", value: average ? show(average.value) : "—" },
            {
              label: "Averaged over",
              value: average
                ? `${average.indexes.length} row${average.indexes.length === 1 ? "" : "s"} — t = ${average.indexes.map((i) => result[i].timeRaw).join(", ")} ${timeUnit}`
                : "—",
            },
            { label: "Saturation concentration (Cs)", value: cs.trim(), unit },
            { label: "Number of observations", value: String(result.length) },
            { label: "Number of calculated intervals", value: String(intervals) },
            { label: "Concentration unit", value: unit },
            { label: "Time unit", value: timeUnit },
          ],
        },
        {
          title: "Entered experimental data",
          table: {
            columns: [`Time (${timeUnit})`, `Corrected Reading (${unit})`],
            rows: result.map((row) => [row.timeRaw, row.readingRaw]),
          },
        },
        {
          title: "Midpoint = (C₁ + C₂) / 2",
          formulas: result.map((row, index) => {
            const last = index === result.length - 1;
            const a = last ? cells[index - 1].reading : cells[index].reading;
            const b = last ? cells[index].reading : cells[index + 1].reading;
            return `t = ${row.timeRaw}:  (${a} + ${b}) / 2 = ${show(row.midpoint)}`;
          }),
          lines: ["The final observation has no following reading, so its midpoint averages the previous reading with its own — the supplied practical table's convention."],
        },
        {
          title: "Rate of concentration change, dC/dt = (C₂ − C₁) / (t₂ − t₁)",
          formulas: result.map((row, index) =>
            row.rate === null
              ? `t = ${row.timeRaw}:  — (no following time point)`
              : `t = ${row.timeRaw}:  (${cells[index + 1].reading} − ${cells[index].reading}) / (${cells[index + 1].time} − ${cells[index].time}) = ${row.rate.ok ? show(row.rate.value) : "undefined"}`,
          ),
        },
        {
          title: "Saturation difference, Cs − C",
          formulas: result.map((row, index) => `t = ${row.timeRaw}:  ${cs.trim()} − ${cells[index].reading} = ${showDenominator(row.csMinusC)}`),
          lines: ["C is the row's own corrected reading, not its midpoint."],
        },
        {
          title: "k = x / y   with x = dC/dt",
          formulas: result.map((row) =>
            row.kRate === null
              ? `t = ${row.timeRaw}:  —`
              : `t = ${row.timeRaw}:  ${row.rate?.ok ? show(row.rate.value) : "undefined"} / ${showDenominator(row.csMinusC)} = ${row.kRate.ok ? show(row.kRate.value) : "undefined"}`,
          ),
          lines: ["Negative values are kept: a corrected reading that falls between two time points gives a negative rate, and therefore a negative k."],
        },
        {
          title: "k = x / y   with x = midpoint",
          formulas: result.map((row) => `t = ${row.timeRaw}:  ${show(row.midpoint)} / ${showDenominator(row.csMinusC)} = ${row.kMidpoint.ok ? show(row.kMidpoint.value) : "undefined"}`),
        },
        { title: "Calculation table", table: { columns: table.columns, rows: table.body } },
        {
          title: "Average k",
          formulas: average
            ? [
                "Average k = (k₁ + k₂ + … + kₙ) / n",
                `Average k = (${averagedRows.map((row) => show((row.kMidpoint as { ok: true; value: number }).value)).join(" + ")}) / ${average.indexes.length}`,
                `Average k = ${show(average.value)}`,
              ]
            : ["Average k = (k₁ + k₂ + … + kₙ) / n"],
          lines: [
            basis === "sheet"
              ? `Averaged over the rows between the first and the last (${range.length} row${range.length === 1 ? "" : "s"}) — the supplied practical table's convention.`
              : `Averaged over every row that has a k value (${average?.indexes.length ?? 0} of ${result.length}).`,
            ...(average && average.skipped.length > 0
              ? [`Left out: t = ${average.skipped.map((i) => result[i].timeRaw).join(", ")} ${timeUnit} — Cs − C = 0 there, so k cannot be calculated.`]
              : []),
            ...(analysis.average && !analysis.average.ok ? [analysis.average.error] : []),
          ],
        },
      ],
      notes: [
        ...analysis.notes,
        "The two k columns are different calculations and are reported separately; neither is substituted for the other.",
        "Every value is rounded for display only — each step uses the full precision of the one before it.",
      ],
      figure: average
        ? {
            svg: chartSvg({
              xLabel: `Time (${timeUnit})`,
              yLabel: "k (midpoint method)",
              series: [{ name: "k", points: chart?.k.data ?? [], kind: "line-points", color: CHART.primary }],
              includeZeroY: true,
              referenceY: { value: average.value, label: `Average k = ${show(average.value)}` },
            }),
            width: FIGURE_WIDTH,
            height: FIGURE_HEIGHT,
            caption: `Dissolution rate constant vs time · Cs = ${cs.trim()} ${unit} · n = ${result.length}`,
          }
        : undefined,
    };
  }, [result, table, chart, average, analysis, basis, cs, unit, timeUnit, sample, notation, intervals]);

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
    setSample("");
    setCs("");
    setUnit("mg/mL");
    setTimeUnit("min");
    setBasis("sheet");
    setNotation("scientific");
    setRows(makeRows(Array.from({ length: INITIAL_ROWS }, blankRow)));
  };

  return (
    <CalculatorShell
      title="Dissolution Rate Constant Calculator"
      subtitle="Builds the dissolution practical's table from your corrected readings — midpoint, dC/dt, Cs − C and both k columns — then averages the midpoint-based k."
      icon={Droplets}
      eyebrow="Pharmaceutics"
      aside={
        <>
          <CalcAbout title="About the dissolution rate constant">
            <p>
              As a solid dissolves, the driving force is how far the solution still is from saturation:
              the further below <strong>Cs</strong> the bulk concentration <strong>C</strong> sits, the faster
              drug goes into solution. Dividing the measured change by that driving force gives a{" "}
              <strong>rate constant</strong> that should stay roughly steady across the run.
            </p>
            <CalcList
              title="Reading the table"
              items={[
                "The midpoint is the average concentration across an interval, not a measured value",
                "dC/dt is the slope between two readings — it is negative if the reading falls",
                "Cs − C uses the row's own reading, so it shrinks as dissolution proceeds",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you report"
              items={[
                "A k that drifts far across the run usually means a sampling or dilution error",
                "A negative dC/dt is experimental variability, not a negative rate constant",
                "The two k columns answer different questions — do not average them together",
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
            label="Drug / sample name (optional)"
            value={sample}
            onChange={setSample}
            placeholder="e.g. Salicylic acid in phosphate buffer"
            hint="Printed on the lab record."
          />
          <NumberField
            label="Saturation concentration (Cs)"
            value={cs}
            onChange={setCs}
            unit={unit}
            error={analysis.csError}
            placeholder="3.5"
            hint="The solubility of the drug in the dissolution medium."
          />
          <SelectField label="Concentration unit" value={unit} onChange={setUnit} options={CONCENTRATION_UNITS} hint="Used for Cs and every reading." />
          <SelectField label="Time unit" value={timeUnit} onChange={setTimeUnit} options={TIME_UNITS} hint="dC/dt and k are reported per this unit." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Experimental data" description="Time | Corrected Reading — one row per sampling point.">
        <DataTable
          caption="Sampling times and corrected readings"
          columns={[
            { key: "time", header: "Time", unit: timeUnit, placeholder: "0", inputClass: "w-[5.5rem]" },
            // Corrected readings run to ten or eleven characters in this practical.
            { key: "reading", header: "Corrected Reading", unit, placeholder: "0.000000", inputClass: "w-[9.5rem]" },
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
            const message = analysis.cellErrors[`${i}:time`] ?? analysis.cellErrors[`${i}:reading`];
            return message ? { tone: "error", text: message } : undefined;
          }}
        />
        <div className="mt-3 flex flex-col gap-3">
          <ExampleChips items={[{ label: SHEET_EXAMPLE.label, apply: () => { setCs(SHEET_EXAMPLE.cs); setRows(makeRows(SHEET_EXAMPLE.rows.map(([time, reading]) => ({ time, reading })))); } }]} />
          <div>
            <Button type="button" variant="outline" size="sm" onClick={clearTable}>
              <Eraser />
              Clear table
            </Button>
          </div>
        </div>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="dissolution-rate-constant" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {analysis.blocking.map((message) => (
          <LabNotice key={message} tone="danger" title="The table cannot be calculated">
            {message}
          </LabNotice>
        ))}

        {report && result && table && chart && steps ? (
          <>
            {report.warnings?.map((warning) => (
              <LabNotice key={warning} tone="warning">
                {warning}
              </LabNotice>
            ))}

            {/* ── Average k ── */}
            <CalcSection title="Dissolution rate constant">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 px-4 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Average k — midpoint method
                </p>
                <p className="mt-1 break-words text-3xl font-extrabold leading-none tracking-tight tabular-nums text-foreground sm:text-4xl">
                  {average ? show(average.value) : "—"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {average ? (
                    <>
                      Mean of {average.indexes.length} value{average.indexes.length === 1 ? "" : "s"} from the{" "}
                      <strong className="text-foreground">k = x/y (x = midpoint)</strong> column, at t ={" "}
                      {average.indexes.map((i) => result[i].timeRaw).join(", ")} {timeUnit}.
                    </>
                  ) : (
                    analysis.average && !analysis.average.ok && analysis.average.error
                  )}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <ModeSwitch
                    label="Average over"
                    value={basis}
                    onChange={setBasis}
                    options={BASIS_OPTIONS}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The supplied practical table averages only the rows <em>between</em> the first and the last: at
                    t = {result[0].timeRaw} the reading is the start of the run, and the final row&apos;s midpoint is a
                    repeat of the row above it. &ldquo;All observations&rdquo; averages every row instead — the two
                    answers differ, so the choice is shown rather than made for you.
                  </p>
                </div>
                <div className="space-y-2">
                  <ModeSwitch
                    label="Notation"
                    value={notation}
                    onChange={setNotation}
                    options={NOTATION_OPTIONS}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Changes how every calculated value is written, here and in the table below. The stored values are
                    unchanged — nothing is rounded before the next step.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <StatTiles
                  tiles={[
                    { label: "Average k", value: average ? show(average.value) : "—", note: "midpoint method", featured: true },
                    { label: "Saturation conc. (Cs)", value: cs.trim(), unit },
                    { label: "Observations", value: String(result.length) },
                    { label: "Calculated intervals", value: String(intervals), note: "rows with a dC/dt" },
                    { label: "Concentration unit", value: unit },
                    { label: "Time unit", value: timeUnit },
                  ]}
                />
              </div>
            </CalcSection>

            {/* ── The practical sheet's table ── */}
            <CalcSection
              title="Calculation results"
              description="Time | Corrected Reading | Midpoint | dC/dt | Cs − C | k = x/y | k = x/y (x = midpoint)"
            >
              <ResultTable
                caption="Dissolution rate constant calculation table"
                columns={table.columns}
                rows={table.body}
                highlightColumn={table.columns.length - 1}
              />
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                The last two columns are <strong>two different calculations</strong>, not two roundings of one: the
                sixth divides <em>dC/dt</em> by Cs − C, the seventh divides the <em>midpoint</em> by Cs − C. The
                reported average comes from the seventh. &ldquo;—&rdquo; on the final row means there is no following
                time point, so dC/dt does not exist there. Cs − C is always shown in decimal: it is the same order of
                magnitude as Cs.
              </p>
            </CalcSection>

            {/* ── Graphs ── */}
            <CalcSection title="Graphs" description="Every experimental observation is plotted; hover or tap a point for its exact value.">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartPanel title="Corrected Concentration vs Time" footer={`Every reading you entered, in ${unit}.`}>
                  <LineChart data={chart.concentration.data} margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: `Time (${timeUnit})`, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.concentration.axis.domain}
                      ticks={chart.concentration.axis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.concentration.axis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={64}
                      label={{ value: `Corrected conc. (${unit})`, angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <ConcentrationTip active={props.active} payload={props.payload} />} />
                    <Line type="linear" dataKey="y" name="Corrected concentration" stroke={CHART.primary} strokeWidth={2.2} dot={{ r: 3.5, fill: CHART.primary, stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ChartPanel>

                <ChartPanel title="Midpoint Concentration vs Time" footer="Each interval's mean concentration — the x used by the reported k.">
                  <LineChart data={chart.midpoint.data} margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: `Time (${timeUnit})`, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.midpoint.axis.domain}
                      ticks={chart.midpoint.axis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.midpoint.axis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={64}
                      label={{ value: `Midpoint (${unit})`, angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <MidpointTip active={props.active} payload={props.payload} />} />
                    <Line type="linear" dataKey="y" name="Midpoint" stroke={CHART.line} strokeWidth={2.2} dot={{ r: 3.5, fill: CHART.line, stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ChartPanel>

                <ChartPanel
                  title="Rate of Concentration Change vs Time"
                  footer="Negative values are plotted as measured; the solid rule is dC/dt = 0. The final observation has no rate."
                >
                  <LineChart data={chart.rate.data} margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: `Time (${timeUnit})`, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.rate.axis.domain}
                      ticks={chart.rate.axis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.rate.axis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={64}
                      label={{ value: `dC/dt (${unit}/${timeUnit})`, angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <RateTip active={props.active} payload={props.payload} />} />
                    <ReferenceLine y={0} stroke={CHART.axis} strokeWidth={1.5} />
                    <Line type="linear" dataKey="y" name="dC/dt" stroke={CHART.accent} strokeWidth={2.2} dot={{ r: 3.5, fill: CHART.accent, stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ChartPanel>

                <ChartPanel
                  title="Dissolution Rate Constant vs Time"
                  footer={average ? `Dashed rule: average k = ${show(average.value)} over ${average.indexes.length} row${average.indexes.length === 1 ? "" : "s"}.` : "No average is available for this data."}
                >
                  <LineChart data={chart.k.data} margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: `Time (${timeUnit})`, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.k.axis.domain}
                      ticks={chart.k.axis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.k.axis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={64}
                      label={{ value: "k (midpoint method)", angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <KTip active={props.active} payload={props.payload} />} />
                    {average && (
                      <ReferenceLine
                        y={average.value}
                        stroke={CHART.line}
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                        label={{ value: `avg ${show(average.value)}`, position: "insideTopRight", fontSize: 11, fill: CHART.line }}
                      />
                    )}
                    <Line type="linear" dataKey="y" name="k" stroke={CHART.primary} strokeWidth={2.2} dot={{ r: 3.5, fill: CHART.primary, stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ChartPanel>
              </div>
            </CalcSection>

            {/* ── Worked steps ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Calculation details — every observation</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setExpandAll((value) => !value)}>
                  {expandAll ? "Collapse all" : "Expand all"}
                </Button>
              </div>
              {steps.map((rowSteps, index) => (
                <StepBlock
                  // Remounted when "Expand all" flips: <details open> is only an initial state.
                  key={`${index}-${expandAll}-${notation}`}
                  title={`T${index + 1} — t = ${result[index].timeRaw} ${timeUnit}`}
                  badge={
                    result[index].kMidpoint.ok
                      ? { text: `k = ${show((result[index].kMidpoint as { ok: true; value: number }).value)}`, tone: result[index].rate?.ok && result[index].rate!.value < 0 ? "warning" : "ok" }
                      : { text: "k undefined", tone: "error" }
                  }
                  steps={rowSteps}
                  defaultOpen={expandAll || index === 0}
                />
              ))}
            </div>

            <FormulaNote title="Full lab record (every step, as filed)">
              <ReportSteps sections={report.sections} />
            </FormulaNote>
          </>
        ) : (
          analysis.blocking.length === 0 && (
            <PendingCard
              submitted={submitted}
              message="Enter the saturation concentration and every time point's corrected reading to build the table."
            />
          )
        )}
      </div>

      <FormulaNote title="How the calculator works" defaultOpen={false}>
        <p className="font-semibold text-foreground">1. Midpoint</p>
        <Formula>Midpoint = (C₁ + C₂) / 2</Formula>
        <p>
          The average of a reading and the one after it — the concentration roughly in the middle of that interval.
          The last observation has no reading after it, so the supplied practical table averages it with the
          <em> previous</em> one instead, which makes the final midpoint a repeat of the row above.
        </p>

        <p className="font-semibold text-foreground">2. Rate of concentration change</p>
        <Formula>dC/dt = (C₂ − C₁) / (t₂ − t₁)</Formula>
        <p>
          How fast the concentration moved between two samples. If the second reading is lower, dC/dt is negative —
          that is experimental variability, and the calculator keeps the sign rather than hiding it.
        </p>

        <p className="font-semibold text-foreground">3. Saturation difference</p>
        <Formula>Cs − C</Formula>
        <p>
          How far the solution still is from saturation, using the row&apos;s <em>own</em> corrected reading. This is
          the driving force for dissolution: it is largest at the start and shrinks as drug goes into solution.
        </p>

        <p className="font-semibold text-foreground">4. First k</p>
        <Formula>k = x / y&nbsp;&nbsp;where x = dC/dt and y = Cs − C</Formula>
        <p>
          The measured rate divided by the driving force. Its unit is per unit time ({timeUnit}⁻¹). It has no value on
          the final row, because dC/dt does not exist there.
        </p>

        <p className="font-semibold text-foreground">5. Midpoint-based k</p>
        <Formula>k = x / y&nbsp;&nbsp;where x = midpoint and y = Cs − C</Formula>
        <p>
          The same division with the interval&apos;s average concentration in place of the rate. This is the column the
          practical sheet averages and reports. Written this way it divides a concentration by a concentration, so as
          printed it carries no unit — worth knowing when you write the result up.
        </p>

        <p className="font-semibold text-foreground">6. Average</p>
        <Formula>Average k = (k₁ + k₂ + … + kₙ) / n</Formula>
        <p>
          The mean of the midpoint-based column. Which rows are included is set by the &ldquo;Average over&rdquo;
          control above — the supplied practical table uses the interior rows only.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why are there two k columns rather than one?",
            a: "They are different calculations and the practical sheet records both. The first divides the rate of change (dC/dt) by Cs − C; the second divides the interval's midpoint concentration by Cs − C. They are not two ways of writing the same number, so the calculator keeps them in separate columns and never substitutes one for the other. The reported average comes from the midpoint column.",
          },
          {
            q: "Why does the last row have no dC/dt?",
            a: "dC/dt needs a following reading to subtract from, and the final observation has none. Its cell shows “—”. Its midpoint is still calculated, using the previous reading, which is the convention the supplied practical table uses.",
          },
          {
            q: "My dC/dt came out negative. Is that wrong?",
            a: "Not necessarily. A corrected reading that falls between two samples gives a negative slope and therefore a negative k. It usually points to sampling or dilution variability rather than to drug leaving the solution. The calculator flags it and keeps the value — it never deletes or takes the absolute value of your data.",
          },
          {
            q: "Which rows does the average cover?",
            a: "By default the rows between the first and the last, reproducing the supplied practical table: the first observation is the start of the run (often C = 0, which makes its midpoint simply half the first reading) and the last row's midpoint repeats the row above it. Switch “Average over” to “All observations” to average every row instead — the two answers are genuinely different, so the calculator shows the choice rather than making it silently.",
          },
          {
            q: "Why does Cs − C use the reading rather than the midpoint?",
            a: "Because that is how the practical sheet is laid out: the midpoint is the numerator of the second k, and the denominator is always the row's own corrected reading subtracted from Cs. Mixing the two is the most common error in this table.",
          },
          {
            q: "Are the displayed values used in the next step?",
            a: "No. Every calculation runs at full precision and rounding happens only when a value is printed, so switching between scientific and decimal notation cannot change the answer.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
