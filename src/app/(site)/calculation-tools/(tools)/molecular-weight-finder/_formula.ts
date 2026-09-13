import { ELEMENT_MAP, type Element } from "./_elements";

/*
 * The formula parser and molecular-weight arithmetic of the original page,
 * lifted out of the component so the result can be derived with useMemo.
 *
 * The parser is kept VERBATIM, quirks included — results must match the old
 * page exactly. Known quirks (reported, deliberately not fixed here):
 *  - A group multiplier is read straight AFTER "(" — "(2NH4)SO4" parses, but
 *    the conventional "(NH4)2SO4" and "Ca(OH)2" stop at the trailing digit.
 *  - Hydrate dots ("CuSO4·5H2O") are not supported.
 *  - Nothing is trimmed: a trailing space is an invalid character.
 */

export type CompositionItem = {
    element: Element;
    count: number;
    weightContribution: number;
    percentComposition: number;
};

export type MolecularWeightResult =
    | {
          ok: true;
          molecularWeight: number;
          composition: CompositionItem[];
          elementsCount: number;
          molarMass: string;
      }
    | { ok: false; error: string };

/**
 * Parse chemical formula into element counts
 * Supports parentheses and nested groups
 */
export function parseChemicalFormula(formula: string) {
    const elements = new Map<string, number>();
    let i = 0;
    const n = formula.length;

    const parseGroup = (multiplier: number = 1): Map<string, number> => {
        const groupElements = new Map<string, number>();

        while (i < n && formula[i] !== ')') {
            if (formula[i] === '(') {
                i++; // Skip '('
                const groupMultiplier = parseNumber() || 1;
                const subGroupElements = parseGroup(groupMultiplier);

                // Merge subgroup elements
                Array.from(subGroupElements.entries()).forEach(([symbol, count]) => {
                    groupElements.set(symbol, (groupElements.get(symbol) || 0) + count);
                });
            } else {
                // Parse element symbol
                if (i < n && /[A-Z]/.test(formula[i])) {
                    let symbol = formula[i];
                    i++;

                    // Check for lowercase letters for element symbols like Na, Mg, etc.
                    while (i < n && /[a-z]/.test(formula[i])) {
                        symbol += formula[i];
                        i++;
                    }

                    // Parse number after element
                    const count = parseNumber() || 1;

                    groupElements.set(symbol, (groupElements.get(symbol) || 0) + count);
                } else {
                    return new Map(); // Invalid character
                }
            }
        }

        if (i < n && formula[i] === ')') {
            i++; // Skip ')'
        }

        // Apply multiplier to all elements in this group
        const result = new Map<string, number>();
        Array.from(groupElements.entries()).forEach(([symbol, count]) => {
            result.set(symbol, count * multiplier);
        });

        return result;
    };

    const parseNumber = (): number | null => {
        if (i >= n || !/\d/.test(formula[i])) {
            return null;
        }

        let numStr = '';
        while (i < n && /\d/.test(formula[i])) {
            numStr += formula[i];
            i++;
        }

        return parseInt(numStr, 10);
    };

    try {
        // Parse the entire formula
        while (i < n) {
            if (formula[i] === '(') {
                i++; // Skip '('
                const groupMultiplier = parseNumber() || 1;
                const groupElements = parseGroup(groupMultiplier);

                // Merge into main elements map
                Array.from(groupElements.entries()).forEach(([symbol, count]) => {
                    elements.set(symbol, (elements.get(symbol) || 0) + count);
                });
            } else {
                // Parse element symbol
                if (/[A-Z]/.test(formula[i])) {
                    let symbol = formula[i];
                    i++;

                    while (i < n && /[a-z]/.test(formula[i])) {
                        symbol += formula[i];
                        i++;
                    }

                    const count = parseNumber() || 1;
                    elements.set(symbol, (elements.get(symbol) || 0) + count);
                } else {
                    return { elements, error: `Invalid character at position ${i}: ${formula[i]}` };
                }
            }
        }

        return { elements, error: null };
    } catch (error) {
        return { elements: new Map<string, number>(), error: 'Failed to parse formula' };
    }
}

/**
 * The original `calculateMolecularWeight`, as a pure function.
 *
 * One behavioural fix, a state bug rather than maths: the original called
 * setResult({ error: "Unknown element: X" }) inside a forEach and then
 * setResult(success) after the loop, in the same React batch — so the error
 * was always overwritten and "NaXx" silently showed 22.9900 g/mol. The error
 * the original code built is now the result.
 */
export function calculateMolecularWeight(formula: string): MolecularWeightResult {
    if (!formula.trim()) {
        return { ok: false, error: 'Please enter a chemical formula' };
    }

    try {
        const parsed = parseChemicalFormula(formula);

        if (parsed.error) {
            return { ok: false, error: parsed.error };
        }

        // Calculate molecular weight and composition
        let molecularWeight = 0;
        const unknown: string[] = [];
        const composition: CompositionItem[] = [];

        Array.from(parsed.elements.entries()).forEach(([symbol, count]) => {
            const element = ELEMENT_MAP.get(symbol);
            if (!element) {
                unknown.push(symbol);
                return;
            }

            const weightContribution = element.atomicWeight * count;
            molecularWeight += weightContribution;

            composition.push({
                element,
                count,
                weightContribution,
                percentComposition: 0 // Will calculate after total
            });
        });

        if (unknown.length > 0) {
            return { ok: false, error: `Unknown element: ${unknown[0]}` };
        }

        // Calculate percentage composition
        composition.forEach(item => {
            item.percentComposition = (item.weightContribution / molecularWeight) * 100;
        });

        // Sort by atomic number
        composition.sort((a, b) => a.element.atomicNumber - b.element.atomicNumber);

        return {
            ok: true,
            molecularWeight,
            composition,
            elementsCount: parsed.elements.size,
            molarMass: `${molecularWeight.toFixed(4)} g/mol`,
        };
    } catch (error) {
        return { ok: false, error: 'Invalid chemical formula format' };
    }
}
