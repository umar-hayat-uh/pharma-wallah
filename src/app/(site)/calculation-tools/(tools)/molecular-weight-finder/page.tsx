"use client";

import { useId, useMemo, useState } from "react";
import { Atom, Grid3x3, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    CalculatorShell,
    CalcSection,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    LabNotice,
} from "@/components/calculators";
import { COMMON_FORMULAS, PERIODIC_TABLE, type Element } from "./_elements";
import { calculateMolecularWeight } from "./_formula";

const DEFAULT_FORMULA = "H2O";

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

/*
 * Only a count that follows a symbol is a subscript. The digit straight after
 * "(" in "(2NH4)SO4" is this tool's group multiplier and stays full size.
 */
const COUNT_PATTERN = /([A-Za-z)])(\d+)/g;

/** "C8H10N4O2" → "C₈H₁₀N₄O₂", for plain-text places such as the result pill. */
function toSubscriptText(formula: string): string {
    return formula.replace(COUNT_PATTERN, (_match, before: string, digits: string) =>
        before + digits.replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[Number(digit)]),
    );
}

/** The formula with real <sub> digits, for display in the page. */
function FormulaText({ formula }: { formula: string }) {
    const parts: React.ReactNode[] = [];
    let last = 0;
    formula.replace(COUNT_PATTERN, (match, before: string, digits: string, offset: number) => {
        parts.push(<span key={`t${offset}`}>{formula.slice(last, offset) + before}</span>);
        parts.push(<sub key={`s${offset}`}>{digits}</sub>);
        last = offset + match.length;
        return match;
    });
    parts.push(<span key="end">{formula.slice(last)}</span>);
    return <>{parts}</>;
}

/* Element-group tints for the periodic table — unchanged from the original. */
function groupColor(group: number): string {
    if (group === 1) return "bg-red-100 border-red-300";
    if (group === 2) return "bg-orange-100 border-orange-300";
    if (group >= 3 && group <= 12) return "bg-yellow-100 border-yellow-300";
    if (group === 13) return "bg-teal-100 border-teal-300";
    if (group === 14) return "bg-green-100 border-green-300";
    if (group === 15) return "bg-blue-100 border-blue-300";
    if (group === 16) return "bg-indigo-100 border-indigo-300";
    if (group === 17) return "bg-purple-100 border-purple-300";
    if (group === 18) return "bg-gray-100 border-gray-300";
    return "bg-gray-50 border-gray-200";
}

const chipClass =
    "min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted active:bg-accent";

export default function MolecularWeightCalculator() {
    const [formula, setFormula] = useState(DEFAULT_FORMULA);
    const [searchElement, setSearchElement] = useState("");
    const [showElements, setShowElements] = useState(false);
    const formulaId = useId();

    /*
     * Derived, not stored. The original computed on "Calculate" (and once on
     * load); this is the same function, run on every keystroke.
     */
    const outcome = useMemo(() => calculateMolecularWeight(formula), [formula]);
    // An empty group such as "()" parses to zero atoms; the original then
    // printed 0.0000 g/mol and "Infinity mol". Treat it as "nothing to show".
    const result = outcome.ok && outcome.molecularWeight > 0 ? outcome : null;
    const error = outcome.ok ? (result ? undefined : "The formula contains no atoms.") : outcome.error;
    const isEmpty = !formula.trim();

    const filteredElements = useMemo(() => {
        if (!searchElement.trim()) {
            return PERIODIC_TABLE.slice(0, 50); // Show first 50 elements by default
        }
        const search = searchElement.toLowerCase();
        return PERIODIC_TABLE.filter(
            (elem) => elem.symbol.toLowerCase().includes(search) || elem.name.toLowerCase().includes(search),
        );
    }, [searchElement]);

    const appendElement = (symbol: string) => setFormula((previous) => previous + symbol);

    const reset = () => {
        setFormula(DEFAULT_FORMULA);
        setSearchElement("");
    };

    const totalAtoms = result ? result.composition.reduce((sum, item) => sum + item.count, 0) : 0;

    return (
        <CalculatorShell
            title="Molecular Weight Calculator"
            subtitle="Type a chemical formula to get its molecular weight, with the mass and percentage each element contributes."
            icon={Atom}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About molecular weight">
                        <p>
                            Molecular weight (MW) is the sum of the atomic weights of every atom in a
                            molecule. It is expressed in atomic mass units (amu) or, per mole, in grams per
                            mole (g/mol) — the same number either way.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Doing stoichiometric calculations",
                                "Preparing solutions of a given molarity",
                                "Working through analytical chemistry problems",
                                "Checking the drug content of a pharmaceutical formulation",
                            ]}
                        />
                        <CalcList
                            title="How to type a formula"
                            items={[
                                "Element symbols with the first letter uppercase, the second lowercase: Na, Mg, Fe, Au",
                                "A number after a symbol is its atom count: H2O, CO2, C6H12O6",
                                "Write a repeated group with its count straight after the opening bracket: (2NH4)SO4",
                                "No spaces, dots or charges",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Limitations"
                            items={[
                                "Isotopic variations are not considered — average atomic weights are used",
                                "Hydrates need a separate calculation: add the water mass yourself",
                                "Brackets with the count after them, such as Ca(OH)2 or (NH4)2SO4, are not read — expand them (CaO2H2)",
                                "For ionic compounds the result is the formula weight",
                            ]}
                        />
                        <p className="text-xs italic">Atomic weights: IUPAC 2021 standard values.</p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Molecular weight"
                value={result ? result.molecularWeight.toFixed(4) : null}
                unit="g/mol"
                interpretation={
                    result
                        ? `${toSubscriptText(formula)} · ${result.elementsCount} unique element${result.elementsCount === 1 ? "" : "s"}`
                        : undefined
                }
                empty={
                    isEmpty
                        ? "Type a chemical formula, such as H2O or C8H10N4O2, to see its molecular weight."
                        : "Fix the formula below to see its molecular weight."
                }
            />

            <CalcSection title="Formula" description="Case matters: Co is cobalt, CO is carbon plus oxygen.">
                <div className="space-y-1.5">
                    <Label htmlFor={formulaId} className="text-[13px] font-medium text-foreground/90">
                        Chemical formula
                    </Label>
                    {/* A local input rather than TextField: a formula must not be
                        autocorrected or auto-capitalised by a phone keyboard. */}
                    <Input
                        id={formulaId}
                        value={formula}
                        onChange={(event) => setFormula(event.target.value)}
                        placeholder="e.g. H2O, C6H12O6"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={200}
                        aria-invalid={error && !isEmpty ? true : undefined}
                        aria-describedby={`${formulaId}-desc`}
                        className={cn(
                            "font-mono text-lg",
                            error && !isEmpty && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
                        )}
                    />
                    <p
                        id={`${formulaId}-desc`}
                        className={cn(
                            "text-xs leading-relaxed",
                            error && !isEmpty ? "font-medium text-destructive" : "text-muted-foreground",
                        )}
                    >
                        {error && !isEmpty
                            ? error
                            : "Element symbols followed by atom counts. Group repeats go straight after “(”, e.g. (2NH4)SO4."}
                    </p>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_FORMULAS.map((item) => (
                            <button
                                key={item.formula}
                                type="button"
                                onClick={() => setFormula(item.formula)}
                                aria-pressed={formula === item.formula}
                                className={cn(
                                    chipClass,
                                    formula === item.formula && "border-primary bg-primary/10 text-primary hover:bg-primary/10",
                                )}
                            >
                                {item.name}
                                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{item.formula}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Add a common element</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {PERIODIC_TABLE.slice(0, 16).map((elem) => (
                            <button
                                key={elem.symbol}
                                type="button"
                                onClick={() => appendElement(elem.symbol)}
                                title={elem.name}
                                aria-label={`Add ${elem.name} (${elem.symbol}), ${elem.atomicWeight}`}
                                className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border bg-background px-1 py-1.5 transition-colors hover:bg-primary/5 active:bg-accent"
                            >
                                <span className="text-sm font-semibold text-foreground">{elem.symbol}</span>
                                <span className="font-mono text-[11px] text-muted-foreground">
                                    {elem.atomicWeight.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Tap an element to add it to the end of the formula.</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowElements((previous) => !previous)}
                        aria-expanded={showElements}
                    >
                        <Grid3x3 />
                        {showElements ? "Hide element finder" : "Find any element"}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw />
                        Reset
                    </Button>
                </div>

                {showElements && (
                    <ElementFinder
                        search={searchElement}
                        onSearch={setSearchElement}
                        elements={filteredElements}
                        onPick={(symbol, fromSearch) => {
                            appendElement(symbol);
                            if (fromSearch) setSearchElement("");
                        }}
                        onClose={() => setShowElements(false)}
                    />
                )}
            </CalcSection>

            {result && (
                <CalcSection
                    title="Element breakdown"
                    description="Each element's atomic weight × atom count, and its share of the total mass."
                >
                    <p className="font-mono text-2xl font-semibold text-foreground">
                        <FormulaText formula={formula} />
                    </p>

                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                        <table className="w-full min-w-[34rem] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-2 font-medium sm:pl-0">Element</th>
                                    <th className="px-3 py-2 text-right font-medium">Atomic weight</th>
                                    <th className="px-3 py-2 text-right font-medium">Count</th>
                                    <th className="px-3 py-2 text-right font-medium">Contribution</th>
                                    <th className="px-4 py-2 font-medium sm:pr-0">% Composition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.composition.map((item) => (
                                    <tr key={item.element.symbol} className="border-b border-border/70">
                                        <td className="px-4 py-2.5 sm:pl-0">
                                            <span className="font-semibold text-primary">{item.element.symbol}</span>
                                            <span className="ml-2 text-foreground">{item.element.name}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">{item.element.atomicWeight}</td>
                                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{item.count}</td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">
                                            {item.weightContribution.toFixed(4)}
                                        </td>
                                        <td className="px-4 py-2.5 sm:pr-0">
                                            <span className="flex items-center gap-2">
                                                <span className="h-2 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                                                    <span
                                                        className="block h-full rounded-full bg-emerald-500"
                                                        style={{ width: `${Math.min(100, item.percentComposition)}%` }}
                                                    />
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    {item.percentComposition.toFixed(2)}%
                                                </span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-semibold">
                                    <td className="px-4 py-2.5 sm:pl-0" colSpan={2}>
                                        Total
                                    </td>
                                    <td className="px-3 py-2.5 text-right tabular-nums">{totalAtoms}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums">
                                        {result.molecularWeight.toFixed(4)}
                                    </td>
                                    <td className="px-4 py-2.5 sm:pr-0">100%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Working</p>
                        <Formula>
                            MW ={" "}
                            {result.composition
                                .map((item) => `(${item.element.atomicWeight} × ${item.count})`)
                                .join(" + ")}{" "}
                            = {result.molecularWeight.toFixed(4)} g/mol
                        </Formula>
                    </div>

                    <div>
                        <ResultRow label="Molar mass" value={result.molarMass} />
                        <ResultRow label="Unique elements" value={result.elementsCount} />
                        <ResultRow label="Total atoms" value={totalAtoms} />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Quick calculations" description="Common conversions using this molecular weight.">
                    <div>
                        <ResultRow label="Mass of 1 mole" value={`${result.molecularWeight.toFixed(2)} g`} />
                        <ResultRow label="Moles in 10 mg" value={`${(10 / result.molecularWeight).toExponential(3)} mol`} />
                        <ResultRow label="Moles in 1 g" value={`${(1 / result.molecularWeight).toFixed(4)} mol`} />
                        <ResultRow
                            label="Mass for 1 L of a 1 mM solution"
                            value={`${(result.molecularWeight * 0.001).toFixed(4)} g`}
                        />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>MW = Σ (atomic weight × atom count)</Formula>
                <Formula>% composition = (element mass ÷ total mass) × 100%</Formula>
                <Formula>Mass of 1 mole in grams = MW in g/mol</Formula>
                <p>
                    Each element&apos;s contribution is its standard atomic weight multiplied by how many
                    atoms of it the formula contains; the molecular weight is the sum of those
                    contributions. Dividing one contribution by the total gives that element&apos;s share of
                    the mass. Elements are listed by atomic number.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Is molecular weight the same as molar mass?",
                        a: "Numerically, yes. Molecular weight is quoted in atomic mass units per molecule and molar mass in grams per mole, but the number is the same — water is 18.015 amu per molecule and 18.015 g/mol.",
                    },
                    {
                        q: "How do I enter a hydrate such as CuSO4·5H2O?",
                        a: "This tool does not read the hydrate dot. Calculate the anhydrous salt and the water separately (CuSO4, then H2O) and add five times the water's weight to the salt's.",
                    },
                    {
                        q: "Why does Ca(OH)2 show an error?",
                        a: "The parser reads a group's repeat count straight after the opening bracket, not after the closing one. Expand the group instead (CaO2H2), or write the count first: (2OH)Ca.",
                    },
                    {
                        q: "Why does CO give a different answer from Co?",
                        a: "Symbols are case-sensitive. Co is cobalt (58.933); CO is one carbon and one oxygen (28.010). Always start each symbol with a capital letter.",
                    },
                    {
                        q: "Why do my textbook values differ slightly?",
                        a: "Older textbooks use rounded or older atomic weights (for example Cl = 35.5 or S = 32.07). This calculator uses the IUPAC 2021 standard values, so the last decimal places can differ.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/** Search by symbol or name, plus the first three periods laid out as a periodic table. */
function ElementFinder({
    search,
    onSearch,
    elements,
    onPick,
    onClose,
}: {
    search: string;
    onSearch: (value: string) => void;
    elements: Element[];
    onPick: (symbol: string, fromSearch: boolean) => void;
    onClose: () => void;
}) {
    const searchId = useId();

    return (
        <div className="space-y-4 rounded-xl border border-border/80 bg-muted/40 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Find an element</p>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X />
                    Close
                </Button>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor={searchId} className="sr-only">
                    Search element by symbol or name
                </Label>
                <div className="relative">
                    <Input
                        id={searchId}
                        value={search}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder="Search by symbol or name…"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="pr-10"
                    />
                    <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
                {elements.length === 0 ? (
                    <LabNotice>No element matches “{search}”.</LabNotice>
                ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {elements.slice(0, 30).map((elem) => (
                            <button
                                key={elem.symbol}
                                type="button"
                                onClick={() => onPick(elem.symbol, true)}
                                title={`${elem.name} - ${elem.atomicWeight}`}
                                className="min-h-[48px] rounded-xl border bg-background px-1 py-1.5 text-center transition-colors hover:bg-emerald-50 active:bg-accent"
                            >
                                <span className="block text-sm font-bold text-primary">{elem.symbol}</span>
                                <span className="block truncate text-xs text-muted-foreground">{elem.name}</span>
                                <span className="block font-mono text-[11px] font-semibold text-foreground">
                                    {elem.atomicWeight.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Periodic table — periods 1 to 3</p>
                <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
                    <div
                        className="grid min-w-[40rem] gap-1"
                        style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
                    >
                        {PERIODIC_TABLE.slice(0, 18).map((elem) => (
                            <button
                                key={elem.symbol}
                                type="button"
                                onClick={() => onPick(elem.symbol, false)}
                                title={`${elem.name} (${elem.symbol}) - ${elem.atomicWeight}`}
                                style={{ gridColumnStart: elem.group, gridRowStart: elem.period }}
                                className={cn(
                                    "flex h-14 flex-col items-center justify-center rounded-md border p-0.5 text-slate-900 transition-transform hover:scale-105",
                                    groupColor(elem.group),
                                )}
                            >
                                <span className="text-xs font-bold leading-none">{elem.symbol}</span>
                                <span className="mt-0.5 text-[11px] leading-none">{elem.atomicNumber}</span>
                                <span className="mt-0.5 text-[11px] leading-none">{elem.atomicWeight.toFixed(1)}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Tap any element to add it to your formula. Colours indicate element groups.
                </p>
            </div>
        </div>
    );
}
