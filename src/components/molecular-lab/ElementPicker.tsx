"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PERIODIC_TABLE, type Element } from "@/app/(site)/calculation-tools/(tools)/molecular-weight-finder/_elements";

/*
 * Element picker: the ten elements a pharmacy course draws with, a search by
 * symbol, name or atomic number, and the full periodic table. The element data
 * (IUPAC 2021 weights) is the Molecular Weight Calculator's table — one source
 * for both tools.
 */

export const COMMON_ELEMENTS = ["H", "C", "N", "O", "F", "P", "S", "Cl", "Br", "I"];

export const ELEMENTS: Element[] = PERIODIC_TABLE;
const BY_SYMBOL = new Map(PERIODIC_TABLE.map((e) => [e.symbol, e]));

export function elementInfo(symbol: string): Element | undefined {
  return BY_SYMBOL.get(symbol);
}

/** One line a student can use, for the elements a course draws. */
export const ELEMENT_NOTE: Record<string, string> = {
  H: "Hydrogen forms one covalent bond.",
  C: "Carbon commonly forms four covalent bonds.",
  N: "Neutral nitrogen forms three bonds and keeps one lone pair; with a fourth bond it carries a positive charge.",
  O: "Neutral oxygen forms two bonds and has two lone pairs; with one bond it carries a negative charge.",
  F: "Fluorine forms one bond — it is the most electronegative element.",
  P: "Phosphorus forms three bonds, or five in phosphates and phosphonates.",
  S: "Sulfur forms two bonds (thiols, thioethers) or four and six (sulfoxides, sulfonamides).",
  Cl: "Chlorine forms one bond in organic molecules.",
  Br: "Bromine forms one bond in organic molecules.",
  I: "Iodine forms one bond in organic molecules.",
  B: "Boron forms three bonds and has an empty orbital.",
  Si: "Silicon, like carbon, forms four bonds.",
};

function fold(s: string) {
  return s.trim().toLowerCase();
}

export function searchElements(query: string): Element[] {
  const q = fold(query);
  if (!q) return [];
  const n = Number(q);
  return PERIODIC_TABLE.filter((e) => {
    if (Number.isInteger(n) && n > 0) return e.atomicNumber === n;
    return fold(e.symbol) === q || fold(e.name).startsWith(q) || (q.length >= 3 && fold(e.name).includes(q));
  }).sort((a, b) => (fold(a.symbol) === q ? -1 : fold(b.symbol) === q ? 1 : a.atomicNumber - b.atomicNumber));
}

export function ElementPicker({ value, onPick, onMore }: { value: string; onPick: (symbol: string) => void; onMore?: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchElements(query), [query]);
  const shown = query ? results : COMMON_ELEMENTS.map((s) => BY_SYMBOL.get(s)!).filter(Boolean);
  return (
    <div>
      <label className="ml-search">
        <Search aria-hidden="true" />
        <span className="sr-only-ml">Search elements</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: oxygen, Cl, 17…" inputMode="search" autoComplete="off" />
      </label>
      <p className="ml-subhead">{query ? `${results.length} match${results.length === 1 ? "" : "es"}` : "Common elements"}</p>
      {shown.length ? (
        <div className="ml-elgrid">
          {shown.slice(0, 20).map((e) => (
            <button key={e.symbol} type="button" className="ml-el" aria-pressed={value === e.symbol} onClick={() => onPick(e.symbol)} aria-label={`${e.name}, atomic number ${e.atomicNumber}`}>
              <i>{e.atomicNumber}</i>
              <b>{e.symbol}</b>
              <small>{e.name}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="ml-muted">No element matches “{query}”.</p>
      )}
      {onMore && (
        <button type="button" className="ml-btn ml-btn--block" style={{ marginTop: 12 }} onClick={onMore}>
          More elements — periodic table
        </button>
      )}
    </div>
  );
}

// Lanthanides and actinides sit in two rows below the table.
function place(e: Element): { row: number; col: number } {
  if (e.atomicNumber >= 57 && e.atomicNumber <= 71) return { row: 9, col: e.atomicNumber - 57 + 3 };
  if (e.atomicNumber >= 89 && e.atomicNumber <= 103) return { row: 10, col: e.atomicNumber - 89 + 3 };
  return { row: e.period, col: e.group };
}

export function PeriodicTable({ value, onPick }: { value: string; onPick: (symbol: string) => void }) {
  const [focus, setFocus] = useState<Element | null>(null);
  const shown = focus ?? BY_SYMBOL.get(value) ?? null;
  return (
    <div>
      <div className="ml-ptable-wrap">
        <div className="ml-ptable" role="grid" aria-label="Periodic table">
          {PERIODIC_TABLE.map((e) => {
            const { row, col } = place(e);
            return (
              <button
                key={e.symbol}
                type="button"
                className="ml-pt"
                style={{ gridRow: row, gridColumn: col }}
                aria-pressed={value === e.symbol}
                data-common={COMMON_ELEMENTS.includes(e.symbol)}
                onClick={() => onPick(e.symbol)}
                onMouseEnter={() => setFocus(e)}
                onFocus={() => setFocus(e)}
                aria-label={`${e.name}, atomic number ${e.atomicNumber}`}
              >
                <i>{e.atomicNumber}</i>
                <b>{e.symbol}</b>
              </button>
            );
          })}
          <div style={{ gridRow: 8, gridColumn: "1 / -1", height: 6 }} aria-hidden="true" />
        </div>
      </div>
      {shown && (
        <p className="ml-muted" style={{ marginTop: 8 }}>
          <b style={{ color: "var(--ml-ink)" }}>
            {shown.symbol} — {shown.name}
          </b>{" "}
          · atomic number {shown.atomicNumber} · {shown.atomicWeight} g/mol
          {ELEMENT_NOTE[shown.symbol] ? ` · ${ELEMENT_NOTE[shown.symbol]}` : " · The lab applies no valence rules to this element."}
        </p>
      )}
      <p className="ml-muted" style={{ marginTop: 4 }}>Highlighted: the ten elements most drug structures use.</p>
    </div>
  );
}
