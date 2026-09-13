"use client";

import { useMemo, useRef, useState } from "react";
import { GitCompare, ListChecks, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  type LabReportData,
  type ModeOption,
} from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CalibrationFields,
  ChartLegend,
  ChartPanel,
  CountStepper,
  DataTable,
  ExampleChips,
  PendingCard,
  ResultTable,
  StatTiles,
  StepBlock,
  chartSvg,
  equationABX,
  makeRows,
  makeTooltip,
  mean,
  nextRowId,
  niceAxis,
  num,
  parseReplicates,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type FigureSeries,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  analyseRelease,
  methodWarnings,
  MAX_POINTS,
  MAX_REPLICATES,
  METHOD_FORMULAS,
  METHOD_NAMES,
  MIN_POINTS,
  MIN_REPLICATES,
  RELEASE_UNITS,
  type Method,
  type MethodRow,
} from "./_release";
import { pointSteps, UNIT_CONVERSION } from "./_steps";

// ─── EXAMPLES (inputs only — every result is calculated) ─────────────────────

type Example = {
  label: string;
  sample: string;
  volume: string;
  sampleVolume: string;
  labelClaim: string;
  dilution: string;
  intercept: string;
  slope: string;
  unit: string;
  rows: [string, string[]][];
};

const EXAMPLES: Example[] = [
  {
    label: "Paracetamol 100 mg tablet, 900 mL, 4 readings",
    sample: "Paracetamol 100 mg tablet, phosphate buffer pH 5.8",
    volume: "900",
    sampleVolume: "5",
    labelClaim: "100",
    dilution: "5",
    intercept: "0.0015",
    slope: "0.0231",
    unit: "µg/mL",
    rows: [
      ["0", ["0.002", "0.002", "0.003", "0.001"]],
      ["5", ["0.115", "0.113", "0.116", "0.112"]],
      ["10", ["0.212", "0.210", "0.213", "0.209"]],
      ["15", ["0.298", "0.296", "0.299", "0.295"]],
      ["30", ["0.405", "0.403", "0.406", "0.402"]],
      ["45", ["0.459", "0.457", "0.460", "0.456"]],
      ["60", ["0.487", "0.485", "0.488", "0.484"]],
    ],
  },
  {
    label: "Diclofenac SR 100 mg, 10 mL samples, 3 readings",
    sample: "Diclofenac sodium SR 100 mg, 8 h",
    volume: "900",
    sampleVolume: "10",
    labelClaim: "100",
    dilution: "10",
    intercept: "0.002",
    slope: "0.0292",
    unit: "µg/mL",
    rows: [
      ["60", ["0.062", "0.059", "0.059"]],
      ["120", ["0.104", "0.101", "0.101"]],
      ["180", ["0.142", "0.139", "0.139"]],
      ["240", ["0.176", "0.173", "0.173"]],
      ["360", ["0.226", "0.223", "0.223"]],
      ["480", ["0.262", "0.259", "0.259"]],
    ],
  },
];

const DEFAULT_TIMES = ["0", "5", "10", "15", "30", "45", "60"];
const DEFAULT_REPLICATES = 4;

const readingKey = (k: number) => `r${k}`;

function rowCells(time: string, readings: string[] = []): Record<string, string> {
  const cells: Record<string, string> = { time, vs: "" };
  for (let k = 0; k < MAX_REPLICATES; k++) cells[readingKey(k)] = readings[k] ?? "";
  return cells;
}

const defaultRows = () => makeRows(DEFAULT_TIMES.map((time) => rowCells(time)));

const METHOD_OPTIONS: ModeOption<Method>[] = [
  { value: "A", label: "Method A — Practical sheet", description: "Adds (Vs / V) × the previous corrected concentration" },
  { value: "B", label: "Method B — Standard correction", description: "Adds Σ C × Vs of every earlier sample" },
];

type Graph = "percent" | "amount" | "conc";

export default function CumulativeDrugReleaseCalculatorPage() {
  const [sample, setSample] = useState("");
  const [volume, setVolume] = useState("");
  const [sampleVolume, setSampleVolume] = useState("");
  const [labelClaim, setLabelClaim] = useState("");
  const [dilution, setDilution] = useState("1");
  const [intercept, setIntercept] = useState("");
  const [slope, setSlope] = useState("");
  const [unit, setUnit] = useState("µg/mL");
  const [replicates, setReplicates] = useState(DEFAULT_REPLICATES);
  const [rows, setRows] = useState<TableRow[]>(defaultRows);
  const [method, setMethod] = useState<Method>("A");
  const [graph, setGraph] = useState<Graph>("percent");
  const [compare, setCompare] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({
    time: row.cells.time ?? "",
    vs: row.cells.vs ?? "",
    readings: Array.from({ length: MAX_REPLICATES }, (_, k) => row.cells[readingKey(k)] ?? ""),
  }));

  const analysis = useMemo(
    () => analyseRelease({ volume, sampleVolume, labelClaim, dilution, intercept, slope, unit, rows: cells }, replicates, submitted),
    [volume, sampleVolume, labelClaim, dilution, intercept, slope, unit, rows, replicates, submitted],
  );
  const result = analysis.result;
  const otherMethod: Method = method === "A" ? "B" : "A";

  // ── Worked steps per time point: one builder for the screen and the record ──
  const steps = useMemo(
    () => (result ? result.points.map((_, n) => pointSteps(result, method, n, cells[n], replicates)) : null),
    [result, method, replicates],
  );

  // ── Results table: the same rows on screen and on the lab record ──
  const table = useMemo(() => {
    if (!result) return null;
    const rowsOut = result.methods[method];
    const columns = [
      "Time (min)",
      "Absorbance readings (AU)",
      "Average absorbance (AU)",
      `Concentration (${unit}, × DF)`,
      "Sample volume (mL)",
      "Correction (mg)",
      ...(method === "A" ? [`Corrected conc. (${unit})`] : []),
      "Cumulative amount (mg)",
      "% Release",
    ];
    const body = result.points.map((p, i) => [
      cells[i].time.trim(),
      cells[i].readings.slice(0, replicates).map((r) => r.trim()).join(", "),
      formatSig(p.average, 4),
      formatSig(p.c, 5),
      `${num(p.vs)}${p.vsFromDefault ? " (default)" : ""}`,
      formatSig(rowsOut[i].correctionMg, 4),
      ...(method === "A" ? [formatSig(rowsOut[i].correctedConc, 5)] : []),
      formatSig(rowsOut[i].cumulativeMg, 5),
      `${formatFixed(rowsOut[i].percent, 2)} %`,
    ]);
    return { columns, body };
  }, [result, method, unit, replicates]);

  // ── Graph: the selected Y quantity, and optionally the other method dashed ──
  const chart = useMemo(() => {
    if (!result) return null;
    const pick = (row: MethodRow) => (graph === "percent" ? row.percent : graph === "amount" ? row.cumulativeMg : row.correctedConc);
    const axisLabel =
      graph === "percent" ? "Cumulative drug release (%)" : graph === "amount" ? "Cumulative amount released (mg)" : `Concentration (${unit})`;
    const quantity = graph === "percent" ? "% release" : graph === "amount" ? "Amount (mg)" : `Corrected conc. (${unit})`;
    const selected = result.methods[method];
    const other = result.methods[otherMethod];

    const data = result.points.map((p, i) => ({
      x: p.time,
      y: pick(selected[i]),
      ...(compare ? { y2: pick(other[i]) } : {}),
      ...(graph === "conc" ? { y3: p.c } : {}),
    }));

    const series: (FigureSeries & { key: "y" | "y2" | "y3"; legend: string })[] = [
      {
        key: "y",
        name: `Method ${method}${graph === "conc" ? " corrected" : ""}`,
        legend: `Method ${method} (selected)${graph === "conc" ? " — corrected concentration" : ""}`,
        points: data.map((d) => ({ x: d.x, y: d.y })),
        kind: "line-points",
        color: CHART.primary,
      },
      ...(graph === "conc"
        ? [{ key: "y3" as const, name: "Measured C × DF", legend: "Measured concentration (C × DF, no correction)", points: result.points.map((p) => ({ x: p.time, y: p.c })), kind: "line-points" as const, color: CHART.line }]
        : []),
      ...(compare
        ? [{ key: "y2" as const, name: `Method ${otherMethod} (comparison)`, legend: `Method ${otherMethod} — comparison only`, points: result.points.map((p, i) => ({ x: p.time, y: pick(other[i]) })), kind: "line-points" as const, color: CHART.accent, dashed: true }]
        : []),
    ];

    const xAxis = niceAxis(data.map((d) => d.x), { includeZero: true });
    const yAxis = niceAxis(series.flatMap((s) => s.points.map((p) => p.y)), { includeZero: true });
    return { data, series, xAxis, yAxis, axisLabel, quantity };
  }, [result, method, otherMethod, graph, compare, unit]);

  const Tip = useMemo(
    () =>
      makeTooltip([
        { key: "x", label: "Time (min)", format: (v) => formatSig(v, 5) },
        { key: "y", label: `Method ${method} · ${chart?.quantity ?? ""}`, format: (v) => formatSig(v, 5) },
        { key: "y3", label: `Measured C × DF (${unit})`, format: (v) => formatSig(v, 5) },
        { key: "y2", label: `Method ${otherMethod} · ${chart?.quantity ?? ""}`, format: (v) => formatSig(v, 5) },
      ]),
    [method, otherMethod, chart?.quantity, unit],
  );

  // ── Report: one description for Copy, PNG and Print ──
  const report = useMemo<LabReportData | null>(() => {
    if (!result || !steps || !table || !chart) return null;
    const rowsOut = result.methods[method];
    const last = rowsOut.length - 1;
    const lastTime = cells[last].time.trim();
    const conv = UNIT_CONVERSION[unit];
    return {
      title: "Cumulative Drug Release",
      context: `Pharmaceutics · ${METHOD_NAMES[method]}`,
      sample: sample.trim() || undefined,
      result: { label: `Cumulative % drug release at ${lastTime} min`, value: formatFixed(rowsOut[last].percent, 2), unit: "%" },
      warnings: [...analysis.warnings, ...methodWarnings(result, method)],
      sections: [
        {
          title: "Correction method used",
          lines: [
            METHOD_NAMES[method],
            "Assumption: each withdrawn sample is replaced with an equal volume of fresh medium, so V stays constant.",
          ],
          formulas: ["Ȳ = (B1 + B2 + … + Bn) / n", "C = [(Ȳ − a) / b] × dilution factor", ...METHOD_FORMULAS[method]],
        },
        {
          title: "Given data",
          rows: [
            { label: "Medium volume (V)", value: volume.trim(), unit: "mL" },
            { label: "Default sample volume (Vs)", value: sampleVolume.trim(), unit: "mL" },
            { label: "Label claim", value: labelClaim.trim(), unit: "mg" },
            { label: "Dilution factor", value: dilution.trim() },
            { label: "Calibration equation", value: `${equationABX(result.intercept, result.slope)}   (Y in AU, X in ${unit})` },
            { label: `Conversion ${unit} → mg/mL`, value: `× ${conv.factor}`, unit: `(${conv.reason})` },
            { label: "Readings per time point", value: String(replicates) },
          ],
        },
        {
          title: "Results",
          table: { columns: table.columns, rows: table.body },
        },
        ...result.points.map((_, n) => ({
          title: `Time point ${n + 1} — t = ${cells[n].time.trim()} min`,
          formulas: steps[n].flatMap((step, s) => [`${s + 1}. ${step.label}`, ...step.lines.map((line) => `   ${line}`)]),
        })),
      ],
      notes: [
        "Values are rounded for display only; every step uses full precision.",
        `Headline numbers use ${METHOD_NAMES[method]}.`,
      ],
      figure: {
        svg: chartSvg({ xLabel: "Time (min)", yLabel: chart.axisLabel, series: chart.series, includeZeroY: true }),
        width: FIGURE_WIDTH,
        height: FIGURE_HEIGHT,
        caption: `${chart.axisLabel} vs time — ${METHOD_NAMES[method]}`,
      },
    };
  }, [result, steps, table, chart, method, analysis.warnings, sample, volume, sampleVolume, labelClaim, dilution, unit, replicates]);

  const updateCell = (id: number, key: string, value: string) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)));

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setVolume("");
    setSampleVolume("");
    setLabelClaim("");
    setDilution("1");
    setIntercept("");
    setSlope("");
    setUnit("µg/mL");
    setReplicates(DEFAULT_REPLICATES);
    setRows(defaultRows());
    setMethod("A");
    setGraph("percent");
    setCompare(false);
    setExpandAll(false);
  };

  const selectedRows = result?.methods[method] ?? null;
  const last = selectedRows ? selectedRows.length - 1 : -1;
  const currentWarnings = report?.warnings ?? analysis.warnings;

  return (
    <CalculatorShell
      title="Cumulative Drug Release Calculator"
      subtitle="Corrected cumulative amount and % drug release from a dissolution or release study, with the sample-withdrawal correction worked out at every time point."
      icon={TrendingUp}
      eyebrow="Pharmaceutics"
      aside={
        <>
          <CalcAbout title="About the sampling correction">
            <p>
              Each sample you withdraw carries drug out of the vessel. If you simply multiply the concentration you
              measure by the vessel volume, that drug is lost from the total and the release is{" "}
              <strong>underestimated</strong> — more so at every later time point.
            </p>
            <CalcList
              title="The two methods"
              items={[
                "Method A (practical sheet): add (Vs / V) × the previous corrected concentration",
                "Method B (standard): add the drug removed by every earlier sample, Σ C × Vs",
                "Both assume each sample is replaced with fresh medium, so V stays constant",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you trust the result"
              items={[
                "Use the method your practical or monograph specifies",
                "The calibration unit must be a mass per volume so the amount can be in mg",
                "Release above 100% points to a wrong label claim, dilution factor or unit",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Study set-up">
        <TextField label="Drug / formulation (optional)" value={sample} onChange={setSample} placeholder="e.g. Paracetamol 500 mg tablet" hint="Printed on the lab record." />
        <FieldGrid>
          <NumberField label="Dissolution / release medium volume (V)" value={volume} onChange={setVolume} unit="mL" error={analysis.fieldErrors.volume} placeholder="900" />
          <NumberField
            label="Sample withdrawal volume (Vs)"
            value={sampleVolume}
            onChange={setSampleVolume}
            unit="mL"
            error={analysis.fieldErrors.sampleVolume}
            placeholder="5"
            hint="Default for every time point; override a row in the table."
          />
          <NumberField label="Label claim / theoretical drug amount" value={labelClaim} onChange={setLabelClaim} unit="mg" error={analysis.fieldErrors.labelClaim} placeholder="100" />
          <NumberField
            label="Dilution factor"
            value={dilution}
            onChange={setDilution}
            unit="×"
            error={analysis.fieldErrors.dilution}
            hint="1 if the sample was read undiluted. 5 mL made up to 25 mL → 5."
          />
        </FieldGrid>
        <LabNotice tone="info" title="Assumption">
          Each withdrawn sample is replaced with an equal volume of fresh medium, so the vessel volume V stays constant.
        </LabNotice>
      </CalcSection>

      <CalcSection title="Calibration curve" description="Y = a + bX, where Y is absorbance and X is concentration.">
        <CalibrationFields
          intercept={intercept}
          slope={slope}
          unit={unit}
          onIntercept={setIntercept}
          onSlope={setSlope}
          onUnit={setUnit}
          show={submitted}
          units={RELEASE_UNITS}
        />
      </CalcSection>

      <CalcSection title="Time points" description="Time | Absorbance readings B1…Bn | Sample volume withdrawn. Leave a sample volume blank to use the default Vs.">
        <CountStepper
          label="Absorbance readings per time point"
          value={replicates}
          min={MIN_REPLICATES}
          max={MAX_REPLICATES}
          onChange={setReplicates}
          hint={`${MIN_REPLICATES}–${MAX_REPLICATES} readings. Every visible reading is required.`}
        />
        <DataTable
          caption="Sampling times, absorbance readings and sample volumes"
          columns={[
            { key: "time", header: "Time", unit: "min", placeholder: "0" },
            ...Array.from({ length: replicates }, (_, k) => ({ key: readingKey(k), header: `B${k + 1}`, unit: "AU", placeholder: "0.000" })),
            {
              key: "average",
              header: "Average",
              unit: "AU",
              computed: (i: number) => {
                const parsed = parseReplicates(cells[i]?.readings.slice(0, replicates) ?? []);
                return parsed.ok ? formatSig(mean(parsed.value)!, 4) : "—";
              },
            },
            { key: "vs", header: "Sample withdrawn", unit: "mL", placeholder: sampleVolume.trim() || "Vs" },
          ]}
          rows={rows}
          rowHeader={(i) => `T${i + 1}`}
          onCell={updateCell}
          onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
          onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: rowCells("") }])}
          addLabel="Add time point"
          minRows={MIN_POINTS}
          maxRows={MAX_POINTS}
          cellError={(i, key) => analysis.cellErrors[`${i}:${key}`]}
          rowMessage={(i) => {
            const message = analysis.rowErrors[i];
            return message ? { tone: "error", text: message } : undefined;
          }}
        />
        <ExampleChips
          items={EXAMPLES.map((example) => ({
            label: example.label,
            apply: () => {
              setSample(example.sample);
              setVolume(example.volume);
              setSampleVolume(example.sampleVolume);
              setLabelClaim(example.labelClaim);
              setDilution(example.dilution);
              setIntercept(example.intercept);
              setSlope(example.slope);
              setUnit(example.unit);
              setReplicates(example.rows[0][1].length);
              setRows(makeRows(example.rows.map(([time, readings]) => rowCells(time, readings))));
            },
          }))}
        />
      </CalcSection>

      <CalcSection title="Correction method">
        <ModeSwitch label="Sample-withdrawal correction method" value={method} onChange={setMethod} options={METHOD_OPTIONS} />
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="cumulative-drug-release" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {analysis.blocking.map((message) => (
          <LabNotice key={message} tone="danger" title="Cannot calculate">{message}</LabNotice>
        ))}

        {result && selectedRows && table && chart && steps ? (
          <>
            <LabNotice tone="info" title={`Using ${METHOD_NAMES[method]}`}>
              <div className="mt-1 space-y-1 font-mono text-[12.5px]">
                {METHOD_FORMULAS[method].map((formula) => (
                  <p key={formula} className="overflow-x-auto whitespace-pre">{formula}</p>
                ))}
              </div>
            </LabNotice>

            {currentWarnings.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}

            <StatTiles
              tiles={[
                {
                  label: "Cumulative % release",
                  value: formatFixed(selectedRows[last].percent, 2),
                  unit: "%",
                  note: `at t = ${cells[last].time.trim()} min`,
                  featured: true,
                },
                { label: "Cumulative amount", value: formatSig(selectedRows[last].cumulativeMg, 4), unit: "mg", note: `of ${labelClaim.trim()} mg label claim` },
                {
                  label: "Sampling correction, final point",
                  value: formatSig(selectedRows[last].correctionMg, 4),
                  unit: "mg",
                  note: method === "A" ? "Vs × previous corrected C" : "Σ C × Vs of all earlier samples",
                },
                { label: "Method used", value: `Method ${method}`, note: method === "A" ? "practical sheet" : "standard correction" },
                {
                  label: `Method ${otherMethod}, final point`,
                  value: formatFixed(result.methods[otherMethod][last].percent, 2),
                  unit: "%",
                  note: "for comparison only",
                },
                { label: "Time points", value: String(result.points.length), note: `${replicates} reading${replicates > 1 ? "s" : ""} each` },
              ]}
            />

            <Tabs value={graph} onValueChange={(value) => setGraph(value as Graph)}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <TabsList aria-label="Quantity on the Y axis">
                  <TabsTrigger value="percent">% release</TabsTrigger>
                  <TabsTrigger value="amount">Amount (mg)</TabsTrigger>
                  <TabsTrigger value="conc">Conc. ({unit})</TabsTrigger>
                </TabsList>
                <Button type="button" variant="outline" size="sm" aria-pressed={compare} onClick={() => setCompare((value) => !value)} className={compare ? "border-blue-300 bg-blue-50" : undefined}>
                  <GitCompare />
                  {compare ? "Hide other method" : "Compare both methods"}
                </Button>
              </div>
              <TabsContent value={graph}>
                <ChartPanel
                  title={`${chart.axisLabel} vs time`}
                  footer={
                    <div className="space-y-2">
                      {chart.series.length > 1 && (
                        <ChartLegend
                          items={chart.series.map((s) => ({ label: s.legend, color: s.color, shape: s.dashed ? ("dash" as const) : ("line" as const) }))}
                        />
                      )}
                      <p>
                        Headline numbers use <strong className="text-foreground">{METHOD_NAMES[method]}</strong>.
                        {compare && ` The dashed line is Method ${otherMethod}, shown for comparison only.`}
                      </p>
                    </div>
                  }
                >
                  <LineChart data={chart.data} margin={{ top: 12, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: "Time (min)", position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.yAxis.domain}
                      ticks={chart.yAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.yAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={56}
                      label={{ value: chart.axisLabel, angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                    {chart.series.map((s) => (
                      <Line
                        key={s.key}
                        type="linear"
                        dataKey={s.key}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2.2}
                        strokeDasharray={s.dashed ? "6 4" : undefined}
                        dot={{ r: 3.5, fill: s.color, stroke: "#fff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ChartPanel>
              </TabsContent>
            </Tabs>

            <ResultTable caption={`Cumulative release results — ${METHOD_NAMES[method]}`} columns={table.columns} rows={table.body} highlightColumn={table.columns.length - 1} />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Calculation details — every time point</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setExpandAll((value) => !value)}>
                  <ListChecks />
                  {expandAll ? "Collapse all" : "Expand all"}
                </Button>
              </div>
              {steps.map((pointStepList, n) => (
                <StepBlock
                  // Remounted when "Expand all" flips, because <details open> is only an initial state here.
                  key={`${n}-${expandAll}-${method}`}
                  title={`T${n + 1} — t = ${cells[n].time.trim()} min`}
                  badge={{ text: `${formatFixed(selectedRows[n].percent, 2)} %`, tone: selectedRows[n].percent > 100 ? "warning" : "ok" }}
                  steps={pointStepList}
                  defaultOpen={expandAll || n <= 1}
                />
              ))}
            </div>
          </>
        ) : (
          analysis.blocking.length === 0 && (
            <PendingCard submitted={submitted} message="Enter the set-up, the calibration line and every absorbance reading to calculate the release profile." />
          )
        )}
      </div>

      <FormulaNote>
        <Formula>Average absorbance Ȳ = (B1 + B2 + … + Bn) / n</Formula>
        <Formula>C = (Ȳ − a) / b &nbsp;→&nbsp; actual C = C × dilution factor</Formula>
        <p className="font-semibold text-foreground">{METHOD_NAMES[method]}</p>
        {METHOD_FORMULAS[method].map((formula) => (
          <Formula key={formula}>{formula}</Formula>
        ))}
        <p>
          C is converted to mg/mL before any amount is calculated (µg/mL × 0.001). Vs is the volume withdrawn at each
          time point; the correction at a time point uses the samples withdrawn <em>before</em> it. The formulas of the
          other method appear here when you switch to it.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why not just multiply the concentration by V?",
            a: "Because every earlier sample took drug out of the vessel. C × V counts only the drug still in the medium, so the release would be underestimated, and the error grows with every sample withdrawn.",
          },
          {
            q: "Which method should I use?",
            a: "The one your practical sheet or monograph specifies. Method A adds a fraction Vs/V of the previous corrected concentration; Method B adds back the milligrams removed by every earlier sample. With small samples in a large vessel they differ only slightly — switch on \"Compare both methods\" to see by how much.",
          },
          {
            q: "Why does the correction at a time point use the previous sample's volume?",
            a: "The drug removed at a time point leaves the vessel after that reading, so it only affects later time points. The volume withdrawn at the last time point therefore does not change any result.",
          },
          {
            q: "My release is above 100%. Is the calculator wrong?",
            a: "Usually an input is: check the label claim, the dilution factor, and that the calibration unit (µg/mL vs mg/mL) matches the line. A tablet can also genuinely contain slightly more than its label claim.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
