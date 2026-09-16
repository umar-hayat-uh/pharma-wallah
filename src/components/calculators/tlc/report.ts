import type { LabReportData } from "../LabReport";
import { formatCm, formatPx, formatRf } from "./rf";
import type { PlateAnalysis } from "./types";

/**
 * The TLC analysis as a lab record — one description that the kit renders as
 * clipboard text, a PNG card and a printout. `figureDataUrl` is the annotated
 * plate as a JPEG data URL; it is wrapped in a self-contained SVG because the
 * record's figure slot takes SVG markup.
 */
export function buildTlcReport({
  analysis,
  baselineY,
  solventFrontY,
  calibrationCm,
  decimals,
  sample,
  imageSize,
  figure,
}: {
  analysis: PlateAnalysis;
  baselineY: number | null;
  solventFrontY: number | null;
  calibrationCm: number | null;
  decimals: 2 | 3;
  sample: string;
  imageSize: { width: number; height: number };
  figure?: { dataUrl: string; width: number; height: number } | null;
}): LabReportData | null {
  if (analysis.errors.length > 0 || analysis.solventDistancePx === null || analysis.rows.length === 0) return null;
  const calibrated = analysis.pixelsPerCm !== null && calibrationCm !== null;

  const given = [
    { label: "Image (after crop / correction)", value: `${imageSize.width} × ${imageSize.height}`, unit: "px" },
    { label: "Baseline / origin at", value: `y = ${Math.round(baselineY ?? 0)}`, unit: "px" },
    { label: "Solvent front at", value: `y = ${Math.round(solventFrontY ?? 0)}`, unit: "px" },
    { label: "Solvent front distance", value: formatPx(analysis.solventDistancePx) },
  ];
  if (calibrated) {
    given.push(
      { label: "Measured solvent front distance", value: formatCm(calibrationCm) },
      { label: "Scale", value: `${analysis.pixelsPerCm!.toFixed(2)} px/cm` },
    );
  }

  const columns = calibrated ? ["Spot", "Distance", "Distance (cm)", "Rf"] : ["Spot", "Distance", "Rf"];
  const rows = analysis.rows.map((row) => {
    const cells = [`${row.index + 1}. ${row.spot.name}`, formatPx(row.result.compoundDistance)];
    if (calibrated) cells.push(formatCm(row.distanceCm));
    cells.push(formatRf(row.result.rf, decimals) + (row.result.warning ? " ⚠" : ""));
    return cells;
  });

  const run = Math.round(analysis.solventDistancePx);
  const formulas = analysis.rows.map(
    (row) =>
      `Spot ${row.index + 1}: Rf = ${Math.round(row.result.compoundDistance)} px ÷ ${run} px = ${formatRf(row.result.rf, decimals)}`,
  );

  const single = analysis.rows.length === 1 ? analysis.rows[0] : null;

  return {
    title: "TLC Rf Analysis",
    context: "Pharmaceutical Analysis · Thin-layer chromatography",
    sample: sample.trim() || undefined,
    result: single
      ? { label: `Rf · ${single.spot.name}`, value: formatRf(single.result.rf, decimals) }
      : { label: "Rf values", value: analysis.rows.map((r) => formatRf(r.result.rf, decimals)).join(" · ") },
    sections: [
      { title: "Given data", rows: given },
      {
        title: "Spots",
        table: { columns, rows },
        lines: ["Distances are measured from the baseline to the centre of each spot, in image pixels."],
      },
      {
        title: "Calculation",
        formulas: ["Rf = distance travelled by compound ÷ distance travelled by solvent front", ...formulas],
      },
    ],
    warnings: analysis.warnings.length ? analysis.warnings : undefined,
    notes: [
      "Measured from a photograph on the device. Rf is a ratio, so pixel distances give the same Rf as centimetres.",
    ],
    figure: figure ? figureSvg(figure) : undefined,
  };
}

/**
 * The record scales a figure to its full width, so a tall plate would make a
 * card several screens long. The plate is centred in a frame at least 1.2×
 * wider than it is tall instead.
 */
function figureSvg({ dataUrl, width, height }: { dataUrl: string; width: number; height: number }) {
  const frameW = Math.max(width, Math.round(height * 1.2));
  const x = Math.round((frameW - width) / 2);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${frameW}" height="${height}" viewBox="0 0 ${frameW} ${height}"><rect width="${frameW}" height="${height}" fill="#f1f5f9"/><image x="${x}" width="${width}" height="${height}" href="${dataUrl}" xlink:href="${dataUrl}"/></svg>`,
    width: frameW,
    height,
    caption: "Annotated plate: baseline (blue), solvent front (green), spots (amber).",
  };
}
