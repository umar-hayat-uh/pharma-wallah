/*
 * Molecular Lab — PubChem and RCSB PDB lookups, straight from the browser.
 *
 * Both services allow cross-origin requests, need no key and cost nothing, so
 * (as in the Molecule Viewer this replaces) there is no server route in
 * between. Only names, formulas and IDs the student typed are sent.
 */

export interface PubChemHit {
  cid: number;
  title: string;
  formula: string;
  mw: number;
  smiles: string;
}

const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const PROPS = "Title,MolecularFormula,MolecularWeight,SMILES,IsomericSMILES";

export type QueryKind = "cid" | "formula" | "name";

/** A bare number is a CID; something like C9H8O4 is a formula; anything else is a name. */
export function classifyQuery(q: string): QueryKind {
  const t = q.trim();
  if (/^(cid[:\s]*)?\d{1,10}$/i.test(t)) return "cid";
  if (/^([A-Z][a-z]?\d*){2,}$/.test(t) && /\d/.test(t)) return "formula";
  return "name";
}

function toHit(p: Record<string, unknown>): PubChemHit | null {
  const smiles = (p.SMILES ?? p.IsomericSMILES) as string | undefined;
  if (!smiles || typeof p.CID !== "number") return null;
  return {
    cid: p.CID,
    title: String(p.Title ?? `CID ${p.CID}`),
    formula: String(p.MolecularFormula ?? ""),
    mw: Number(p.MolecularWeight ?? NaN),
    smiles,
  };
}

export async function searchPubChem(query: string, signal?: AbortSignal): Promise<PubChemHit[]> {
  const q = query.trim().slice(0, 120);
  if (!q) return [];
  const kind = classifyQuery(q);
  const path =
    kind === "cid"
      ? `compound/cid/${q.replace(/\D/g, "")}`
      : kind === "formula"
        ? `compound/fastformula/${encodeURIComponent(q)}`
        : `compound/name/${encodeURIComponent(q)}`;
  const res = await fetch(`${PUG}/${path}/property/${PROPS}/JSON${kind === "formula" ? "?MaxRecords=8" : ""}`, { signal });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(res.status === 503 ? "PubChem is busy — try again in a moment." : `PubChem returned ${res.status}.`);
  const data = await res.json();
  const rows: Record<string, unknown>[] = data?.PropertyTable?.Properties ?? [];
  return rows.map(toHit).filter((h): h is PubChemHit => Boolean(h)).slice(0, 8);
}

/** PubChem's 3D conformer record when one exists, otherwise the 2D record. */
export async function fetchPubChemSdf(cid: number, signal?: AbortSignal): Promise<{ text: string; is3D: boolean }> {
  const three = await fetch(`${PUG}/compound/cid/${cid}/SDF?record_type=3d`, { signal });
  if (three.ok) return { text: await three.text(), is3D: true };
  const two = await fetch(`${PUG}/compound/cid/${cid}/SDF`, { signal });
  if (!two.ok) throw new Error(`PubChem returned ${two.status}.`);
  return { text: await two.text(), is3D: false };
}

/** MeSH pharmacological classes for a compound (empty when PubChem has none). */
export async function fetchMeshClasses(cid: number, signal?: AbortSignal): Promise<string[]> {
  const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=MeSH+Pharmacological+Classification`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const out: string[] = [];
  const walk = (sec: { Section?: unknown[]; TOCHeading?: string; Information?: { Name?: unknown }[] }) => {
    for (const s of (sec.Section ?? []) as (typeof sec)[]) walk(s);
    if (sec.TOCHeading === "MeSH Pharmacological Classification") {
      for (const info of sec.Information ?? []) if (typeof info.Name === "string") out.push(info.Name);
    }
  };
  if (data?.Record) walk(data.Record);
  return Array.from(new Set(out)).sort();
}

export async function fetchPdb(id: string, signal?: AbortSignal): Promise<string> {
  const clean = id.trim().toUpperCase();
  if (!/^[0-9][A-Z0-9]{3}$/.test(clean)) throw new Error("A PDB ID is four characters, starting with a digit (e.g. 1CRN).");
  const res = await fetch(`https://files.rcsb.org/download/${clean}.pdb`, { signal });
  if (!res.ok) throw new Error(res.status === 404 ? `No PDB entry ${clean}.` : `RCSB returned ${res.status}.`);
  return res.text();
}
