import type { Point, ValidationMatch } from "./types";

/**
 * Development-only metrics for the colony detector: how a detection list
 * compares with known colony positions (or just a known count).
 *
 * These numbers describe one test image. They are not an accuracy claim for
 * real plates unless the dataset and method behind them are documented.
 */

/**
 * Greedy one-to-one matching, closest pairs first. A detection within
 * `tolerance(truth)` pixels of an unmatched true colony is a true positive.
 */
export function matchDetections(
  truth: (Point & { r?: number })[],
  detected: Point[],
  tolerance: (t: Point & { r?: number }) => number = (t) => Math.max(6, (t.r ?? 6) * 1.2),
): ValidationMatch {
  const pairs: { d: number; t: number; k: number }[] = [];
  truth.forEach((t, ti) => {
    const tol = tolerance(t);
    detected.forEach((p, k) => {
      const d = Math.hypot(t.x - p.x, t.y - p.y);
      if (d <= tol) pairs.push({ d, t: ti, k });
    });
  });
  pairs.sort((a, b) => a.d - b.d);
  const usedT = new Set<number>();
  const usedK = new Set<number>();
  for (const pair of pairs) {
    if (usedT.has(pair.t) || usedK.has(pair.k)) continue;
    usedT.add(pair.t);
    usedK.add(pair.k);
  }
  return summarise(truth.length, detected.length, usedT.size);
}

/** Count-only comparison, for fixtures with a manual count but no positions. */
export function compareCounts(expected: number, detected: number): ValidationMatch {
  return {
    ...summarise(expected, detected, Math.min(expected, detected)),
    // Without positions, TP/FP/FN are not knowable.
    precision: null,
    recall: null,
    f1: null,
  };
}

function summarise(expected: number, detected: number, tp: number): ValidationMatch {
  const fp = detected - tp;
  const fn = expected - tp;
  const precision = detected > 0 ? tp / detected : null;
  const recall = expected > 0 ? tp / expected : null;
  const f1 = precision !== null && recall !== null && precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : null;
  return {
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    expected,
    detected,
    absoluteError: Math.abs(detected - expected),
    percentError: expected > 0 ? (Math.abs(detected - expected) / expected) * 100 : null,
    precision,
    recall,
    f1,
  };
}
