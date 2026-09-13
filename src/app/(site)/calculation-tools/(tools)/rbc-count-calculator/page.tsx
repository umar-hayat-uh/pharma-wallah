"use client";

import { useMemo, useRef, useState } from "react";
import { Droplets, Grid3x3, Sigma } from "lucide-react";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  SelectField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabReport,
  LabActions,
  ModeSwitch,
  TextField,
  LabNotice,
  type LabReportData,
  toNumber,
  fieldError,
  formatSig,
} from "@/components/calculators";
import {
  HEMO_CONFIG,
  RBC_MANUAL_NOTICE,
  SQUARE_TYPE_OPTIONS,
  STANDARD_DEPTH_MM,
  type SquareType,
  buildHemoReport,
  cellCountError,
  chamberCaption,
  chamberGeometry,
  chamberSvg,
  computeManual,
  computeStandard,
  formatCount,
  isNonStandardDepth,
  parseRange,
  rangeErrors,
  squareCountError,
} from "@/components/calculators/hemocytometer";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

type Mode = "standard" | "manual";

const CONFIG = HEMO_CONFIG.rbc;

// ─── UI PIECES ───────────────────────────────────────────────────────────────

type Chip = { key: string; text: string; active: boolean; onClick: () => void };

/** Quick-pick buttons. aria-pressed shows which one the current fields match. */
function ChipRow({ label, items }: { label: string; items: Chip[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={item.active}
            onClick={item.onClick}
            className={`min-h-[44px] rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              item.active
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-background text-foreground hover:border-blue-300 hover:bg-blue-600/[0.06]"
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <p className="overflow-x-auto whitespace-nowrap rounded-lg bg-card/90 px-3 py-2 font-mono text-[13px] text-foreground ring-1 ring-inset ring-border/70">
      {children}
    </p>
  );
}

/** The ruling with the counted squares shaded, and the area → volume → factor chain, live. */
function ChamberReadout({ squareType, customArea, squares, depth, dilution }: {
  squareType: SquareType; customArea: string; squares: string; depth: string; dilution: string;
}) {
  const geometry = chamberGeometry({ squareType, customArea, squares, depth });
  const drawn = geometry ? geometry.squares : 0;
  const src = useMemo(() => {
    const { svg } = chamberSvg(squareType, drawn);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [squareType, drawn]);
  const caption = geometry ? chamberCaption(squareType, geometry.squares) : null;
  const d = toNumber(dilution);
  const f = (value: number) => formatSig(value, 6);

  return (
    <div className="rounded-[20px] border border-blue-600/15 bg-gradient-to-br from-blue-600/[0.06] via-card to-green-400/[0.10] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- an inline data-URI SVG, nothing to optimise */}
        <img
          src={src}
          width={300}
          height={300}
          alt="Improved Neubauer ruling: nine 1 mm large squares, the central one divided into 25 medium squares, with the counted squares shaded blue"
          className="mx-auto h-auto w-44 shrink-0 rounded-xl border bg-white sm:mx-0 sm:w-40"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Live chamber readout</p>
          {geometry ? (
            <>
              <Readout>
                Area counted = n × a = {f(geometry.squares)} × {f(geometry.areaPerSquare)} mm² = {f(geometry.area)} mm²
              </Readout>
              {geometry.volume !== null && geometry.depth !== null ? (
                <Readout>
                  Volume = {f(geometry.area)} mm² × {f(geometry.depth)} mm = {f(geometry.volume)} mm³
                </Readout>
              ) : (
                <p className="text-sm text-muted-foreground">Enter a chamber depth above zero to get the volume counted.</p>
              )}
              {geometry.volume !== null && d !== null && d > 0 && (
                <Readout>
                  Factor = {f(d)} ÷ {f(geometry.volume)} mm³ = {f(d / geometry.volume)}
                </Readout>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose the square type and enter how many squares you counted to see the area.
            </p>
          )}
          {caption && <p className="text-xs leading-relaxed text-muted-foreground">{caption}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function RbcCountCalculator() {
  const [mode, setMode] = useState<Mode>("standard");
  const [submitted, setSubmitted] = useState(false);
  const [sample, setSample] = useState("");
  const [cells, setCells] = useState("");
  const [dilution, setDilution] = useState("");
  const [squareType, setSquareType] = useState<SquareType>(CONFIG.defaultSquareType);
  const [customArea, setCustomArea] = useState("");
  const [squares, setSquares] = useState(String(CONFIG.defaultSquares));
  const [depth, setDepth] = useState(String(STANDARD_DEPTH_MM));
  const [factor, setFactor] = useState("");
  const [refLow, setRefLow] = useState("");
  const [refHigh, setRefHigh] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () =>
      mode === "standard"
        ? computeStandard({ cells, dilution, squareType, customArea, squares, depth })
        : computeManual({ cells, factor, dilution }),
    [mode, cells, dilution, squareType, customArea, squares, depth, factor],
  );

  const report: LabReportData | null = useMemo(
    () => (result ? buildHemoReport(CONFIG, result, { sample, range: parseRange(refLow, refHigh) }) : null),
    [result, sample, refLow, refHigh],
  );

  // ── Validation ──
  const show = submitted;
  const errors = {
    cells: cellCountError(cells, show),
    dilution: fieldError(dilution, { show, required: mode === "standard" }),
    customArea: squareType === "custom" ? fieldError(customArea, { show }) : undefined,
    squares: squareCountError(squares, show),
    depth: fieldError(depth, { show }),
    factor: fieldError(factor, { show }),
  };
  const rangeError = rangeErrors(refLow, refHigh, show);
  const rangePartial = parseRange(refLow, refHigh).status === "partial";

  const cellsValue = toNumber(cells);
  const depthValue = toNumber(depth);
  const dilutionValue = toNumber(dilution);
  const factorValue = toNumber(factor);
  const zeroCount = cellsValue === 0;
  const oddDepth = depthValue !== null && depthValue > 0 && isNonStandardDepth(depthValue);

  const calculate = () => {
    setSubmitted(true);
    // Let the errors or the card render, then bring whichever it is into view.
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setCells(""); setDilution(""); setFactor("");
    setSquareType(CONFIG.defaultSquareType); setCustomArea("");
    setSquares(String(CONFIG.defaultSquares)); setDepth(String(STANDARD_DEPTH_MM));
    setRefLow(""); setRefHigh("");
  };

  const dilutionChips: Chip[] = CONFIG.dilutionChips.map((value) => ({
    key: `d-${value}`,
    text: `1:${value} (factor ${value})`,
    active: dilutionValue === value,
    onClick: () => setDilution(String(value)),
  }));

  const zeroNotice = zeroCount && (
    <LabNotice tone="info">
      A count of zero is allowed and gives 0 cells/mm³, but it is unreliable — count more squares, or check the
      dilution and that the chamber filled properly.
    </LabNotice>
  );

  return (
    <CalculatorShell
      title="RBC Count Calculator"
      eyebrow="Physiology Lab"
      subtitle="Red cell count from an improved Neubauer hemocytometer — cells counted, squares, depth and dilution, worked step by step."
      icon={Droplets}
      aside={
        <>
          <CalcAbout title="About the hemocytometer RBC count">
            <p>
              A <strong>hemocytometer</strong> is a thick glass slide with a precisely ruled grid and a chamber of known
              depth under the coverslip. Because both the area of each square and the depth are known, the cells you see
              in a set of squares sit in a known <strong>volume</strong> — and dividing by that volume, then multiplying by
              the dilution, gives cells per mm³ of blood.
            </p>
            <p>
              The improved Neubauer ruling is 3 mm × 3 mm, split into nine <strong>large squares</strong> of 1 mm². Red
              cells are counted in the <strong>central large square</strong>, which is divided into 25 medium squares of
              0.2 × 0.2 mm (0.04 mm²), each divided again into 16 smallest squares of 0.05 × 0.05 mm (0.0025 mm²).
            </p>
            <p>
              The <strong>depth</strong> matters as much as the area: at the standard 0.1 mm, the five medium squares
              (0.2 mm²) hold only 0.02 mm³. Because the RBC factor is so large, a small error in depth or volume becomes a
              difference of hundreds of thousands of cells.
            </p>
            <CalcList
              title="The standard RBC count"
              items={[
                "Dilute blood 1:200 in Hayem's fluid, an isotonic diluent that preserves red cells",
                "Count 5 medium squares — the four corners and the centre: 5 × 0.04 mm² × 0.1 mm = 0.02 mm³",
                "Factor = 200 ÷ 0.02 = 10,000, so cells/mm³ = cells counted × 10,000",
              ]}
            />
            <CalcList
              tone="caution"
              title="Sources of error"
              items={[
                "Uneven filling — overfilling, air bubbles or a dry chamber change the volume",
                "Cells on boundary lines counted twice — count the top and left lines only",
                "Rouleaux or clumping, from poor mixing or a slow count",
                "Pipetting and dilution errors, multiplied ten-thousand-fold by the factor",
                "Too few cells counted — the Poisson error is about ±1/√N",
              ]}
            />
            <p>
              Reference ranges vary with age, sex and laboratory. This tool does not assert a normal range; it compares
              against one only if you enter it, for educational purposes.
            </p>
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="Calculation mode"
        value={mode}
        onChange={(next) => { setMode(next); setSubmitted(false); }}
        options={[
          { value: "standard", label: "Standard formula", description: "Squares, depth and dilution", icon: Grid3x3 },
          { value: "manual", label: "Manual factor", description: "Cells × your manual's factor", icon: Sigma },
        ]}
      />

      <LabNotice tone="info">{RBC_MANUAL_NOTICE}</LabNotice>

      <CalcSection title="Sample">
        <TextField
          label="Sample / subject ID (optional)"
          value={sample}
          onChange={setSample}
          placeholder="e.g. Subject 4 — capillary blood"
          hint="Printed on the lab result card."
        />
      </CalcSection>

      {mode === "standard" ? (
        <>
          <CalcSection title="Count and dilution" description="The total cells in all the squares you counted, and the dilution of the blood.">
            <ChipRow
              label="Quick setup"
              items={CONFIG.presets.map((preset) => ({
                key: preset.label,
                text: preset.label,
                active:
                  squareType === preset.squareType &&
                  toNumber(squares) === preset.squares &&
                  dilutionValue === preset.dilution &&
                  depthValue === STANDARD_DEPTH_MM,
                onClick: () => {
                  setSquareType(preset.squareType); setSquares(String(preset.squares));
                  setDilution(String(preset.dilution)); setDepth(String(STANDARD_DEPTH_MM)); setCustomArea("");
                },
              }))}
            />
            <FieldGrid>
              <NumberField
                label="Number of cells counted"
                value={cells}
                onChange={setCells}
                unit="cells"
                min={0}
                step="1"
                error={errors.cells}
                hint="Total across every square counted."
              />
              <NumberField
                label="Dilution factor (e.g. 200 for 1:200)"
                value={dilution}
                onChange={setDilution}
                min={0}
                error={errors.dilution}
                hint="1:200 means 1 volume of blood in 200 volumes of suspension."
              />
            </FieldGrid>
            <ChipRow label="Common dilutions" items={dilutionChips} />
            {zeroNotice}
          </CalcSection>

          <CalcSection title="Counting squares" description="Which squares you counted, and the depth of your chamber. Check both against your manual.">
            <FieldGrid>
              <SelectField
                label="Square type"
                value={squareType}
                onChange={(next) => setSquareType(next as SquareType)}
                options={SQUARE_TYPE_OPTIONS}
              />
              <NumberField
                label="Number of squares counted"
                value={squares}
                onChange={setSquares}
                min={1}
                step="1"
                error={errors.squares}
                hint="Standard RBC count: 5 medium squares (4 corners + centre)."
              />
              {squareType === "custom" && (
                <NumberField
                  label="Area of one square"
                  value={customArea}
                  onChange={setCustomArea}
                  unit="mm²"
                  min={0}
                  error={errors.customArea}
                  hint="e.g. 0.01 for a 0.1 mm × 0.1 mm square."
                />
              )}
              <NumberField
                label="Chamber depth"
                value={depth}
                onChange={setDepth}
                unit="mm"
                min={0}
                error={errors.depth}
                hint="Improved Neubauer: 0.1 mm."
              />
            </FieldGrid>
            {oddDepth && (
              <LabNotice tone="warning">Standard Neubauer depth is 0.1 mm — confirm your chamber.</LabNotice>
            )}
            <ChamberReadout squareType={squareType} customArea={customArea} squares={squares} depth={depth} dilution={dilution} />
          </CalcSection>
        </>
      ) : (
        <CalcSection title="Count and factor" description="For a manual that gives the chamber factor directly: count = cells counted × factor.">
          <FieldGrid>
            <NumberField
              label="Number of cells counted"
              value={cells}
              onChange={setCells}
              unit="cells"
              min={0}
              step="1"
              error={errors.cells}
              hint="Total across every square counted."
            />
            <NumberField
              label="Chamber calculation factor"
              value={factor}
              onChange={setFactor}
              unit="per mm³"
              min={0}
              error={errors.factor}
              hint="e.g. 10,000 for 5 medium squares at 1:200."
            />
          </FieldGrid>
          <ChipRow
            label="Common factors"
            items={CONFIG.factorChips.map((value) => ({
              key: `f-${value}`,
              text: `Factor ${formatCount(value)}`,
              active: factorValue === value,
              onClick: () => setFactor(String(value)),
            }))}
          />
          <FieldGrid>
            <NumberField
              label="Dilution factor (optional, e.g. 200 for 1:200)"
              value={dilution}
              onChange={setDilution}
              min={0}
              error={errors.dilution}
              hint="Not used in the count — only to show the volume your factor implies."
            />
          </FieldGrid>
          {factorValue !== null && factorValue > 0 && dilutionValue !== null && dilutionValue > 0 && (
            <LabNotice tone="info">
              Implied volume counted = dilution ÷ factor = {formatSig(dilutionValue, 6)} ÷ {formatSig(factorValue, 6)} ={" "}
              <strong>{formatSig(dilutionValue / factorValue, 6)} mm³</strong>. Information only.
            </LabNotice>
          )}
          {zeroNotice}
        </CalcSection>
      )}

      <CalcSection
        title="Reference range (optional, educational)"
        description="No range is built in. Enter the one from your manual to add a comparison to the lab card."
      >
        <FieldGrid>
          <NumberField
            label="Low limit"
            value={refLow}
            onChange={setRefLow}
            unit="cells/mm³"
            min={0}
            error={rangeError.low}
            hint={rangePartial ? "Enter both limits to include a comparison." : undefined}
          />
          <NumberField
            label="High limit"
            value={refHigh}
            onChange={setRefHigh}
            unit="cells/mm³"
            min={0}
            error={rangeError.high}
          />
        </FieldGrid>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName={CONFIG.fileName} />

      <div ref={reportRef} className="scroll-mt-24">
        {report ? (
          <LabReport data={report} />
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : mode === "standard"
                  ? "Enter the cells counted and the dilution factor. The squares and depth start at the standard RBC setup."
                  : "Enter the cells counted and the calculation factor from your manual."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>Area counted (mm²) = number of squares × area of one square</Formula>
        <Formula>Volume counted (mm³) = area counted × chamber depth</Formula>
        <Formula>RBC (cells/mm³) = cells counted × dilution factor ÷ volume counted</Formula>
        <p>
          Standard RBC count: 5 medium squares × 0.04 mm² × 0.1 mm = 0.02 mm³. The calculation factor is
          200 ÷ 0.02 = 10,000, so 480 cells counted gives 480 × 10,000 = <strong>4,800,000 cells/mm³</strong>.
        </p>
        <Formula>1 mm³ = 1 µL;  4,800,000/µL = 4.80 × 10⁶/mm³ = 4.80 × 10¹²/L</Formula>
        <p>
          Counting 80 smallest squares is the same area: 80 × 0.0025 mm² = 0.2 mm². A manual that dilutes 1:100
          instead halves the factor to 100 ÷ 0.02 = 5,000. Manual factor mode skips the area and depth:
          count = cells counted × factor.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Which cells on the lines do I count?", a: "Count cells touching the top and left boundary lines of each square and ignore those touching the bottom and right lines (or the other way round — just be consistent). Otherwise a cell lying on a shared line is counted in two neighbouring squares." },
          { q: "Why is blood diluted 1:200 for RBCs but only 1:20 for WBCs?", a: "There are several million red cells per mm³ but only a few thousand white cells. Undiluted enough, red cells overlap and cannot be counted, so they need a ten-fold higher dilution and a much smaller counting area (0.2 mm² rather than 4 mm²)." },
          { q: "Why must the diluting fluid be isotonic?", a: "Red cells swell and burst in a hypotonic fluid and shrink in a hypertonic one, which would lose cells or change how they look. Hayem's fluid is isotonic, so the cells keep their shape; its sodium sulphate also discourages rouleaux, and mercuric chloride acts as a preservative." },
          { q: "My manual counts 80 small squares, or dilutes 1:100. Is that wrong?", a: "No. 80 smallest squares (5 groups of 16) are exactly the same 0.2 mm² as 5 medium squares, so the factor is unchanged. A 1:100 dilution halves the factor to 5,000. Use the quick-setup buttons, or Manual factor mode with your manual's factor." },
          { q: "Why count the corner and centre squares rather than any five?", a: "Cells never spread perfectly evenly when the chamber fills. Sampling squares spread across the central large square averages out that unevenness. If the counts in the five squares differ widely, the chamber was probably filled badly and should be recharged." },
        ]}
      />
    </CalculatorShell>
  );
}
