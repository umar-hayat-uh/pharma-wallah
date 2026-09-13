"use client";

import { useMemo, useRef, useState } from "react";
import { FlaskConical } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
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
  calculatorHref,
  formatFixed,
  formatSig,
  type LabReportData,
} from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CalibrationFields,
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
  nextRowId,
  niceAxis,
  num,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  analyseDissolution,
  readingKey,
  timePointSteps,
  DEFAULT_READINGS,
  DEFAULT_TIMES,
  DISSOLUTION_UNITS,
  MAX_READINGS,
  MAX_TIME_POINTS,
  MIN_READINGS,
  MIN_TIME_POINTS,
  type DissolutionResult,
} from "./_dissolution";

// ─── EXAMPLES (inputs only — every result is calculated) ─────────────────────

type Example = {
  label: string;
  sample: string;
  labelClaim: string;
  mediumVolume: string;
  sampleVolume: string;
  dilutionFactor: string;
  intercept: string;
  slope: string;
  unit: string;
  /** [time, B1, B2, …] — the replicate count is the row length − 1. */
  rows: string[][];
};

const EXAMPLES: Example[] = [
  {
    label: "Paracetamol 500 mg · 900 mL pH 5.8 (4 readings)",
    sample: "Paracetamol 500 mg tablet — phosphate buffer pH 5.8",
    labelClaim: "500",
    mediumVolume: "900",
    sampleVolume: "5",
    dilutionFactor: "50",
    intercept: "0.0012",
    slope: "0.0645",
    unit: "µg/mL",
    rows: [
      ["0", "0.004", "0.006", "0.003", "0.005"],
      ["10", "0.221", "0.247", "0.236", "0.228"],
      ["20", "0.402", "0.431", "0.418", "0.409"],
      ["30", "0.538", "0.561", "0.549", "0.552"],
      ["40", "0.612", "0.641", "0.628", "0.619"],
      ["50", "0.61", "0.828", "0.58", "0.737"],
      ["60", "0.689", "0.712", "0.701", "0.694"],
    ],
  },
  {
    label: "Diclofenac sodium 50 mg · mg/L (3 readings)",
    sample: "Diclofenac sodium 50 mg tablet — phosphate buffer pH 6.8",
    labelClaim: "50",
    mediumVolume: "900",
    sampleVolume: "10",
    dilutionFactor: "2",
    intercept: "0.0035",
    slope: "0.029",
    unit: "mg/L",
    rows: [
      ["0", "0.004", "0.005", "0.003"],
      ["5", "0.118", "0.126", "0.121"],
      ["10", "0.254", "0.262", "0.247"],
      ["15", "0.371", "0.384", "0.366"],
      ["30", "0.566", "0.581", "0.574"],
      ["45", "0.689", "0.702", "0.695"],
      ["60", "0.741", "0.756", "0.749"],
    ],
  },
];

/** Every row carries all six replicate cells; only the visible ones are read. */
const blankCells = (time = ""): Record<string, string> => {
  const cells: Record<string, string> = { time };
  for (let k = 0; k < MAX_READINGS; k++) cells[readingKey(k)] = "";
  return cells;
};

const defaultRows = () => makeRows(DEFAULT_TIMES.map((time) => blankCells(time)));

type Graph = "concentration" | "release";

export default function DissolutionCalculatorPage() {
  const [sample, setSample] = useState("");
  const [labelClaim, setLabelClaim] = useState("");
  const [mediumVolume, setMediumVolume] = useState("");
  const [sampleVolume, setSampleVolume] = useState("");
  const [dilutionFactor, setDilutionFactor] = useState("1");
  const [intercept, setIntercept] = useState("");
  const [slope, setSlope] = useState("");
  const [unit, setUnit] = useState("µg/mL");
  const [replicates, setReplicates] = useState(DEFAULT_READINGS);
  const [rows, setRows] = useState<TableRow[]>(defaultRows);
  const [graph, setGraph] = useState<Graph>("concentration");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const analysis = useMemo(
    () =>
      analyseDissolution({
        labelClaim,
        mediumVolume,
        sampleVolume,
        dilutionFactor,
        intercept,
        slope,
        unit,
        show: submitted,
        rows: rows.map((row) => ({
          time: row.cells.time ?? "",
          readings: Array.from({ length: replicates }, (_, k) => row.cells[readingKey(k)] ?? ""),
        })),
      }),
    [labelClaim, mediumVolume, sampleVolume, dilutionFactor, intercept, slope, unit, submitted, rows, replicates],
  );
  const result = analysis.result;

  const changeReplicates = (count: number) => {
    // Clear the columns being hidden, so a value can never reappear unseen later.
    setRows((current) =>
      current.map((row) => {
        const cells = { ...row.cells };
        for (let k = count; k < MAX_READINGS; k++) cells[readingKey(k)] = "";
        return { ...row, cells };
      }),
    );
    setReplicates(count);
  };

  // ── Report: one description for the screen details, Copy, PNG and Print ──
  const report = useMemo<LabReportData | null>(() => {
    if (!result) return null;
    const u = result.unit;
    const last = result.points[result.points.length - 1];
    const equation = equationABX(result.intercept, result.slope);
    const readingHeaders = Array.from({ length: result.readingsPerPoint }, (_, k) => `B${k + 1} (AU)`);
    const table = resultTable(result);
    const release = graph === "release";

    return {
      title: "Dissolution Calculation",
      context: "Pharmaceutics · In-vitro dissolution",
      sample: sample.trim() || undefined,
      result: { label: `% Drug release at ${num(last.time)} min`, value: formatFixed(last.percentRelease, 2), unit: "%" },
      warnings: analysis.warnings,
      sections: [
        {
          title: "Given data",
          rows: [
            { label: "Label claim", value: result.text.labelClaim, unit: "mg" },
            { label: "Dissolution medium volume (V)", value: result.text.mediumVolume, unit: "mL" },
            { label: "Sample withdrawal volume (Vs)", value: result.text.sampleVolume, unit: "mL" },
            { label: "Dilution factor (DF)", value: result.text.dilutionFactor },
            { label: "Vs / V", value: num(result.ratio) },
            { label: "Calibration equation", value: `Y = ${result.text.intercept} + ${result.text.slope}X` },
            { label: "Intercept (a)", value: result.text.intercept, unit: "AU" },
            { label: "Slope (b)", value: result.text.slope, unit: `AU per ${u}` },
            { label: "Concentration unit (X)", value: u },
            { label: "Absorbance readings per time point", value: String(result.readingsPerPoint) },
          ],
        },
        {
          title: "Method",
          lines: [
            "Correction method: practical-sheet (previous corrected concentration).",
            `Y is absorbance (AU); X is concentration (${u}). Rounded form: ${equation}.`,
            u === "mg/mL"
              ? "Concentrations are already in mg/mL, so the amount dissolved needs no unit conversion."
              : `For the amount dissolved, ${u} is converted to mg/mL ${result.conversion.factorText} (${result.conversion.reason}).`,
          ],
          formulas: [
            `Average Y = (${Array.from({ length: result.readingsPerPoint }, (_, k) => `B${k + 1}`).join(" + ")}) / ${result.readingsPerPoint}`,
            "X = (Y − a) / b",
            "C = X × DF",
            "First time point: CF = 0, corrected C = C (no previous withdrawal)",
            "CF = (Vs / V) × previous corrected concentration",
            "Corrected C = current C + CF",
            "Amount dissolved (mg) = corrected C (mg/mL) × V (mL)",
            "% Drug release = (Amount dissolved / Label claim) × 100",
          ],
        },
        {
          title: "Time-point absorbance readings",
          table: {
            columns: ["Time (min)", ...readingHeaders, "Average (AU)"],
            rows: result.points.map((p) => [num(p.time), ...p.readingsText, num(p.averageAbsorbance)]),
          },
        },
        { title: "Results", table },
        ...result.points.map((p, i) => ({
          title: `Worked calculation — t = ${num(p.time)} min`,
          formulas: timePointSteps(result, i).flatMap((step) => step.lines),
        })),
      ],
      notes: analysis.notes,
      figure: {
        svg: chartSvg({
          xLabel: "Time (min)",
          yLabel: release ? "% Drug release (%)" : `Corrected concentration (${u})`,
          includeZeroY: true,
          series: [
            {
              name: release ? "% Drug release" : "Corrected concentration",
              points: result.points.map((p) => ({ x: p.time, y: release ? p.percentRelease : p.corrected })),
              kind: "line-points",
              color: release ? CHART.line : CHART.primary,
            },
          ],
        }),
        width: FIGURE_WIDTH,
        height: FIGURE_HEIGHT,
        caption: release ? "Time vs % drug release" : `Time vs corrected concentration (${u})`,
      },
    };
  }, [result, analysis.warnings, analysis.notes, sample, graph]);

  // ── Chart data ──
  const chart = useMemo(() => {
    if (!result) return null;
    const data = result.points.map((p) => ({ time: p.time, corrected: p.corrected, percent: p.percentRelease, series: `t = ${num(p.time)} min` }));
    return {
      data,
      xAxis: niceAxis(data.map((d) => d.time), { includeZero: true }),
      concAxis: niceAxis(data.map((d) => d.corrected), { includeZero: true }),
      releaseAxis: niceAxis(data.map((d) => d.percent), { includeZero: true }),
    };
  }, [result]);

  const ConcTip = useMemo(
    () =>
      makeTooltip([
        { key: "time", label: "Time (min)", format: (v) => formatSig(v, 5) },
        { key: "corrected", label: `Corrected conc. (${unit})`, format: (v) => formatSig(v, 5) },
      ]),
    [unit],
  );
  const ReleaseTip = useMemo(
    () =>
      makeTooltip([
        { key: "time", label: "Time (min)", format: (v) => formatSig(v, 5) },
        { key: "percent", label: "% Drug release (%)", format: (v) => formatFixed(v, 2) },
      ]),
    [],
  );

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setLabelClaim("");
    setMediumVolume("");
    setSampleVolume("");
    setDilutionFactor("1");
    setIntercept("");
    setSlope("");
    setUnit("µg/mL");
    setReplicates(DEFAULT_READINGS);
    setRows(defaultRows());
    setGraph("concentration");
  };

  const applyExample = (example: Example) => {
    setSample(example.sample);
    setLabelClaim(example.labelClaim);
    setMediumVolume(example.mediumVolume);
    setSampleVolume(example.sampleVolume);
    setDilutionFactor(example.dilutionFactor);
    setIntercept(example.intercept);
    setSlope(example.slope);
    setUnit(example.unit);
    const count = example.rows[0].length - 1;
    setReplicates(count);
    setRows(
      makeRows(
        example.rows.map(([time, ...readings]) => {
          const cells = blankCells(time);
          readings.forEach((value, k) => {
            cells[readingKey(k)] = value;
          });
          return cells;
        }),
      ),
    );
  };

  const dfValue = Number(dilutionFactor);
  const table = useMemo(() => (result ? resultTable(result) : null), [result]);
  const last = result?.points[result.points.length - 1];
  const maxRelease = result?.points.reduce((best, p) => (p.percentRelease > best.percentRelease ? p : best), result.points[0]);

  const readingColumns = Array.from({ length: replicates }, (_, k) => ({
    key: readingKey(k),
    header: `B${k + 1}`,
    unit: "AU",
    placeholder: "0.000",
  }));

  return (
    <CalculatorShell
      title="Dissolution Calculator"
      subtitle="Absorbance readings → average → concentration → correction factor → corrected concentration → amount dissolved and % drug release, with every step shown."
      icon={FlaskConical}
      eyebrow="Pharmaceutics"
      aside={
        <>
          <CalcAbout title="About dissolution calculations">
            <p>
              In a <strong>dissolution test</strong> a tablet is stirred in a fixed volume of medium and samples are
              withdrawn at set times. Each sample&apos;s absorbance gives its concentration through the calibration
              equation Y = a + bX, and the concentration gives the amount of drug dissolved.
            </p>
            <CalcList
              title="The practical-sheet workflow"
              items={[
                "Average the absorbance readings at each time point",
                "Concentration X = (Y − a) / b, multiplied by the dilution factor",
                "Correct for drug removed in earlier samples",
                "Amount dissolved = corrected concentration × medium volume",
                "% Drug release = amount dissolved / label claim × 100",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you trust it"
              items={[
                "Use the calibration equation made in the same medium and wavelength",
                "Enter the concentration unit your calibration used",
                "A release above 100% points to a reading, dilution or unit error",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Tablet / drug information">
        <FieldGrid>
          <TextField label="Drug / dosage form (optional)" value={sample} onChange={setSample} placeholder="e.g. Paracetamol 500 mg tablet" hint="Printed on the lab record." />
          <NumberField label="Label claim (drug per dosage unit)" value={labelClaim} onChange={setLabelClaim} unit="mg" error={analysis.fieldErrors.labelClaim} />
          <NumberField label="Dissolution medium volume (V)" value={mediumVolume} onChange={setMediumVolume} unit="mL" error={analysis.fieldErrors.mediumVolume} hint="e.g. 900 mL in each vessel." />
          <NumberField label="Sample withdrawal volume (Vs)" value={sampleVolume} onChange={setSampleVolume} unit="mL" error={analysis.fieldErrors.sampleVolume} hint="Volume removed at each time point." />
          <NumberField
            label="Dilution factor (DF)"
            value={dilutionFactor}
            onChange={setDilutionFactor}
            unit="×"
            error={analysis.fieldErrors.dilutionFactor}
            hint={
              Number.isFinite(dfValue) && dilutionFactor.trim() !== "" && dfValue > 0 && dfValue < 1
                ? "Below 1 means the sample was concentrated — check the value."
                : "Unitless. 1 = sample measured undiluted; 10 = 1 mL made up to 10 mL."
            }
          />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Calibration equation" description="Y = a + bX — Y = absorbance, X = concentration, a = intercept, b = slope">
        <CalibrationFields
          intercept={intercept}
          slope={slope}
          unit={unit}
          onIntercept={setIntercept}
          onSlope={setSlope}
          onUnit={setUnit}
          show={submitted}
          units={DISSOLUTION_UNITS}
        />
        {analysis.calibrationError && <LabNotice tone="danger" title="Concentration cannot be calculated">{analysis.calibrationError}</LabNotice>}
      </CalcSection>

      <CalcSection title="Time points" description="Time | B1 … Bn absorbance | Average absorbance — add or remove time points as your practical needs.">
        <CountStepper
          label="Absorbance readings per time point"
          value={replicates}
          min={MIN_READINGS}
          max={MAX_READINGS}
          onChange={changeReplicates}
          hint={`${MIN_READINGS}–${MAX_READINGS} readings (B1…B${MAX_READINGS}). Every visible reading is required.`}
        />
        <DataTable
          caption="Sampling times and absorbance readings"
          columns={[
            { key: "time", header: "Time", unit: "min", placeholder: "0" },
            ...readingColumns,
            {
              key: "average",
              header: "Average absorbance",
              unit: "AU",
              computed: (i) => {
                const average = analysis.averages[i];
                return average === null || average === undefined ? "—" : num(average);
              },
            },
          ]}
          rows={rows}
          rowHeader={(i) => `T${i + 1}`}
          onCell={(id, key, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)))}
          onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
          onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: blankCells() }])}
          addLabel="Add time point"
          minRows={MIN_TIME_POINTS}
          maxRows={MAX_TIME_POINTS}
          cellError={(i, key) => analysis.cellErrors[`${i}:${key}`]}
          rowMessage={(i) => {
            if (analysis.rowErrors[i]) return { tone: "error", text: analysis.rowErrors[i] };
            if (analysis.rowWarnings[i]) return { tone: "warning", text: analysis.rowWarnings[i] };
            return undefined;
          }}
        />
        <ExampleChips items={EXAMPLES.map((example) => ({ label: example.label, apply: () => applyExample(example) }))} />
        <LabNotice title="Correction method: practical-sheet (previous corrected concentration)">
          <p>
            First time point: no previous withdrawal, so CF = 0 and corrected concentration = concentration. At every later
            time point CF = (Vs / V) × previous corrected concentration, and corrected concentration = current concentration + CF.
          </p>
          <p className="mt-1">
            This tool uses only that method. For a different correction, use the{" "}
            <a className="font-semibold underline underline-offset-2" href={calculatorHref("cumulative-drug-release-calculator", {})}>
              Cumulative Drug Release Calculator
            </a>
            .
          </p>
        </LabNotice>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="dissolution" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {result && report && chart && table && last && maxRelease ? (
          <>
            {analysis.warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}

            <StatTiles
              tiles={[
                { label: `% Release at ${num(last.time)} min`, value: formatFixed(last.percentRelease, 2), unit: "%", featured: true },
                { label: `Amount dissolved at ${num(last.time)} min`, value: formatSig(last.amountMg, 4), unit: "mg" },
                { label: "Maximum % release", value: formatFixed(maxRelease.percentRelease, 2), unit: "%", note: `at ${num(maxRelease.time)} min` },
                { label: "Final corrected conc.", value: formatSig(last.corrected, 4), unit: result.unit },
                { label: "Vs / V", value: formatSig(result.ratio, 4), note: `${result.text.sampleVolume} mL / ${result.text.mediumVolume} mL` },
                { label: "Time points", value: String(result.points.length) },
              ]}
            />

            <Tabs value={graph} onValueChange={(value) => setGraph(value as Graph)}>
              <TabsList aria-label="Choose a graph">
                <TabsTrigger value="concentration">Corrected concentration</TabsTrigger>
                <TabsTrigger value="release">% Drug release</TabsTrigger>
              </TabsList>

              <TabsContent value="concentration">
                <ChartPanel title="Time vs corrected concentration" footer="The graph on the downloaded card and printout follows the tab selected here.">
                  <LineChart data={chart.data} margin={{ top: 8, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="time"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: "Time (min)", position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.concAxis.domain}
                      ticks={chart.concAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.concAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={60}
                      label={{ value: `Corrected conc. (${result.unit})`, angle: -90, position: "insideLeft", offset: 6, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <ConcTip active={props.active} payload={props.payload} />} />
                    <Legend verticalAlign="top" height={28} iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="linear"
                      dataKey="corrected"
                      name={`Corrected concentration (${result.unit})`}
                      stroke={CHART.primary}
                      strokeWidth={2.2}
                      dot={{ r: 4, fill: CHART.primary, stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartPanel>
              </TabsContent>

              <TabsContent value="release">
                <ChartPanel title="Time vs % drug release" footer="The graph on the downloaded card and printout follows the tab selected here.">
                  <LineChart data={chart.data} margin={{ top: 8, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="time"
                      domain={chart.xAxis.domain}
                      ticks={chart.xAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.xAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      label={{ value: "Time (min)", position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.releaseAxis.domain}
                      ticks={chart.releaseAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.releaseAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={52}
                      label={{ value: "% Drug release (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <ReleaseTip active={props.active} payload={props.payload} />} />
                    <Legend verticalAlign="top" height={28} iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="linear"
                      dataKey="percent"
                      name="% Drug release"
                      stroke={CHART.line}
                      strokeWidth={2.2}
                      dot={{ r: 4, fill: CHART.line, stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartPanel>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Result table</p>
              <ResultTable caption="Dissolution results per time point" columns={table.columns} rows={table.rows} highlightColumn={6} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Calculation details — each time point</p>
              {result.points.map((p, i) => (
                <StepBlock
                  key={i}
                  title={`T${i + 1} · t = ${num(p.time)} min — ${formatFixed(p.percentRelease, 2)}% released`}
                  badge={
                    p.concentration < 0
                      ? { text: "negative conc.", tone: "warning" }
                      : p.percentRelease > 100
                        ? { text: "> 100%", tone: "warning" }
                        : i === 0
                          ? { text: "CF = 0", tone: "ok" }
                          : undefined
                  }
                  steps={timePointSteps(result, i)}
                />
              ))}
            </div>

            {analysis.notes.map((note) => (
              <LabNotice key={note}>{note}</LabNotice>
            ))}
          </>
        ) : (
          <PendingCard
            submitted={submitted}
            message="Enter the tablet data, the calibration equation and every absorbance reading to calculate the dissolution profile."
          />
        )}
      </div>

      <FormulaNote>
        <Formula>Average Y = (B1 + B2 + B3 + B4) / 4</Formula>
        <Formula>X = (Y − a) / b &nbsp;·&nbsp; C = X × DF</Formula>
        <Formula>CF = (Vs / V) × previous corrected concentration &nbsp;(CF = 0 at the first time point)</Formula>
        <Formula>Corrected concentration = current concentration + CF</Formula>
        <Formula>Amount dissolved (mg) = corrected concentration (mg/mL) × V (mL)</Formula>
        <Formula>% Drug release = (Amount dissolved / Label claim) × 100</Formula>
        <p>
          Y is the average absorbance, a and b are the intercept and slope of the calibration line, Vs is the sample
          withdrawal volume and V the dissolution medium volume. A concentration in µg/mL, mg/L, µg/L or g/L is
          converted to mg/mL as its own step before the amount is calculated.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why is a correction factor needed?", a: "Each sample withdrawn removes some dissolved drug from the vessel. The practical-sheet correction adds back (Vs / V) × the previous corrected concentration, so later concentrations are not underestimated." },
          { q: "Why is the correction factor zero at the first time point?", a: "Nothing has been withdrawn before the first sample, so there is no drug to add back: its corrected concentration equals its concentration." },
          { q: "Where does the dilution factor go?", a: "It multiplies the concentration read from the calibration equation (C = X × DF), because the solution in the cuvette was diluted from the withdrawn sample. Every later step is linear, so applying it at the end would give the same answer." },
          { q: "My % drug release is above 100%. What went wrong?", a: "Usually a reading error, a wrong dilution factor, or a concentration unit that does not match the calibration curve (for example µg/mL entered as mg/mL). Check those before reporting it." },
          { q: "Can I use the equation from the Calibration Curve Calculator?", a: "Yes. Open this tool from that calculator's Dissolution button, or press “Import saved calibration” here — the intercept, slope and unit land in the fields, where you can still edit them." },
        ]}
      />
    </CalculatorShell>
  );
}

/** Result columns and rows, shared by the screen table and the lab record. */
function resultTable(result: DissolutionResult) {
  const u = result.unit;
  const concentrationHeader = result.dilutionFactor !== 1 ? "Concentration (× DF)" : "Concentration";
  return {
    columns: [
      "Time (min)",
      "Avg absorbance (AU)",
      `${concentrationHeader} (${u})`,
      `Correction factor (${u})`,
      `Corrected concentration (${u})`,
      "Amount dissolved (mg)",
      "% Drug release (%)",
    ],
    rows: result.points.map((p) => [
      num(p.time),
      num(p.averageAbsorbance),
      p.concentration < 0 ? `⚠ ${num(p.concentration)}` : num(p.concentration),
      num(p.correctionFactor),
      num(p.corrected),
      num(p.amountMg),
      formatFixed(p.percentRelease, 2),
    ]),
  };
}
