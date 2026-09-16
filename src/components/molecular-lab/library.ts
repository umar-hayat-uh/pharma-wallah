/*
 * Molecular Lab — the example library and molecule search.
 *
 * The entries (library-data.ts) are generated from PubChem by
 * scripts/build-molecule-library.mts; see that script for how each category is
 * confirmed. Search covers the library by name, formula and PubChem CID, and
 * falls back to PubChem itself for anything else (pubchem.ts).
 */

import { LIBRARY } from "./library-data";

export interface LibraryEntry {
  id: string;
  name: string;
  cid: number;
  formula: string;
  mw: number;
  smiles: string;
  iupac: string | null;
  categories: string[];
  /** PubChem's MeSH Pharmacological Classification terms — the evidence for drug categories. */
  mesh: string[];
}

export const CATEGORIES: { id: string; label: string; basis: string }[] = [
  { id: "common", label: "Common molecules", basis: "Everyday small molecules." },
  { id: "pharmaceutical", label: "Pharmaceutically important", basis: "Drugs with a MeSH pharmacological classification on PubChem." },
  { id: "functional-groups", label: "Functional groups", basis: "Model compounds; the named group is confirmed in the structure." },
  { id: "amino-acids", label: "Amino acids", basis: "α-Amino acids, confirmed from the structure." },
  { id: "carbohydrates", label: "Carbohydrates", basis: "Cn(H₂O)m with hydroxyl groups, confirmed from the structure." },
  { id: "analgesics", label: "Analgesics", basis: "MeSH: Analgesics (PubChem)." },
  { id: "antibiotics", label: "Antibiotics", basis: "MeSH: Anti-Bacterial Agents (PubChem)." },
  { id: "antihistamines", label: "Antihistamines", basis: "MeSH: Histamine H1 Antagonists (PubChem)." },
  { id: "cardiovascular", label: "Cardiovascular drugs", basis: "MeSH cardiovascular classes such as antihypertensives and diuretics (PubChem)." },
  { id: "cns", label: "CNS drugs", basis: "MeSH central nervous system classes such as anticonvulsants and antidepressants (PubChem)." },
  { id: "other", label: "Other", basis: "Not confirmed in any category above." },
];

/** The examples the empty state offers — only ids that exist in the generated data are shown. */
export const EXAMPLE_IDS = ["water", "methane", "ethanol", "acetic-acid", "benzene", "glucose", "aspirin", "paracetamol", "caffeine"];

export function allEntries(): LibraryEntry[] {
  return LIBRARY;
}

export function entriesIn(category: string): LibraryEntry[] {
  return LIBRARY.filter((e) => e.categories.includes(category));
}

export function examples(): LibraryEntry[] {
  return EXAMPLE_IDS.map((id) => LIBRARY.find((e) => e.id === id)).filter((e): e is LibraryEntry => Boolean(e));
}

export function categoryCounts(): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of LIBRARY) for (const c of e.categories) out.set(c, (out.get(c) ?? 0) + 1);
  return out;
}

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[₀-₉]/g, (d) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(d))).replace(/[^a-z0-9]/g, "");

/** Local search: name, IUPAC name, formula, or CID. */
export function searchLibrary(query: string): LibraryEntry[] {
  const q = fold(query);
  if (!q) return [];
  const scored: { e: LibraryEntry; s: number }[] = [];
  for (const e of LIBRARY) {
    const name = fold(e.name);
    let s = 0;
    if (String(e.cid) === q) s = 100;
    else if (fold(e.formula) === q) s = 90;
    else if (name === q) s = 95;
    else if (name.startsWith(q)) s = 70;
    else if (name.includes(q)) s = 50;
    else if (e.iupac && fold(e.iupac).includes(q) && q.length >= 4) s = 30;
    if (s) scored.push({ e, s });
  }
  return scored.sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name)).map((x) => x.e);
}

export function entryById(id: string): LibraryEntry | undefined {
  return LIBRARY.find((e) => e.id === id);
}
