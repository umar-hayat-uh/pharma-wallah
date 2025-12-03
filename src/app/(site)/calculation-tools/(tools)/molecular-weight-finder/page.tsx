"use client";
import { useState, useEffect, useMemo } from 'react';
import {
    Calculator, Beaker, FlaskConical, Scale, Weight,
    Search, Hash, AlertCircle, Atom, TestTube2,
    TrendingUp, BarChart3, Database
} from 'lucide-react';

// Define element interface
interface Element {
    symbol: string;
    name: string;
    atomicNumber: number;
    atomicWeight: number;
    uncertainty?: number;
    group: number;
    period: number;
}

// Periodic table data with atomic weights (IUPAC 2021 values)
const PERIODIC_TABLE: Element[] = [
    // Period 1
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicWeight: 1.008, group: 1, period: 1 },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicWeight: 4.0026, group: 18, period: 1 },

    // Period 2
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicWeight: 6.94, group: 1, period: 2 },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicWeight: 9.0122, group: 2, period: 2 },
    { symbol: 'B', name: 'Boron', atomicNumber: 5, atomicWeight: 10.81, group: 13, period: 2 },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicWeight: 12.011, group: 14, period: 2 },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicWeight: 14.007, group: 15, period: 2 },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicWeight: 15.999, group: 16, period: 2 },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicWeight: 18.998, group: 17, period: 2 },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicWeight: 20.180, group: 18, period: 2 },

    // Period 3
    { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicWeight: 22.990, group: 1, period: 3 },
    { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicWeight: 24.305, group: 2, period: 3 },
    { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicWeight: 26.982, group: 13, period: 3 },
    { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicWeight: 28.085, group: 14, period: 3 },
    { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.974, group: 15, period: 3 },
    { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicWeight: 32.06, group: 16, period: 3 },
    { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicWeight: 35.45, group: 17, period: 3 },
    { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicWeight: 39.948, group: 18, period: 3 },

    // Period 4
    { symbol: 'K', name: 'Potassium', atomicNumber: 19, atomicWeight: 39.098, group: 1, period: 4 },
    { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, atomicWeight: 40.078, group: 2, period: 4 },
    { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, atomicWeight: 44.956, group: 3, period: 4 },
    { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, atomicWeight: 47.867, group: 4, period: 4 },
    { symbol: 'V', name: 'Vanadium', atomicNumber: 23, atomicWeight: 50.942, group: 5, period: 4 },
    { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, atomicWeight: 51.996, group: 6, period: 4 },
    { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, atomicWeight: 54.938, group: 7, period: 4 },
    { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicWeight: 55.845, group: 8, period: 4 },
    { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, atomicWeight: 58.933, group: 9, period: 4 },
    { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, atomicWeight: 58.693, group: 10, period: 4 },
    { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicWeight: 63.546, group: 11, period: 4 },
    { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicWeight: 65.38, group: 12, period: 4 },
    { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, atomicWeight: 69.723, group: 13, period: 4 },
    { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, atomicWeight: 72.630, group: 14, period: 4 },
    { symbol: 'As', name: 'Arsenic', atomicNumber: 33, atomicWeight: 74.922, group: 15, period: 4 },
    { symbol: 'Se', name: 'Selenium', atomicNumber: 34, atomicWeight: 78.971, group: 16, period: 4 },
    { symbol: 'Br', name: 'Bromine', atomicNumber: 35, atomicWeight: 79.904, group: 17, period: 4 },
    { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, atomicWeight: 83.798, group: 18, period: 4 },

    // Period 5
    { symbol: 'Rb', name: 'Rubidium', atomicNumber: 37, atomicWeight: 85.468, group: 1, period: 5 },
    { symbol: 'Sr', name: 'Strontium', atomicNumber: 38, atomicWeight: 87.62, group: 2, period: 5 },
    { symbol: 'Y', name: 'Yttrium', atomicNumber: 39, atomicWeight: 88.906, group: 3, period: 5 },
    { symbol: 'Zr', name: 'Zirconium', atomicNumber: 40, atomicWeight: 91.224, group: 4, period: 5 },
    { symbol: 'Nb', name: 'Niobium', atomicNumber: 41, atomicWeight: 92.906, group: 5, period: 5 },
    { symbol: 'Mo', name: 'Molybdenum', atomicNumber: 42, atomicWeight: 95.95, group: 6, period: 5 },
    { symbol: 'Tc', name: 'Technetium', atomicNumber: 43, atomicWeight: 98, group: 7, period: 5 },
    { symbol: 'Ru', name: 'Ruthenium', atomicNumber: 44, atomicWeight: 101.07, group: 8, period: 5 },
    { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45, atomicWeight: 102.91, group: 9, period: 5 },
    { symbol: 'Pd', name: 'Palladium', atomicNumber: 46, atomicWeight: 106.42, group: 10, period: 5 },
    { symbol: 'Ag', name: 'Silver', atomicNumber: 47, atomicWeight: 107.87, group: 11, period: 5 },
    { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48, atomicWeight: 112.41, group: 12, period: 5 },
    { symbol: 'In', name: 'Indium', atomicNumber: 49, atomicWeight: 114.82, group: 13, period: 5 },
    { symbol: 'Sn', name: 'Tin', atomicNumber: 50, atomicWeight: 118.71, group: 14, period: 5 },
    { symbol: 'Sb', name: 'Antimony', atomicNumber: 51, atomicWeight: 121.76, group: 15, period: 5 },
    { symbol: 'Te', name: 'Tellurium', atomicNumber: 52, atomicWeight: 127.60, group: 16, period: 5 },
    { symbol: 'I', name: 'Iodine', atomicNumber: 53, atomicWeight: 126.90, group: 17, period: 5 },
    { symbol: 'Xe', name: 'Xenon', atomicNumber: 54, atomicWeight: 131.29, group: 18, period: 5 },

    // Period 6
    { symbol: 'Cs', name: 'Cesium', atomicNumber: 55, atomicWeight: 132.91, group: 1, period: 6 },
    { symbol: 'Ba', name: 'Barium', atomicNumber: 56, atomicWeight: 137.33, group: 2, period: 6 },
    { symbol: 'La', name: 'Lanthanum', atomicNumber: 57, atomicWeight: 138.91, group: 3, period: 6 },
    { symbol: 'Ce', name: 'Cerium', atomicNumber: 58, atomicWeight: 140.12, group: 3, period: 6 },
    { symbol: 'Pr', name: 'Praseodymium', atomicNumber: 59, atomicWeight: 140.91, group: 3, period: 6 },
    { symbol: 'Nd', name: 'Neodymium', atomicNumber: 60, atomicWeight: 144.24, group: 3, period: 6 },
    { symbol: 'Pm', name: 'Promethium', atomicNumber: 61, atomicWeight: 145, group: 3, period: 6 },
    { symbol: 'Sm', name: 'Samarium', atomicNumber: 62, atomicWeight: 150.36, group: 3, period: 6 },
    { symbol: 'Eu', name: 'Europium', atomicNumber: 63, atomicWeight: 151.96, group: 3, period: 6 },
    { symbol: 'Gd', name: 'Gadolinium', atomicNumber: 64, atomicWeight: 157.25, group: 3, period: 6 },
    { symbol: 'Tb', name: 'Terbium', atomicNumber: 65, atomicWeight: 158.93, group: 3, period: 6 },
    { symbol: 'Dy', name: 'Dysprosium', atomicNumber: 66, atomicWeight: 162.50, group: 3, period: 6 },
    { symbol: 'Ho', name: 'Holmium', atomicNumber: 67, atomicWeight: 164.93, group: 3, period: 6 },
    { symbol: 'Er', name: 'Erbium', atomicNumber: 68, atomicWeight: 167.26, group: 3, period: 6 },
    { symbol: 'Tm', name: 'Thulium', atomicNumber: 69, atomicWeight: 168.93, group: 3, period: 6 },
    { symbol: 'Yb', name: 'Ytterbium', atomicNumber: 70, atomicWeight: 173.05, group: 3, period: 6 },
    { symbol: 'Lu', name: 'Lutetium', atomicNumber: 71, atomicWeight: 174.97, group: 3, period: 6 },
    { symbol: 'Hf', name: 'Hafnium', atomicNumber: 72, atomicWeight: 178.49, group: 4, period: 6 },
    { symbol: 'Ta', name: 'Tantalum', atomicNumber: 73, atomicWeight: 180.95, group: 5, period: 6 },
    { symbol: 'W', name: 'Tungsten', atomicNumber: 74, atomicWeight: 183.84, group: 6, period: 6 },
    { symbol: 'Re', name: 'Rhenium', atomicNumber: 75, atomicWeight: 186.21, group: 7, period: 6 },
    { symbol: 'Os', name: 'Osmium', atomicNumber: 76, atomicWeight: 190.23, group: 8, period: 6 },
    { symbol: 'Ir', name: 'Iridium', atomicNumber: 77, atomicWeight: 192.22, group: 9, period: 6 },
    { symbol: 'Pt', name: 'Platinum', atomicNumber: 78, atomicWeight: 195.08, group: 10, period: 6 },
    { symbol: 'Au', name: 'Gold', atomicNumber: 79, atomicWeight: 196.97, group: 11, period: 6 },
    { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, atomicWeight: 200.59, group: 12, period: 6 },
    { symbol: 'Tl', name: 'Thallium', atomicNumber: 81, atomicWeight: 204.38, group: 13, period: 6 },
    { symbol: 'Pb', name: 'Lead', atomicNumber: 82, atomicWeight: 207.2, group: 14, period: 6 },
    { symbol: 'Bi', name: 'Bismuth', atomicNumber: 83, atomicWeight: 208.98, group: 15, period: 6 },
    { symbol: 'Po', name: 'Polonium', atomicNumber: 84, atomicWeight: 209, group: 16, period: 6 },
    { symbol: 'At', name: 'Astatine', atomicNumber: 85, atomicWeight: 210, group: 17, period: 6 },
    { symbol: 'Rn', name: 'Radon', atomicNumber: 86, atomicWeight: 222, group: 18, period: 6 },

    // Period 7
    { symbol: 'Fr', name: 'Francium', atomicNumber: 87, atomicWeight: 223, group: 1, period: 7 },
    { symbol: 'Ra', name: 'Radium', atomicNumber: 88, atomicWeight: 226, group: 2, period: 7 },
    { symbol: 'Ac', name: 'Actinium', atomicNumber: 89, atomicWeight: 227, group: 3, period: 7 },
    { symbol: 'Th', name: 'Thorium', atomicNumber: 90, atomicWeight: 232.04, group: 3, period: 7 },
    { symbol: 'Pa', name: 'Protactinium', atomicNumber: 91, atomicWeight: 231.04, group: 3, period: 7 },
    { symbol: 'U', name: 'Uranium', atomicNumber: 92, atomicWeight: 238.03, group: 3, period: 7 },
    { symbol: 'Np', name: 'Neptunium', atomicNumber: 93, atomicWeight: 237, group: 3, period: 7 },
    { symbol: 'Pu', name: 'Plutonium', atomicNumber: 94, atomicWeight: 244, group: 3, period: 7 },
    { symbol: 'Am', name: 'Americium', atomicNumber: 95, atomicWeight: 243, group: 3, period: 7 },
    { symbol: 'Cm', name: 'Curium', atomicNumber: 96, atomicWeight: 247, group: 3, period: 7 },
    { symbol: 'Bk', name: 'Berkelium', atomicNumber: 97, atomicWeight: 247, group: 3, period: 7 },
    { symbol: 'Cf', name: 'Californium', atomicNumber: 98, atomicWeight: 251, group: 3, period: 7 },
    { symbol: 'Es', name: 'Einsteinium', atomicNumber: 99, atomicWeight: 252, group: 3, period: 7 },
    { symbol: 'Fm', name: 'Fermium', atomicNumber: 100, atomicWeight: 257, group: 3, period: 7 },
    { symbol: 'Md', name: 'Mendelevium', atomicNumber: 101, atomicWeight: 258, group: 3, period: 7 },
    { symbol: 'No', name: 'Nobelium', atomicNumber: 102, atomicWeight: 259, group: 3, period: 7 },
    { symbol: 'Lr', name: 'Lawrencium', atomicNumber: 103, atomicWeight: 262, group: 3, period: 7 },
    { symbol: 'Rf', name: 'Rutherfordium', atomicNumber: 104, atomicWeight: 267, group: 4, period: 7 },
    { symbol: 'Db', name: 'Dubnium', atomicNumber: 105, atomicWeight: 268, group: 5, period: 7 },
    { symbol: 'Sg', name: 'Seaborgium', atomicNumber: 106, atomicWeight: 269, group: 6, period: 7 },
    { symbol: 'Bh', name: 'Bohrium', atomicNumber: 107, atomicWeight: 270, group: 7, period: 7 },
    { symbol: 'Hs', name: 'Hassium', atomicNumber: 108, atomicWeight: 269, group: 8, period: 7 },
    { symbol: 'Mt', name: 'Meitnerium', atomicNumber: 109, atomicWeight: 278, group: 9, period: 7 },
    { symbol: 'Ds', name: 'Darmstadtium', atomicNumber: 110, atomicWeight: 281, group: 10, period: 7 },
    { symbol: 'Rg', name: 'Roentgenium', atomicNumber: 111, atomicWeight: 282, group: 11, period: 7 },
    { symbol: 'Cn', name: 'Copernicium', atomicNumber: 112, atomicWeight: 285, group: 12, period: 7 },
    { symbol: 'Nh', name: 'Nihonium', atomicNumber: 113, atomicWeight: 286, group: 13, period: 7 },
    { symbol: 'Fl', name: 'Flerovium', atomicNumber: 114, atomicWeight: 289, group: 14, period: 7 },
    { symbol: 'Mc', name: 'Moscovium', atomicNumber: 115, atomicWeight: 289, group: 15, period: 7 },
    { symbol: 'Lv', name: 'Livermorium', atomicNumber: 116, atomicWeight: 293, group: 16, period: 7 },
    { symbol: 'Ts', name: 'Tennessine', atomicNumber: 117, atomicWeight: 294, group: 17, period: 7 },
    { symbol: 'Og', name: 'Oganesson', atomicNumber: 118, atomicWeight: 294, group: 18, period: 7 },
];

// Create a map for quick element lookup
const ELEMENT_MAP = new Map(PERIODIC_TABLE.map(elem => [elem.symbol, elem]));

// Common molecular formulas for quick selection
const COMMON_FORMULAS = [
    { formula: 'H2O', name: 'Water' },
    { formula: 'CO2', name: 'Carbon Dioxide' },
    { formula: 'NaCl', name: 'Sodium Chloride' },
    { formula: 'C6H12O6', name: 'Glucose' },
    { formula: 'CH4', name: 'Methane' },
    { formula: 'C2H5OH', name: 'Ethanol' },
    { formula: 'C8H10N4O2', name: 'Caffeine' },
    { formula: 'H2SO4', name: 'Sulfuric Acid' },
    { formula: 'HCl', name: 'Hydrochloric Acid' },
    { formula: 'NaOH', name: 'Sodium Hydroxide' },
    { formula: 'NH3', name: 'Ammonia' },
    { formula: 'CaCO3', name: 'Calcium Carbonate' },
    { formula: 'C12H22O11', name: 'Sucrose' },
    { formula: 'C3H8', name: 'Propane' },
    { formula: 'C55H72MgN4O5', name: 'Chlorophyll a' },
];

export default function MolecularWeightCalculator() {
    // State variables
    const [formula, setFormula] = useState('H2O');
    const [result, setResult] = useState<{
        molecularWeight: number;
        composition: Array<{
            element: Element;
            count: number;
            weightContribution: number;
            percentComposition: number;
        }>;
        elementsCount: number;
        molarMass: string;
        error?: string;
    } | null>(null);

    const [showPeriodicTable, setShowPeriodicTable] = useState(false);
    const [searchElement, setSearchElement] = useState('');

    /**
     * Parse chemical formula and calculate molecular weight
     */
    const calculateMolecularWeight = () => {
        if (!formula.trim()) {
            setResult({
                molecularWeight: 0,
                composition: [],
                elementsCount: 0,
                molarMass: '0 g/mol',
                error: 'Please enter a chemical formula'
            });
            return;
        }

        try {
            const parsed = parseChemicalFormula(formula);

            if (parsed.error) {
                setResult({
                    molecularWeight: 0,
                    composition: [],
                    elementsCount: 0,
                    molarMass: '0 g/mol',
                    error: parsed.error
                });
                return;
            }

            // Calculate molecular weight and composition
            let molecularWeight = 0;
            const composition: Array<{
                element: Element;
                count: number;
                weightContribution: number;
                percentComposition: number;
            }> = [];

            for (const [symbol, count] of parsed.elements) {
                const element = ELEMENT_MAP.get(symbol);
                if (!element) {
                    setResult({
                        molecularWeight: 0,
                        composition: [],
                        elementsCount: 0,
                        molarMass: '0 g/mol',
                        error: `Unknown element: ${symbol}`
                    });
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
            }

            // Calculate percentage composition
            composition.forEach(item => {
                item.percentComposition = (item.weightContribution / molecularWeight) * 100;
            });

            // Sort by atomic number
            composition.sort((a, b) => a.element.atomicNumber - b.element.atomicNumber);

            setResult({
                molecularWeight,
                composition,
                elementsCount: parsed.elements.size,
                molarMass: `${molecularWeight.toFixed(4)} g/mol`,
                error: undefined
            });

        } catch (error) {
            setResult({
                molecularWeight: 0,
                composition: [],
                elementsCount: 0,
                molarMass: '0 g/mol',
                error: 'Invalid chemical formula format'
            });
        }
    };

    /**
     * Parse chemical formula into element counts
     * Supports parentheses and nested groups
     */
    const parseChemicalFormula = (formula: string) => {
        const elements = new Map<string, number>();
        let i = 0;
        const n = formula.length;

        const parseGroup = (multiplier: number = 1): number => {
            const groupElements = new Map<string, number>();

            while (i < n && formula[i] !== ')') {
                if (formula[i] === '(') {
                    i++; // Skip '('
                    const groupMultiplier = parseNumber() || 1;
                    const subGroupElements = parseGroup(groupMultiplier);

                    // Merge subgroup elements
                    for (const [symbol, count] of subGroupElements) {
                        groupElements.set(symbol, (groupElements.get(symbol) || 0) + count);
                    }
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
            for (const [symbol, count] of groupElements) {
                result.set(symbol, count * multiplier);
            }

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
                    for (const [symbol, count] of groupElements) {
                        elements.set(symbol, (elements.get(symbol) || 0) + count);
                    }
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
            return { elements: new Map(), error: 'Failed to parse formula' };
        }
    };

    /**
     * Reset calculator
     */
    const handleReset = () => {
        setFormula('H2O');
        setResult(null);
        setSearchElement('');
    };

    /**
     * Select a common formula
     */
    const selectCommonFormula = (commonFormula: string) => {
        setFormula(commonFormula);
    };

    /**
     * Format formula with subscripts for display
     */
    const formatFormulaWithSubscripts = (formula: string) => {
        return formula.replace(/(\d+)/g, '<sub>$1</sub>');
    };

    /**
     * Filter elements based on search
     */
    const filteredElements = useMemo(() => {
        if (!searchElement.trim()) {
            return PERIODIC_TABLE.slice(0, 50); // Show first 50 elements by default
        }

        const search = searchElement.toLowerCase();
        return PERIODIC_TABLE.filter(elem =>
            elem.symbol.toLowerCase().includes(search) ||
            elem.name.toLowerCase().includes(search)
        );
    }, [searchElement]);

    // Calculate on initial load
    useEffect(() => {
        calculateMolecularWeight();
    }, []);

    return (
        <section id="molecular-weight-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="mt-6 px-4 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Atom className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Molecular Weight Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Calculate molecular weight from chemical formulas with element-by-element breakdown
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Calculator Card */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
                            {/* Formula Input Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Chemical Formula
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={formula}
                                            onChange={(e) => setFormula(e.target.value)}
                                            placeholder="Enter chemical formula (e.g., H2O, C6H12O6)"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors font-mono text-lg"
                                            onKeyPress={(e) => e.key === 'Enter' && calculateMolecularWeight()}
                                        />
                                        <div className="absolute right-3 top-3">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={calculateMolecularWeight}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                                    >
                                        <Calculator className="w-5 h-5 mr-2" />
                                        Calculate
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Use element symbols (e.g., H, C, O, Na, Cl). Numbers indicate atom counts. Parentheses are supported.
                                </p>
                            </div>

                            {/* Quick Formula Buttons */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Common Formulas:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_FORMULAS.map((item) => (
                                        <button
                                            key={item.formula}
                                            onClick={() => selectCommonFormula(item.formula)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${formula === item.formula
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            title={item.name}
                                        >
                                            {item.formula}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results Section */}
                            {result && (
                                <div className="mt-6">
                                    {result.error ? (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                                <p className="text-red-800 font-medium">{result.error}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-400 rounded-lg p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                                Calculation Results
                                            </h3>

                                            {/* Molecular Formula Display */}
                                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">Chemical Formula</p>
                                                <p className="text-2xl font-bold text-blue-600 font-mono">
                                                    {formula}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Formula parsed successfully
                                                </p>
                                            </div>

                                            {/* Main Results */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">Molecular Weight</p>
                                                    <p className="text-3xl font-bold text-blue-600">
                                                        {result.molecularWeight.toFixed(4)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">g/mol</p>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">Molar Mass</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {result.molarMass}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Exact value</p>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">Unique Elements</p>
                                                    <p className="text-3xl font-bold text-purple-600">
                                                        {result.elementsCount}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Different elements in formula</p>
                                                </div>
                                            </div>

                                            {/* Element Composition Table */}
                                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <BarChart3 className="w-4 h-4 mr-2" />
                                                    Element Composition Breakdown
                                                </h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-blue-50">
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">Element</th>
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">Symbol</th>
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">Atomic Weight</th>
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">Count</th>
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">Contribution</th>
                                                                <th className="py-2 px-3 text-left font-semibold text-gray-700">% Composition</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {result.composition.map((item, index) => (
                                                                <tr key={item.element.symbol} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                                    <td className="py-2 px-3 font-medium text-gray-800">{item.element.name}</td>
                                                                    <td className="py-2 px-3">
                                                                        <span className="font-bold text-blue-600">{item.element.symbol}</span>
                                                                    </td>
                                                                    <td className="py-2 px-3">{item.element.atomicWeight}</td>
                                                                    <td className="py-2 px-3 font-semibold">{item.count}</td>
                                                                    <td className="py-2 px-3">{item.weightContribution.toFixed(4)}</td>
                                                                    <td className="py-2 px-3">
                                                                        <div className="flex items-center">
                                                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                                <div
                                                                                    className="bg-green-400 h-2 rounded-full"
                                                                                    style={{ width: `${Math.min(100, item.percentComposition)}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="font-semibold">{item.percentComposition.toFixed(2)}%</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-blue-50 font-bold">
                                                                <td className="py-2 px-3" colSpan={3}>Total</td>
                                                                <td className="py-2 px-3">
                                                                    {result.composition.reduce((sum, item) => sum + item.count, 0)}
                                                                </td>
                                                                <td className="py-2 px-3">{result.molecularWeight.toFixed(4)}</td>
                                                                <td className="py-2 px-3">100%</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Quick Calculations */}
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <p className="text-xs font-semibold text-blue-800 mb-2">🧪 Quick Calculations:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                    <div className="bg-white rounded p-2">
                                                        <p className="font-semibold text-gray-600">1 mole</p>
                                                        <p className="font-bold text-blue-600">{result.molecularWeight.toFixed(2)} g</p>
                                                    </div>
                                                    <div className="bg-white rounded p-2">
                                                        <p className="font-semibold text-gray-600">10 mg</p>
                                                        <p className="font-bold text-blue-600">
                                                            {(10 / result.molecularWeight).toExponential(3)} mol
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded p-2">
                                                        <p className="font-semibold text-gray-600">1 g</p>
                                                        <p className="font-bold text-blue-600">
                                                            {(1 / result.molecularWeight).toFixed(4)} mol
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded p-2">
                                                        <p className="font-semibold text-gray-600">1 mM (1 L)</p>
                                                        <p className="font-bold text-blue-600">
                                                            {(result.molecularWeight * 0.001).toFixed(4)} g
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={calculateMolecularWeight}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Calculator className="w-5 h-5 mr-2" />
                                    Calculate
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowPeriodicTable(!showPeriodicTable)}
                                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    {showPeriodicTable ? 'Hide Table' : 'Show Periodic Table'}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar - Information and Elements */}
                        <div className="space-y-6">
                            {/* How to Use */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">How to Use</h3>
                                <div className="space-y-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Basic Formulas</h4>
                                        <p className="text-xs text-gray-600">
                                            Enter element symbols followed by numbers: H2O, CO2, NaCl
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-green-800 mb-1">Parentheses</h4>
                                        <p className="text-xs text-gray-600">
                                            Use parentheses for groups: Ca(OH)2, (NH4)2SO4
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-purple-800 mb-1">Element Symbols</h4>
                                        <p className="text-xs text-gray-600">
                                            First letter uppercase, second lowercase: Na, Mg, Fe, Au
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Common Elements */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Common Elements</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {PERIODIC_TABLE.slice(0, 16).map((elem) => (
                                        <div
                                            key={elem.symbol}
                                            className="p-2 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-blue-50 transition-colors"
                                            onClick={() => {
                                                // Append element to formula
                                                setFormula(prev => prev + elem.symbol);
                                            }}
                                            title={elem.name}
                                        >
                                            <p className="text-xs font-semibold text-gray-600">{elem.symbol}</p>
                                            <p className="text-xs text-gray-500">{elem.atomicWeight.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    Click to add element to formula
                                </p>
                            </div>

                            {/* Element Search */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Find Element</h3>
                                <div className="relative mb-3">
                                    <input
                                        type="text"
                                        value={searchElement}
                                        onChange={(e) => setSearchElement(e.target.value)}
                                        placeholder="Search element by symbol or name..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                                    />
                                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                                <div className="h-60 overflow-y-auto">
                                    <div className="grid grid-cols-3 gap-2">
                                        {filteredElements.slice(0, 30).map((elem) => (
                                            <div
                                                key={elem.symbol}
                                                className="p-2 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-green-50 transition-colors"
                                                onClick={() => {
                                                    setFormula(prev => prev + elem.symbol);
                                                    setSearchElement('');
                                                }}
                                                title={`${elem.name} - ${elem.atomicWeight}`}
                                            >
                                                <p className="text-xs font-bold text-blue-600">{elem.symbol}</p>
                                                <p className="text-xs text-gray-500 truncate" title={elem.name}>
                                                    {elem.name}
                                                </p>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    {elem.atomicWeight.toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Reference */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600">MW Calculation</p>
                                        <p className="text-xs text-gray-500">
                                            MW = Σ(atomic weight × atom count)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600">Molar Mass</p>
                                        <p className="text-xs text-gray-500">
                                            Mass of 1 mole in grams = MW in g/mol
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600">% Composition</p>
                                        <p className="text-xs text-gray-500">
                                            (Element mass / Total mass) × 100%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Periodic Table Display */}
                    {showPeriodicTable && (
                        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Periodic Table</h3>
                                <button
                                    onClick={() => setShowPeriodicTable(false)}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="relative">
                                {/* Simplified periodic table grid */}
                                <div className="grid grid-cols-18 gap-1">
                                    {/* Empty spaces for proper alignment */}
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-12"></div>
                                    ))}

                                    {/* Period 1 */}
                                    <ElementCell element={PERIODIC_TABLE[0]} onClick={() => setFormula(prev => prev + 'H')} />
                                    <div className="col-span-16"></div>
                                    <ElementCell element={PERIODIC_TABLE[1]} onClick={() => setFormula(prev => prev + 'He')} />

                                    {/* Period 2 */}
                                    <ElementCell element={PERIODIC_TABLE[2]} onClick={() => setFormula(prev => prev + 'Li')} />
                                    <ElementCell element={PERIODIC_TABLE[3]} onClick={() => setFormula(prev => prev + 'Be')} />
                                    <div className="col-span-10"></div>
                                    {PERIODIC_TABLE.slice(4, 10).map(elem => (
                                        <ElementCell key={elem.symbol} element={elem} onClick={() => setFormula(prev => prev + elem.symbol)} />
                                    ))}

                                    {/* Period 3 */}
                                    <ElementCell element={PERIODIC_TABLE[10]} onClick={() => setFormula(prev => prev + 'Na')} />
                                    <ElementCell element={PERIODIC_TABLE[11]} onClick={() => setFormula(prev => prev + 'Mg')} />
                                    <div className="col-span-10"></div>
                                    {PERIODIC_TABLE.slice(12, 18).map(elem => (
                                        <ElementCell key={elem.symbol} element={elem} onClick={() => setFormula(prev => prev + elem.symbol)} />
                                    ))}
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Click any element to add it to your formula. Colors indicate element groups.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">About Molecular Weight</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">What is Molecular Weight?</h4>
                                <p className="text-xs text-gray-600">
                                    Molecular weight (MW) is the sum of atomic weights of all atoms in a molecule.
                                    It's expressed in atomic mass units (amu) or grams per mole (g/mol).
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Applications</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Stoichiometric calculations</li>
                                    <li>• Solution preparation (molarity)</li>
                                    <li>• Analytical chemistry</li>
                                    <li>• Pharmaceutical formulations</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Limitations</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Isotopic variations not considered</li>
                                    <li>• Average atomic weights used</li>
                                    <li>• Hydrates require separate calculation</li>
                                    <li>• Ionic compounds show formula weight</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Helper component for element cell in periodic table
function ElementCell({ element, onClick }: { element: Element; onClick: () => void }) {
    // Determine color based on group
    const getGroupColor = (group: number) => {
        if (group === 1) return 'bg-red-100 border-red-300';
        if (group === 2) return 'bg-orange-100 border-orange-300';
        if (group >= 3 && group <= 12) return 'bg-yellow-100 border-yellow-300';
        if (group === 13) return 'bg-teal-100 border-teal-300';
        if (group === 14) return 'bg-green-100 border-green-300';
        if (group === 15) return 'bg-blue-100 border-blue-300';
        if (group === 16) return 'bg-indigo-100 border-indigo-300';
        if (group === 17) return 'bg-purple-100 border-purple-300';
        if (group === 18) return 'bg-gray-100 border-gray-300';
        return 'bg-gray-50 border-gray-200';
    };

    return (
        <button
            onClick={onClick}
            className={`h-12 border rounded flex flex-col items-center justify-center p-1 hover:scale-105 transition-transform ${getGroupColor(element.group)}`}
            title={`${element.name} (${element.symbol}) - ${element.atomicWeight}`}
        >
            <span className="text-xs font-bold">{element.symbol}</span>
            <span className="text-[10px]">{element.atomicNumber}</span>
            <span className="text-[8px] mt-0.5">{element.atomicWeight.toFixed(1)}</span>
        </button>
    );
}