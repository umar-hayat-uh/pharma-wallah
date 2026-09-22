/**
 * The offline pharmaceutical values library (spec §8, §9).
 *
 * PROVENANCE IS THE WHOLE POINT. Nothing in this file is a number somebody
 * typed from memory. Every row is either
 *   (a) computed from data already generated and verified elsewhere in this
 *       repo — the IUPAC 2021 atomic weights the calculators use, and the
 *       83-molecule PubChem-verified Molecular Lab library; or
 *   (b) transcribed from a specific PharmaWallah calculator's own reference
 *       table, and carries a `source` naming that calculator; or
 *   (c) an exactly-defined SI/CODATA constant.
 *
 * Every row states its `source` on screen. Where a value could not be sourced
 * it is simply absent — an invented density is worse than a missing one.
 *
 * The transcribed tables (b) are a second copy of numbers that also live in a
 * calculator page. That is a deliberate trade: those tables are `const`s inside
 * 1,000-line page components and are not exported, and exporting them would
 * mean editing files the website and the Android app share. The `source` field
 * is what makes any future drift findable — see the MEMORY gotcha.
 *
 * Pure data + pure functions. No I/O, no network, no React.
 */

import { ATOMIC_WEIGHTS } from "@/components/calculators/chemistry";
import { LIBRARY } from "@/components/molecular-lab/library-data";

export type ValueCategory =
  | "drug"
  | "element"
  | "electrolyte"
  | "density"
  | "constant"
  | "conversion"
  | "tonicity";

export type ValueRow = {
  id: string;
  name: string;
  category: ValueCategory;
  /** The number, already formatted for reading. */
  value: string;
  unit?: string;
  /** Secondary identifiers — molecular formula, valence, synonyms. */
  detail?: string;
  /** Plain-language note: what it is for, or what it must not be used for. */
  note?: string;
  /** Where the value came from. Shown on every row. */
  source: string;
  /** Extra search keys that are not in the name. */
  keywords?: string[];
};

export const CATEGORY_LABELS: Record<ValueCategory, string> = {
  drug: "Drugs & molecules",
  element: "Atomic weights",
  electrolyte: "Electrolytes",
  density: "Densities & specific gravities",
  constant: "Physical & laboratory constants",
  conversion: "Conversion factors",
  tonicity: "Sodium chloride equivalents (E values)",
};

export const CATEGORY_ORDER: ValueCategory[] = [
  "drug",
  "element",
  "electrolyte",
  "density",
  "tonicity",
  "constant",
  "conversion",
];

/* ── (a) Derived from verified data already in this repo ───────────────── */

const ELEMENT_NAMES: Record<string, string> = {
  H: "Hydrogen", He: "Helium", Li: "Lithium", Be: "Beryllium", B: "Boron", C: "Carbon",
  N: "Nitrogen", O: "Oxygen", F: "Fluorine", Ne: "Neon", Na: "Sodium", Mg: "Magnesium",
  Al: "Aluminium", Si: "Silicon", P: "Phosphorus", S: "Sulfur", Cl: "Chlorine", Ar: "Argon",
  K: "Potassium", Ca: "Calcium", Sc: "Scandium", Ti: "Titanium", V: "Vanadium", Cr: "Chromium",
  Mn: "Manganese", Fe: "Iron", Co: "Cobalt", Ni: "Nickel", Cu: "Copper", Zn: "Zinc",
  Ga: "Gallium", Ge: "Germanium", As: "Arsenic", Se: "Selenium", Br: "Bromine", Kr: "Krypton",
  Rb: "Rubidium", Sr: "Strontium", Y: "Yttrium", Zr: "Zirconium", Nb: "Niobium",
  Mo: "Molybdenum", Ru: "Ruthenium", Rh: "Rhodium", Pd: "Palladium", Ag: "Silver",
  Cd: "Cadmium", In: "Indium", Sn: "Tin", Sb: "Antimony", Te: "Tellurium", I: "Iodine",
  Xe: "Xenon", Cs: "Caesium", Ba: "Barium", La: "Lanthanum", Ce: "Cerium",
  Pr: "Praseodymium", Nd: "Neodymium", Sm: "Samarium", Eu: "Europium", Gd: "Gadolinium",
  Tb: "Terbium", Dy: "Dysprosium", Ho: "Holmium", Er: "Erbium", Tm: "Thulium",
  Yb: "Ytterbium", Lu: "Lutetium", Hf: "Hafnium", Ta: "Tantalum", W: "Tungsten",
  Re: "Rhenium", Os: "Osmium", Ir: "Iridium", Pt: "Platinum", Au: "Gold", Hg: "Mercury",
  Tl: "Thallium", Pb: "Lead", Bi: "Bismuth", Th: "Thorium", Pa: "Protactinium", U: "Uranium",
};

const ELEMENT_ROWS: ValueRow[] = Object.entries(ATOMIC_WEIGHTS).map(([symbol, weight]) => ({
  id: `element-${symbol}`,
  name: `${ELEMENT_NAMES[symbol] ?? symbol} (${symbol})`,
  category: "element",
  value: String(weight),
  unit: "g/mol",
  detail: `Symbol ${symbol}`,
  source: "IUPAC standard atomic weights (abridged, 2021) — the same table the Molecular Weight Finder uses",
  keywords: [symbol],
}));

const MOLECULE_ROWS: ValueRow[] = LIBRARY.map((entry) => ({
  id: `drug-${entry.id}`,
  name: entry.name,
  category: "drug",
  value: String(entry.mw),
  unit: "g/mol",
  detail: entry.formula,
  note: entry.mesh.length
    ? `Class: ${entry.mesh.slice(0, 3).join(", ")}`
    : entry.iupac
      ? `IUPAC: ${entry.iupac}`
      : undefined,
  source: `PubChem CID ${entry.cid} — verified by scripts/build-molecule-library.mts`,
  keywords: [entry.formula, entry.iupac ?? "", String(entry.cid)].filter(Boolean),
}));

/* ── (b) Transcribed from a named calculator's own reference table ─────── */

const ELECTROLYTE_ROWS: ValueRow[] = [
  { symbol: "Na⁺", name: "Sodium", formula: "Na", mw: 22.99, valence: 1, forms: "NaCl, NaHCO₃", serum: "135–145 mEq/L" },
  { symbol: "K⁺", name: "Potassium", formula: "K", mw: 39.1, valence: 1, forms: "KCl, K acetate", serum: "3.5–5.0 mEq/L" },
  { symbol: "Ca²⁺", name: "Calcium", formula: "Ca", mw: 40.08, valence: 2, forms: "CaCl₂, Ca gluconate", serum: "8.5–10.2 mg/dL" },
  { symbol: "Mg²⁺", name: "Magnesium", formula: "Mg", mw: 24.31, valence: 2, forms: "MgSO₄, MgCl₂", serum: "1.7–2.2 mg/dL" },
  { symbol: "Cl⁻", name: "Chloride", formula: "Cl", mw: 35.45, valence: 1, forms: "NaCl, KCl", serum: "98–106 mEq/L" },
  { symbol: "HCO₃⁻", name: "Bicarbonate", formula: "HCO₃", mw: 61.02, valence: 1, forms: "NaHCO₃", serum: "22–28 mEq/L" },
  { symbol: "PO₄³⁻", name: "Phosphate", formula: "PO₄", mw: 94.97, valence: 3, forms: "K phosphate, Na phosphate", serum: "2.5–4.5 mg/dL" },
].map((row) => ({
  id: `electrolyte-${row.formula}`,
  name: `${row.name} (${row.symbol})`,
  category: "electrolyte" as const,
  value: String(row.mw),
  unit: "g/mol",
  detail: `Valence ${row.valence} · ${row.forms}`,
  note: `Reference serum range ${row.serum}. mEq = mmol × valence.`,
  source: "PharmaWallah mmol ↔ mEq ↔ mg Calculator reference table",
  keywords: [row.symbol, row.formula, "mEq", "mmol"],
}));

const DENSITY_ROWS: ValueRow[] = [
  { id: "water", name: "Water", density: 1.0, use: "Diluent, vehicle, reconstitution" },
  { id: "ethanol-95", name: "Ethanol (95%)", density: 0.816, use: "Extraction, preservative, tinctures" },
  { id: "glycerol", name: "Glycerol", density: 1.26, use: "Syrups, ointments, humectant" },
  { id: "propylene-glycol", name: "Propylene glycol", density: 1.04, use: "Injectables, topicals, solvent" },
  { id: "mineral-oil", name: "Mineral oil", density: 0.88, use: "Laxative, ointment base, lubricant" },
  { id: "olive-oil", name: "Olive oil", density: 0.92, use: "Ointments, emulsions, carrier" },
  { id: "honey", name: "Honey", density: 1.42, use: "Cough syrups, demulcent, sweetener" },
].map((row) => ({
  id: `density-${row.id}`,
  name: row.name,
  category: "density" as const,
  value: String(row.density),
  unit: "g/mL",
  detail: `Specific gravity ≈ ${row.density} (relative to water at the same temperature)`,
  note: `${row.use}. Density varies with temperature — verify against the USP/NF monograph for compounding.`,
  source: "PharmaWallah Weight/Volume (Density-Based) Conversion Calculator reference table",
  keywords: ["specific gravity", "sg"],
}));

const TONICITY_ROWS: ValueRow[] = [
  { name: "Sodium chloride", e: 1.0 },
  { name: "Boric acid", e: 0.5 },
  { name: "Sodium borate", e: 0.42 },
  { name: "Dextrose", e: 0.18 },
  { name: "Mannitol", e: 0.18 },
  { name: "Glycerin", e: 0.34 },
  { name: "Phenylephrine HCl", e: 0.32 },
  { name: "Tropicamide", e: 0.1 },
  { name: "Sodium phosphate", e: 0.29 },
  { name: "Potassium phosphate", e: 0.4 },
  { name: "Benzalkonium chloride", e: 0.16 },
].map((row) => ({
  id: `evalue-${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: row.name,
  category: "tonicity" as const,
  value: row.e.toFixed(2),
  unit: "E (g NaCl per g)",
  detail: `1 g behaves osmotically like ${row.e.toFixed(2)} g of sodium chloride`,
  note: "Used to make an ophthalmic or parenteral solution isotonic. Open the Isotonicity Calculator to work a formulation.",
  source: "PharmaWallah Isotonicity Calculator reference table",
  keywords: ["E value", "isotonic", "tonicity", "NaCl equivalent"],
}));

/* ── (c) Exactly-defined or CODATA constants ───────────────────────────── */

const CONSTANT_ROWS: ValueRow[] = [
  {
    id: "const-avogadro",
    name: "Avogadro constant",
    category: "constant",
    value: "6.02214076 × 10²³",
    unit: "mol⁻¹",
    detail: "Nᴀ",
    note: "Exact by definition of the mole (SI, 2019 redefinition).",
    source: "SI definition (BIPM, 2019)",
    keywords: ["NA", "mole", "number"],
  },
  {
    id: "const-gas",
    name: "Molar gas constant",
    category: "constant",
    value: "8.314462618",
    unit: "J·mol⁻¹·K⁻¹",
    detail: "R = Nᴀ·k",
    note: "Exact, since both Nᴀ and the Boltzmann constant are defined exactly. Used in the Arrhenius and van 't Hoff equations.",
    source: "SI definition (BIPM, 2019)",
    keywords: ["R", "arrhenius", "ideal gas"],
  },
  {
    id: "const-boltzmann",
    name: "Boltzmann constant",
    category: "constant",
    value: "1.380649 × 10⁻²³",
    unit: "J/K",
    detail: "k",
    note: "Exact by definition of the kelvin.",
    source: "SI definition (BIPM, 2019)",
    keywords: ["k"],
  },
  {
    id: "const-faraday",
    name: "Faraday constant",
    category: "constant",
    value: "96485.33212…",
    unit: "C/mol",
    detail: "F = Nᴀ·e",
    note: "Exact, since both factors are defined exactly.",
    source: "SI definition (BIPM, 2019)",
    keywords: ["F", "electrochemistry"],
  },
  {
    id: "const-zero-celsius",
    name: "Zero degrees Celsius",
    category: "constant",
    value: "273.15",
    unit: "K",
    detail: "0 °C = 273.15 K",
    note: "Exact. K = °C + 273.15.",
    source: "SI definition",
    keywords: ["kelvin", "temperature", "absolute"],
  },
  {
    id: "const-molar-volume",
    name: "Molar volume of an ideal gas (STP, 0 °C, 100 kPa)",
    category: "constant",
    value: "22.711",
    unit: "L/mol",
    detail: "Vm = RT/p",
    note: "At the older 101.325 kPa reference this is 22.414 L/mol — state which standard you mean.",
    source: "Computed from the exact values of R, T = 273.15 K and p = 100 kPa",
    keywords: ["STP", "22.4", "ideal gas"],
  },
  {
    id: "const-ln10",
    name: "ln 10",
    category: "constant",
    value: "2.302585093",
    detail: "Converts natural to base-10 logarithms",
    note: "First-order kinetics: k = 2.303/t × log(C₀/C). This is where the 2.303 comes from.",
    source: "Mathematical constant",
    keywords: ["2.303", "kinetics", "first order", "log"],
  },
  {
    id: "const-half-life-first-order",
    name: "0.693 (ln 2)",
    category: "constant",
    value: "0.6931472",
    detail: "t½ = 0.693 / k for a first-order process",
    note: "Appears in every first-order half-life, elimination-rate and shelf-life calculation.",
    source: "Mathematical constant",
    keywords: ["ln2", "half life", "elimination", "ke"],
  },
  {
    id: "const-water-density",
    name: "Density of water at 25 °C",
    category: "constant",
    value: "0.99704",
    unit: "g/mL",
    detail: "0.99820 g/mL at 20 °C; 1.00000 g/mL at 4 °C",
    note: "Relative-density bottle work is done against water at a stated temperature — say which.",
    source: "Standard physical-chemistry reference values",
    keywords: ["specific gravity", "pycnometer", "relative density"],
  },
  {
    id: "const-shelf-life",
    name: "t₉₀ (time to 90% of label claim)",
    category: "constant",
    value: "0.105",
    detail: "t₉₀ = 0.105 / k for a first-order degradation",
    note: "The usual shelf-life criterion: 10% loss. 0.105 = −ln(0.9).",
    source: "Derived from −ln(0.9)",
    keywords: ["shelf life", "expiry", "t90", "stability", "degradation"],
  },
];

const CONVERSION_ROWS: ValueRow[] = [
  {
    id: "conv-percent-wv",
    name: "1% w/v",
    category: "conversion",
    value: "1 g in 100 mL = 10 mg/mL",
    detail: "10 mg/mL · 10 g/L",
    note: "The single most-used conversion in dispensing. 0.1% = 1 mg/mL; 5% = 50 mg/mL.",
    source: "PharmaWallah Strength Conversion Calculator reference table",
    keywords: ["percent", "w/v", "mg/mL", "strength"],
  },
  {
    id: "conv-ratio",
    name: "Ratio strength 1:1000",
    category: "conversion",
    value: "0.1% w/v = 1 mg/mL",
    detail: "1:100 = 1% · 1:10 000 = 0.01% = 0.1 mg/mL",
    note: "1:X means one part in X parts total, so % = (1/X) × 100.",
    source: "PharmaWallah Strength Conversion Calculator reference table",
    keywords: ["adrenaline", "epinephrine", "ratio", "1:1000"],
  },
  {
    id: "conv-mgml-gl",
    name: "1 mg/mL",
    category: "conversion",
    value: "= 1 g/L = 0.1% w/v",
    detail: "1000 µg/mL · 1000 ppm (aqueous, density 1 g/mL)",
    note: "ppm equals mg/L only when the solution's density is 1 g/mL.",
    source: "Derived from the SI prefixes; matches the ppm/ppb Calculator's stated assumption",
    keywords: ["ppm", "g/L", "mg/mL"],
  },
  {
    id: "conv-mass",
    name: "Mass ladder",
    category: "conversion",
    value: "1 kg = 1000 g = 10⁶ mg = 10⁹ µg",
    detail: "µg → g is ×10⁻⁶; mg → g is ×10⁻³",
    note: "These are exactly the factors the shared calculator kit uses (MASS_TO_G).",
    source: "src/components/calculators/lab-math.ts — MASS_TO_G",
    keywords: ["kg", "mg", "µg", "microgram", "gram"],
  },
  {
    id: "conv-volume",
    name: "Volume ladder",
    category: "conversion",
    value: "1 L = 1000 mL = 10⁶ µL",
    detail: "1 mL = 1 cm³",
    note: "These are exactly the factors the shared calculator kit uses (VOLUME_TO_ML).",
    source: "src/components/calculators/lab-math.ts — VOLUME_TO_ML",
    keywords: ["litre", "liter", "mL", "µL", "microlitre", "cc"],
  },
  {
    id: "conv-amount",
    name: "Amount ladder",
    category: "conversion",
    value: "1 mol = 1000 mmol = 10⁶ µmol",
    detail: "moles = mass (g) ÷ molar mass (g/mol)",
    note: "These are exactly the factors the shared calculator kit uses (AMOUNT_TO_MOL).",
    source: "src/components/calculators/lab-math.ts — AMOUNT_TO_MOL",
    keywords: ["mole", "mmol", "µmol", "micromole"],
  },
  {
    id: "conv-meq",
    name: "Milliequivalents",
    category: "conversion",
    value: "mEq = mmol × valence",
    detail: "mg = mmol × molar mass · mmol = mEq ÷ valence",
    note: "Valence is 1 for Na⁺, K⁺ and Cl⁻; 2 for Ca²⁺ and Mg²⁺; 3 for PO₄³⁻.",
    source: "PharmaWallah mmol ↔ mEq ↔ mg Calculator",
    keywords: ["mEq", "equivalent", "electrolyte"],
  },
  {
    id: "conv-temperature",
    name: "Temperature",
    category: "conversion",
    value: "°F = (°C × 9/5) + 32 · K = °C + 273.15",
    detail: "°C = (°F − 32) × 5/9",
    note: "Temperature has an offset, so it is never a simple multiplying factor — it cannot join the ladders above.",
    source: "SI definition",
    keywords: ["celsius", "fahrenheit", "kelvin"],
  },
  {
    id: "conv-length",
    name: "Length",
    category: "conversion",
    value: "1 m = 100 cm = 1000 mm",
    detail: "1 inch = 2.54 cm exactly · 1 foot = 30.48 cm",
    note: "Used for height in BSA and BMI. The inch is defined as exactly 2.54 cm.",
    source: "International yard and pound agreement (1959)",
    keywords: ["cm", "metre", "meter", "inch", "height"],
  },
  {
    id: "conv-pound",
    name: "Body weight",
    category: "conversion",
    value: "1 lb = 0.45359237 kg exactly",
    detail: "1 kg = 2.20462 lb · 1 stone = 6.35029 kg",
    note: "Weight-based dosing is done in kg. Converting a charted weight in pounds is a common source of error — do it once, at the start.",
    source: "International yard and pound agreement (1959)",
    keywords: ["lb", "pound", "kg", "weight", "dose"],
  },
];

/* ── The library ───────────────────────────────────────────────────────── */

export const VALUES: ValueRow[] = [
  ...MOLECULE_ROWS,
  ...ELECTROLYTE_ROWS,
  ...DENSITY_ROWS,
  ...TONICITY_ROWS,
  ...CONSTANT_ROWS,
  ...CONVERSION_ROWS,
  ...ELEMENT_ROWS,
];

export function valueCounts(): Record<ValueCategory, number> {
  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, 0]),
  ) as Record<ValueCategory, number>;
  for (const row of VALUES) counts[row.category] += 1;
  return counts;
}

const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)))
    .replace(/[^a-z0-9]/g, "");

/**
 * Local search across every row — name, formula, detail and keywords.
 * Runs entirely in the renderer; there is no index to fetch and no request.
 */
export function searchValues(query: string, category?: ValueCategory | "all"): ValueRow[] {
  const pool = !category || category === "all" ? VALUES : VALUES.filter((row) => row.category === category);
  const q = fold(query);
  if (!q) return pool;

  const scored: { row: ValueRow; score: number }[] = [];
  for (const row of pool) {
    const name = fold(row.name);
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (fold(row.detail ?? "") === q) score = 75;
    else if (name.includes(q)) score = 55;
    else if ((row.keywords ?? []).some((key) => fold(key) === q)) score = 70;
    else if ((row.keywords ?? []).some((key) => fold(key).includes(q)) && q.length >= 2) score = 45;
    else if (fold(row.detail ?? "").includes(q) && q.length >= 3) score = 30;
    else if (fold(row.note ?? "").includes(q) && q.length >= 4) score = 15;
    if (score) scored.push({ row, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
    .map((entry) => entry.row);
}
