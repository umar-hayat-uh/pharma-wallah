/**
 * Probit (log-dose / probit) regression for the ED50-TD50-LD50 calculator.
 *
 * Pulled out of the page so the arithmetic can be hand-checked with node and
 * compared against the pre-migration page. Every expression, constant and
 * rounding below is copied verbatim from that page.
 *
 * KNOWN FAULTS, preserved deliberately (migration rule: identical numbers; a
 * formula that looks wrong is reported, never silently fixed). All three are
 * recorded in .claude/redesign-tracker.md:
 *   1. `probitTransform` returns the UPPER-tail deviate for every p. The
 *      Hastings approximation gives |z|; for p < 0.5 it must be negated. Without
 *      that, probits below 50% response come out above 5 instead of below it,
 *      which inverts the fitted slope (a real data set yields a negative slope).
 *   2. `ed50` is assigned `ld50` — the ED50 reported is the LD50, not a
 *      separately fitted effective dose.
 *   3. No TD50 is computed at all, despite the tool's name.
 * Because the slope is inverted, the chi-square and the confidence interval
 * derived from it are not trustworthy either.
 */

export interface DoseRow {
  dose: string;
  response: string;
  n: string;
}

export interface ProbitResult {
  ed50: number;
  ld50: number;
  slope: number;
  intercept: number;
  probitLineEquation: string;
  confidenceInterval: { lower: number; upper: number };
  chiSquare: number;
  goodnessOfFit: string;
  mortalityRates: Array<{ dose: number; observed: number; expected: number }>;
  classification: string;
  riskLevel: string;
  lineData: Array<{ logDose: number; fittedProbit: number }>;
  scatterData: Array<{ logDose: number; observedProbit: number }>;
  slopeInverted: boolean;
}

export type ProbitOutcome =
  | { ok: true; result: ProbitResult }
  | { ok: false; error: string };

/** Probit transform: inverse standard normal CDF + 5, Hastings (1955). */
export function probitTransform(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const t = Math.sqrt(-2 * Math.log(p));
  const probit =
    t -
    ((0.010328 * t + 0.802853) * t + 2.515517) /
      (((0.001308 * t + 0.189269) * t + 1.432788) * t + 1);
  return probit + 5;
}

export function runProbitAnalysis(rows: DoseRow[]): ProbitOutcome | null {
  const validData = rows.filter(
    (d) =>
      d.dose && d.response && d.n &&
      parseFloat(d.dose) > 0 &&
      parseFloat(d.response) >= 0 &&
      parseFloat(d.n) > 0,
  );

  if (validData.length < 3) {
    return {
      ok: false,
      error: "Enter at least 3 valid dose-response data points for probit analysis.",
    };
  }

  const data = validData
    .map((d) => ({
      dose: parseFloat(d.dose),
      response: parseFloat(d.response),
      n: parseFloat(d.n),
      p: parseFloat(d.response) / 100,
      logDose: Math.log10(parseFloat(d.dose)),
    }))
    .sort((a, b) => a.dose - b.dose);

  // 0% and 100% responses have no finite probit, so they are excluded from the fit.
  const transformable = data.filter((d) => d.p > 0 && d.p < 1);
  if (transformable.length < 2) {
    return { ok: false, error: "Need at least two points with a response between 0% and 100%." };
  }

  const transformed = transformable.map((d) => ({
    ...d,
    probit: probitTransform(d.p),
    weight: d.n * d.p * (1 - d.p),
  }));

  // Weighted linear regression: probit = a + b × logDose.
  let sumW = 0, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  transformed.forEach((d) => {
    const w = d.weight;
    sumW += w;
    sumX += w * d.logDose;
    sumY += w * d.probit;
    sumXY += w * d.logDose * d.probit;
    sumX2 += w * d.logDose * d.logDose;
  });

  const meanX = sumX / sumW;
  const meanY = sumY / sumW;
  const Sxx = sumX2 - (sumX * sumX) / sumW;
  const Sxy = sumXY - (sumX * sumY) / sumW;

  const slope = Sxy / Sxx;
  const intercept = meanY - slope * meanX;

  // LD50 is the dose at probit = 5 (50% response).
  const logLD50 = (5 - intercept) / slope;
  const ld50 = Math.pow(10, logLD50);
  const ed50 = ld50; // fault 2 — preserved

  const residualVariance =
    transformed.reduce((sum, d) => {
      const pred = intercept + slope * d.logDose;
      return sum + d.weight * Math.pow(d.probit - pred, 2);
    }, 0) /
    (transformed.length - 2);
  const seLog = Math.sqrt(residualVariance / (slope * slope * Sxx));
  const tValue = 1.96; // 95%
  const confidenceInterval = {
    lower: Math.pow(10, logLD50 - tValue * seLog),
    upper: Math.pow(10, logLD50 + tValue * seLog),
  };

  let chiSquare = 0;
  const mortalityRates = data.map((d) => {
    const expectedProbit = intercept + slope * Math.log10(d.dose);
    const expectedP = 1 / (1 + Math.exp((-(expectedProbit - 5) * Math.PI) / Math.sqrt(3)));
    const expectedDeaths = expectedP * d.n;
    const observedDeaths = d.p * d.n;
    chiSquare += Math.pow(observedDeaths - expectedDeaths, 2) / (expectedDeaths * (1 - expectedP));
    return { dose: d.dose, observed: d.p * 100, expected: expectedP * 100 };
  });

  const df = transformed.length - 2;
  const criticalChi = df === 1 ? 3.84 : df === 2 ? 5.99 : df === 3 ? 7.81 : 9.49;
  const goodnessOfFit = chiSquare < criticalChi ? "GOOD FIT (p > 0.05)" : "POOR FIT (p < 0.05)";

  // Hodge & Sterner acute toxicity bands.
  let classification = "";
  let riskLevel = "";
  if (ld50 < 1) { classification = "HIGHLY TOXIC"; riskLevel = "EXTREME RISK"; }
  else if (ld50 < 50) { classification = "TOXIC"; riskLevel = "HIGH RISK"; }
  else if (ld50 < 500) { classification = "MODERATELY TOXIC"; riskLevel = "MODERATE RISK"; }
  else if (ld50 < 5000) { classification = "SLIGHTLY TOXIC"; riskLevel = "LOW RISK"; }
  else { classification = "PRACTICALLY NON‑TOXIC"; riskLevel = "VERY LOW RISK"; }

  const logDoses = data.map((d) => Math.log10(d.dose));
  const minLog = Math.min(...logDoses);
  const maxLog = Math.max(...logDoses);
  const lineData: Array<{ logDose: number; fittedProbit: number }> = [];
  for (let i = 0; i <= 100; i++) {
    const logDose = minLog + ((maxLog - minLog) * i) / 100;
    lineData.push({ logDose, fittedProbit: intercept + slope * logDose });
  }

  const scatterData = data
    .filter((d) => d.p > 0 && d.p < 1)
    .map((d) => ({ logDose: Math.log10(d.dose), observedProbit: probitTransform(d.p) }));

  return {
    ok: true,
    result: {
      ed50,
      ld50,
      slope,
      intercept,
      probitLineEquation: `Probit = ${intercept.toFixed(2)} + ${slope.toFixed(2)} × log(Dose)`,
      confidenceInterval,
      chiSquare: parseFloat(chiSquare.toFixed(3)),
      goodnessOfFit,
      mortalityRates,
      classification,
      riskLevel,
      lineData,
      scatterData,
      // A rising dose must raise mortality, so a negative slope signals fault 1.
      slopeInverted: slope < 0,
    },
  };
}
