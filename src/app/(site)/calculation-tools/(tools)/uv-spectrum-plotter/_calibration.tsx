"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Plus, Printer, Trash2 } from "lucide-react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  CalcSection,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
  LabNotice,
  IS_MOBILE_APP,
  printReport,
  toNumber,
  fieldError,
  formatSig,
  formatFixed,
  type LabReportData,
} from "@/components/calculators";
import {
  EXAMPLE_STANDARDS,
  blankRow,
  calibrationXDomain,
  concentrationRule,
  linearRegression,
  listNumbers,
  newRowId,
  niceTicks,
  summariseTable,
  tickDecimals,
  valueDomain,
  type DataRow,
} from "./_math";
import { calibrationSvg, csvComment, downloadBlob, downloadSvgAsPng, equationText, slug, FIGURE_HEIGHT, FIGURE_WIDTH } from "./_figure";
import { DataTable, ExampleChip, StatTiles, Toggle, ToolButton, WarningList } from "./_parts";
import { REPORT_CONTEXT } from "./_spectrum";

export const CONC_UNITS = ["µg/mL", "mg/mL", "mg/L", "% w/v", "M", "mM", "µM"] as const;
type ConcUnit = (typeof CONC_UNITS)[number];

type UnknownRow = { id: number; a: string };

const R2_CAUTION = 0.995;
const BEER_LAMBERT_LIMIT = 1.5;
/** Relative slack when deciding whether an unknown sits inside the calibrated range. */
const RANGE_TOLERANCE = 1e-9;

const blankRows = (count: number): DataRow[] => Array.from({ length: count }, () => blankRow());

export function useCalibration(submitted: boolean) {
  const [analyte, setAnalyte] = useState("");
  const [wavelength, setWavelength] = useState("");
  const [unit, setUnit] = useState<ConcUnit>("µg/mL");
  const [rows, setRowsRaw] = useState<DataRow[]>(() => blankRows(5));
  const [forceOrigin, setForceOrigin] = useState(false);
  const [unknowns, setUnknowns] = useState<UnknownRow[]>(() => [{ id: newRowId(), a: "" }]);
  const [dilution, setDilution] = useState("");
  const [exampleLoaded, setExampleLoaded] = useState(false);

  const setRows = (next: DataRow[]) => {
    setRowsRaw(next);
    setExampleLoaded(false);
  };

  const loadExample = () => {
    setRowsRaw(EXAMPLE_STANDARDS.map((row) => ({ id: newRowId(), ...row })));
    setExampleLoaded(true);
  };

  const reset = () => {
    setAnalyte(""); setWavelength(""); setUnit("µg/mL");
    setRowsRaw(blankRows(5)); setForceOrigin(false);
    setUnknowns([{ id: newRowId(), a: "" }]); setDilution(""); setExampleLoaded(false);
  };

  const summary = useMemo(() => summariseTable(rows, concentrationRule, "concentration", "absorbance"), [rows]);
  const wavelengthError = fieldError(wavelength, { show: submitted, required: false });
  const dilutionError = fieldError(dilution, { show: submitted, required: false });
  const dilutionValue = !dilutionError && dilution.trim() !== "" ? toNumber(dilution) : null;

  const derived = useMemo(() => {
    const points = summary.points;
    const n = points.length;
    const fit = n >= 3 ? linearRegression(points, forceOrigin) : null;
    let fitProblem: string | null = null;
    if (n < 3) fitProblem = `At least 3 standards are needed to fit a calibration line (${n} complete so far).`;
    else if (!fit) {
      fitProblem = forceOrigin
        ? "Every standard is at zero concentration, so a line through the origin cannot be fitted."
        : "Every standard has the same concentration, so a slope cannot be calculated.";
    }

    const warnings: string[] = [];
    if (summary.invalidRows.length > 0) {
      warnings.push(
        `${summary.invalidRows.length} incomplete row${summary.invalidRows.length === 1 ? " is" : "s are"} excluded from the fit (row${summary.invalidRows.length === 1 ? "" : "s"} ${listNumbers(summary.invalidRows)}).`,
      );
    }
    if (fit) {
      if (n < 5) warnings.push(`Only ${n} standards. ICH Q2 recommends a minimum of 5 concentrations for linearity.`);
      if (fit.r2 === null) warnings.push("Every standard has the same absorbance, so R² is undefined and the line is not a calibration.");
      else if (fit.r2 < R2_CAUTION) {
        warnings.push(`R² = ${formatFixed(fit.r2, 4)} is below ${R2_CAUTION}. Check for an outlier, a pipetting error or curvature before relying on this line.`);
      }
      if (fit.slope <= 0) warnings.push("The slope is not positive — absorbance should rise with concentration. Check that the columns are not swapped.");
    }
    const high = points.filter((p) => p.y > BEER_LAMBERT_LIMIT).map((p) => p.xRaw);
    if (high.length > 0) {
      warnings.push(
        `Absorbance above ${BEER_LAMBERT_LIMIT} at concentration ${listNumbers(high)} ${unit} — possible deviation from the Beer–Lambert law (stray light, instrumental and chemical deviations). Consider narrowing the range or diluting.`,
      );
    }

    const unknownResults = unknowns.map((row, index) => {
      const label = `U${index + 1}`;
      const raw = row.a.trim();
      const a = toNumber(raw);
      if (raw === "") return { row, label, a: null, error: undefined as string | undefined, conc: null as number | null, original: null as number | null, rangeNote: "" };
      if (a === null) return { row, label, a: null, error: "Enter a number.", conc: null, original: null, rangeNote: "" };
      if (!fit || fit.slope === 0) return { row, label, a, error: undefined, conc: null, original: null, rangeNote: "" };
      const conc = (a - fit.intercept) / fit.slope;
      const slack = RANGE_TOLERANCE * Math.max(1, Math.abs(fit.xMax));
      let rangeNote = "Within the calibrated range";
      if (conc < 0) rangeNote = "Below zero — the absorbance is less than the intercept";
      else if (conc < fit.xMin - slack) rangeNote = "Extrapolated — below the lowest standard";
      else if (conc > fit.xMax + slack) rangeNote = "Extrapolated — above the highest standard";
      return { row, label, a, error: undefined, conc, original: dilutionValue !== null ? conc * dilutionValue : null, rangeNote };
    });

    const extrapolated = unknownResults.filter((u) => u.conc !== null && u.rangeNote !== "Within the calibrated range").map((u) => u.label);
    if (extrapolated.length > 0) {
      warnings.push(
        `${listNumbers(extrapolated)} ${extrapolated.length === 1 ? "lies" : "lie"} outside the calibrated concentration range. Linearity is only demonstrated between the lowest and highest standard — dilute or re-prepare the sample so its absorbance falls inside the range.`,
      );
    }

    const plottedUnknowns = unknownResults
      .filter((u) => u.conc !== null && u.a !== null)
      .map((u) => ({ label: u.label, c: u.conc as number, a: u.a as number }));

    return { points, fit, fitProblem, warnings, unknownResults, plottedUnknowns };
  }, [summary, forceOrigin, unknowns, dilutionValue, unit]);

  const { fit, points, unknownResults, plottedUnknowns } = derived;
  const equation = fit ? equationText(fit) : null;

  const report: LabReportData | null = useMemo(() => {
    if (!fit || !equation) return null;
    const readyUnknowns = unknownResults.filter((u) => u.conc !== null);
    const r2Text = fit.r2 === null ? "undefined" : formatFixed(fit.r2, 4);
    return {
      title: "UV-Vis Calibration Curve",
      context: REPORT_CONTEXT,
      sample: analyte.trim() || undefined,
      result: { label: "Calibration equation", value: equation },
      warnings: derived.warnings.length > 0 ? derived.warnings : undefined,
      sections: [
        {
          title: "Method",
          rows: [
            { label: "Analyte / sample", value: analyte.trim() || "not recorded" },
            { label: "Wavelength used", value: toNumber(wavelength) !== null && !wavelengthError ? wavelength.trim() : "not recorded", unit: toNumber(wavelength) !== null && !wavelengthError ? "nm" : undefined },
            { label: "Concentration unit", value: unit },
            { label: "Model", value: fit.throughOrigin ? "Least squares, forced through origin (A = m·c)" : "Least squares, A = m·c + b" },
          ],
        },
        {
          title: "Standards",
          table: {
            columns: ["Row", `Concentration (${unit})`, "Absorbance", "Fitted A", "Residual"],
            rows: points.map((p) => {
              const fitted = fit.slope * p.x + fit.intercept;
              return [String(p.rowNumber), p.xRaw, p.yRaw, formatFixed(fitted, 4), formatFixed(p.y - fitted, 4)];
            }),
          },
        },
        {
          title: "Regression",
          rows: [
            { label: "Slope (m)", value: formatSig(fit.slope, 5), unit: `A per ${unit}` },
            { label: "Intercept (b)", value: fit.throughOrigin ? "0 (fixed)" : formatSig(fit.intercept, 4), unit: fit.throughOrigin ? undefined : "A" },
            { label: "R²", value: r2Text },
            { label: "Number of standards (n)", value: String(fit.n) },
            ...(fit.seSlope !== null ? [{ label: "Standard error of slope", value: formatSig(fit.seSlope, 3) }] : []),
            ...(fit.seIntercept !== null ? [{ label: "Standard error of intercept", value: formatSig(fit.seIntercept, 3) }] : []),
            ...(fit.sResidual !== null ? [{ label: "Residual standard deviation s(y/x)", value: formatSig(fit.sResidual, 3), unit: "A" }] : []),
          ],
          formulas: fit.throughOrigin
            ? ["m = Σ(c·A) / Σ(c²)", "b = 0", `R² = 1 − SSres / SStot = 1 − ${formatSig(fit.ssRes, 4)} / ${formatSig(fit.ssTot, 4)}`]
            : ["m = Σ(c − c̄)(A − Ā) / Σ(c − c̄)²", "b = Ā − m·c̄", `R² = 1 − SSres / SStot = 1 − ${formatSig(fit.ssRes, 4)} / ${formatSig(fit.ssTot, 4)}`],
          lines: fit.throughOrigin
            ? ["R² is computed with SStot about the mean absorbance, the same convention as the ordinary fit. The uncentred R² that some spreadsheets report for a zero-intercept fit (SStot = ΣA²) is higher and is not comparable."]
            : undefined,
        },
        ...(readyUnknowns.length > 0
          ? [
              {
                title: "Unknown samples",
                formulas: [
                  fit.throughOrigin ? "c = A / m" : "c = (A − b) / m",
                  ...(dilutionValue !== null ? [`Original concentration = c × dilution factor (${formatSig(dilutionValue, 4)})`] : []),
                ],
                table: {
                  columns: dilutionValue !== null
                    ? ["Sample", "Absorbance", `c measured (${unit})`, `Original (${unit})`, "Range check"]
                    : ["Sample", "Absorbance", `c (${unit})`, "Range check"],
                  rows: readyUnknowns.map((u) => {
                    const cells = [u.label, u.row.a.trim(), formatSig(u.conc as number, 4)];
                    if (dilutionValue !== null) cells.push(formatSig(u.original as number, 4));
                    cells.push(u.rangeNote);
                    return cells;
                  }),
                },
                lines: [`Calibrated range: ${formatSig(fit.xMin, 6)} – ${formatSig(fit.xMax, 6)} ${unit}.`],
              },
            ]
          : []),
      ],
      notes: [
        "Standards and absorbances are used exactly as entered; blank-corrected absorbance is assumed.",
        "Concentration units are labels only — no unit conversion is applied.",
        ...(exampleLoaded ? ["Illustrative standards, not measured data."] : []),
      ],
      figure: {
        svg: calibrationSvg({ points, fit, unknowns: plottedUnknowns, unitLabel: unit, equation }),
        width: FIGURE_WIDTH,
        height: FIGURE_HEIGHT,
        caption: `Calibration curve: standards (circles), least-squares line${plottedUnknowns.length > 0 ? ", unknowns (diamonds)" : ""}. ${equation}${fit.r2 !== null ? `, R² = ${r2Text}` : ""}.`,
      },
    };
  }, [fit, equation, unknownResults, derived, analyte, wavelength, wavelengthError, unit, points, dilutionValue, exampleLoaded, plottedUnknowns]);

  return {
    analyte, setAnalyte, wavelength, setWavelength, unit, setUnit, rows, setRows, forceOrigin, setForceOrigin,
    unknowns, setUnknowns, dilution, setDilution, exampleLoaded, loadExample, reset,
    summary, wavelengthError, dilutionError, dilutionValue, derived, equation, plottedUnknowns, report,
  };
}

export type CalibrationState = ReturnType<typeof useCalibration>;

export function CalibrationPanel({ c }: { c: CalibrationState }) {
  const [status, setStatus] = useState("");
  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus((current) => (current === message ? "" : current)), 3200);
  };

  const { fit, points, fitProblem, unknownResults } = c.derived;

  const xs = points.map((p) => p.x).concat(c.plottedUnknowns.map((u) => u.c));
  // The line is drawn only across the standards (and out to any unknown), so the intercept need not be on the axis.
  const ys = points.map((p) => p.y).concat(c.plottedUnknowns.map((u) => u.a));
  if (fit) ys.push(fit.slope * fit.xMin + fit.intercept, fit.slope * fit.xMax + fit.intercept);
  const xDomain = xs.length > 0 ? calibrationXDomain(xs) : ([0, 1] as [number, number]);
  const yDomain = ys.length > 0 ? valueDomain(ys) : ([0, 1] as [number, number]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], 6);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);
  const xDec = tickDecimals(xTicks);
  const yDec = tickDecimals(yTicks);

  const fitLine = fit ? [fit.xMin, fit.xMax].map((x) => ({ c: x, a: fit.slope * x + fit.intercept })) : [];
  const extension = (() => {
    if (!fit || c.plottedUnknowns.length === 0) return { low: [], high: [] } as { low: { c: number; a: number }[]; high: { c: number; a: number }[] };
    const lo = Math.min(...c.plottedUnknowns.map((u) => u.c));
    const hi = Math.max(...c.plottedUnknowns.map((u) => u.c));
    const at = (x: number) => ({ c: x, a: fit.slope * x + fit.intercept });
    return {
      low: lo < fit.xMin ? [at(lo), at(fit.xMin)] : [],
      high: hi > fit.xMax ? [at(fit.xMax), at(hi)] : [],
    };
  })();

  const downloadPng = async () => {
    if (!fit || !c.equation) return;
    const svg = calibrationSvg({ points, fit, unknowns: c.plottedUnknowns, unitLabel: c.unit, equation: c.equation });
    try {
      await downloadSvgAsPng(svg, `${c.analyte.trim() || "Calibration curve"} — ${c.equation}`, `uv-calibration-${slug(c.analyte, "curve")}.png`);
      flash("Graph downloaded as PNG.");
    } catch {
      flash("The graph could not be drawn. Try Print instead.");
    }
  };

  const downloadCsv = () => {
    if (!fit || !c.equation) return;
    const lines = [
      "# UV-Vis calibration standards — PharmaWallah Academia",
      csvComment("Analyte/sample", c.analyte),
      csvComment("Wavelength (nm)", c.wavelength),
      csvComment("Equation", `${c.equation}${fit.r2 !== null ? `, R2 = ${fit.r2.toFixed(4)}` : ""}${fit.throughOrigin ? ", forced through origin" : ""}`),
      `concentration_${c.unit.replace(/[^a-zA-Z0-9]+/g, "_").replace(/_$/, "")},absorbance,fitted_absorbance,residual`,
      ...points.map((p) => {
        const fitted = fit.slope * p.x + fit.intercept;
        return `${p.xRaw},${p.yRaw},${fitted.toFixed(6)},${(p.y - fitted).toFixed(6)}`;
      }),
    ];
    downloadBlob(new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" }), `uv-calibration-${slug(c.analyte, "curve")}.csv`);
    flash("Standards downloaded as CSV.");
  };

  return (
    <>
      <CalcSection title="Method" description="Recorded on the lab card. The unit is a label — no conversion is applied.">
        <FieldGrid>
          <TextField label="Analyte / sample" value={c.analyte} onChange={c.setAnalyte} placeholder="e.g. Paracetamol in 0.1 M NaOH" />
          <NumberField label="Wavelength used (optional)" value={c.wavelength} onChange={c.setWavelength} unit="nm" min={0} error={c.wavelengthError} hint="Usually the λmax of the analyte." />
          <SelectField label="Concentration unit" value={c.unit} onChange={(v) => c.setUnit(v as ConcUnit)} options={[...CONC_UNITS]} />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Standards" description={`Concentration (${c.unit}) | Absorbance. Replicate standards at the same concentration are fine.`}>
        <div className="flex flex-wrap items-center gap-2">
          <ExampleChip label="Load example standards" onClick={c.loadExample} />
          <span className="text-xs text-muted-foreground">Illustrative data, not measured values.</span>
        </div>
        {c.exampleLoaded && (
          <LabNotice tone="info" title="Illustrative standards, not measured data">
            Five standards from 2 to 10 on a nearly linear response. Replace them with your own before recording a result.
          </LabNotice>
        )}
        <DataTable
          rows={c.rows}
          onRowsChange={c.setRows}
          statuses={c.summary.statuses}
          xLabel={`Concentration (${c.unit})`}
          yLabel="Absorbance"
          xPlaceholder="conc."
          yPlaceholder="A"
          pasteExample={"conc,Abs\n2, 0.105\n4\t0.212\n6 0.318"}
        />
      </CalcSection>

      <CalcSection title="Calibration curve" description="Least-squares straight line through the standards.">
        <Toggle
          checked={c.forceOrigin}
          onChange={c.setForceOrigin}
          label="Force through origin"
          description="Fixes b = 0. Only justified when the blank truly reads zero."
        />

        {fit && c.equation ? (
          <>
            <StatTiles
              tiles={[
                { label: "Slope (m)", value: formatSig(fit.slope, 4), unit: `A per ${c.unit}`, note: fit.seSlope !== null ? `SE ${formatSig(fit.seSlope, 2)}` : undefined, featured: true },
                { label: "Intercept (b)", value: fit.throughOrigin ? "0" : formatSig(fit.intercept, 3), unit: "A", note: fit.throughOrigin ? "fixed" : undefined },
                { label: "R²", value: fit.r2 === null ? "—" : formatFixed(fit.r2, 4), note: fit.r2 !== null && fit.r2 < R2_CAUTION ? "below 0.995" : undefined },
                { label: "Standards (n)", value: String(fit.n) },
              ]}
            />
            <p className="rounded-xl border border-l-[3px] border-l-blue-600 bg-muted/60 px-3.5 py-3 font-mono text-[15px] font-semibold text-foreground">
              {c.equation}
            </p>

            <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Graph controls">
              {!IS_MOBILE_APP && (
                <>
                  <ToolButton icon={Download} label="Download PNG" onClick={downloadPng} />
                  <ToolButton icon={FileSpreadsheet} label="Download data" onClick={downloadCsv} />
                  <ToolButton icon={Printer} label="Print result" onClick={() => c.report && printReport(c.report)} disabled={!c.report} />
                </>
              )}
            </div>

            <div className="h-72 rounded-[20px] border bg-gradient-to-b from-white to-green-50/30 p-2 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 20, right: 18, bottom: 22, left: 6 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="c"
                    type="number"
                    domain={xDomain}
                    ticks={xTicks}
                    allowDataOverflow
                    tickFormatter={(v: number) => v.toFixed(xDec)}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    stroke="#94A3B8"
                    label={{ value: `Concentration (${c.unit})`, position: "insideBottom", offset: -14, fontSize: 12, fill: "#0F172A" }}
                  />
                  <YAxis
                    dataKey="a"
                    type="number"
                    domain={yDomain}
                    ticks={yTicks}
                    allowDataOverflow
                    tickFormatter={(v: number) => v.toFixed(yDec)}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    stroke="#94A3B8"
                    width={52}
                    label={{ value: "Absorbance (AU)", angle: -90, position: "insideLeft", offset: 8, fontSize: 12, fill: "#0F172A", style: { textAnchor: "middle" } }}
                  />
                  {extension.low.length > 0 && (
                    <Line data={extension.low} dataKey="a" stroke="#16A34A" strokeWidth={1.6} strokeDasharray="5 4" dot={false} activeDot={false} isAnimationActive={false} legendType="none" />
                  )}
                  {extension.high.length > 0 && (
                    <Line data={extension.high} dataKey="a" stroke="#16A34A" strokeWidth={1.6} strokeDasharray="5 4" dot={false} activeDot={false} isAnimationActive={false} legendType="none" />
                  )}
                  <Line data={fitLine} dataKey="a" stroke="#16A34A" strokeWidth={2.4} dot={false} activeDot={false} isAnimationActive={false} legendType="none" name="Fitted line" />
                  <Scatter data={points.map((p) => ({ c: p.x, a: p.y }))} fill="#2563EB" name="Standards" isAnimationActive={false} />
                  {c.plottedUnknowns.length > 0 && (
                    <Scatter data={c.plottedUnknowns.map((u) => ({ c: u.c, a: u.a }))} fill="#D97706" shape="diamond" name="Unknowns" isAnimationActive={false} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-blue-600" />Standards</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-4 bg-green-600" />Fitted line</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rotate-45 bg-amber-600" />Unknowns</span>
            </p>
            <p aria-live="polite" className="min-h-[1rem] text-xs text-muted-foreground">{status}</p>
            {c.forceOrigin && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                R² here is 1 − SSres/SStot with SStot taken about the mean absorbance, so it is comparable with the
                ordinary fit. The uncentred R² some spreadsheets report for a zero-intercept line (SStot = ΣA²) is higher
                and not comparable.
              </p>
            )}
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed bg-gradient-to-br from-blue-50/60 to-green-50/50 p-6 text-center">
            <p className="text-sm font-semibold text-foreground">No calibration line yet</p>
            <p className="mt-1 text-sm text-muted-foreground">{fitProblem}</p>
          </div>
        )}
        <WarningList items={c.derived.warnings} />
      </CalcSection>

      <CalcSection title="Unknown samples" description="Concentration from absorbance: c = (A − b) / m.">
        <div className="space-y-2.5">
          {unknownResults.map((u, index) => (
            <div key={u.row.id} className="rounded-2xl border bg-background p-3">
              <div className="flex items-end gap-2">
                <NumberField
                  className="flex-1"
                  label={`Unknown ${index + 1} absorbance`}
                  value={u.row.a}
                  onChange={(value) => c.setUnknowns(c.unknowns.map((row) => (row.id === u.row.id ? { ...row, a: value } : row)))}
                  unit="A"
                  error={u.error}
                />
                <button
                  type="button"
                  aria-label={`Delete unknown ${index + 1}`}
                  onClick={() => c.setUnknowns(c.unknowns.length === 1 ? [{ id: newRowId(), a: "" }] : c.unknowns.filter((row) => row.id !== u.row.id))}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {u.conc !== null && (
                <div className="mt-2 space-y-0.5 text-sm">
                  <p className="text-foreground">
                    c = <span className="font-bold tabular-nums">{formatSig(u.conc, 4)}</span> {c.unit}
                    {u.original !== null && (
                      <>
                        {" "}× {formatSig(c.dilutionValue as number, 4)} ={" "}
                        <span className="font-bold tabular-nums text-blue-700">{formatSig(u.original, 4)}</span> {c.unit} in the original sample
                      </>
                    )}
                  </p>
                  <p className={u.rangeNote === "Within the calibrated range" ? "text-xs text-green-700" : "text-xs font-medium text-amber-800"}>{u.rangeNote}</p>
                </div>
              )}
              {u.a !== null && u.conc === null && (
                <p className="mt-2 text-xs text-muted-foreground">Fit a calibration line first.</p>
              )}
            </div>
          ))}
        </div>
        <FieldGrid>
          <Button variant="outline" className="border-dashed" disabled={c.unknowns.length >= 20} onClick={() => c.setUnknowns([...c.unknowns, { id: newRowId(), a: "" }])}>
            <Plus />
            Add unknown
          </Button>
          <NumberField
            label="Dilution factor (optional)"
            value={c.dilution}
            onChange={c.setDilution}
            unit="×"
            min={0}
            error={c.dilutionError}
            hint="e.g. 10 for 1 mL made up to 10 mL. Multiplies back to the original concentration."
          />
        </FieldGrid>
      </CalcSection>
    </>
  );
}
