/*
 * Molecular Lab — geometry on 3D coordinates (Å). Only ever called with a real
 * conformer (PubChem's, or one generated and force-field minimised); the UI
 * disables measuring when there is none rather than inventing a value.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const crossV = (a: Vec3, b: Vec3): Vec3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a: Vec3) => Math.sqrt(dot(a, a));

export function distance(a: Vec3, b: Vec3): number {
  return norm(sub(a, b));
}

/** Angle a–b–c at b, in degrees. */
export function angle(a: Vec3, b: Vec3, c: Vec3): number {
  const u = sub(a, b);
  const v = sub(c, b);
  const cos = dot(u, v) / (norm(u) * norm(v));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Signed dihedral a–b–c–d in degrees (−180, 180]. */
export function dihedral(a: Vec3, b: Vec3, c: Vec3, d: Vec3): number {
  const b0 = sub(a, b);
  const b1 = sub(c, b);
  const b2 = sub(d, c);
  const n1 = norm(b1) || 1;
  const b1n = { x: b1.x / n1, y: b1.y / n1, z: b1.z / n1 };
  const v = sub(b0, { x: b1n.x * dot(b0, b1n), y: b1n.y * dot(b0, b1n), z: b1n.z * dot(b0, b1n) });
  const w = sub(b2, { x: b1n.x * dot(b2, b1n), y: b1n.y * dot(b2, b1n), z: b1n.z * dot(b2, b1n) });
  const x = dot(v, w);
  const y = dot(crossV(b1n, v), w);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return deg === -180 ? 180 : deg;
}

export type MeasureKind = "distance" | "angle" | "dihedral";

export const MEASURE_ATOMS: Record<MeasureKind, number> = { distance: 2, angle: 3, dihedral: 4 };

export function measure(kind: MeasureKind, points: Vec3[]): number | null {
  if (points.length !== MEASURE_ATOMS[kind]) return null;
  switch (kind) {
    case "distance": return distance(points[0], points[1]);
    case "angle": return angle(points[0], points[1], points[2]);
    case "dihedral": return dihedral(points[0], points[1], points[2], points[3]);
  }
}

export function formatMeasure(kind: MeasureKind, value: number): string {
  return kind === "distance" ? `${value.toFixed(3)} Å` : `${value.toFixed(1)}°`;
}
