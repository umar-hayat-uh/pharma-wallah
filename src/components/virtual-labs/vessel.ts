/**
 * Vessel geometry shared by both 3D engines: glassware is turned on a lathe from real
 * dimensions (metres), and a liquid's height is solved from its volume,
 * V(h) = ∫ π r(y)² dy, so "28.55 mL in a 250 mL conical flask" sits at the height it
 * would in the real flask. Pure maths — no 3D library (moved out of three/glass.ts on
 * 2026-10-22 for the Babylon.js chemistry room).
 */

export type Profile = [number, number][]; // [radius, y] from the bottom up

/** Inner radius at height y by linear interpolation of the profile. */
export function radiusAt(p: Profile, y: number) {
  if (y <= p[0][1]) return p[0][0];
  for (let i = 1; i < p.length; i++) {
    if (y <= p[i][1]) {
      const [r0, y0] = p[i - 1];
      const [r1, y1] = p[i];
      return r0 + ((y - y0) / Math.max(1e-9, y1 - y0)) * (r1 - r0);
    }
  }
  return p[p.length - 1][0];
}

/** Height (m) at which `ml` fills the inner profile. */
export function heightForVolume(p: Profile, ml: number) {
  const target = ml / 1e6; // m³
  const top = p[p.length - 1][1];
  const base = p[0][1];
  const dy = (top - base) / 600;
  let v = 0;
  for (let y = base; y < top; y += dy) {
    const r = radiusAt(p, y + dy / 2);
    v += Math.PI * r * r * dy;
    if (v >= target) return y + dy;
  }
  return top;
}
