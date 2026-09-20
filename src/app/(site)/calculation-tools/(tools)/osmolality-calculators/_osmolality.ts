/**
 * The five osmolality calculators (general, serum, urine, plasma, blood).
 *
 * Pulled out of the page so the arithmetic can be hand-checked and compared
 * against the pre-migration page. Every coefficient, band and rounding step is
 * copied verbatim from that page.
 *
 * KNOWN FAULTS, preserved deliberately (migration rule: identical numbers; a
 * formula that looks wrong is reported, never silently fixed). Recorded in
 * .claude/redesign-tracker.md:
 *   1. Serum osmolar gap is always 0 except in the ethanol mode, because the gap
 *      is computed as (calculated − calculated). A true gap needs a *measured*
 *      osmolality, which the page never asks for.
 *   2. Serum "Measured Value" mode computes the standard formula, not a measured
 *      value — the two modes return identical numbers.
 *   3. Urine "Direct Input" mode returns sodium × 2 rather than a measured value.
 *   4. The urine-to-plasma ratio always divides by a hard-coded plasma osmolality
 *      of 290 mOsm/kg, regardless of the patient.
 *   5. Blood "Standard Calculation" ignores haematocrit entirely and returns the
 *      plasma osmolality unchanged.
 */

export type CalculatorType = "general" | "serum" | "urine" | "plasma" | "blood";

export interface Solute {
  id: number;
  name: string;
  concentration: number;
  dissociation: number;
}

export interface OsmolalityResult {
  osmolality: number;
  interpretation: string;
  formula: string;
  details: string;
  rows: Array<{ label: string; value: string; unit?: string }>;
}

/* ── 1. General ─────────────────────────────────────────────────────────── */
export function calculateGeneral(solutes: Solute[], temperature: string): OsmolalityResult {
  let total = 0;
  solutes.forEach((s) => {
    total += s.concentration * s.dissociation;
  });

  // Approximate temperature correction: 0.1% per °C away from 25 °C.
  const temp = parseFloat(temperature);
  const tempCorrection = 1 + (temp - 25) * 0.001;
  const osmolality = total * tempCorrection;

  let interpretation = "";
  if (osmolality < 250) interpretation = "Hypotonic solution";
  else if (osmolality <= 300) interpretation = "Isotonic (physiological)";
  else interpretation = "Hypertonic solution";

  return {
    osmolality,
    interpretation,
    formula: "Σ(Concentration × i) × Temperature correction",
    details: `Sum of solute contributions: ${total.toFixed(1)} mOsm/kg × ${tempCorrection.toFixed(3)} (temp correction)`,
    rows: solutes.map((s) => ({
      label: `${s.name} (${s.concentration} mmol/kg × i = ${s.dissociation})`,
      value: (s.concentration * s.dissociation).toFixed(1),
      unit: "mOsm/kg",
    })),
  };
}

/* ── 2. Serum ───────────────────────────────────────────────────────────── */
export type SerumMethod = "standard" | "advanced" | "measured";

export function calculateSerum(
  sodium: string,
  glucose: string,
  bun: string,
  ethanol: string,
  method: SerumMethod,
): OsmolalityResult {
  const na = parseFloat(sodium);
  const glu = parseFloat(glucose); // mg/dL
  const urea = parseFloat(bun); // mg/dL
  const eth = parseFloat(ethanol); // mg/dL

  let osmolality = 0;
  let formula = "";

  if (method === "standard") {
    osmolality = 2 * na + glu / 18 + urea / 2.8;
    formula = "2×Na⁺ + Glucose/18 + BUN/2.8";
  } else if (method === "advanced") {
    osmolality = 2 * na + glu / 18 + urea / 2.8 + eth / 4.6;
    formula = "2×Na⁺ + Glucose/18 + BUN/2.8 + Ethanol/4.6";
  } else {
    osmolality = 2 * na + glu / 18 + urea / 2.8;
    formula = "Measured osmolality (input directly if known)";
  }

  // Fault 1: `calculated` repeats the standard formula, so the gap is 0 unless
  // the ethanol term was added above.
  const calculated = 2 * na + glu / 18 + urea / 2.8;
  const gap = osmolality - calculated;

  let interpretation = "";
  if (osmolality < 275) interpretation = "Hyposmolal - Possible water intoxication, SIADH";
  else if (osmolality <= 295) interpretation = "Normal serum osmolality";
  else if (osmolality <= 320) interpretation = "Hyperosmolal - Mild to moderate dehydration";
  else interpretation = "Severely hyperosmolal - Medical emergency";

  let gapInterpretation = "";
  if (gap < 10) gapInterpretation = "Normal osmolar gap";
  else if (gap <= 20) gapInterpretation = "Elevated - consider toxins";
  else gapInterpretation = "Markedly elevated - toxic alcohol ingestion likely";

  return {
    osmolality,
    interpretation,
    formula,
    details: `Osmolar gap: ${gap.toFixed(1)} mOsm/kg (${gapInterpretation})`,
    rows: [
      { label: "2 × Na⁺", value: (2 * na).toFixed(1), unit: "mOsm/kg" },
      { label: "Glucose ÷ 18", value: (glu / 18).toFixed(1), unit: "mOsm/kg" },
      { label: "BUN ÷ 2.8", value: (urea / 2.8).toFixed(1), unit: "mOsm/kg" },
      { label: "Ethanol ÷ 4.6", value: eth > 0 && method === "advanced" ? (eth / 4.6).toFixed(1) : "0", unit: "mOsm/kg" },
    ],
  };
}

/* ── 3. Urine ───────────────────────────────────────────────────────────── */
export type UrineMethod = "electrolytes" | "specificGravity" | "measured";

export function calculateUrine(
  sodium: string,
  potassium: string,
  urea: string,
  glucose: string,
  specificGravity: string,
  method: UrineMethod,
): OsmolalityResult {
  let osmolality = 0;
  let formula = "";
  const rows: OsmolalityResult["rows"] = [];

  if (method === "electrolytes") {
    const na = parseFloat(sodium);
    const k = parseFloat(potassium);
    const ur = parseFloat(urea);
    const glu = parseFloat(glucose);
    osmolality = 2 * (na + k) + ur + glu;
    formula = "2×(Na⁺ + K⁺) + Urea + Glucose (all in mmol/L)";
    rows.push(
      { label: "2 × (Na⁺ + K⁺)", value: (2 * (na + k)).toFixed(1), unit: "mOsm/kg" },
      { label: "Urea", value: ur.toFixed(1), unit: "mOsm/kg" },
      { label: "Glucose", value: glu.toFixed(1), unit: "mOsm/kg" },
    );
  } else if (method === "specificGravity") {
    const sg = parseFloat(specificGravity);
    osmolality = (sg - 1) * 40000;
    formula = "(Specific Gravity - 1) × 40,000";
    rows.push({ label: "(SG − 1) × 40,000", value: osmolality.toFixed(1), unit: "mOsm/kg" });
  } else {
    // Fault 3: "direct measurement" is sodium × 2.
    osmolality = parseFloat(sodium) * 2;
    formula = "Direct measurement";
    rows.push({ label: "Sodium field × 2", value: osmolality.toFixed(1), unit: "mOsm/kg" });
  }

  let interpretation = "";
  if (osmolality < 100) interpretation = "Very dilute urine - Diabetes insipidus, polydipsia";
  else if (osmolality < 300) interpretation = "Dilute urine - Normal hydration";
  else if (osmolality < 800) interpretation = "Concentrated urine - Normal renal function";
  else interpretation = "Highly concentrated - Dehydration, appropriate ADH response";

  // Fault 4: plasma osmolality is assumed to be 290, never asked for.
  const plasmaOsm = 290;
  const ratio = osmolality / plasmaOsm;

  return {
    osmolality,
    interpretation,
    formula,
    details: `Urine-to-plasma ratio: ${ratio.toFixed(1)} (Normal: 1-3, Max concentration: >3)`,
    rows: [
      ...rows,
      { label: "Urine : plasma ratio (plasma assumed 290)", value: ratio.toFixed(1) },
      {
        label: "Concentrating ability",
        value: osmolality > 800 ? "Normal concentrating ability" : "Impaired concentrating ability",
      },
    ],
  };
}

/* ── 4. Plasma ──────────────────────────────────────────────────────────── */
export function calculatePlasma(
  sodium: string,
  potassium: string,
  glucose: string,
  urea: string,
  albumin: string,
  globulin: string,
): OsmolalityResult {
  const na = parseFloat(sodium);
  const k = parseFloat(potassium);
  const glu = parseFloat(glucose); // mmol/L
  const ur = parseFloat(urea); // mmol/L
  const alb = parseFloat(albumin); // g/L
  const glob = parseFloat(globulin); // g/L

  let osmolality = 2 * (na + k) + glu + ur;
  const proteinContribution = (alb + glob) * 0.08;
  osmolality += proteinContribution;

  let interpretation = "";
  if (osmolality < 280) interpretation = "Hypo-osmolal plasma";
  else if (osmolality <= 300) interpretation = "Normal plasma osmolality";
  else if (osmolality <= 320) interpretation = "Mild hyper-osmolality";
  else interpretation = "Severe hyper-osmolality";

  // Urea crosses membranes freely, so it is an ineffective osmole.
  const effectiveOsmolality = 2 * (na + k) + glu;

  return {
    osmolality,
    interpretation,
    formula: "2×(Na⁺ + K⁺) + Glucose + Urea + Protein contribution",
    details: `Effective osmolality (tonicity): ${effectiveOsmolality.toFixed(1)} mOsm/kg H₂O | Protein contribution: ${proteinContribution.toFixed(1)} mOsm/kg`,
    rows: [
      { label: "2 × (Na⁺ + K⁺)", value: (2 * (na + k)).toFixed(1), unit: "mOsm/kg" },
      { label: "Glucose", value: glu.toFixed(1), unit: "mOsm/kg" },
      { label: "Urea", value: ur.toFixed(1), unit: "mOsm/kg" },
      { label: "Proteins ((alb + glob) × 0.08)", value: proteinContribution.toFixed(1), unit: "mOsm/kg" },
      { label: "Effective osmolality (tonicity)", value: effectiveOsmolality.toFixed(1), unit: "mOsm/kg" },
    ],
  };
}

/* ── 5. Blood ───────────────────────────────────────────────────────────── */
export type BloodMethod = "calculated" | "measured";

export function calculateBlood(
  hematocrit: string,
  plasmaOsmolality: string,
  cellOsmolality: string,
  method: BloodMethod,
): OsmolalityResult {
  const hct = parseFloat(hematocrit);
  const plasmaOsm = parseFloat(plasmaOsmolality);
  const cellOsm = parseFloat(cellOsmolality);

  let bloodOsmolality = 0;
  let formula = "";

  if (method === "calculated") {
    // Fault 5: haematocrit is ignored in this mode.
    bloodOsmolality = plasmaOsm;
    formula = "Blood osmolality ≈ Plasma osmolality";
  } else {
    const plasmaFraction = (100 - hct) / 100;
    const cellFraction = hct / 100;
    bloodOsmolality = plasmaOsm * plasmaFraction + cellOsm * cellFraction;
    formula = `(Plasma osm × ${plasmaFraction.toFixed(2)}) + (Cell osm × ${cellFraction.toFixed(2)})`;
  }

  const osmolarGradient = plasmaOsm - cellOsm;
  let shift = "";
  if (osmolarGradient > 10) shift = "Water moves from cells to plasma";
  else if (osmolarGradient < -10) shift = "Water moves from plasma to cells";
  else shift = "No significant water shift";

  return {
    osmolality: bloodOsmolality,
    interpretation: `Whole blood osmolality: ${bloodOsmolality.toFixed(1)} mOsm/kg | ${shift}`,
    formula,
    details: `Hematocrit: ${hct}% | Osmolar gradient (plasma-cell): ${osmolarGradient.toFixed(1)} mOsm/kg`,
    rows: [
      { label: "Plasma osmolality", value: plasmaOsm.toFixed(1), unit: "mOsm/kg" },
      { label: "Cell osmolality", value: cellOsm.toFixed(1), unit: "mOsm/kg" },
      { label: "Haematocrit", value: `${hct}`, unit: "%" },
      { label: "Osmolar gradient (plasma − cell)", value: osmolarGradient.toFixed(1), unit: "mOsm/kg" },
      { label: "Predicted water shift", value: shift },
    ],
  };
}
