"use client";

import { useMemo, useRef, useState } from "react";
import { FlaskConical, Layers, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
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
  formatFixed,
  formatSig,
  type LabReportData,
  type LabReportSection,
  type ModeOption,
} from "@/components/calculators";
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
  StatTiles,
  chartSvg,
  makeRows,
  makeTooltip,
  nextRowId,
  niceAxis,
  num,
  paren,
  tickLabel,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  type TableRow,
} from "@/components/calculators/lab-analysis";
import {
  AMOUNT_UNITS,
  MAX_TRIALS,
  MIN_TRIALS,
  accuracySummary,
  analyseBasic,
  analyseRange,
  analyseReplicates,
  withinRange,
  type Trial,
} from "./_accuracy";

// ─── MODES & EXAMPLES (inputs only — every result is calculated) ─────────────

type Mode = "basic" | "replicates";

const MODES: ModeOption<Mode>[] = [
  { value: "basic", label: "Basic practical", description: "One theoretical and one found amount", icon: FlaskConical },
  { value: "replicates", label: "Multiple replicates", description: "Trials with mean, SD and %RSD", icon: Layers },
];

const BASIC_EXAMPLES = [{ label: "Assay: 500 mg theoretical, 492.5 mg found", unit: "mg", theoretical: "500", found: "492.5" }];

const REPLICATE_EXAMPLES: { label: string; unit: string; rows: [string, string][] }[] = [
  {
    label: "Spiked recovery at 80 / 100 / 120% levels",
    unit: "µg/mL",
    rows: [["8.0", "7.92"], ["10.0", "10.06"], ["12.0", "11.85"]],
  },
  {
    label: "Six replicates at one level (50 mg)",
    unit: "mg",
    rows: [["50", "49.6"], ["50", "50.3"], ["50", "49.1"], ["50", "49.8"], ["50", "50.4"], ["50", "49.5"]],
  },
];

const DEFAULT_TRIALS = 3;
const blankRow = () => ({ theoretical: "", found: "" });

// ─── Display helpers (display only — arithmetic stays full precision) ────────

/** A worked-step value with a typographic minus: "−1.5". */
const s = (value: number) => num(value).replace(/^-/, "−");
/** A tile/table percentage, two decimals. */
const pct = (value: number) => formatFixed(value, 2).replace(/^-/, "−");
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n: number) => String(n).split("").map((d) => SUB[Number(d)]).join("");

export default function AccuracyRecoveryCalculatorPage() {
  const [mode, setMode] = useState<Mode>("basic");
  const [sample, setSample] = useState("");
  const [unit, setUnit] = useState("mg");
  const [theoretical, setTheoretical] = useState("");
  const [found, setFound] = useState("");
  const [rows, setRows] = useState<TableRow[]>(() => makeRows(Array.from({ length: DEFAULT_TRIALS }, blankRow)));
  const [lower, setLower] = useState("");
  const [upper, setUpper] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const cells = rows.map((row) => ({ theoretical: row.cells.theoretical ?? "", found: row.cells.found ?? "" }));
  const basic = useMemo(() => analyseBasic(theoretical, found, submitted), [theoretical, found, submitted]);
  const replicates = useMemo(() => analyseReplicates(cells, submitted), [rows, submitted]); // eslint-disable-line
  const rangeCheck = useMemo(() => analyseRange(lower, upper), [lower, upper]);
  const range = rangeCheck.range;

  const trial = mode === "basic" ? basic.trial : null;
  const trials = mode === "replicates" ? replicates.trials : null;
  const stats = mode === "replicates" ? replicates.stats : null;

  const summary = useMemo(() => {
    if (trial) return accuracySummary({ recovery: trial.recovery, label: "Recovery", range });
    if (trials && stats) {
      return accuracySummary({
        recovery: stats.meanRecovery,
        label: "Mean recovery",
        rsd: stats.rsd,
        n: stats.n,
        range,
        trialsWithin: range ? trials.filter((t) => withinRange(t.recovery, range)).length : undefined,
      });
    }
    return null;
  }, [trial, trials, stats, range]);

  const warnings = mode === "basic" ? basic.warnings : replicates.warnings;

  // ── Report: one description for the screen details, Copy, PNG and Print ──
  const report = useMemo<LabReportData | null>(() => {
    if (!summary) return null;
    const u = unit;
    const rangeRow = range
      ? [{ label: "Acceptance range (entered)", value: `${lower.trim()}–${upper.trim()}`, unit: "%" }]
      : [{ label: "Acceptance range", value: "not entered" }];
    const summarySection: LabReportSection = { title: "Accuracy summary", lines: summary };

    if (mode === "basic" && trial) {
      const T = theoretical.trim();
      const F = found.trim();
      return {
        title: "Accuracy & % Recovery",
        context: "Pharmaceutical Analysis · Basic practical",
        sample: sample.trim() || undefined,
        result: { label: "% Recovery", value: pct(trial.recovery), unit: "%" },
        warnings,
        sections: [
          {
            title: "Given data",
            rows: [
              { label: "Theoretical / expected amount", value: T, unit: u },
              { label: "Experimental / found amount", value: F, unit: u },
              ...rangeRow,
            ],
          },
          {
            title: "% Recovery",
            formulas: [
              "% Recovery = (Found amount / Theoretical amount) × 100",
              `% Recovery = (${F} / ${T}) × 100`,
              `% Recovery = ${s(trial.found / trial.theoretical)} × 100 = ${s(trial.recovery)}%`,
            ],
          },
          {
            title: "% Error",
            formulas: [
              "% Error = [(Found − Theoretical) / Theoretical] × 100",
              `% Error = [(${F} − ${T}) / ${T}] × 100`,
              `% Error = (${paren(s(trial.difference))} / ${T}) × 100 = ${s(trial.percentError)}%`,
            ],
            lines: ["A negative % error means less was found than expected; a positive one, more."],
          },
          {
            title: "Absolute error",
            formulas: ["Absolute error = |Found − Theoretical|", `Absolute error = |${F} − ${T}| = ${s(trial.absoluteError)} ${u}`],
          },
          {
            title: "Difference from 100%",
            formulas: ["Difference = |100 − % Recovery|", `Difference = |100 − ${s(trial.recovery)}| = ${s(trial.fromHundred)} percentage points`],
          },
          summarySection,
        ],
        notes: ["Theoretical and found amounts are in the same unit, so no conversion is applied. Values are rounded for display only; every step uses full precision."],
      };
    }

    if (mode === "replicates" && trials && stats) {
      const T = cells.map((c) => c.theoretical.trim());
      const F = cells.map((c) => c.found.trim());
      const { n, meanRecovery, sd, rsd } = stats;
      const meanText = s(meanRecovery);
      const sdFormulas = sd.ok
        ? [
            "SD = √[Σ(xᵢ − x̄)² / (n − 1)]",
            `SD = √[(${trials.map((t) => `(${s(t.recovery)} − ${meanText})²`).join(" + ")}) / (${n} − 1)]`,
            `SD = √[(${stats.squaredDeviations.map(s).join(" + ")}) / ${n - 1}]`,
            `SD = √(${s(stats.sumSquaredDeviations)} / ${n - 1}) = √${s(stats.sumSquaredDeviations / (n - 1))} = ${s(sd.value)}%`,
          ]
        : ["SD = √[Σ(xᵢ − x̄)² / (n − 1)]"];

      return {
        title: "Accuracy & % Recovery",
        context: "Pharmaceutical Analysis · Multiple replicates",
        sample: sample.trim() || undefined,
        result: { label: "Mean % recovery", value: pct(meanRecovery), unit: "%" },
        warnings,
        sections: [
          {
            title: "Given data",
            table: {
              columns: ["Trial", `Theoretical / added (${u})`, `Found / experimental (${u})`],
              rows: trials.map((_, i) => [String(i + 1), T[i], F[i]]),
            },
            rows: [{ label: "Number of trials (n)", value: String(n) }, ...rangeRow],
          },
          {
            title: "% Recovery for each trial",
            formulas: [
              "%Rᵢ = (Foundᵢ / Theoreticalᵢ) × 100",
              ...trials.map((t, i) => `%R${sub(i + 1)} = (${F[i]} / ${T[i]}) × 100 = ${s(t.recovery)}%`),
            ],
          },
          {
            title: "% Error and absolute error for each trial",
            formulas: [
              "%Eᵢ = [(Foundᵢ − Theoreticalᵢ) / Theoreticalᵢ] × 100      |Eᵢ| = |Foundᵢ − Theoreticalᵢ|",
              ...trials.flatMap((t, i) => [
                `%E${sub(i + 1)} = [(${F[i]} − ${T[i]}) / ${T[i]}] × 100 = ${s(t.percentError)}%`,
                `|E${sub(i + 1)}| = |${F[i]} − ${T[i]}| = ${s(t.absoluteError)} ${u}`,
              ]),
            ],
          },
          {
            title: "Mean % recovery",
            formulas: [
              "x̄ = Σ%Rᵢ / n",
              `x̄ = (${trials.map((t) => s(t.recovery)).join(" + ")}) / ${n}`,
              `x̄ = ${s(stats.sumRecovery)} / ${n} = ${meanText}%`,
            ],
          },
          {
            title: "Standard deviation (sample, n − 1)",
            table: sd.ok
              ? {
                  columns: ["Trial", "xᵢ = %Rᵢ", "xᵢ − x̄", "(xᵢ − x̄)²"],
                  rows: trials.map((t, i) => [String(i + 1), s(t.recovery), s(t.recovery - meanRecovery), s(stats.squaredDeviations[i])]),
                }
              : undefined,
            formulas: sdFormulas,
            lines: sd.ok ? undefined : [sd.error],
          },
          {
            title: "%RSD",
            formulas: rsd.ok && sd.ok
              ? ["%RSD = (SD / x̄) × 100", `%RSD = (${s(sd.value)} / ${meanText}) × 100 = ${s(rsd.value)}%`]
              : ["%RSD = (SD / x̄) × 100"],
            lines: rsd.ok ? undefined : [rsd.error],
          },
          {
            title: "Mean % error",
            formulas: [
              "Mean % error = Σ%Eᵢ / n",
              `Mean % error = (${trials.map((t) => paren(s(t.percentError))).join(" + ")}) / ${n}`,
              `Mean % error = ${paren(s(stats.sumPercentError))} / ${n} = ${s(stats.meanPercentError)}%`,
            ],
          },
          {
            title: "Mean absolute error",
            formulas: [
              "Mean absolute error = Σ|Foundᵢ − Theoreticalᵢ| / n",
              `Mean absolute error = (${trials.map((t) => s(t.absoluteError)).join(" + ")}) / ${n}`,
              `Mean absolute error = ${s(stats.sumAbsoluteError)} / ${n} = ${s(stats.meanAbsoluteError)} ${u}`,
            ],
          },
          summarySection,
        ],
        notes: [
          ...replicates.notes,
          "SD is the sample standard deviation (n − 1) of the % recovery values. Theoretical and found amounts are in the same unit, so no conversion is applied. Values are rounded for display only.",
        ],
        figure: {
          svg: chartSvg({
            xLabel: "Trial number",
            integerX: true,
            yLabel: "% Recovery",
            series: [
              { name: "% Recovery", points: trials.map((t, i) => ({ x: i + 1, y: t.recovery })), kind: "points", color: CHART.primary },
              ...(range
                ? [
                    { name: `Lower limit ${lower.trim()}%`, points: [{ x: 1, y: range.lower }, { x: Math.max(n, 2), y: range.lower }], kind: "line" as const, color: CHART.accent, dashed: true },
                    { name: `Upper limit ${upper.trim()}%`, points: [{ x: 1, y: range.upper }, { x: Math.max(n, 2), y: range.upper }], kind: "line" as const, color: CHART.accent, dashed: true },
                  ]
                : []),
            ],
            referenceY: { value: 100, label: "100%" },
          }),
          width: FIGURE_WIDTH,
          height: FIGURE_HEIGHT,
          caption: `Mean % recovery ${pct(meanRecovery)}%   SD ${sd.ok ? pct(sd.value) : "—"}   %RSD ${rsd.ok ? pct(rsd.value) : "—"}   n = ${n}`,
        },
      };
    }
    return null;
  }, [summary, mode, trial, trials, stats, unit, sample, theoretical, found, lower, upper, range, warnings, replicates.notes]); // eslint-disable-line

  // ── Chart data (replicates only) ──
  const chart = useMemo(() => {
    if (!trials) return null;
    const data = trials.map((t, i) => ({
      label: `Trial ${i + 1}`,
      series: `Trial ${i + 1}`,
      recovery: t.recovery,
      theoretical: t.theoretical,
      found: t.found,
    }));
    const yAxis = niceAxis([...trials.map((t) => t.recovery), 100, ...(range ? [range.lower, range.upper] : [])], { includeZero: true });
    return { data, yAxis };
  }, [trials, range]);

  const Tip = useMemo(
    () =>
      makeTooltip([
        { key: "recovery", label: "% Recovery", format: (v) => `${formatFixed(v, 2)}%` },
        { key: "theoretical", label: `Theoretical (${unit})`, format: (v) => formatSig(v, 6) },
        { key: "found", label: `Found (${unit})`, format: (v) => formatSig(v, 6) },
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
    setUnit("mg");
    setTheoretical("");
    setFound("");
    setLower("");
    setUpper("");
    setRows(makeRows(Array.from({ length: DEFAULT_TRIALS }, blankRow)));
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setSubmitted(false);
  };

  const rowWarning = (t: Trial | null) =>
    !t ? undefined : t.found === 0 ? "0% recovery — nothing was found." : t.recovery > 100 ? "Above 100% — check weighing, dilution or calculation." : undefined;

  return (
    <CalculatorShell
      title="Accuracy & % Recovery Calculator"
      subtitle="Compare the theoretical (added) amount with the amount found — % recovery, % error and absolute error, or mean recovery, SD and %RSD across replicate trials, with every step shown."
      icon={Target}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About accuracy and recovery">
            <p>
              <strong>Accuracy</strong> is how close a result is to the true value. In a practical it is judged by
              adding or preparing a known (theoretical) amount and measuring how much is <strong>found</strong>:
              the % recovery. 100% means everything added was found.
            </p>
            <CalcList
              title="When to use it"
              items={[
                "Assay of a prepared or spiked sample against its label or added amount",
                "Recovery studies at several levels, e.g. 80, 100 and 120%",
                "Replicate analyses, where %RSD describes precision",
              ]}
            />
            <CalcList
              tone="caution"
              title="Read the result carefully"
              items={[
                "Accuracy (recovery) and precision (%RSD) are different — a method can be precise but biased",
                "Acceptance limits come from your practical or monograph; this tool does not assume any",
                "Theoretical and found must be in the same unit — nothing is converted",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch label="Calculation mode" value={mode} onChange={changeMode} options={MODES} />

      <CalcSection title="Experiment">
        <FieldGrid>
          <TextField label="Drug / sample name (optional)" value={sample} onChange={setSample} placeholder="e.g. Paracetamol tablets" hint="Printed on the lab record." />
          <SelectField label="Amount unit" value={unit} onChange={setUnit} options={AMOUNT_UNITS} hint="Used for both theoretical and found amounts — no conversion." />
        </FieldGrid>
      </CalcSection>

      {mode === "basic" ? (
        <CalcSection title="Amounts">
          <FieldGrid>
            <NumberField
              label="Theoretical / expected amount"
              value={theoretical}
              onChange={setTheoretical}
              unit={unit}
              error={basic.theoreticalError}
              hint="The amount added, labelled or calculated."
            />
            <NumberField
              label="Experimental / found amount"
              value={found}
              onChange={setFound}
              unit={unit}
              error={basic.foundError}
              hint="The amount your analysis found."
            />
          </FieldGrid>
          <ExampleChips
            items={BASIC_EXAMPLES.map((example) => ({
              label: example.label,
              apply: () => {
                setUnit(example.unit);
                setTheoretical(example.theoretical);
                setFound(example.found);
              },
            }))}
          />
        </CalcSection>
      ) : (
        <CalcSection title="Trials" description="Trial | Theoretical / added | Found / experimental | % Recovery">
          <DataTable
            caption="Theoretical and found amounts for each trial"
            columns={[
              { key: "theoretical", header: "Theoretical / added", unit, placeholder: "0.0" },
              { key: "found", header: "Found / experimental", unit, placeholder: "0.0" },
              {
                key: "recovery",
                header: "% Recovery",
                unit: "%",
                computed: (i) => {
                  const t = replicates.rowTrials[i];
                  return t ? pct(t.recovery) : "—";
                },
              },
            ]}
            rows={rows}
            rowHeader={(i) => `Trial ${i + 1}`}
            onCell={(id, key, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, cells: { ...row.cells, [key]: value } } : row)))}
            onRemove={(id) => setRows((current) => current.filter((row) => row.id !== id))}
            onAdd={() => setRows((current) => [...current, { id: nextRowId(), cells: blankRow() }])}
            addLabel="Add trial"
            minRows={MIN_TRIALS}
            maxRows={MAX_TRIALS}
            cellError={(i, key) => replicates.cellErrors[`${i}:${key}`]}
            rowMessage={(i) => {
              const error = replicates.cellErrors[`${i}:theoretical`] ?? replicates.cellErrors[`${i}:found`];
              if (error) return { tone: "error", text: error };
              const warning = rowWarning(replicates.rowTrials[i]);
              return warning ? { tone: "warning", text: warning } : undefined;
            }}
          />
          <p className="text-xs text-muted-foreground">
            {MIN_TRIALS}–{MAX_TRIALS} trials. Every row is used — remove a row rather than leaving it blank.
          </p>
          <ExampleChips
            items={REPLICATE_EXAMPLES.map((example) => ({
              label: example.label,
              apply: () => {
                setUnit(example.unit);
                setRows(makeRows(example.rows.map(([t, f]) => ({ theoretical: t, found: f }))));
              },
            }))}
          />
        </CalcSection>
      )}

      <CalcSection title="Acceptance range (optional)" description="Leave blank unless your practical gives limits. Nothing is judged against a range you did not enter.">
        <FieldGrid>
          <NumberField label="Lower limit" value={lower} onChange={setLower} unit="%" error={rangeCheck.lowerError} hint="Enter the limits from your practical or monograph, e.g. 98–102%" />
          <NumberField label="Upper limit" value={upper} onChange={setUpper} unit="%" error={rangeCheck.upperError} hint={rangeCheck.note} />
        </FieldGrid>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="accuracy-recovery" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {report && summary ? (
          <>
            {warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}

            {trial && (
              <StatTiles
                tiles={[
                  { label: "% Recovery", value: pct(trial.recovery), unit: "%", featured: true },
                  { label: "% Error", value: pct(trial.percentError), unit: "%", note: trial.percentError < 0 ? "less found than expected" : trial.percentError > 0 ? "more found than expected" : undefined },
                  { label: "Absolute error", value: formatSig(trial.absoluteError, 4), unit },
                  { label: "Difference from 100%", value: pct(trial.fromHundred), unit: "% points" },
                ]}
              />
            )}

            {trials && stats && (
              <StatTiles
                tiles={[
                  { label: "Mean % recovery", value: pct(stats.meanRecovery), unit: "%", featured: true },
                  { label: "SD", value: stats.sd.ok ? formatSig(stats.sd.value, 4) : "—", unit: stats.sd.ok ? "%" : undefined, note: stats.sd.ok ? "sample, n − 1" : "not defined for n = 1" },
                  { label: "%RSD", value: stats.rsd.ok ? pct(stats.rsd.value) : "—", unit: stats.rsd.ok ? "%" : undefined, note: stats.rsd.ok ? undefined : stats.sd.ok ? "mean is 0" : "needs n ≥ 2" },
                  { label: "Mean % error", value: pct(stats.meanPercentError), unit: "%" },
                  { label: "Mean absolute error", value: formatSig(stats.meanAbsoluteError, 4), unit },
                  { label: "Trials (n)", value: String(stats.n) },
                ]}
              />
            )}

            {stats && !stats.sd.ok && <LabNotice tone="info">SD and %RSD: {stats.sd.error} Add a second trial to describe precision.</LabNotice>}
            {stats && stats.sd.ok && !stats.rsd.ok && <LabNotice tone="danger">{stats.rsd.error}</LabNotice>}

            <div className="rounded-2xl border border-l-[3px] border-l-green-600 bg-card p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">Accuracy summary</p>
              <div className="mt-2 space-y-1.5">
                {summary.map((line) => (
                  <p key={line} className="text-sm leading-relaxed text-foreground/90">{line}</p>
                ))}
              </div>
            </div>

            {trials && chart && (
              <>
                <ResultTable
                  caption="Recovery for each trial"
                  columns={[
                    "Trial",
                    `Theoretical (${unit})`,
                    `Found (${unit})`,
                    "% Recovery",
                    "% Error",
                    `Absolute error (${unit})`,
                    ...(range ? ["Within range"] : []),
                  ]}
                  rows={trials.map((t, i) => [
                    String(i + 1),
                    cells[i].theoretical.trim(),
                    cells[i].found.trim(),
                    `${pct(t.recovery)}%`,
                    `${pct(t.percentError)}%`,
                    formatSig(t.absoluteError, 4),
                    ...(range ? [withinRange(t.recovery, range) ? "Yes" : "⚠ No"] : []),
                  ])}
                  highlightColumn={3}
                />

                <ChartPanel
                  title="% Recovery by trial"
                  footer={
                    <ChartLegend
                      items={[
                        { label: "% Recovery", color: CHART.primary, shape: "bar" },
                        { label: "100% (theoretical)", color: CHART.line, shape: "dash" },
                        ...(range ? [{ label: `Acceptance limits ${lower.trim()}–${upper.trim()}%`, color: CHART.accent, shape: "dash" as const }] : []),
                      ]}
                    />
                  }
                >
                  <BarChart data={chart.data} margin={{ top: 16, right: 16, bottom: 28, left: 4 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      type="category"
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      interval="preserveStartEnd"
                      label={{ value: "Trial number", position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
                    />
                    <YAxis
                      type="number"
                      domain={chart.yAxis.domain}
                      ticks={chart.yAxis.ticks}
                      tickFormatter={(v: number) => tickLabel(v, chart.yAxis.ticks)}
                      tick={AXIS_TICK}
                      stroke={CHART.axis}
                      width={52}
                      label={{ value: "% Recovery", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip cursor={{ fill: "rgba(28,123,217,0.06)" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
                    <Bar dataKey="recovery" name="% Recovery" fill={CHART.primary} radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
                    <ReferenceLine y={100} stroke={CHART.line} strokeWidth={1.5} strokeDasharray="6 4" label={{ value: "100%", position: "insideTopRight", fontSize: 11, fill: CHART.line }} />
                    {range && (
                      <ReferenceLine y={range.lower} stroke={CHART.accent} strokeDasharray="3 3" label={{ value: `${lower.trim()}%`, position: "insideBottomLeft", fontSize: 11, fill: CHART.accent }} />
                    )}
                    {range && (
                      <ReferenceLine y={range.upper} stroke={CHART.accent} strokeDasharray="3 3" label={{ value: `${upper.trim()}%`, position: "insideTopLeft", fontSize: 11, fill: CHART.accent }} />
                    )}
                  </BarChart>
                </ChartPanel>
              </>
            )}

            <FormulaNote title="Calculation details (step by step)">
              <ReportSteps sections={report.sections} />
              {report.notes?.map((note) => (
                <p key={note} className="text-xs leading-relaxed text-muted-foreground">{note}</p>
              ))}
            </FormulaNote>
          </>
        ) : (
          <PendingCard
            submitted={submitted}
            message={
              mode === "basic"
                ? "Enter the theoretical and found amounts to calculate % recovery."
                : "Enter the theoretical and found amount for every trial to calculate mean recovery, SD and %RSD."
            }
          />
        )}
      </div>

      <FormulaNote>
        <Formula>% Recovery = (Found amount / Theoretical amount) × 100</Formula>
        <Formula>% Error = [(Found − Theoretical) / Theoretical] × 100</Formula>
        <Formula>Absolute error = |Found − Theoretical| &nbsp;·&nbsp; Difference from 100% = |100 − % Recovery|</Formula>
        <Formula>Mean % recovery x̄ = Σ%Rᵢ / n</Formula>
        <Formula>SD = √[Σ(xᵢ − x̄)² / (n − 1)] &nbsp;·&nbsp; %RSD = (SD / x̄) × 100</Formula>
        <Formula>Mean % error = Σ%Eᵢ / n &nbsp;·&nbsp; Mean absolute error = Σ|Foundᵢ − Theoreticalᵢ| / n</Formula>
        <p>
          xᵢ is each trial&apos;s % recovery. SD is the <strong>sample</strong> standard deviation (divides by n − 1),
          as for experimental replicates, so it needs at least two trials.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "What % recovery is acceptable?", a: "Your practical manual or the monograph sets the limits — for example 98–102% for many assays, wider for trace or biological methods. Enter them in the optional acceptance range and the calculator will say whether each result lies within them." },
          { q: "What is the difference between accuracy and precision?", a: "Accuracy (mean % recovery, % error) is how close results are to the theoretical value. Precision (SD, %RSD) is how close replicate results are to each other. A method can be precise yet inaccurate if every trial is biased the same way." },
          { q: "Why is my recovery above 100%?", a: "More was found than was added. Small excesses can be analytical variation; larger ones usually point to a weighing or dilution error, an interfering substance, or a calculation slip." },
          { q: "Why are SD and %RSD missing with one trial?", a: "The sample standard deviation divides by n − 1, which is zero for a single trial. Enter at least two replicate trials to describe precision." },
        ]}
      />
    </CalculatorShell>
  );
}
