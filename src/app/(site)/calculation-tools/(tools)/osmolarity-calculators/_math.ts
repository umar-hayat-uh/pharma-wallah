/**
 * Osmolarity maths — lifted verbatim from the original page's six
 * `calculate…` handlers (formulas, constants, thresholds and strings unchanged).
 * Each function is pure and returns null when an input is not a finite number,
 * so the page never renders NaN.
 */

export type Tone = "neutral" | "success" | "warning" | "danger";

export type OsmResult = {
    osmolarity: number;
    interpretation: string;
    tone: Tone;
    formula: string;
    tonicity?: string;
};

export type Solute = { id: number; name: string; concentration: number; dissociation: number };

const finite = (...values: number[]) => values.every((v) => Number.isFinite(v));

/* ── 1. General: Σ(C × i) ─────────────────────────────────────────────────── */
export function generalOsmolarity(solutes: Solute[]): OsmResult | null {
    let totalOsmolarity = 0;
    solutes.forEach((solute) => {
        totalOsmolarity += solute.concentration * solute.dissociation;
    });
    if (!finite(totalOsmolarity)) return null;

    let tonicity = "Isotonic";
    if (totalOsmolarity < 250) tonicity = "Hypotonic";
    else if (totalOsmolarity > 375) tonicity = "Hypertonic";

    return {
        osmolarity: totalOsmolarity,
        tonicity,
        interpretation:
            tonicity === "Isotonic"
                ? "Solution matches physiological osmolarity"
                : tonicity === "Hypotonic"
                  ? "May cause hemolysis in red blood cells"
                  : "May cause cellular dehydration",
        tone: tonicity === "Isotonic" ? "success" : "warning",
        formula: "Osmolarity = Σ(Concentration × Dissociation factor)",
    };
}

/* ── 2. Serum: 2×Na + Glucose/18 + BUN/2.8 ───────────────────────────────── */
export type SerumMethod = "standard" | "advanced";

export function serumOsmolarity(na: number, glu: number, urea: number, method: SerumMethod) {
    if (!finite(na, glu, urea)) return null;

    let osmolarity = 0;
    let formula = "";
    if (method === "standard") {
        osmolarity = 2 * na + glu / 18 + urea / 2.8;
        formula = "2×Na + Glucose/18 + BUN/2.8";
    } else {
        // Original behaviour: the "advanced" method shows the ethanol formula
        // but adds no ethanol term (reported as a suspected issue, not fixed).
        osmolarity = 2 * na + glu / 18 + urea / 2.8;
        formula = "2×Na + Glucose/18 + BUN/2.8 + Ethanol/4.6";
    }

    let interpretation = "";
    let tone: Tone = "success";
    if (osmolarity < 275) { interpretation = "Hypotonic - Possible water intoxication"; tone = "warning"; }
    else if (osmolarity <= 295) interpretation = "Normal serum osmolarity";
    else if (osmolarity <= 320) { interpretation = "Hypertonic - Mild dehydration"; tone = "warning"; }
    else { interpretation = "Severely hypertonic - Critical condition"; tone = "danger"; }

    const osmolarGap = osmolarity - (2 * na + glu / 18 + urea / 2.8);
    let gapInterpretation = "";
    if (osmolarGap < 10) gapInterpretation = "Normal osmolar gap";
    else if (osmolarGap <= 20) gapInterpretation = "Moderately elevated - possible toxins";
    else gapInterpretation = "Markedly elevated - toxic alcohols likely";

    const result: OsmResult = { osmolarity, interpretation: `${interpretation}. ${gapInterpretation}`, tone, formula };
    return { ...result, terms: { sodium: 2 * na, glucose: glu / 18, bun: urea / 2.8 }, osmolarGap };
}

/* ── 3. Plasma: 2×(Na + K) + Glucose + Urea ──────────────────────────────── */
export function plasmaOsmolarity(na: number, k: number, glu: number, ur: number) {
    if (!finite(na, k, glu, ur)) return null;
    const osmolarity = 2 * (na + k) + glu + ur;

    let interpretation = "";
    let tone: Tone = "success";
    if (osmolarity < 280) { interpretation = "Hypo-osmolar - Consider SIADH, water intoxication"; tone = "warning"; }
    else if (osmolarity <= 300) interpretation = "Normal plasma osmolarity";
    else if (osmolarity <= 320) { interpretation = "Mild hyper-osmolarity - Monitor hydration"; tone = "warning"; }
    else { interpretation = "Severe hyper-osmolarity - Requires immediate attention"; tone = "danger"; }

    const result: OsmResult = { osmolarity, interpretation, tone, formula: "2×(Na⁺ + K⁺) + Glucose + Urea" };
    return { ...result, components: { electrolytes: 2 * (na + k), glucose: glu, urea: ur } };
}

/* ── 4. IV fluids ────────────────────────────────────────────────────────── */
export const IV_FLUIDS = [
    { id: "ns", name: "Normal Saline (0.9% NaCl)", osmolarity: 308 },
    { id: "halfns", name: "Half Normal Saline (0.45% NaCl)", osmolarity: 154 },
    { id: "d5w", name: "D5W (5% Dextrose)", osmolarity: 252 },
    { id: "lr", name: "Lactated Ringer's", osmolarity: 273 },
    { id: "d5ns", name: "D5 Normal Saline", osmolarity: 560 },
    { id: "custom", name: "Custom Fluid", osmolarity: 0 },
];

export function ivOsmolarity(selectedFluid: string, nacl: number, dextrose: number) {
    let osmolarity = 0;
    let formula = "";
    let naclTerm: number | null = null;
    let dextroseTerm: number | null = null;

    if (selectedFluid === "custom") {
        if (!finite(nacl, dextrose)) return null;
        // NaCl: 0.9% = 154 mmol/L = 308 mOsm/L; Dextrose: 5% = 278 mmol/L = 278 mOsm/L
        naclTerm = (nacl / 0.9) * 308;
        dextroseTerm = (dextrose / 5) * 278;
        osmolarity = (nacl / 0.9) * 308 + (dextrose / 5) * 278;
        formula = "(NaCl % ÷ 0.9) × 308 + (Dextrose % ÷ 5) × 278";
    } else {
        const fluid = IV_FLUIDS.find((f) => f.id === selectedFluid);
        osmolarity = fluid?.osmolarity || 0;
        formula = "Pre-calculated value";
    }

    let interpretation = "";
    let tone: Tone = "success";
    if (osmolarity < 250) { interpretation = "Hypotonic - May cause hemolysis if given rapidly"; tone = "warning"; }
    else if (osmolarity <= 375) interpretation = "Isotonic - Safe for peripheral administration";
    else if (osmolarity <= 900) { interpretation = "Moderately hypertonic - Consider central line"; tone = "warning"; }
    else { interpretation = "Highly hypertonic - Requires central line"; tone = "danger"; }

    const result: OsmResult = {
        osmolarity,
        interpretation,
        tone,
        formula,
        tonicity: osmolarity < 250 ? "Hypotonic" : osmolarity <= 375 ? "Isotonic" : "Hypertonic",
    };
    return { ...result, naclTerm, dextroseTerm };
}

/* ── 5. TPN ──────────────────────────────────────────────────────────────── */
export function tpnOsmolarity(aa: number, dex: number, lip: number, na: number, k: number, ca: number, mg: number, po4: number) {
    if (!finite(aa, dex, lip, na, k, ca, mg, po4)) return null;

    // Approximation formulas for TPN components (original comments kept)
    const aaOsm = aa * 100; // ~100 mOsm/L per 1% AA
    const dexOsm = dex * 50; // ~50 mOsm/L per 1% dextrose
    const lipidOsm = lip * 20; // ~20 mOsm/L per 1% lipid
    const electrolyteOsm = (na + k) * 2 + ca * 3 + mg * 2 + po4 * 4;

    const totalOsmolarity = aaOsm + dexOsm + lipidOsm + electrolyteOsm;

    let route = "";
    let tone: Tone = "success";
    if (totalOsmolarity < 900) route = "Suitable for peripheral administration";
    else if (totalOsmolarity < 1200) { route = "Borderline - Consider central line"; tone = "warning"; }
    else { route = "Requires central venous access"; tone = "danger"; }

    const result: OsmResult = {
        osmolarity: totalOsmolarity,
        interpretation: route,
        tone,
        formula: "Amino Acids × 100 + Dextrose × 50 + Lipids × 20 + Electrolytes",
    };
    return { ...result, components: { aminoAcids: aaOsm, dextrose: dexOsm, lipids: lipidOsm, electrolytes: electrolyteOsm } };
}

/* ── 6. Buffers ──────────────────────────────────────────────────────────── */
export const BUFFERS = [
    { id: "pbs", name: "Phosphate Buffered Saline", baseOsmolarity: 290 },
    { id: "tris", name: "Tris Buffer", baseOsmolarity: 250 },
    { id: "hepes", name: "HEPES Buffer", baseOsmolarity: 280 },
    { id: "acetate", name: "Acetate Buffer", baseOsmolarity: 270 },
    { id: "carbonate", name: "Carbonate Buffer", baseOsmolarity: 300 },
    { id: "custom", name: "Custom Buffer", baseOsmolarity: 0 },
];

export function bufferOsmolarity(bufferType: string, conc: number, pHValue: number) {
    if (!finite(conc, pHValue)) return null;

    let osmolarity = 0;
    let formula = "";
    let base = 300;

    const buffer = BUFFERS.find((b) => b.id === bufferType);
    if (buffer && buffer.id !== "custom") {
        base = buffer.baseOsmolarity;
        osmolarity = buffer.baseOsmolarity * conc;
        formula = `Base osmolarity (${buffer.baseOsmolarity} mOsm/L) × Concentration`;
    } else {
        osmolarity = 300 * conc; // Approximation
        formula = "Estimated 300 mOsm/L × Concentration";
    }
    const beforePh = osmolarity;

    // Adjust for pH (approximation)
    const pHAdjustment = Math.abs(pHValue - 7.4) * 10;
    osmolarity += pHAdjustment;

    let interpretation = "";
    let tone: Tone = "success";
    if (osmolarity < 250) { interpretation = "Hypotonic buffer - May affect cell volume"; tone = "warning"; }
    else if (osmolarity <= 350) interpretation = "Physiological buffer - Suitable for most applications";
    else { interpretation = "Hypertonic buffer - Use with caution for cell work"; tone = "warning"; }

    const recommendedUse =
        bufferType === "pbs"
            ? "Cell culture, immunohistochemistry"
            : bufferType === "tris"
              ? "DNA/RNA work, protein assays"
              : bufferType === "hepes"
                ? "Cell culture, enzyme assays"
                : "General laboratory use";

    const result: OsmResult = { osmolarity, interpretation, tone, formula };
    return { ...result, base, beforePh, pHAdjustment, recommendedUse };
}

/** Whole number as the original showed it (`toFixed(0)`), never "-0". */
export function fmt0(value: number): string {
    const text = value.toFixed(0);
    return text === "-0" ? "0" : text;
}

/** Fixed decimals for working rows, never "-0.00". */
export function fmt(value: number, decimals = 2): string {
    const text = value.toFixed(decimals);
    return /^-0\.?0*$/.test(text) ? text.slice(1) : text;
}
