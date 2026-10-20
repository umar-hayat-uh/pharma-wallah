/**
 * Room-building helpers shared by the four rooms: place an object, register it as
 * interactive with a close-up pose framed from its own bounding box, and add colliders.
 */
import * as THREE from "three";
import type { MaterialLib } from "../materials";
import type { Collider, Interactive, Pose } from "../types";
import { bench, footprint, mesh, rbox, stool, wallSign, poster } from "../kit";

export class RoomBuilder {
  root = new THREE.Group();
  interactives: Interactive[] = [];
  colliders: Collider[] = [];
  constructor(public m: MaterialLib) {}

  place<T extends THREE.Object3D>(obj: T, x: number, y: number, z: number, ry = 0, parent: THREE.Object3D = this.root): T {
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    parent.add(obj);
    return obj;
  }

  /** Floor-standing furniture with a collider. */
  furniture<T extends THREE.Object3D>(obj: T, x: number, z: number, w: number, d: number, ry = 0): T {
    this.place(obj, x, 0, z, ry);
    this.colliders.push(footprint(x, z, w, d, ry, 0.05));
    return obj;
  }

  /**
   * Register interactive equipment. The close-up looks at the object's bounding-box
   * centre from `dir` (a horizontal direction toward the viewer), at a distance that
   * frames the object, slightly from above.
   */
  interactive(id: string, label: string, obj: THREE.Object3D, o: { dir?: [number, number]; dist?: number; lift?: number; target?: [number, number, number] } = {}) {
    this.root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(obj);
    const c = o.target ? new THREE.Vector3(...o.target) : bb.getCenter(new THREE.Vector3());
    const size = bb.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.y, size.z);
    const dist = o.dist ?? Math.max(0.35, span * 1.6);
    const [dx, dz] = o.dir ?? [0, 1];
    const len = Math.hypot(dx, dz) || 1;
    const focus: Pose = {
      pos: [c.x + (dx / len) * dist, c.y + (o.lift ?? Math.max(0.08, span * 0.35)), c.z + (dz / len) * dist],
      target: [c.x, c.y, c.z],
    };
    this.interactives.push({ id, label, object: obj, focus });
    return obj;
  }

  /** A bench placed in the room, with its collider. */
  bench(o: Parameters<typeof bench>[1], x: number, z: number, ry = 0) {
    const b = bench(this.m, o);
    return this.furniture(b, x, z, o.w, o.d ?? 0.75, ry);
  }

  /** Back-to-back island: two benches sharing a spine with a reagent shelf. */
  island(w: number, x: number, z: number, top: "epoxy" | "white" | "wood" = "epoxy", seed = 1) {
    const g = new THREE.Group();
    const front = bench(this.m, { w, top, shelf: false, seed });
    front.position.z = 0.375;
    const back = bench(this.m, { w, top, shelf: false, seed: seed + 1 });
    back.position.z = -0.375;
    back.rotation.y = Math.PI;
    const shelf = bench(this.m, { w, top, shelf: true, seed: seed + 2 });
    // reuse only the shelf part of a third bench: hide its cabinets by taking its last child
    const shelfOnly = shelf.children[shelf.children.length - 1];
    g.add(front, back, shelfOnly);
    g.add(mesh(rbox(w, 0.035, 0.06, 0.006), this.m.cabinet, 0, 0.9, 0));
    return this.furniture(g, x, z, w, 1.5);
  }

  sign(kind: Parameters<typeof wallSign>[0], caption: string, x: number, y: number, z: number, ry: number) {
    return this.place(wallSign(kind, caption), x, y, z, ry);
  }

  poster(title: string, lines: string[], x: number, y: number, z: number, ry: number, accent?: string) {
    return this.place(poster(title, lines, accent), x, y, z, ry);
  }

  stools(xs: number[], z: number) {
    for (const x of xs) this.furniture(stool(this.m), x, z, 0.36, 0.36);
  }
}

/** Bench-top height used by every room. */
export const TOP = 0.91;
