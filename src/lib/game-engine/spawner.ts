/**
 * Generic weighted-random picker. Used to decide, on each spawn event,
 * what kind of entity to place: e.g. 60% correct pill, 25% wrong pill,
 * 15% fruit. Kept engine-generic so any future game (not just Snake) can
 * reuse the same weighting logic for its own spawn table.
 */
export interface SpawnWeight<T> {
  value: T;
  weight: number;
}

export function pickWeighted<T>(options: SpawnWeight<T>[]): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const opt of options) {
    if (roll < opt.weight) return opt.value;
    roll -= opt.weight;
  }
  return options[options.length - 1].value; // fallback for float rounding
}
