/**
 * Builds the Molecular Lab example library from PubChem.
 *
 *   node scripts/build-molecule-library.mts
 *
 * Writes src/components/molecular-lab/library-data.ts. Nothing in that file is
 * typed by hand:
 * - identity, formula, weight and SMILES come from PubChem's compound record;
 * - drug categories come only from PubChem's "MeSH Pharmacological
 *   Classification" for that compound (the MeSH terms are stored alongside, so
 *   the page can show its evidence);
 * - "Amino acids", "Carbohydrates" and "Functional groups" are decided from the
 *   structure by the lab's own rules, and a molecule is dropped from a
 *   category those rules do not confirm.
 * The script also parses every SMILES with the lab's own code and fails if the
 * lab's formula or weight disagrees with PubChem's — the same code path a
 * student's structure goes through.
 */
import { register } from "node:module";
import { writeFileSync } from "node:fs";

register("./lib/ts-resolve.mjs", import.meta.url);

const OCL = await import("openchemlib");
const core = await import("../src/components/molecular-lab/chem-core.ts");
const graphMod = await import("../src/components/molecular-lab/graph.ts");
const groupsMod = await import("../src/components/molecular-lab/groups.ts");
const { ELEMENT_MAP } = await import("../src/app/(site)/calculation-tools/(tools)/molecular-weight-finder/_elements.ts");

type Kind = "common" | "functional" | "amino" | "carb" | "drug";
// name as PubChem knows it, display name, what we expect to confirm, and for
// functional-group models the group the structure must contain.
const WANT: { q: string; name?: string; kind: Kind; group?: string }[] = [
  { q: "water", kind: "common" },
  { q: "methane", kind: "common" },
  { q: "ammonia", kind: "common" },
  { q: "carbon dioxide", kind: "common" },
  { q: "ethanol", kind: "common" },
  { q: "acetic acid", kind: "common" },
  { q: "benzene", kind: "common" },
  { q: "urea", kind: "common" },
  { q: "ethylene", name: "Ethene (ethylene)", kind: "common" },
  { q: "acetylene", name: "Ethyne (acetylene)", kind: "common" },
  { q: "glycerol", kind: "common" },

  { q: "methanol", kind: "functional", group: "hydroxyl" },
  { q: "phenol", kind: "functional", group: "phenol" },
  { q: "acetaldehyde", kind: "functional", group: "aldehyde" },
  { q: "acetone", kind: "functional", group: "ketone" },
  { q: "propanoic acid", kind: "functional", group: "carboxylic-acid" },
  { q: "ethyl acetate", kind: "functional", group: "ester" },
  { q: "acetamide", kind: "functional", group: "amide" },
  { q: "diethyl ether", kind: "functional", group: "ether" },
  { q: "methylamine", kind: "functional", group: "amine" },
  { q: "chloromethane", kind: "functional", group: "halogen" },
  { q: "acetonitrile", kind: "functional", group: "nitrile" },
  { q: "nitrobenzene", kind: "functional", group: "nitro" },
  { q: "ethanethiol", kind: "functional", group: "thiol" },
  { q: "pyridine", kind: "functional", group: "aromatic-ring" },

  { q: "glycine", kind: "amino" },
  { q: "L-alanine", kind: "amino" },
  { q: "L-serine", kind: "amino" },
  { q: "L-cysteine", kind: "amino" },
  { q: "L-phenylalanine", kind: "amino" },
  { q: "L-tyrosine", kind: "amino" },
  { q: "L-tryptophan", kind: "amino" },
  { q: "L-glutamic acid", kind: "amino" },
  { q: "L-lysine", kind: "amino" },

  { q: "D-glucose", name: "Glucose", kind: "carb" },
  { q: "D-fructose", name: "Fructose", kind: "carb" },
  { q: "D-galactose", name: "Galactose", kind: "carb" },
  { q: "D-ribose", name: "Ribose", kind: "carb" },
  { q: "sucrose", kind: "carb" },
  { q: "lactose", kind: "carb" },

  { q: "aspirin", kind: "drug" },
  { q: "salicylic acid", kind: "drug" },
  { q: "acetaminophen", name: "Paracetamol", kind: "drug" },
  { q: "ibuprofen", kind: "drug" },
  { q: "naproxen", kind: "drug" },
  { q: "diclofenac", kind: "drug" },
  { q: "morphine", kind: "drug" },
  { q: "codeine", kind: "drug" },
  { q: "tramadol", kind: "drug" },
  { q: "caffeine", kind: "drug" },
  { q: "penicillin G", name: "Benzylpenicillin (penicillin G)", kind: "drug" },
  { q: "amoxicillin", kind: "drug" },
  { q: "ciprofloxacin", kind: "drug" },
  { q: "sulfamethoxazole", kind: "drug" },
  { q: "chloramphenicol", kind: "drug" },
  { q: "metronidazole", kind: "drug" },
  { q: "tetracycline", kind: "drug" },
  { q: "diphenhydramine", kind: "drug" },
  { q: "chlorpheniramine", kind: "drug" },
  { q: "cetirizine", kind: "drug" },
  { q: "loratadine", kind: "drug" },
  { q: "propranolol", kind: "drug" },
  { q: "atenolol", kind: "drug" },
  { q: "amlodipine", kind: "drug" },
  { q: "captopril", kind: "drug" },
  { q: "nifedipine", kind: "drug" },
  { q: "furosemide", kind: "drug" },
  { q: "hydrochlorothiazide", kind: "drug" },
  { q: "warfarin", kind: "drug" },
  { q: "diazepam", kind: "drug" },
  { q: "fluoxetine", kind: "drug" },
  { q: "chlorpromazine", kind: "drug" },
  { q: "phenytoin", kind: "drug" },
  { q: "levodopa", kind: "drug" },
  { q: "metformin", kind: "drug" },
  { q: "salbutamol", kind: "drug" },
  { q: "omeprazole", kind: "drug" },
  { q: "lidocaine", kind: "drug" },
  { q: "atropine", kind: "drug" },
  { q: "nicotine", kind: "drug" },
  { q: "dopamine", kind: "drug" },
  { q: "histamine", kind: "drug" },
  { q: "serotonin", kind: "drug" },
];

// MeSH Pharmacological Classification term → lab category. Matching is exact
// on the term (or a listed prefix), never on free text.
const MESH: { cat: string; terms: string[]; prefixes?: string[] }[] = [
  { cat: "analgesics", terms: [], prefixes: ["Analgesics"] },
  { cat: "antibiotics", terms: ["Anti-Bacterial Agents"] },
  { cat: "antihistamines", terms: ["Histamine H1 Antagonists", "Histamine H1 Antagonists, Non-Sedating"] },
  {
    cat: "cardiovascular",
    terms: [
      "Antihypertensive Agents", "Anti-Arrhythmia Agents", "Vasodilator Agents", "Cardiotonic Agents",
      "Diuretics", "Adrenergic beta-Antagonists", "Calcium Channel Blockers",
      "Angiotensin-Converting Enzyme Inhibitors", "Anticoagulants", "Platelet Aggregation Inhibitors",
      "Sodium Chloride Symporter Inhibitors", "Sodium Potassium Chloride Symporter Inhibitors",
    ],
  },
  {
    cat: "cns",
    terms: [
      "Central Nervous System Stimulants", "Central Nervous System Depressants", "Anticonvulsants",
      "Antipsychotic Agents", "Hypnotics and Sedatives", "Anti-Anxiety Agents", "Tranquilizing Agents",
      "Antiparkinson Agents", "Dopamine Agents", "Narcotics", "Serotonin Uptake Inhibitors",
      "Selective Serotonin Reuptake Inhibitors", "Analgesics, Opioid", "Antiemetics",
    ],
    prefixes: ["Antidepressive Agents"],
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, tries = 4): Promise<any> {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    await sleep(1500 * (i + 1));
  }
  throw new Error(`PubChem request failed: ${url}`);
}

async function meshActions(cid: number): Promise<string[]> {
  const data = await getJson(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=MeSH+Pharmacological+Classification`);
  if (!data) return [];
  const out: string[] = [];
  const walk = (sec: any) => {
    if (!sec) return;
    for (const s of sec.Section ?? []) walk(s);
    if (sec.TOCHeading === "MeSH Pharmacological Classification") {
      for (const info of sec.Information ?? []) {
        // Each entry's Name is the MeSH term; its Value is the definition.
        if (typeof info.Name === "string") out.push(info.Name.trim());
      }
    }
  };
  walk(data.Record);
  return Array.from(new Set(out)).sort();
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const entries: any[] = [];
const problems: string[] = [];
// A disagreement with PubChem on formula or weight is a bug in the lab, not a note.
const fatal: string[] = [];

for (const w of WANT) {
  const props = await getJson(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(w.q)}/property/Title,MolecularFormula,MolecularWeight,SMILES,IsomericSMILES,IUPACName,Charge/JSON`,
  );
  const p = props?.PropertyTable?.Properties?.[0];
  if (!p) {
    problems.push(`${w.q}: not found on PubChem`);
    continue;
  }
  const smiles: string = p.SMILES ?? p.IsomericSMILES;
  const cid: number = p.CID;
  await sleep(250);
  // Pharmacological classes are only looked up for the drug list: MeSH files
  // acetic acid under "Anti-Bacterial Agents", which would mislead a student
  // browsing everyday molecules.
  const mesh = w.kind === "drug" ? await meshActions(cid) : [];
  await sleep(250);

  const { graph } = core.fromSmiles(OCL, smiles);
  const report = graphMod.analyse(graph);
  const f = graphMod.formulaInfo(graph, ELEMENT_MAP, report);
  const groups = groupsMod.findGroups(graph, report);
  const groupIds = new Set(groups.map((g: any) => g.id));
  const pubchemFormula = String(p.MolecularFormula).replace(/[+-]$/, "");
  if (f.formula !== pubchemFormula) fatal.push(`${w.q}: lab formula ${f.formula} ≠ PubChem ${p.MolecularFormula}`);
  const mwDiff = Math.abs(f.mw - Number(p.MolecularWeight));
  if (mwDiff > 0.05) fatal.push(`${w.q}: lab MW ${f.mw.toFixed(3)} ≠ PubChem ${p.MolecularWeight}`);
  if (report.status !== "valid") fatal.push(`${w.q}: lab reports ${report.status}`);

  const categories = new Set<string>();
  if (w.kind === "common") categories.add("common");
  if (w.kind === "functional") {
    if (w.group && groupIds.has(w.group)) categories.add("functional-groups");
    else problems.push(`${w.q}: expected group ${w.group} not found (found ${[...groupIds].join(", ")})`);
  }
  if (w.kind === "amino") {
    // α-amino acid: an amine N and a carboxylic acid C on the same carbon.
    const amines = groups.filter((g: any) => g.id === "amine").map((g: any) => g.atoms[0]);
    const acids = groups.filter((g: any) => g.id === "carboxylic-acid").map((g: any) => g.atoms[0]);
    const alpha = graph.atoms.some((a: any) => {
      const n = graphMod.neighboursOf(graph, a.id);
      return a.el === "C" && n.some((x: number) => amines.includes(x)) && n.some((x: number) => acids.includes(x));
    });
    if (alpha) categories.add("amino-acids");
    else problems.push(`${w.q}: not confirmed as an α-amino acid`);
  }
  if (w.kind === "carb") {
    // Cn(H2O)m with several hydroxyl groups — the textbook definition.
    const c = f.counts.C ?? 0, h = f.counts.H ?? 0, o = f.counts.O ?? 0;
    const onlyCHO = Object.keys(f.counts).every((e) => ["C", "H", "O"].includes(e));
    const hydroxyls = groups.filter((g: any) => g.id === "hydroxyl").length;
    if (onlyCHO && c >= 3 && h === 2 * o && hydroxyls >= 2) categories.add("carbohydrates");
    else problems.push(`${w.q}: not confirmed as a carbohydrate`);
  }
  if (w.kind === "drug") {
    if (mesh.length) categories.add("pharmaceutical");
    else problems.push(`${w.q}: no MeSH pharmacological classification — not listed as pharmaceutical`);
  }
  for (const m of MESH) {
    if (mesh.some((t) => m.terms.includes(t) || (m.prefixes ?? []).some((pre) => t.startsWith(pre)))) categories.add(m.cat);
  }
  if (!categories.size) categories.add("other");

  entries.push({
    id: String(w.name ?? p.Title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: w.name ?? titleCase(p.Title),
    cid,
    formula: String(p.MolecularFormula),
    mw: Number(p.MolecularWeight),
    smiles,
    iupac: p.IUPACName ?? null,
    categories: [...categories],
    mesh,
  });
  process.stdout.write(`${w.q} → CID ${cid} ${p.MolecularFormula} [${[...categories].join(", ")}]\n`);
}

if (fatal.length) {
  console.error(`\nNot written — the lab disagrees with PubChem:\n- ${fatal.join("\n- ")}`);
  process.exit(1);
}

const header = `/*
 * GENERATED by scripts/build-molecule-library.mts on ${new Date().toISOString().slice(0, 10)} — do not edit by hand.
 * Source: PubChem (identity, formula, weight, SMILES, MeSH Pharmacological
 * Classification). Structural categories are confirmed by the lab's own rules.
 */
import type { LibraryEntry } from "./library";

export const LIBRARY: LibraryEntry[] = ${JSON.stringify(entries, null, 2)};
`;
writeFileSync(new URL("../src/components/molecular-lab/library-data.ts", import.meta.url), header);
console.log(`\n${entries.length} molecules written.`);
if (problems.length) {
  console.log(`\n${problems.length} note(s):\n- ${problems.join("\n- ")}`);
}
