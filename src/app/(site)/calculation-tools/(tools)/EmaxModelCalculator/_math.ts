/**
 * Sigmoid Emax (Hill) model — the maths of the original page, moved out of a
 * useEffect into a pure function. Formula, loop bounds, step sizes and the
 * 100 % clamp on the plotted curves are unchanged.
 */

export type EmaxInputs = { emax: string; ec50: string; hill: string; baseline: string; conc: string };

export type EmaxResult = {
    effect: number;
    Em: number;
    EC50: number;
    n: number;
    C: number;
    base: number;
    maxLinear: number;
    minLog: number;
    maxLog: number;
    linear: { conc: number; effect: number }[];
    logData: { logConc: number; effect: number }[];
};

export function computeEmax(input: EmaxInputs): EmaxResult | null {
    const Em = parseFloat(input.emax);
    const EC50 = parseFloat(input.ec50);
    const n = parseFloat(input.hill);
    const C = parseFloat(input.conc);
    const base = parseFloat(input.baseline);

    if (isNaN(Em) || isNaN(EC50) || isNaN(n) || isNaN(C) || EC50 <= 0) return null;

    // Hill equation
    const E = base + (Em * Math.pow(C, n)) / (Math.pow(EC50, n) + Math.pow(C, n));
    // The original only guarded four of the five inputs, so a blank baseline or a
    // negative concentration printed "NaN%". Nothing is shown instead.
    if (!Number.isFinite(E)) return null;

    // Linear scale data (from 0 to 5*EC50)
    const linear: { conc: number; effect: number }[] = [];
    const maxLinear = Math.max(EC50 * 5, C * 1.5);
    for (let x = 0; x <= maxLinear; x += maxLinear / 200) {
        const y = base + (Em * Math.pow(x, n)) / (Math.pow(EC50, n) + Math.pow(x, n));
        linear.push({ conc: x, effect: Math.min(y, 100) });
    }

    // Log scale data (from EC50/100 to EC50*100)
    const logData: { logConc: number; effect: number }[] = [];
    const minLog = Math.log10(EC50 / 100);
    const maxLog = Math.log10(EC50 * 100);
    for (let logC = minLog; logC <= maxLog; logC += (maxLog - minLog) / 200) {
        const x = Math.pow(10, logC);
        const y = base + (Em * Math.pow(x, n)) / (Math.pow(EC50, n) + Math.pow(x, n));
        logData.push({ logConc: logC, effect: Math.min(y, 100) });
    }

    return { effect: E, Em, EC50, n, C, base, maxLinear, minLog, maxLog, linear, logData };
}

/** Bands and wording from the original page (they compare the absolute effect with 50 and 80). */
export function interpretEffect(effect: number): { text: string; band: "below" | "therapeutic" | "plateau" } {
    if (effect < 50) return { text: "Below EC₅₀ – effect less than half maximal.", band: "below" };
    if (effect < 80) return { text: "Therapeutic range – between 50% and 80% of Emax.", band: "therapeutic" };
    return { text: "Near maximal effect – plateau region.", band: "plateau" };
}
