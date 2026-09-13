/*
 * Particle-size-distribution maths of the Surface Area & Particle Size
 * Analyzer, lifted verbatim from the original page's calculateFromSieve /
 * calculateFromLaser / interpolateSize so results can be derived live.
 *
 * Every formula, filter, tolerance and band is unchanged. The alert() calls
 * became `{ ok: false, message }` with the same wording.
 *
 * One type fix: the original stored an edited sieve opening as a STRING in a
 * numeric field, so `point2.size + fraction * (…)` concatenated ("151" + 21.75
 * → "15121.75") and the page crashed on `d50.toFixed`. Openings are parsed
 * with parseFloat here; untouched rows give exactly the numbers they did.
 */

export type Method = "sieve" | "laser";
export type Distribution = "narrow" | "moderate" | "broad";

export type SieveRow = { mesh: string; opening: string; retained: string };
export type LaserRow = { size: string; percentage: string };

export type CumulativePoint = { size: number; cumulative: number };

export type PsdResult = {
    d10: number;
    d50: number;
    d90: number;
    meanDiameter: number;
    specificSurfaceArea: number;
    span: number;
    distribution: Distribution;
    cumulativeData: CumulativePoint[];
    /** Σ % used — shown in the working. */
    total: number;
    density: number;
    rowsUsed: number;
};

export type PsdOutcome = { ok: true; result: PsdResult } | { ok: false; message: string };

export function interpolateSize(data: CumulativePoint[], target: number): number {
    for (let i = 0; i < data.length - 1; i++) {
        const point1 = data[i];
        const point2 = data[i + 1];

        if (target >= point2.cumulative && target <= point1.cumulative) {
            const fraction = (target - point2.cumulative) / (point1.cumulative - point2.cumulative);
            return point2.size + fraction * (point1.size - point2.size);
        }
    }
    return data[0]?.size || 0;
}

function classify(span: number): Distribution {
    let distribution: Distribution = "moderate";
    if (span < 1) distribution = "narrow";
    else if (span > 2) distribution = "broad";
    return distribution;
}

export function calculateFromSieve(sieveData: SieveRow[], density: string): PsdOutcome {
    const validData = sieveData.filter((d) => parseFloat(d.retained) >= 0 && parseFloat(d.retained) <= 100);

    if (validData.length < 2) {
        return { ok: false, message: "Please enter valid sieve analysis data" };
    }

    const totalRetained = validData.reduce((sum, d) => sum + parseFloat(d.retained), 0);
    if (Math.abs(totalRetained - 100) > 5) {
        return { ok: false, message: `Total retained should be ~100% (current: ${totalRetained.toFixed(1)}%)` };
    }

    let cumulative = 0;
    const cumulativeData = validData.map((d) => {
        cumulative += parseFloat(d.retained);
        return {
            size: parseFloat(d.opening),
            cumulative: 100 - cumulative,
        };
    });

    const d10 = interpolateSize(cumulativeData, 10);
    const d50 = interpolateSize(cumulativeData, 50);
    const d90 = interpolateSize(cumulativeData, 90);

    const meanDiameter = Math.sqrt(d10 * d90);
    const span = (d90 - d10) / d50;
    const densityValue = parseFloat(density) || 1;
    const specificSurfaceArea = (6 / (densityValue * (d50 / 1000))) * 1000; // m²/kg

    return {
        ok: true,
        result: {
            d10,
            d50,
            d90,
            meanDiameter,
            specificSurfaceArea,
            span,
            distribution: classify(span),
            cumulativeData,
            total: totalRetained,
            density: densityValue,
            rowsUsed: validData.length,
        },
    };
}

export function calculateFromLaser(particleData: LaserRow[], density: string): PsdOutcome {
    const validData = particleData.filter((d) => parseFloat(d.percentage) >= 0 && parseFloat(d.percentage) <= 100);

    if (validData.length < 2) {
        return { ok: false, message: "Please enter valid particle size distribution data" };
    }

    const totalPercentage = validData.reduce((sum, d) => sum + parseFloat(d.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 5) {
        return { ok: false, message: `Total percentage should be ~100% (current: ${totalPercentage.toFixed(1)}%)` };
    }

    const sortedData = [...validData]
        .map((d) => ({ size: parseFloat(d.size), percentage: parseFloat(d.percentage) }))
        .sort((a, b) => b.size - a.size);

    let cumulative = 0;
    const cumulativeData = sortedData.map((d) => {
        cumulative += d.percentage;
        return {
            size: d.size,
            cumulative: 100 - cumulative,
        };
    });

    const d10 = interpolateSize(cumulativeData, 10);
    const d50 = interpolateSize(cumulativeData, 50);
    const d90 = interpolateSize(cumulativeData, 90);

    const meanDiameter = sortedData.reduce((sum, d) => sum + d.size * d.percentage, 0) / 100;

    const span = (d90 - d10) / d50;
    const densityValue = parseFloat(density) || 1;
    const specificSurfaceArea = (6 / (densityValue * (d50 / 1000))) * 1000;

    return {
        ok: true,
        result: {
            d10,
            d50,
            d90,
            meanDiameter,
            specificSurfaceArea,
            span,
            distribution: classify(span),
            cumulativeData,
            total: totalPercentage,
            density: densityValue,
            rowsUsed: validData.length,
        },
    };
}

/* ── Data sets, unchanged from the original ── */

export const DEFAULT_SIEVE: SieveRow[] = [
    { mesh: "20", opening: "850", retained: "0" },
    { mesh: "40", opening: "425", retained: "5" },
    { mesh: "60", opening: "250", retained: "15" },
    { mesh: "80", opening: "180", retained: "25" },
    { mesh: "100", opening: "150", retained: "20" },
    { mesh: "200", opening: "75", retained: "15" },
    { mesh: "0", opening: "0", retained: "20" }, // Pan
];

export const DEFAULT_LASER: LaserRow[] = [
    { size: "1000", percentage: "5" },
    { size: "500", percentage: "15" },
    { size: "250", percentage: "25" },
    { size: "125", percentage: "20" },
    { size: "63", percentage: "15" },
    { size: "0", percentage: "20" },
];

export const SIEVE_EXAMPLES: Record<"fine" | "coarse", SieveRow[]> = {
    fine: [
        { mesh: "60", opening: "250", retained: "2" },
        { mesh: "80", opening: "180", retained: "8" },
        { mesh: "100", opening: "150", retained: "20" },
        { mesh: "200", opening: "75", retained: "40" },
        { mesh: "325", opening: "45", retained: "20" },
        { mesh: "0", opening: "0", retained: "10" },
    ],
    coarse: [
        { mesh: "20", opening: "850", retained: "15" },
        { mesh: "40", opening: "425", retained: "30" },
        { mesh: "60", opening: "250", retained: "25" },
        { mesh: "80", opening: "180", retained: "15" },
        { mesh: "100", opening: "150", retained: "10" },
        { mesh: "200", opening: "75", retained: "5" },
        { mesh: "0", opening: "0", retained: "0" },
    ],
};

export const LASER_EXAMPLES: Record<"fine" | "coarse", LaserRow[]> = {
    fine: [
        { size: "100", percentage: "5" },
        { size: "50", percentage: "15" },
        { size: "25", percentage: "30" },
        { size: "10", percentage: "30" },
        { size: "5", percentage: "15" },
        { size: "1", percentage: "5" },
    ],
    coarse: [
        { size: "1000", percentage: "10" },
        { size: "500", percentage: "25" },
        { size: "250", percentage: "30" },
        { size: "125", percentage: "20" },
        { size: "63", percentage: "10" },
        { size: "0", percentage: "5" },
    ],
};
