"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, LineChart as LineChartIcon } from "lucide-react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
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
  calculatorHref,
  formatFixed,
  formatSig,
  type LabReportData,
} from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CONCENTRATION_UNITS,
  ChartLegend,
  ChartPanel,
  CountStepper,
  DataTable,
  ExampleChips,
  PendingCard,
  ReportSteps,
  StatTiles,
  chartSvg,
  equationMXC,
  makeRows,
  makeTooltip,
  nextRowId,
  niceAxis,
  num,
  paren,
  precise,
  saveCalibration,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import { analyseCalibration, MAX_STANDARDS, MIN_STANDARDS } from "./_calibration";

// ─── EXAMPLES (inputs only — every result is calculated) ─────────────────────

const EXAMPLES: { label: string; unit: string; unknown: string; rows: [string, string][] }[] = [
  {
    label: "Paracetamol, 243 nm (5 standards)",
    unit: "µg/mL",
    unknown: "0.452",
    rows: [["2", "0.131"], ["4", "0.268"], ["6", "0.396"], ["8", "0.529"], ["10", "0.664"]],
  },
  {
    label: "With a blank (6 standards)",
    unit: "µg/mL",
    unknown: "0.318",
    rows: [["0", "0.004"], ["5", "0.118"], ["10", "0.237"], ["15", "0.349"], ["20", "0.468"], ["25", "0.583"]],
  },
];

const blankRow = () => ({ conc: "", abs: "" });

/** The tools that accept this line as Y = a + bX (a = c, b = m). */
const CONSUMERS = [
  { slug: "dissolution-calculator", label: "Dissolution" },
  { slug: "cumulative-drug-release-calculator", label: "Cumulative release" },
  { slug: "dialysis-diffusion-calculator", label: "Dialysis / diffusion" },
  { slug: "partition-coefficient-calculator", label: "Partition coefficient" },
];

export default function CalibrationCurveCalculatorPage() {
  const [sample, setSample] = useState("");
  const [unit, setUnit] = useState("µg/mL");
  const [rows, setRows] = useState<TableRow[]>(() => makeRows(Array.from({ length: 5 }, blankRow)));
  const [unknownAbs, setUnknownAbs] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({ conc: row.cells.conc ?? "", abs: row.cells.abs ?? "" }));
  const analysis = useMemo(() => analyseCalibration(cells, unknownAbs, submitted), [rows, unknownAbs, submitted]); // cells derives from rows
  const fit = analysis.fit?.ok ? analysis.fit.value : null;
  const points = analysis.points;

  // Keep the latest valid line on this device so the dissolution, release,
  // dialysis and partition tools can import it.
  useEffect(() => {
    if (!fit) return;
    saveCalibration({ intercept: fit.intercept, slope: fit.slope, r2: fit.r2, unit, n: fit.n, savedAt: new Date().toISOString() });
  }, [fit, unit]);

  const setCount = (count: number) => {
    setRows((current) =>
      count > current.length
        ? [...current, ...makeRows(Array.from({ length: count - current.length }, blankRow))]
        : current.slice(0, count),
    );
  };

  // ── Report: one description for the screen details, Copy, PNG and Print ──
  const report = useMemo<LabReportData | null>(() => {
    if (!fit || !points) return null;
    const { n, sumX, sumY, sumXY, sumX2, meanX, meanY, slope, intercept, sse, sst, r2, predicted, slopeNumerator, denominator } = fit;
    const X = cells.map((c) => c.conc.trim());
    const Y = cells.map((c) => c.abs.trim());
    const u = unit;
    const equation = equationMXC(slope, intercept);
    const unknown = analysis.unknown;

    const lineSeries = [
      { x: fit.xMin, y: slope * fit.xMin + intercept },
      { x: fit.xMax, y: slope * fit.xMax + intercept },
    ];

    return {
      title: "Calibration Curve",
      context: "Pharmaceutical Analysis · UV-Vis calibration",
      sample: sample.trim() || undefined,
      result:
        unknown && unknown.concentration.ok
          ? { label: "Concentration of unknown sample", value: num(unknown.concentration.value, 4), unit: u }
          : { label: "Regression equation", value: equationMXC(slope, intercept, 4) },
      warnings: [...analysis.warnings, ...(unknown && !unknown.concentration.ok ? [unknown.concentration.error] : [])],
      sections: [
        {
          title: "Result",
          rows: [
            { label: "Slope (m)", value: num(slope), unit: `AU per ${u}` },
            { label: "Intercept (c)", value: num(intercept), unit: "AU" },
            { label: "Regression equation", value: equation },
            { label: "R²", value: r2 === null ? "undefined (SST = 0)" : formatFixed(r2, 4) },
            { label: "Unknown absorbance", value: unknown ? unknownAbs.trim() : "not entered", unit: unknown ? "AU" : undefined },
            {
              label: "Unknown concentration",
              value: unknown ? (unknown.concentration.ok ? num(unknown.concentration.value, 4) : "cannot be calculated") : "—",
              unit: unknown?.concentration.ok ? u : undefined,
            },
          ],
        },
        {
          title: "Entered standard values",
          table: {
            columns: ["Standard", `Concentration X (${u})`, "Absorbance Y", "XY", "X²"],
            rows: points.map((p, i) => [`Std ${i + 1}`, X[i], Y[i], num(p.x * p.y), num(p.x * p.x)]),
          },
          rows: [
            { label: "Number of standards (n)", value: String(n) },
            { label: "Mean X (x̄ = ΣX / n)", value: `${num(sumX)} / ${n} = ${num(meanX)}`, unit: u },
            { label: "Mean Y (ȳ = ΣY / n)", value: `${num(sumY)} / ${n} = ${num(meanY)}`, unit: "AU" },
          ],
        },
        { title: "ΣX", formulas: [`ΣX = ${X.join(" + ")}`, `ΣX = ${num(sumX)}`] },
        { title: "ΣY", formulas: [`ΣY = ${Y.join(" + ")}`, `ΣY = ${num(sumY)}`] },
        { title: "ΣXY", formulas: [`ΣXY = ${points.map((_, i) => `(${X[i]} × ${Y[i]})`).join(" + ")}`, `ΣXY = ${num(sumXY)}`] },
        { title: "ΣX²", formulas: [`ΣX² = ${X.map((x) => `${paren(x)}²`).join(" + ")}`, `ΣX² = ${num(sumX2)}`] },
        {
          title: "Slope calculation",
          formulas: [
            "m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]",
            `m = [${n} × ${num(sumXY)} − (${num(sumX)})(${num(sumY)})] / [${n} × ${num(sumX2)} − (${num(sumX)})²]`,
            `m = (${num(n * sumXY)} − ${num(sumX * sumY)}) / (${num(n * sumX2)} − ${num(sumX * sumX)})`,
            `m = ${num(slopeNumerator)} / ${num(denominator)} = ${num(slope)} AU per ${u}`,
          ],
        },
        {
          title: "Intercept calculation",
          formulas: [
            "c = [Σy − mΣx] / n",
            `c = [${num(sumY)} − ${paren(slope)} × ${num(sumX)}] / ${n}`,
            `c = (${num(sumY)} − ${paren(slope * sumX)}) / ${n} = ${num(intercept)} AU`,
          ],
        },
        { title: "Regression equation", formulas: ["Y = mX + c", equation], lines: [`Y is absorbance (AU); X is concentration (${u}).`] },
        {
          title: "Unknown concentration calculation",
          formulas: unknown
            ? unknown.concentration.ok
              ? ["X = (Y − c) / m", `X = (${unknownAbs.trim()} − ${paren(intercept)}) / ${paren(slope)}`, `X = ${num(unknown.absorbance - intercept)} / ${paren(slope)} = ${num(unknown.concentration.value)} ${u}`]
              : ["X = (Y − c) / m"]
            : ["X = (Y − c) / m"],
          lines: unknown
            ? unknown.concentration.ok
              ? unknown.outsideRange
                ? [`Outside the standard range ${num(fit.xMin)}–${num(fit.xMax)} ${u}: extrapolated.`]
                : [`Within the standard range ${num(fit.xMin)}–${num(fit.xMax)} ${u}.`]
              : [unknown.concentration.error]
            : ["No unknown absorbance entered."],
        },
        {
          title: "R² calculation",
          table: {
            columns: ["Std", "y", "ŷ = mX + c", "(y − ŷ)²", "(y − ȳ)²"],
            rows: points.map((p, i) => [String(i + 1), Y[i], num(predicted[i]), num((p.y - predicted[i]) ** 2), num((p.y - meanY) ** 2)]),
          },
          formulas: [
            `SSE = Σ(y − ŷ)² = ${num(sse)}`,
            `SST = Σ(y − ȳ)² = ${num(sst)}`,
            "R² = 1 − [Σ(y − ŷ)² / Σ(y − ȳ)²]",
            r2 === null ? "R² is undefined because SST = 0." : `R² = 1 − (${num(sse)} / ${num(sst)}) = ${num(r2, 6)}`,
          ],
        },
      ],
      notes: [
        ...analysis.notes,
        "Least-squares linear regression of absorbance (Y) on concentration (X). Values are rounded for display only; every step uses full precision.",
      ],
      figure: {
        svg: chartSvg({
          xLabel: `Concentration (${u})`,
          yLabel: "Absorbance (AU)",
          series: [
            { name: "Regression line", points: lineSeries, kind: "line", color: CHART.line },
            { name: "Standards", points, kind: "points", color: CHART.primary },
            ...(unknown?.concentration.ok ? [{ name: "Unknown", points: [{ x: unknown.concentration.value, y: unknown.absorbance }], kind: "points" as const, color: CHART.accent }] : []),
          ],
        }),
        width: FIGURE_WIDTH,
        height: FIGURE_HEIGHT,
        caption: `${equation}   R² = ${r2 === null ? "undefined" : formatFixed(r2, 4)}`,
      },
    };
  }, [fit, points, analysis, unit, sample, unknownAbs]); // cells derives from rows

  // ── Chart data ──
  const chart = useMemo(() => {
    if (!fit || !points) return null;
    const unknownPoint = analysis.unknown?.concentration.ok ? { x: analysis.unknown.concentration.value, y: analysis.unknown.absorbance } : null;
    const xs = [...points.map((p) => p.x), ...(unknownPoint ? [unknownPoint.x] : [])];
    const xAxis = niceAxis(xs, { includeZero: true });
    const lo = Math.min(fit.xMin, unknownPoint?.x ?? fit.xMin);
    const hi = Math.max(fit.xMax, unknownPoint?.x ?? fit.xMax);
    const line = [lo, hi].map((x) => ({ x, y: fit.slope * x + fit.intercept, series: "Regression line" }));
    const yAxis = niceAxis([...points.map((p) => p.y), ...line.map((p) => p.y), ...(unknownPoint ? [unknownPoint.y] : [])], { includeZero: true });
    return { xAxis, yAxis, line, unknownPoint };
  }, [fit, points, analysis.unknown]);

  const Tip = useMemo(
    () =>
      makeTooltip([
        { key: "x", label: `Concentration (${unit})`, format: (v) => formatSig(v, 5) },
        { key: "y", label: "Absorbance (AU)", format: (v) => formatSig(v, 5) },
      ]),
    [unit],
  );

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setUnit("µg/mL");
    setUnknownAbs("");
    setRows(makeRows(Array.from({ length: 5 }, blankRow)));
  };

  const fitError = analysis.fit && !analysis.fit.ok ? analysis.fit.error : null;

  return (
    <CalculatorShell
      title="Calibration Curve Calculator"
      subtitle="Least-squares regression of absorbance on concentration — slope, intercept, R² and the concentration of an unknown, with every step shown."
      icon={LineChartIcon}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About calibration curves">
            <p>
              A <strong>calibration curve</strong> relates a measured response (absorbance) to known standard
              concentrations. Within the range where Beer–Lambert holds the relationship is a straight line,
              Y = mX + c, and an unknown&apos;s concentration is read back from its absorbance.
            </p>
            <CalcList
              title="Good practice"
              items={[
                "Use at least 5 standards spanning the expected sample concentration",
                "Zero the instrument with the blank (solvent) before reading",
                "Keep absorbance roughly between 0.1 and 1.0 AU",
              ]}
            />
            <CalcList
              tone="caution"
              title="Read the result carefully"
              items={[
                "A high R² does not prove linearity — look at the points on the graph",
                "An unknown outside the standard range is an extrapolation",
                "Units of the unknown are the units you entered for the standards",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Experiment">
        <FieldGrid>
          <TextField label="Drug / sample name (optional)" value={sample} onChange={setSample} placeholder="e.g. Paracetamol in 0.1 N NaOH" hint="Printed on the lab record." />
          <SelectField label="Concentration unit (X)" value={unit} onChange={setUnit} options={CONCENTRATION_UNITS} hint="Used for the standards and for the unknown's result." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Standards" description="Standard # | Concentration (X) | Absorbance (Y)">
        <CountStepper label="Number of standards" value={rows.length} min={MIN_STANDARDS} max={MAX_STANDARDS} onChange={setCount} hint={`${MIN_STANDARDS}–${MAX_STANDARDS} standards.`} />
        <DataTable
          caption="Standard concentrations and absorbances"
          columns={[
            { key: "conc", header: "Concentration (X)", unit, placeholder: "0.0" },
            { key: "abs", header: "Absorbance (Y)", unit: "AU", placeholder: "0.000" },
          ]}
          rows={rows}
          rowHeader={(i) => `Std ${i + 1}`}
          onCell={(id, key, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)))}
          onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
          onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: blankRow() }])}
          addLabel="Add standard"
          minRows={MIN_STANDARDS}
          maxRows={MAX_STANDARDS}
          cellError={(i, key) => analysis.cellErrors[`${i}:${key}`]}
          rowMessage={(i) => {
            const message = analysis.cellErrors[`${i}:conc`] ?? analysis.cellErrors[`${i}:abs`];
            return message ? { tone: "error", text: message } : undefined;
          }}
        />
        <ExampleChips
          items={EXAMPLES.map((example) => ({
            label: example.label,
            apply: () => {
              setUnit(example.unit);
              setUnknownAbs(example.unknown);
              setRows(makeRows(example.rows.map(([conc, abs]) => ({ conc, abs }))));
            },
          }))}
        />
      </CalcSection>

      <CalcSection title="Unknown sample">
        <FieldGrid>
          <NumberField label="Unknown absorbance" value={unknownAbs} onChange={setUnknownAbs} unit="AU" error={analysis.unknownError} hint="Optional — leave blank to fit the curve only." />
        </FieldGrid>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="calibration-curve" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {fitError && <LabNotice tone="danger" title="The line cannot be fitted">{fitError}</LabNotice>}

        {report && fit && chart ? (
          <>
            {report.warnings?.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}

            <StatTiles
              tiles={[
                { label: "Slope (m)", value: num(fit.slope, 4), unit: `AU/(${unit})` },
                { label: "Intercept (c)", value: num(fit.intercept, 4), unit: "AU" },
                { label: "R²", value: fit.r2 === null ? "—" : formatFixed(fit.r2, 4), note: fit.r2 === null ? "undefined (SST = 0)" : undefined },
                { label: "Unknown absorbance", value: analysis.unknown ? unknownAbs.trim() : "—", unit: analysis.unknown ? "AU" : undefined },
                {
                  label: "Unknown concentration",
                  value: analysis.unknown?.concentration.ok ? num(analysis.unknown.concentration.value, 4) : "—",
                  unit: analysis.unknown?.concentration.ok ? unit : undefined,
                  note: analysis.unknown && !analysis.unknown.concentration.ok ? "cannot be calculated" : analysis.unknown?.outsideRange ? "extrapolated" : undefined,
                  featured: true,
                },
                { label: "Standards (n)", value: String(fit.n) },
              ]}
            />
            <p className="rounded-xl border border-l-[3px] border-l-blue-600 bg-card px-3.5 py-3 font-mono text-[15px] font-semibold text-foreground">
              {equationMXC(fit.slope, fit.intercept, 5)}
            </p>

            <ChartPanel
              title="Calibration graph — absorbance vs concentration"
              footer={
                <div className="space-y-2">
                  <p className="font-mono text-[13px] text-foreground">
                    {equationMXC(fit.slope, fit.intercept, 5)} · R² = {fit.r2 === null ? "undefined" : formatFixed(fit.r2, 4)}
                  </p>
                  <ChartLegend
                    items={[
                      { label: "Standards", color: CHART.primary, shape: "dot" },
                      { label: "Regression line", color: CHART.line, shape: "line" },
                      ...(chart.unknownPoint ? [{ label: "Unknown", color: CHART.accent, shape: "diamond" as const }] : []),
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
                  label={{ value: `Concentration (${unit})`, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={chart.yAxis.domain}
                  ticks={chart.yAxis.ticks}
                  tickFormatter={(v: number) => tickLabel(v, chart.yAxis.ticks)}
                  tick={AXIS_TICK}
                  stroke={CHART.axis}
                  width={52}
                  label={{ value: "Absorbance (AU)", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                <Scatter
                  name="Regression line"
                  data={chart.line}
                  line={{ stroke: CHART.line, strokeWidth: 2 }}
                  shape={() => <g />}
                  legendType="none"
                  isAnimationActive={false}
                />
                <Scatter name="Standards" data={points!.map((p) => ({ ...p, series: "Standard" }))} fill={CHART.primary} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
                {chart.unknownPoint && (
                  <Scatter name="Unknown" data={[{ ...chart.unknownPoint, series: "Unknown sample" }]} fill={CHART.accent} shape="diamond" isAnimationActive={false} />
                )}
              </ScatterChart>
            </ChartPanel>

            <div className="rounded-2xl border bg-card p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">Use this line in another practical</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Those tools write the line as Y = a + bX, so a = c = {num(fit.intercept)} and b = m = {num(fit.slope)}. It is also saved on this device — press
                &ldquo;Import saved calibration&rdquo; there.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CONSUMERS.map((consumer) => (
                  <Button key={consumer.slug} variant="outline" asChild className="justify-between">
                    <a href={calculatorHref(consumer.slug, { a: precise(fit.intercept), b: precise(fit.slope), unit })}>
                      {consumer.label}
                      <ArrowRight />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <FormulaNote title="Calculation details (step by step)">
              <ReportSteps sections={report.sections} />
            </FormulaNote>
          </>
        ) : (
          !fitError && <PendingCard submitted={submitted} message="Enter every standard's concentration and absorbance to fit the curve." />
        )}
      </div>

      <FormulaNote>
        <Formula>m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]</Formula>
        <Formula>c = [Σy − mΣx] / n</Formula>
        <Formula>Y = mX + c &nbsp;→&nbsp; X = (Y − c) / m</Formula>
        <Formula>R² = 1 − [Σ(y − ŷ)² / Σ(y − ȳ)²] = 1 − SSE / SST</Formula>
        <p>
          ŷ is the absorbance the line predicts at each standard&apos;s concentration; ȳ is the mean absorbance.
          SSE measures how far the points lie from the line, SST how far they lie from their mean.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "What R² is acceptable?", a: "Your laboratory manual or monograph sets the criterion — many UV assay practicals ask for R² of at least 0.99. R² alone does not prove linearity: always look at whether the points curve away from the line." },
          { q: "Should I include the blank (0, 0) as a standard?", a: "Only if you actually measured it as a standard. Adding a (0, 0) point you did not measure pulls the line through the origin artificially. Enter the readings you recorded." },
          { q: "Why is my unknown concentration negative?", a: "Its absorbance is below the intercept c. The sample is too dilute for this curve, the blank was not zeroed, or the reading is wrong." },
          { q: "Can two standards have the same concentration?", a: "Yes — replicate standards are fitted as separate points. The calculator only stops if every concentration is the same, because the slope is then undefined." },
        ]}
      />
    </CalculatorShell>
  );
}
