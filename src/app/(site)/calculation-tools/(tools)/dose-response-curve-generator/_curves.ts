/**
 * Sigmoid Emax (Hill) curve generation for the Dose-Response Curve Generator.
 *
 * Pulled out of the page so the maths can be hand-checked with `npx tsx` and
 * compared point-for-point against the pre-migration page. Every expression,
 * guard and point count below is copied verbatim from that page — this module
 * changes nothing about the numbers it produces.
 */

export interface CurveParams {
  id: string;
  name: string;
  emax: number;
  ec50: number;
  hill: number;
  baseline: number;
  color: string;
}

export interface CurvePoint {
  conc: number;
  logConc?: number;
  [seriesId: string]: number | undefined;
}

export interface CurveData {
  linearData: CurvePoint[];
  logData: CurvePoint[];
  yDomainMax: number;
}

/** The original guards a zero or negative EC50 by substituting 0.001. */
export const safeEc50 = (ec50: number) => (ec50 <= 0 ? 0.001 : ec50);

/** E = E0 + (Emax × C^n) / (EC50^n + C^n) */
export function hillEffect(curve: CurveParams, conc: number): number {
  const ec = safeEc50(curve.ec50);
  return (
    curve.baseline +
    (curve.emax * Math.pow(conc, curve.hill)) /
      (Math.pow(ec, curve.hill) + Math.pow(conc, curve.hill))
  );
}

export function generateCurveData(
  curves: CurveParams[],
  maxConc: number,
  pointsPerCurve = 150,
): CurveData {
  if (curves.length === 0) return { linearData: [], logData: [], yDomainMax: 100 };

  let observedMax = 0;

  // Linear scale: 0 → maxConc.
  const linearData: CurvePoint[] = [];
  const step = maxConc / pointsPerCurve;
  for (let i = 0; i <= pointsPerCurve; i++) {
    const conc = i * step;
    const point: CurvePoint = { conc };
    curves.forEach((curve) => {
      const effect = hillEffect(curve, conc);
      point[curve.id] = effect;
      if (effect > observedMax) observedMax = effect;
    });
    linearData.push(point);
  }

  // Log scale, centred on the range of EC50s present.
  const minLog = Math.log10(0.01 * Math.min(...curves.map((c) => safeEc50(c.ec50))));
  const maxLog = Math.log10(100 * Math.max(...curves.map((c) => safeEc50(c.ec50))));
  const logStep = (maxLog - minLog) / pointsPerCurve;
  const logData: CurvePoint[] = [];
  for (let i = 0; i <= pointsPerCurve; i++) {
    const logConc = minLog + i * logStep;
    const conc = Math.pow(10, logConc);
    const point: CurvePoint = { logConc, conc };
    curves.forEach((curve) => {
      const effect = hillEffect(curve, conc);
      point[curve.id] = effect;
      if (effect > observedMax) observedMax = effect;
    });
    logData.push(point);
  }

  // Auto-scale Y to whatever the curves actually reach: baseline + Emax can
  // exceed 100, and a hard clamp would silently flatten the top of the curve.
  return {
    linearData,
    logData,
    yDomainMax: Math.max(100, Math.ceil(observedMax / 10) * 10),
  };
}
