"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Maximize2, Printer, ZoomIn, ZoomOut } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalcSection,
  FieldGrid,
  NumberField,
  TextField,
  LabNotice,
  ModeSwitch,
  IS_MOBILE_APP,
  printReport,
  toNumber,
  fieldError,
  formatSig,
  type LabReportData,
} from "@/components/calculators";
import {
  EXAMPLE_SPECTRUM,
  analyseSpectrum,
  blankRow,
  duplicateXs,
  findPeaks,
  listNumbers,
  newRowId,
  niceTicks,
  summariseTable,
  tickDecimals,
  valueDomain,
  wavelengthRule,
  type DataRow,
  type Point,
} from "./_math";
import { csvComment, downloadBlob, downloadSvgAsPng, slug, spectrumSvg, FIGURE_HEIGHT, FIGURE_WIDTH, type CurveKind } from "./_figure";
import { DataTable, ExampleChip, StatTiles, Toggle, ToolButton, WarningList } from "./_parts";

export const REPORT_CONTEXT = "Pharmaceutical Analysis Lab — UV-Visible Spectrophotometry";
const REPORT_TITLE = "UV-Vis Spectrum Plotter";
/** Readings listed in the lab card before the rest are left to the CSV. */
const REPORT_TABLE_LIMIT = 60;

const blankRows = (count: number): DataRow[] => Array.from({ length: count }, () => blankRow());

const inWindow = (point: Point, window: [number, number]) => point.x >= window[0] && point.x <= window[1];

/* ─── State and analysis ─────────────────────────────────────────────────── */

export function useSpectrum(submitted: boolean) {
  const [sample, setSample] = useState("");
  const [solvent, setSolvent] = useState("");
  const [minNm, setMinNm] = useState("");
  const [maxNm, setMaxNm] = useState("");
  const [rows, setRowsRaw] = useState<DataRow[]>(() => blankRows(5));
  const [curve, setCurve] = useState<CurveKind>("linear");
  const [peaksOn, setPeaksOn] = useState(true);
  const [minProminence, setMinProminence] = useState("0");
  const [view, setView] = useState<[number, number] | null>(null);
  const [exampleLoaded, setExampleLoaded] = useState(false);

  /** Any edit to the table means the data is no longer the illustrative set. */
  const setRows = (next: DataRow[]) => {
    setRowsRaw(next);
    setExampleLoaded(false);
  };

  const loadExample = () => {
    setRowsRaw(EXAMPLE_SPECTRUM.map((row) => ({ id: newRowId(), ...row })));
    setExampleLoaded(true);
    setSample("Illustrative spectrum (not measured data)");
    setSolvent("");
    setMinNm("");
    setMaxNm("");
    setView(null);
  };

  const reset = () => {
    setSample(""); setSolvent(""); setMinNm(""); setMaxNm("");
    setRowsRaw(blankRows(5));
    setCurve("linear"); setPeaksOn(true); setMinProminence("0");
    setView(null); setExampleLoaded(false);
  };

  const summary = useMemo(() => summariseTable(rows, wavelengthRule, "wavelength", "absorbance"), [rows]);

  // ── Wavelength window ──
  const minValue = toNumber(minNm);
  const maxValue = toNumber(maxNm);
  const rangeError = (raw: string, value: number | null) => {
    if (raw.trim() === "") return undefined;
    if (value === null) return "Enter a number.";
    if (value <= 0) return "Must be greater than 0 nm.";
    return undefined;
  };
  const minError = rangeError(minNm, minValue);
  const maxError =
    rangeError(maxNm, maxValue) ??
    (minValue !== null && maxValue !== null && !minError && minValue >= maxValue
      ? "Must be greater than the minimum wavelength."
      : undefined);
  const rangeValid = !minError && !maxError;
  const hasRange = rangeValid && (minValue !== null || maxValue !== null);

  const prominenceValue = minProminence.trim() === "" ? 0 : toNumber(minProminence);
  const prominenceError = fieldError(minProminence, { show: submitted, allowZero: true, required: false });

  const derived = useMemo(() => {
    const all = summary.points;
    const inRange = rangeValid
      ? all.filter((p) => (minValue === null || p.x >= minValue) && (maxValue === null || p.x <= maxValue))
      : [];
    const analysis = inRange.length >= 2 ? analyseSpectrum(inRange) : null;
    const duplicatesAll = duplicateXs(all);
    const duplicatesInRange = duplicateXs(inRange);

    let peakNote: string | null = null;
    let peaks: ReturnType<typeof findPeaks> = [];
    if (peaksOn && analysis) {
      if (duplicatesInRange.length > 0) peakNote = "Peak detection is paused while duplicate wavelengths are present — the order of the readings is ambiguous.";
      else if (inRange.length < 3) peakNote = "At least 3 readings are needed to detect peaks.";
      else if (prominenceValue === null || prominenceValue < 0) peakNote = "Enter a minimum prominence of 0 or more.";
      else peaks = findPeaks(inRange, prominenceValue);
    }

    const warnings: string[] = [];
    if (summary.invalidRows.length > 0) {
      warnings.push(
        `${summary.invalidRows.length} incomplete row${summary.invalidRows.length === 1 ? " is" : "s are"} not plotted (row${summary.invalidRows.length === 1 ? "" : "s"} ${listNumbers(summary.invalidRows)}).`,
      );
    }
    if (duplicatesAll.length > 0) {
      warnings.push(
        `Duplicate wavelengths: ${listNumbers(duplicatesAll)} nm. Every reading is kept, so the line doubles back there and λmax or peaks at those wavelengths are ambiguous — remove or average the repeats.`,
      );
    }
    const veryNegative = all.filter((p) => p.y < -0.1).map((p) => p.xRaw);
    if (veryNegative.length > 0) {
      warnings.push(
        `Absorbance below −0.1 at ${listNumbers(veryNegative)} nm. Small negative values are baseline noise, but this is larger — check that the blank was measured in the same cuvette and solvent.`,
      );
    }
    const tooHigh = all.filter((p) => p.y > 3).map((p) => p.xRaw);
    if (tooHigh.length > 0) {
      warnings.push(
        `Absorbance above 3 at ${listNumbers(tooHigh)} nm is above the reliable linear range of most instruments (less than 0.1% of the light reaches the detector, so stray light dominates). Dilute and re-measure.`,
      );
    }
    const outsideInstrument = all.filter((p) => p.x < 190 || p.x > 1100).map((p) => p.xRaw);
    if (outsideInstrument.length > 0) {
      warnings.push(
        `Wavelengths outside 190–1100 nm (${listNumbers(outsideInstrument)}) are beyond a typical UV-Vis spectrophotometer — check the units.`,
      );
    }
    if (rangeValid && hasRange && all.length > 0 && inRange.length < 2) {
      warnings.push(`Fewer than 2 readings fall inside the wavelength range you set, so there is nothing to analyse.`);
    }
    if (analysis && inRange.length >= 3) {
      const first = analysis.lambdaMax[0];
      if (first.x === analysis.xMin || analysis.lambdaMax[analysis.lambdaMax.length - 1].x === analysis.xMax) {
        warnings.push(
          "The highest absorbance is at the edge of the analysed range, so this may be the start of a band rather than its maximum. Extend the scan past this wavelength before reporting λmax.",
        );
      }
    }

    const fullDomain: [number, number] | null = analysis
      ? analysis.xMin === analysis.xMax
        ? [analysis.xMin - 1, analysis.xMax + 1]
        : [analysis.xMin, analysis.xMax]
      : null;

    return { inRange, analysis, peaks, peakNote, duplicatesInRange, warnings, fullDomain, outsideCount: all.length - inRange.length };
  }, [summary, rangeValid, minValue, maxValue, hasRange, peaksOn, prominenceValue]);

  const { analysis, inRange, peaks, fullDomain } = derived;
  // A zoom window that no longer holds two readings (the data changed) falls back to the full view.
  const effectiveView = view && inRange.filter((p) => inWindow(p, view)).length >= 2 ? view : null;
  const xDomain = effectiveView ?? fullDomain;
  const visible = effectiveView ? inRange.filter((p) => inWindow(p, effectiveView)) : inRange;
  const smoothingAllowed = derived.duplicatesInRange.length === 0;
  const drawnCurve: CurveKind = smoothingAllowed ? curve : "linear";

  const lambdaText = analysis ? analysis.lambdaMax.map((p) => p.xRaw).filter((x, i, arr) => arr.indexOf(x) === i).join(", ") : "";

  // ── Report ──
  const report: LabReportData | null = useMemo(() => {
    if (!analysis || !fullDomain) return null;
    const first = analysis.points[0];
    const last = analysis.points[analysis.points.length - 1];
    const rangeLabel = hasRange
      ? `${minValue !== null ? `${minValue}` : "lowest reading"} – ${maxValue !== null ? `${maxValue}` : "highest reading"} nm`
      : "All readings (no range set)";
    const allValid = summary.points;
    const shown = allValid.slice(0, REPORT_TABLE_LIMIT);
    const tieLines =
      analysis.lambdaMax.length > 1
        ? [`${analysis.lambdaMax.length} readings share the maximum absorbance of ${analysis.lambdaMax[0].yRaw}: ${analysis.lambdaMax.map((p) => `${p.xRaw} nm`).join(", ")}. All are reported; the true maximum is likely between them.`]
        : [];

    return {
      title: REPORT_TITLE,
      context: REPORT_CONTEXT,
      sample: sample.trim() || undefined,
      result: { label: "λmax", value: lambdaText, unit: "nm" },
      warnings: derived.warnings.length > 0 ? derived.warnings : undefined,
      sections: [
        {
          title: "Sample details",
          rows: [
            { label: "Sample", value: sample.trim() || "not recorded" },
            { label: "Solvent / blank", value: solvent.trim() || "not recorded" },
            { label: "Wavelength range analysed", value: rangeLabel },
          ],
        },
        {
          title: "Data summary",
          rows: [
            { label: "Readings analysed", value: String(analysis.points.length) },
            { label: "Wavelength range of the data", value: `${first.xRaw} – ${last.xRaw}`, unit: "nm" },
            { label: "Step", value: analysis.step !== null ? `${formatSig(analysis.step, 6)} nm (uniform)` : "not uniform" },
            { label: "Incomplete rows excluded", value: String(summary.invalidRows.length) },
            ...(derived.outsideCount > 0 ? [{ label: "Readings outside the analysed range", value: String(derived.outsideCount) }] : []),
          ],
        },
        {
          title: "λmax",
          rows: [
            { label: analysis.lambdaMax.length > 1 ? "λmax (tied readings)" : "λmax", value: lambdaText, unit: "nm" },
            { label: "Maximum absorbance (Amax)", value: analysis.lambdaMax[0].yRaw, unit: "A" },
          ],
          lines: [
            "λmax is the measured wavelength with the highest absorbance inside the analysed range.",
            ...tieLines,
          ],
        },
        ...(peaksOn
          ? [
              {
                title: "Peaks",
                table:
                  peaks.length > 0
                    ? {
                        columns: ["Peak #", "Wavelength (nm)", "Absorbance", "Prominence"],
                        rows: peaks.map((peak, index) => [String(index + 1), peak.point.xRaw, peak.point.yRaw, formatSig(peak.prominence, 4)]),
                      }
                    : undefined,
                lines: [
                  derived.peakNote ?? (peaks.length === 0 ? "No local maxima met the minimum prominence." : `Local maxima with prominence ≥ ${prominenceValue ?? 0} A (endpoints excluded).`),
                  "Peaks are located only at measured wavelengths — the true maximum may lie between two readings. Scan with a finer step near λmax to locate it precisely.",
                ],
              },
            ]
          : []),
        {
          title: "Data table",
          table: {
            columns: hasRange ? ["Row", "Wavelength (nm)", "Absorbance", "Analysed"] : ["Row", "Wavelength (nm)", "Absorbance"],
            rows: shown.map((p) => {
              const cells = [String(p.rowNumber), p.xRaw, p.yRaw];
              if (hasRange) cells.push(inRange.includes(p) ? "yes" : "outside range");
              return cells;
            }),
          },
          lines:
            allValid.length > REPORT_TABLE_LIMIT
              ? [`… ${allValid.length - REPORT_TABLE_LIMIT} more readings${IS_MOBILE_APP ? " are not listed here" : " in the CSV download"}.`]
              : undefined,
        },
      ],
      notes: [
        "Values are exactly as entered; no smoothing or interpolation is used to compute λmax.",
        drawnCurve === "monotone"
          ? "The plotted curve is a monotone cubic drawn between readings for display only; it never overshoots the data and does not change any result."
          : "The plotted line joins readings with straight segments.",
        "Absorbance is assumed to be blank-corrected (instrument zeroed on the solvent / blank).",
        ...(exampleLoaded ? ["Illustrative data, not a measured spectrum."] : []),
      ],
      figure: {
        svg: spectrumSvg({ points: inRange, xDomain: fullDomain, lambdaMax: analysis.lambdaMax, peaks, curve: drawnCurve }),
        width: FIGURE_WIDTH,
        height: FIGURE_HEIGHT,
        caption: `Absorbance spectrum${sample.trim() ? ` of ${sample.trim()}` : ""}. λmax marked with a ring${peaks.length > 0 ? "; detected peaks marked with triangles" : ""}.`,
      },
    };
  }, [analysis, fullDomain, derived, summary, sample, solvent, hasRange, minValue, maxValue, peaksOn, peaks, prominenceValue, lambdaText, drawnCurve, exampleLoaded, inRange]);

  return {
    sample, setSample, solvent, setSolvent, minNm, setMinNm, maxNm, setMaxNm,
    rows, setRows, curve, setCurve, peaksOn, setPeaksOn, minProminence, setMinProminence,
    view, setView, exampleLoaded, loadExample, reset,
    summary, minError, maxError, prominenceError, derived, analysis, inRange, peaks,
    fullDomain, effectiveView, xDomain, visible, smoothingAllowed, drawnCurve, lambdaText, report,
  };
}

export type SpectrumState = ReturnType<typeof useSpectrum>;

/* ─── Panel ──────────────────────────────────────────────────────────────── */

export function SpectrumPanel({ s }: { s: SpectrumState }) {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus((current) => (current === message ? "" : current)), 3200);
  };

  const { analysis, xDomain, visible, inRange, peaks } = s;
  const countIn = (window: [number, number]) => inRange.filter((p) => inWindow(p, window)).length;

  const applyWindow = (window: [number, number]) => {
    if (!s.fullDomain) return;
    const lo = Math.max(window[0], s.fullDomain[0]);
    const hi = Math.min(window[1], s.fullDomain[1]);
    if (lo <= s.fullDomain[0] && hi >= s.fullDomain[1]) {
      s.setView(null);
      return;
    }
    if (countIn([lo, hi]) < 2) {
      flash("Cannot zoom in further — fewer than 2 readings would be visible.");
      return;
    }
    s.setView([lo, hi]);
  };

  const zoom = (factor: number) => {
    if (!xDomain) return;
    const centre = (xDomain[0] + xDomain[1]) / 2;
    const half = ((xDomain[1] - xDomain[0]) / 2) * factor;
    applyWindow([centre - half, centre + half]);
  };

  const endDrag = () => {
    if (dragStart !== null && dragEnd !== null && dragStart !== dragEnd) {
      applyWindow([Math.min(dragStart, dragEnd), Math.max(dragStart, dragEnd)]);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const yDomain = visible.length > 0 ? valueDomain(visible.map((p) => p.y)) : ([0, 1] as [number, number]);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);
  const xTicks = xDomain ? niceTicks(xDomain[0], xDomain[1], 7) : [];
  const yDec = tickDecimals(yTicks);
  const xDec = tickDecimals(xTicks);
  const chartData = visible.map((p) => ({ wl: p.x, a: p.y }));
  const visiblePeaks = xDomain ? peaks.filter((peak) => inWindow(peak.point, xDomain)) : [];

  const downloadPng = async () => {
    if (!analysis || !xDomain) return;
    const svg = spectrumSvg({ points: visible, xDomain, lambdaMax: analysis.lambdaMax, peaks: visiblePeaks, curve: s.drawnCurve });
    try {
      await downloadSvgAsPng(svg, `${s.sample.trim() || "UV-Vis spectrum"} — λmax ${s.lambdaText} nm`, `uv-spectrum-${slug(s.sample, "sample")}.png`);
      flash("Graph downloaded as PNG.");
    } catch {
      flash("The graph could not be drawn. Try Print instead.");
    }
  };

  const downloadCsv = () => {
    if (!analysis) return;
    const lines = [
      "# UV-Vis spectrum — PharmaWallah Academia",
      csvComment("Sample", s.sample),
      csvComment("Solvent/blank", s.solvent),
      csvComment("Readings", `${analysis.points.length} valid readings in the analysed range, sorted by wavelength, values as entered`),
      "wavelength_nm,absorbance",
      ...analysis.points.map((p) => `${p.xRaw},${p.yRaw}`),
    ];
    downloadBlob(new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" }), `uv-spectrum-${slug(s.sample, "sample")}.csv`);
    flash("Data downloaded as CSV.");
  };

  const tiles = analysis
    ? [
        {
          label: "λmax",
          value: s.lambdaText,
          unit: "nm",
          note: analysis.lambdaMax.length > 1 ? `${analysis.lambdaMax.length} tied readings` : undefined,
          featured: true,
        },
        { label: "Maximum absorbance", value: analysis.lambdaMax[0].yRaw, unit: "A" },
        { label: "Readings", value: String(analysis.points.length), note: "valid, in range" },
        {
          label: "Wavelength range",
          value: `${analysis.points[0].xRaw}–${analysis.points[analysis.points.length - 1].xRaw}`,
          unit: "nm",
          note: analysis.step !== null ? `uniform ${formatSig(analysis.step, 6)} nm step` : "uneven steps",
        },
      ]
    : [];

  return (
    <>
      <CalcSection title="Sample" description="Recorded on the lab card. The range limits which readings are plotted and searched.">
        <FieldGrid>
          <TextField label="Sample name" value={s.sample} onChange={s.setSample} placeholder="e.g. Paracetamol 10 µg/mL" />
          <TextField label="Solvent / blank" value={s.solvent} onChange={s.setSolvent} placeholder="e.g. 0.1 M HCl" />
          <NumberField label="Analyse from (optional)" value={s.minNm} onChange={s.setMinNm} unit="nm" min={0} error={s.minError} hint="Leave blank to start at the first reading." />
          <NumberField label="Analyse to (optional)" value={s.maxNm} onChange={s.setMaxNm} unit="nm" min={0} error={s.maxError} hint="Leave blank to end at the last reading." />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Spectrum readings" description="Wavelength (nm) | Absorbance. Rows can be in any order — they are sorted for plotting only.">
        <div className="flex flex-wrap items-center gap-2">
          <ExampleChip label="Load example spectrum" onClick={s.loadExample} />
          <span className="text-xs text-muted-foreground">Illustrative data, not a measured spectrum.</span>
        </div>
        {s.exampleLoaded && (
          <LabNotice tone="info" title="Illustrative data, not a measured spectrum">
            A synthetic band at 275 nm with a weaker band near 240 nm, sampled every 5 nm. Replace it with your own
            readings before recording a result.
          </LabNotice>
        )}
        <DataTable
          rows={s.rows}
          onRowsChange={s.setRows}
          statuses={s.summary.statuses}
          xLabel="Wavelength (nm)"
          yLabel="Absorbance"
          xPlaceholder="nm"
          yPlaceholder="A"
          pasteExample={"nm,Abs\n250, 0.412\n255\t0.498\n260 0.563"}
        />
      </CalcSection>

      <CalcSection title="Spectrum graph" description="Drag across the graph to zoom into a wavelength window.">
        {analysis && xDomain ? (
          <>
            <StatTiles tiles={tiles} />

            <ModeSwitch
              label="Line between readings"
              value={s.drawnCurve}
              onChange={(next) => s.setCurve(next)}
              options={[
                { value: "linear", label: "Straight segments", description: "Joins readings directly — the most honest view" },
                { value: "monotone", label: "Smoothed (monotone)", description: "Never overshoots the data; display only" },
              ]}
            />
            {!s.smoothingAllowed && (
              <p className="text-xs text-amber-800">Smoothing is unavailable while duplicate wavelengths are present.</p>
            )}

            <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Graph controls">
              <ToolButton icon={ZoomIn} label="Zoom in" onClick={() => zoom(0.5)} />
              <ToolButton icon={ZoomOut} label="Zoom out" onClick={() => zoom(2)} disabled={!s.effectiveView} />
              <ToolButton icon={Maximize2} label="Reset view" onClick={() => s.setView(null)} disabled={!s.effectiveView} />
              {!IS_MOBILE_APP && (
                <>
                  <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
                  <ToolButton icon={Download} label="Download PNG" onClick={downloadPng} />
                  <ToolButton icon={FileSpreadsheet} label="Download data" onClick={downloadCsv} />
                  <ToolButton icon={Printer} label="Print result" onClick={() => s.report && printReport(s.report)} disabled={!s.report} />
                </>
              )}
            </div>

            <div
              className="h-72 cursor-crosshair select-none rounded-[20px] border bg-gradient-to-b from-white to-blue-50/30 p-2 sm:h-96"
              onMouseLeave={() => { setDragStart(null); setDragEnd(null); }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 28, right: 18, bottom: 22, left: 6 }}
                  onMouseDown={(state: { activeLabel?: string | number }) => {
                    const value = Number(state?.activeLabel);
                    if (Number.isFinite(value)) { setDragStart(value); setDragEnd(null); }
                  }}
                  onMouseMove={(state: { activeLabel?: string | number }) => {
                    if (dragStart === null) return;
                    const value = Number(state?.activeLabel);
                    if (Number.isFinite(value)) setDragEnd(value);
                  }}
                  onMouseUp={endDrag}
                >
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="wl"
                    type="number"
                    domain={xDomain}
                    ticks={xTicks}
                    allowDataOverflow
                    tickFormatter={(v: number) => v.toFixed(xDec)}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    stroke="#94A3B8"
                    label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -14, fontSize: 12, fill: "#0F172A" }}
                  />
                  <YAxis
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
                  <Tooltip
                    formatter={(value) => [String(value), "Absorbance"]}
                    labelFormatter={(label) => `${label} nm`}
                    contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0", fontSize: 12 }}
                  />
                  <Line
                    type={s.drawnCurve}
                    dataKey="a"
                    stroke="#2563EB"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: "#2563EB", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#2563EB", stroke: "#FFFFFF", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                  {visiblePeaks.map((peak) => (
                    <ReferenceDot key={`peak-${peak.point.rowNumber}`} x={peak.point.x} y={peak.point.y} r={5} fill="#16A34A" stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                  {analysis.lambdaMax.map((point, index) => (
                    <ReferenceDot
                      key={`max-${point.rowNumber}`}
                      x={point.x}
                      y={point.y}
                      r={7}
                      fill="#FFFFFF"
                      stroke="#1D4ED8"
                      strokeWidth={2.5}
                      label={index === 0 ? { value: `λmax ${s.lambdaText} nm`, position: "top", offset: 12, fontSize: 12, fontWeight: 700, fill: "#1D4ED8" } : undefined}
                    />
                  ))}
                  {dragStart !== null && dragEnd !== null && (
                    <ReferenceArea x1={Math.min(dragStart, dragEnd)} x2={Math.max(dragStart, dragEnd)} fill="#2563EB" fillOpacity={0.1} stroke="#2563EB" strokeOpacity={0.35} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p aria-live="polite" className="min-h-[1rem] text-xs text-muted-foreground">
              {status || (s.effectiveView ? `Showing ${formatSig(xDomain[0], 6)}–${formatSig(xDomain[1], 6)} nm (${visible.length} readings).` : "")}
            </p>

            <WarningList items={s.derived.warnings} />

            <div className="space-y-3 rounded-[20px] border bg-muted/30 p-3.5">
              <Toggle
                checked={s.peaksOn}
                onChange={s.setPeaksOn}
                label="Detect peaks"
                description="Local maxima between the first and last readings, ranked by prominence."
              />
              {s.peaksOn && (
                <>
                  <NumberField
                    label="Minimum prominence"
                    value={s.minProminence}
                    onChange={s.setMinProminence}
                    unit="A"
                    min={0}
                    step="0.01"
                    error={s.prominenceError}
                    hint="0 lists every local maximum. Raise it to ignore noise bumps."
                  />
                  {s.derived.peakNote ? (
                    <p className="text-sm text-amber-800">{s.derived.peakNote}</p>
                  ) : peaks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No local maxima met the minimum prominence.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border bg-card">
                      <table className="w-full min-w-max border-collapse text-sm">
                        <caption className="sr-only">Detected peaks</caption>
                        <thead className="bg-blue-50/80">
                          <tr>
                            {["Peak #", "Wavelength (nm)", "Absorbance", "Prominence"].map((column) => (
                              <th key={column} scope="col" className="px-3 py-2 text-left text-xs font-semibold text-foreground">{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {peaks.map((peak, index) => (
                            <tr key={peak.point.rowNumber} className="border-t">
                              <td className="px-3 py-2 tabular-nums">{index + 1}</td>
                              <td className="px-3 py-2 font-semibold tabular-nums">{peak.point.xRaw}</td>
                              <td className="px-3 py-2 tabular-nums">{peak.point.yRaw}</td>
                              <td className="px-3 py-2 tabular-nums">{formatSig(peak.prominence, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Peaks are found only at measured wavelengths — the true maximum may lie between two readings. Use a
                    finer step (1 nm or less) near λmax to locate it.
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed bg-gradient-to-br from-blue-50/60 to-green-50/50 p-6 text-center">
            <p className="text-sm font-semibold text-foreground">No graph yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.summary.points.length < 2
                ? "Enter at least 2 complete readings (wavelength and absorbance) to plot a spectrum."
                : "Fewer than 2 readings fall inside the wavelength range — widen or clear the range."}
            </p>
            {s.derived.warnings.length > 0 && <div className="mt-3 text-left"><WarningList items={s.derived.warnings} /></div>}
          </div>
        )}
      </CalcSection>
    </>
  );
}
