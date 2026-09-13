/**
 * Improved Neubauer hemocytometer — the maths, conventions and lab record shared
 * by the WBC and RBC count calculators.
 *
 * Pure functions and constants, no JSX and no I/O: this file ships inside the
 * offline Android app. Intermediates are never rounded for display — only the
 * strings are — so a report's substituted numbers always reproduce its result
 * (see `denoise` for the one 12-significant-figure float clean-up).
 */

import type { LabReportData, LabReportRow, LabReportSection } from "./LabReport";
import { fieldError, formatFixed, formatScientific, formatSig, toNumber } from "./lab-math";

/* ─── Chamber geometry ───────────────────────────────────────────────────── */

export type CellKind = "wbc" | "rbc";
export type SquareType = "large" | "medium" | "smallest" | "custom";

/** The standard improved Neubauer chamber depth, in mm. */
export const STANDARD_DEPTH_MM = 0.1;

/** Area of one square of each ruling, in mm². Side lengths: 1, 0.2 and 0.05 mm. */
export const SQUARE_AREA_MM2: Record<Exclude<SquareType, "custom">, number> = {
  large: 1,
  medium: 0.04,
  smallest: 0.0025,
};

export const SQUARE_TYPE_OPTIONS: { value: SquareType; label: string }[] = [
  { value: "large", label: "Large square (1 mm²)" },
  { value: "medium", label: "Medium square (0.04 mm²)" },
  { value: "smallest", label: "Smallest square (0.0025 mm²)" },
  { value: "custom", label: "Custom area per square" },
];

const SQUARE_NOUN: Record<SquareType, string> = {
  large: "large",
  medium: "medium",
  smallest: "smallest",
  custom: "custom",
};

/* ─── Per-cell conventions ───────────────────────────────────────────────── */

export type HemoPreset = { label: string; squareType: SquareType; squares: number; dilution: number };

export type HemoConfig = {
  kind: CellKind;
  /** "WBC" / "RBC". */
  abbrev: string;
  reportTitle: string;
  fileName: string;
  defaultSquareType: SquareType;
  defaultSquares: number;
  dilutionChips: number[];
  factorChips: number[];
  presets: HemoPreset[];
  /** Exponent of the SI litre unit this count is conventionally reported in. */
  siExponent: 9 | 12;
};

export const HEMO_CONFIG: Record<CellKind, HemoConfig> = {
  wbc: {
    kind: "wbc",
    abbrev: "WBC",
    reportTitle: "WBC Count",
    fileName: "wbc-count",
    defaultSquareType: "large",
    defaultSquares: 4,
    dilutionChips: [10, 20],
    factorChips: [50],
    presets: [{ label: "Standard: 4 large squares, 1:20", squareType: "large", squares: 4, dilution: 20 }],
    siExponent: 9,
  },
  rbc: {
    kind: "rbc",
    abbrev: "RBC",
    reportTitle: "RBC Count",
    fileName: "rbc-count",
    defaultSquareType: "medium",
    defaultSquares: 5,
    dilutionChips: [100, 200],
    factorChips: [10000, 5000],
    presets: [
      { label: "Standard: 5 medium squares, 1:200", squareType: "medium", squares: 5, dilution: 200 },
      { label: "80 smallest squares, 1:200", squareType: "smallest", squares: 80, dilution: 200 },
      { label: "5 medium squares, 1:100", squareType: "medium", squares: 5, dilution: 100 },
    ],
    siExponent: 12,
  },
};

export const RBC_MANUAL_NOTICE = "Use the counting area and dilution specified by your laboratory manual.";

/* ─── Validation ─────────────────────────────────────────────────────────── */

/** Cells counted: a whole number, zero allowed. */
export function cellCountError(raw: string, show: boolean): string | undefined {
  const base = fieldError(raw, { show, allowZero: true });
  if (base) return base;
  const value = toNumber(raw);
  if (value !== null && !Number.isInteger(value)) return "Enter a whole number of cells.";
  return undefined;
}

/** Squares counted: a whole number of at least one. */
export function squareCountError(raw: string, show: boolean): string | undefined {
  const base = fieldError(raw, { show });
  if (base) return base;
  const value = toNumber(raw);
  if (value !== null && !Number.isInteger(value)) return "Enter a whole number of squares.";
  return undefined;
}

/**
 * Strips binary floating-point noise (0.2 × 0.1 = 0.020000000000000004) at 12
 * significant figures — far beyond any counting precision — so a count of
 * exactly 4,800,000 compares correctly against a reference limit of 4,800,000.
 * This is not display rounding; full precision is otherwise kept throughout.
 */
const denoise = (value: number) => Number(value.toPrecision(12));

const isCellCount = (v: number | null): v is number => v !== null && v >= 0 && Number.isInteger(v);
const isPositive = (v: number | null): v is number => v !== null && v > 0;

export const isNonStandardDepth = (depth: number) => Math.abs(depth - STANDARD_DEPTH_MM) > 1e-9;

/* ─── Calculation ────────────────────────────────────────────────────────── */

export type StandardResult = {
  mode: "standard";
  cells: number;
  dilution: number;
  squareType: SquareType;
  areaPerSquare: number;
  squares: number;
  area: number;
  depth: number;
  volume: number;
  factor: number;
  count: number;
};

export type ManualResult = {
  mode: "manual";
  cells: number;
  factor: number;
  dilution: number | null;
  impliedVolume: number | null;
  count: number;
};

export type HemoResult = StandardResult | ManualResult;

/** Area counted and volume, whenever the chamber fields alone are valid — for the live readout. */
export function chamberGeometry(input: { squareType: SquareType; customArea: string; squares: string; depth: string }) {
  const areaPerSquare = input.squareType === "custom" ? toNumber(input.customArea) : SQUARE_AREA_MM2[input.squareType];
  const squares = toNumber(input.squares);
  const depth = toNumber(input.depth);
  if (!isPositive(areaPerSquare) || !isPositive(squares) || !Number.isInteger(squares)) return null;
  const area = denoise(squares * areaPerSquare);
  return {
    areaPerSquare,
    squares,
    area,
    depth: isPositive(depth) ? depth : null,
    volume: isPositive(depth) ? denoise(area * depth) : null,
  };
}

export function computeStandard(input: {
  cells: string;
  dilution: string;
  squareType: SquareType;
  customArea: string;
  squares: string;
  depth: string;
}): StandardResult | null {
  const cells = toNumber(input.cells);
  const dilution = toNumber(input.dilution);
  const geometry = chamberGeometry(input);
  if (!isCellCount(cells) || !isPositive(dilution) || !geometry || geometry.depth === null || geometry.volume === null) {
    return null;
  }
  const { areaPerSquare, squares, area, depth, volume } = geometry;
  return {
    mode: "standard",
    cells,
    dilution,
    squareType: input.squareType,
    areaPerSquare,
    squares,
    area,
    depth,
    volume,
    factor: denoise(dilution / volume),
    // N × dilution ÷ volume directly, rather than N × a rounded factor.
    count: denoise((cells * dilution) / volume),
  };
}

export function computeManual(input: { cells: string; factor: string; dilution: string }): ManualResult | null {
  const cells = toNumber(input.cells);
  const factor = toNumber(input.factor);
  if (!isCellCount(cells) || !isPositive(factor)) return null;
  const dilution = toNumber(input.dilution);
  const hasDilution = input.dilution.trim() !== "";
  // An optional field that is filled in but invalid blocks the result rather than being ignored.
  if (hasDilution && !isPositive(dilution)) return null;
  return {
    mode: "manual",
    cells,
    factor,
    dilution: hasDilution ? dilution : null,
    impliedVolume: hasDilution && dilution !== null ? denoise(dilution / factor) : null,
    count: denoise(cells * factor),
  };
}

/* ─── Reference range (optional, educational) ────────────────────────────── */

export type RangeState =
  | { status: "empty" }
  | { status: "partial" }
  | { status: "invalid" }
  | { status: "ok"; low: number; high: number };

export function parseRange(lowRaw: string, highRaw: string): RangeState {
  const lowBlank = lowRaw.trim() === "";
  const highBlank = highRaw.trim() === "";
  if (lowBlank && highBlank) return { status: "empty" };
  if (lowBlank || highBlank) return { status: "partial" };
  const low = toNumber(lowRaw);
  const high = toNumber(highRaw);
  if (low === null || high === null || low < 0 || high <= 0 || low >= high) return { status: "invalid" };
  return { status: "ok", low, high };
}

export function rangeErrors(lowRaw: string, highRaw: string, show: boolean) {
  const low = fieldError(lowRaw, { show, required: false, allowZero: true });
  let high = fieldError(highRaw, { show, required: false });
  const lowValue = toNumber(lowRaw);
  const highValue = toNumber(highRaw);
  if (!low && !high && lowValue !== null && highValue !== null && lowValue >= highValue) {
    high = "Must be greater than the low limit.";
  }
  return { low, high };
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

/** A cell count with thousands separators: "7,500", "4,800,000". Display only. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e12) return formatScientific(value, 4);
  if (abs >= 100) return Math.round(value).toLocaleString("en-US");
  return formatSig(value, 4);
}

/** A value in "× 10ⁿ" units: two decimals ("7.50", "4.80"), significant figures when tiny. */
function formatScaled(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && Math.abs(value) < 0.01) return formatSig(value, 3);
  return formatFixed(value, 2);
}

const n = (value: number, sig = 6) => formatSig(value, sig);
const SUPER: Record<number, string> = { 6: "⁶", 9: "⁹", 12: "¹²" };

export function squaresPhrase(squares: number, squareType: SquareType, areaPerSquare: number): string {
  const noun = squares === 1 ? "square" : "squares";
  if (squareType === "custom") return `${n(squares)} ${noun} of ${n(areaPerSquare)} mm² each (custom)`;
  return `${n(squares)} ${SQUARE_NOUN[squareType]} ${noun} (${n(areaPerSquare)} mm² each)`;
}

/* ─── Conventions, stated as assumptions ─────────────────────────────────── */

function areaConvention(kind: CellKind, r: StandardResult): string {
  const base = `Counting area: ${squaresPhrase(r.squares, r.squareType, r.areaPerSquare)} = ${n(r.area)} mm².`;
  if (kind === "wbc" && r.squareType === "large" && r.squares === 4) {
    return `${base} This is the standard WBC area — the four corner large squares.`;
  }
  if (kind === "rbc" && r.squareType === "medium" && r.squares === 5) {
    return `${base} This is the standard RBC area — the four corner and the centre medium squares of the central large square.`;
  }
  if (kind === "rbc" && r.squareType === "smallest" && r.squares === 80) {
    return `${base} 80 smallest squares are 5 groups of 16 — the same 0.2 mm² as 5 medium squares.`;
  }
  return `${base} Not the usual ${kind === "wbc" ? "WBC" : "RBC"} configuration — confirm it against your manual.`;
}

function dilutionConvention(kind: CellKind, dilution: number): string {
  const ratio = `A dilution factor of ${n(dilution)} means 1 volume of blood in ${n(dilution)} volumes of final suspension (1:${n(dilution)}).`;
  if (kind === "wbc" && dilution === 20) {
    return `${ratio} Conventionally blood in Türk's fluid: dilute acetic acid lyses the red cells and gentian violet stains the leucocyte nuclei.`;
  }
  if (kind === "wbc" && dilution === 10) {
    return `${ratio} Used by some manuals when the count is expected to be low — confirm the diluting fluid your manual specifies.`;
  }
  if (kind === "rbc" && dilution === 200) {
    return `${ratio} Conventionally blood in Hayem's fluid, an isotonic diluent that preserves red cells and discourages rouleaux.`;
  }
  if (kind === "rbc" && dilution === 100) {
    return `${ratio} Used by some manuals — confirm the diluting fluid your laboratory specifies.`;
  }
  return `${ratio} Diluting fluid as specified by your manual.`;
}

/* ─── Lab record ─────────────────────────────────────────────────────────── */

export function buildHemoReport(
  config: HemoConfig,
  result: HemoResult,
  extras: { sample?: string; range: RangeState },
): LabReportData {
  const { abbrev, kind, siExponent } = config;
  const count = result.count;
  const countText = formatCount(count);
  const siValue = count / 10 ** (siExponent - 6); // cells/µL → × 10ⁿ/L
  const siUnit = `× 10${SUPER[siExponent]}/L`;
  const cellsText = n(result.cells);

  const sections: LabReportSection[] = [];

  if (result.mode === "standard") {
    const r = result;
    sections.push(
      {
        title: "Given data",
        rows: [
          { label: "Cells counted (N)", value: cellsText },
          { label: "Dilution factor", value: n(r.dilution), unit: `(1:${n(r.dilution)})` },
          { label: "Squares counted", value: `${n(r.squares)} × ${r.squareType === "custom" ? "custom" : SQUARE_NOUN[r.squareType]}` },
          { label: "Area of one square", value: n(r.areaPerSquare), unit: "mm²" },
          { label: "Area counted", value: n(r.area), unit: "mm²" },
          { label: "Chamber depth", value: n(r.depth), unit: "mm" },
        ],
      },
      {
        title: "Assumptions",
        lines: [
          areaConvention(kind, r),
          isNonStandardDepth(r.depth)
            ? `Chamber depth ${n(r.depth)} mm as entered — not the standard Neubauer 0.1 mm; confirm your chamber.`
            : "Chamber depth 0.1 mm — the standard improved Neubauer depth under a correctly seated coverslip.",
          dilutionConvention(kind, r.dilution),
          "The chamber is evenly filled, and cells on the top and left boundary lines are counted while those on the bottom and right lines are not.",
        ],
      },
      {
        title: "Volume counted",
        formulas: [
          `Area   = squares × area of one square = ${n(r.squares)} × ${n(r.areaPerSquare)} mm² = ${n(r.area)} mm²`,
          `Volume = area × depth = ${n(r.area)} mm² × ${n(r.depth)} mm = ${n(r.volume)} mm³`,
        ],
      },
      {
        title: "Calculation factor",
        formulas: [`Factor = dilution ÷ volume = ${n(r.dilution)} ÷ ${n(r.volume)} mm³ = ${n(r.factor)} per mm³`],
      },
      {
        title: "Formula & substitution",
        formulas: [
          "Count = N × dilution ÷ volume",
          `      = ${cellsText} × ${n(r.dilution)} ÷ ${n(r.volume)} mm³`,
          `      = ${cellsText} × ${n(r.factor)} = ${countText} cells/mm³`,
        ],
      },
    );
  } else {
    const r = result;
    const given: LabReportRow[] = [
      { label: "Cells counted (N)", value: cellsText },
      { label: "Calculation factor (supplied)", value: n(r.factor) },
      r.dilution !== null
        ? { label: "Dilution factor", value: n(r.dilution), unit: `(1:${n(r.dilution)})` }
        : { label: "Dilution factor", value: "Not entered" },
      { label: "Area counted", value: "Not entered" },
      { label: "Chamber depth", value: "Not entered" },
    ];
    sections.push(
      { title: "Given data", rows: given },
      {
        title: "Assumptions",
        lines: [
          "Area and depth: not entered — included in the factor you supplied.",
          `The supplied factor of ${n(r.factor)} is taken from your laboratory manual, which already combines the dilution and the volume counted.`,
          ...(r.dilution !== null ? [dilutionConvention(kind, r.dilution)] : []),
        ],
      },
      {
        title: "Volume counted",
        ...(r.dilution !== null && r.impliedVolume !== null
          ? {
              formulas: [`Implied volume = dilution ÷ factor = ${n(r.dilution)} ÷ ${n(r.factor)} = ${n(r.impliedVolume)} mm³`],
              lines: ["Information only — derived from the factor and dilution you entered, not used in the count."],
            }
          : { lines: ["Not entered — included in the factor you supplied."] }),
      },
      {
        title: "Calculation factor",
        formulas: [`Factor = dilution ÷ volume = ${n(r.factor)} per mm³ (supplied)`],
      },
      {
        title: "Formula & substitution",
        formulas: ["Count = N × factor", `      = ${cellsText} × ${n(r.factor)} = ${countText} cells/mm³`],
      },
    );
  }

  const finalLines: string[] = [];
  if (result.cells > 0) {
    const cv = 100 / Math.sqrt(result.cells);
    finalLines.push(`Counting (Poisson) error ≈ ±1/√N = ±1/√${cellsText} ≈ ±${formatSig(cv, 2)}% of the result.`);
  }
  sections.push(
    {
      title: "Final result",
      rows: [{ label: `${abbrev} count`, value: countText, unit: "cells/mm³" }],
      lines: finalLines,
    },
    {
      title: "Unit conversion",
      formulas: ["1 mm³ = 1 µL;  cells/µL × 10⁶ = cells/L"],
      rows: [
        { label: "cells/mm³", value: countText },
        { label: "cells/µL", value: countText },
        ...(kind === "rbc"
          ? [{ label: "millions/mm³", value: formatScaled(count / 1e6), unit: "× 10⁶/mm³" }]
          : [{ label: "thousands/µL", value: formatScaled(count / 1e3), unit: "× 10³/µL" }]),
        { label: "cells/L", value: formatScaled(siValue), unit: siUnit },
      ],
    },
  );

  if (extras.range.status === "ok") {
    const { low, high } = extras.range;
    const position = count < low ? "below" : count > high ? "above" : "within";
    sections.push({
      title: "Reference range",
      rows: [
        { label: "Low limit (entered)", value: formatCount(low), unit: "cells/mm³" },
        { label: "High limit (entered)", value: formatCount(high), unit: "cells/mm³" },
      ],
      lines: [
        `Your result is ${position} the reference range you entered. Educational comparison only — not a diagnostic interpretation.`,
      ],
    });
  }

  const warnings: string[] = [];
  if (result.cells === 0) {
    warnings.push("No cells were counted. A zero count is unreliable — count more squares or check the dilution and the filling of the chamber.");
  } else if (result.cells < 10) {
    warnings.push("Fewer than 10 cells counted — the Poisson counting error is large (about ±1/√N). Count more squares.");
  }
  if (result.cells > 10000) warnings.push("Unusually high count — check the dilution.");
  if (result.mode === "standard" && isNonStandardDepth(result.depth)) {
    warnings.push("Standard Neubauer depth is 0.1 mm — confirm your chamber.");
  }
  if (result.dilution !== null && result.dilution < 1) {
    warnings.push("A dilution factor below 1 would mean the sample was concentrated, not diluted — check the entry.");
  }

  const notes = [
    ...(kind === "rbc" ? [RBC_MANUAL_NOTICE] : []),
    "1 mm³ = 1 µL, so cells/mm³ and cells/µL are the same number.",
    "Educational laboratory calculation — not for clinical diagnosis. Reference ranges vary with age, sex and laboratory.",
  ];

  return {
    title: config.reportTitle,
    context: "Physiology Lab — Haemocytometry",
    sample: extras.sample?.trim() || undefined,
    result: { label: `${abbrev} count`, value: countText, unit: "cells/mm³" },
    sections,
    warnings: warnings.length ? warnings : undefined,
    notes,
    ...(result.mode === "standard" ? { figure: chamberFigure(result) } : {}),
  };
}

/* ─── Ruling diagram (SVG string, literal colours) ───────────────────────── */

const GRID = 270; // px for the 3 mm × 3 mm ruled area
const MM = GRID / 3;
const OFFSET = 15;

/** Large-square order: the four corners, the centre, then the edges. */
const LARGE_ORDER = [0, 2, 6, 8, 4, 1, 3, 5, 7];

/** Medium-square order within the central 5 × 5: four corners, centre, then the rest. */
const MEDIUM_ORDER = (() => {
  const first = [0, 4, 20, 24, 12];
  const rest: number[] = [];
  for (let i = 0; i < 25; i++) if (first.indexOf(i) === -1) rest.push(i);
  return first.concat(rest);
})();

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The improved Neubauer ruling with the counted squares shaded.
 *
 * Drawn as a self-contained string so the same picture serves the live
 * readout (as an <img>) and the downloaded / printed lab card, which cannot
 * see the page's CSS. With `legend`, a text panel sits to the right.
 */
export function chamberSvg(
  squareType: SquareType,
  squares: number,
  options: { legend?: string[] } = {},
): { svg: string; width: number; height: number; drawnSquares: number; capacity: number } {
  const legend = options.legend;
  const width = legend ? 600 : GRID + OFFSET * 2;
  const height = GRID + OFFSET * 2;
  const fill = "#2563EB";
  const parts: string[] = [];
  const count = Number.isFinite(squares) ? Math.max(0, Math.floor(squares)) : 0;
  let capacity = 0;
  let drawn = 0;

  const rect = (x: number, y: number, size: number) =>
    parts.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" fill-opacity="0.24"/>`);

  if (squareType === "large") {
    capacity = 9;
    drawn = Math.min(count, capacity);
    for (let i = 0; i < drawn; i++) {
      const cell = LARGE_ORDER[i];
      rect(OFFSET + (cell % 3) * MM, OFFSET + Math.floor(cell / 3) * MM, MM);
    }
  } else if (squareType === "medium" || squareType === "smallest") {
    const medium = MM / 5;
    const small = medium / 4;
    capacity = squareType === "medium" ? 25 : 400;
    drawn = Math.min(count, capacity);
    for (let i = 0; i < drawn; i++) {
      if (squareType === "medium") {
        const cell = MEDIUM_ORDER[i];
        rect(OFFSET + MM + (cell % 5) * medium, OFFSET + MM + Math.floor(cell / 5) * medium, medium);
      } else {
        const cell = MEDIUM_ORDER[Math.floor(i / 16)];
        const sub = i % 16;
        rect(
          OFFSET + MM + (cell % 5) * medium + (sub % 4) * small,
          OFFSET + MM + Math.floor(cell / 5) * medium + Math.floor(sub / 4) * small,
          small,
        );
      }
    }
  }

  const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number) =>
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"/>`);

  // Smallest-square lines in the central large square (0.05 mm).
  for (let i = 1; i < 20; i++) {
    if (i % 4 === 0) continue;
    const p = MM + (i * MM) / 20;
    line(OFFSET + p, OFFSET + MM, OFFSET + p, OFFSET + 2 * MM, "#CBD5E1", 0.5);
    line(OFFSET + MM, OFFSET + p, OFFSET + 2 * MM, OFFSET + p, "#CBD5E1", 0.5);
  }
  // Medium-square lines (0.2 mm).
  for (let i = 1; i < 5; i++) {
    const p = MM + (i * MM) / 5;
    line(OFFSET + p, OFFSET + MM, OFFSET + p, OFFSET + 2 * MM, "#64748B", 1);
    line(OFFSET + MM, OFFSET + p, OFFSET + 2 * MM, OFFSET + p, "#64748B", 1);
  }
  // The corner large squares are ruled 4 × 4 (0.25 mm) for the WBC count.
  [0, 2, 6, 8].forEach((cell) => {
    const x0 = OFFSET + (cell % 3) * MM;
    const y0 = OFFSET + Math.floor(cell / 3) * MM;
    for (let i = 1; i < 4; i++) {
      const p = (i * MM) / 4;
      line(x0 + p, y0, x0 + p, y0 + MM, "#94A3B8", 0.7);
      line(x0, y0 + p, x0 + MM, y0 + p, "#94A3B8", 0.7);
    }
  });
  // Large squares (1 mm).
  for (let i = 1; i < 3; i++) {
    line(OFFSET + i * MM, OFFSET, OFFSET + i * MM, OFFSET + GRID, "#334155", 1.6);
    line(OFFSET, OFFSET + i * MM, OFFSET + GRID, OFFSET + i * MM, "#334155", 1.6);
  }
  parts.push(`<rect x="${OFFSET}" y="${OFFSET}" width="${GRID}" height="${GRID}" fill="none" stroke="#334155" stroke-width="2"/>`);

  if (legend) {
    const x = GRID + OFFSET * 2 + 22;
    parts.push(
      `<text x="${x}" y="52" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#0F172A">Improved Neubauer ruling</text>`,
      `<rect x="${x}" y="72" width="16" height="16" rx="3" fill="${fill}" fill-opacity="0.24" stroke="${fill}" stroke-width="1"/>`,
      `<text x="${x + 26}" y="85" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">Squares counted</text>`,
    );
    legend.forEach((text, index) => {
      parts.push(
        `<text x="${x}" y="${122 + index * 28}" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#475569">${escapeXml(text)}</text>`,
      );
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#FFFFFF"/>${parts.join("")}</svg>`;
  return { svg, width, height, drawnSquares: drawn, capacity };
}

/** A short caption for the diagram, or null when every counted square is drawn. */
export function chamberCaption(squareType: SquareType, squares: number): string | null {
  if (squareType === "custom") return "Custom square area — the counted squares are not drawn.";
  const { capacity } = chamberSvg(squareType, 0);
  if (squares > capacity) {
    const noun = squareType === "smallest" ? "smallest squares in the central square" : `${SQUARE_NOUN[squareType]} squares`;
    return `One ruling holds ${capacity} ${noun}; the rest are assumed to come from the second chamber.`;
  }
  return null;
}

function chamberFigure(r: StandardResult): NonNullable<LabReportData["figure"]> {
  const legend = [
    `${n(r.squares)} × ${n(r.areaPerSquare)} mm² = ${n(r.area)} mm²`,
    `Depth ${n(r.depth)} mm`,
    `Volume ${n(r.volume)} mm³`,
    `Factor ${n(r.dilution)} ÷ ${n(r.volume)} = ${n(r.factor)}`,
    "Large square = 1 mm × 1 mm",
  ];
  const { svg, width, height } = chamberSvg(r.squareType, r.squares, { legend });
  const caption = chamberCaption(r.squareType, r.squares);
  return { svg, width, height, caption: caption ?? "Shaded squares show the counting area used." };
}
