/*
 * Element data and example formulas for the Molecular Weight Calculator.
 * Moved verbatim from the original page.tsx — the atomic weights below are the
 * numbers every result is computed from, so do not edit them casually.
 */
// Define element interface
export interface Element {
    symbol: string;
    name: string;
    atomicNumber: number;
    atomicWeight: number;
    uncertainty?: number;
    group: number;
    period: number;
}

// Periodic table data with atomic weights (IUPAC 2021 values)
export const PERIODIC_TABLE: Element[] = [
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
export const ELEMENT_MAP = new Map(PERIODIC_TABLE.map(elem => [elem.symbol, elem]));

// Common molecular formulas for quick selection
export const COMMON_FORMULAS = [
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
