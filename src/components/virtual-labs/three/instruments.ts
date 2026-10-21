/**
 * Instruments — original procedural models with working parts. Each returns its group
 * plus setters the room calls from the experiment's visual state, so what the student
 * sees on the instrument (a balance display, a recorder trace, the objective in place)
 * is always the experiment's own number.
 */
import * as THREE from "three";
import type { MaterialLib } from "./materials";
import { box, cyl, mesh, rbox } from "./kit";
import { lcdTexture, labelTexture } from "./textures";

// ── Balances ──────────────────────────────────────────────────────────────

/** Analytical balance (0.1 mg) with a sliding-door draught shield. */
export function analyticalBalance(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.22, 0.08, 0.36, 0.015), m.plasticWhite, 0, 0.04, 0));
  g.add(mesh(rbox(0.22, 0.03, 0.08, 0.01), m.plasticGrey, 0, 0.085, 0.14));
  const lcd = lcdTexture(512, 140);
  const screen = mesh(box(0.13, 0.03, 0.002), new THREE.MeshBasicMaterial({ map: lcd.texture }), 0, 0.086, 0.181, false);
  screen.rotation.x = -0.35;
  g.add(screen);
  for (const x of [-0.08, 0.08]) g.add(mesh(cyl(0.008, 0.008, 0.006, 16), m.accentBlue, x, 0.09, 0.17, false));
  // pan
  g.add(mesh(cyl(0.045, 0.045, 0.004, 40), m.chrome, 0, 0.1, -0.03));
  g.add(mesh(cyl(0.008, 0.008, 0.02, 12), m.chrome, 0, 0.09, -0.03));
  // draught shield
  const shield = new THREE.Group();
  shield.add(mesh(box(0.2, 0.2, 0.004), m.glass, 0, 0.19, -0.17, false));
  shield.add(mesh(box(0.2, 0.004, 0.25), m.glass, 0, 0.29, -0.045, false));
  shield.add(mesh(box(0.2, 0.2, 0.004), m.glass, 0, 0.19, 0.08, false));
  for (const x of [-0.1, 0.1]) for (const z of [-0.17, 0.08]) shield.add(mesh(box(0.008, 0.2, 0.008), m.plasticGrey, x, 0.19, z, false));
  const doors: THREE.Mesh[] = [];
  for (const x of [-0.101, 0.101]) {
    const d = mesh(box(0.004, 0.19, 0.24), m.glass, x, 0.19, -0.045, false);
    d.add(mesh(box(0.006, 0.05, 0.012), m.plasticGrey, x < 0 ? -0.004 : 0.004, 0, 0.1, false));
    doors.push(d);
    shield.add(d);
  }
  g.add(shield);
  const boat = new THREE.Group();
  boat.add(mesh(new THREE.BoxGeometry(0.05, 0.002, 0.05), m.plasticWhite, 0, 0, 0, false));
  const heap = mesh(new THREE.ConeGeometry(0.018, 0.01, 20), m.powderWhite, 0, 0.006, 0, false);
  boat.add(heap);
  boat.position.set(0, 0.104, -0.03);
  g.add(boat);
  return {
    group: g,
    set(v: { boatOn: boolean; sampleG: number; display: string; stable: boolean; doorsClosed: boolean; unit?: string }) {
      boat.visible = v.boatOn;
      heap.visible = v.sampleG > 0.001;
      heap.scale.setScalar(Math.max(0.3, Math.min(1.4, Math.cbrt(v.sampleG))));
      lcd.draw(v.display, v.stable ? "● stable" : "○ unstable — close the doors");
      for (const d of doors) d.position.z = v.doorsClosed ? -0.045 : -0.2;
    },
  };
}

/** Top-pan balance (0.01 g). */
export function topPanBalance(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.2, 0.06, 0.28, 0.012), m.plasticWhite, 0, 0.03, 0));
  const lcd = lcdTexture(512, 140);
  const screen = mesh(box(0.12, 0.03, 0.002), new THREE.MeshBasicMaterial({ map: lcd.texture }), 0, 0.045, 0.141, false);
  g.add(screen);
  g.add(mesh(rbox(0.16, 0.006, 0.16, 0.003), m.brushed, 0, 0.065, -0.03));
  const boat = new THREE.Group();
  boat.add(mesh(new THREE.BoxGeometry(0.08, 0.002, 0.08), m.plasticWhite, 0, 0, 0, false));
  const heap = mesh(new THREE.ConeGeometry(0.035, 0.03, 24), m.powderWhite, 0, 0.016, 0, false);
  boat.add(heap);
  boat.position.set(0, 0.07, -0.03);
  g.add(boat);
  return {
    group: g,
    set(v: { boatOn: boolean; sampleG: number; display: string }) {
      boat.visible = v.boatOn;
      heap.visible = v.sampleG > 0.05;
      heap.scale.setScalar(Math.max(0.2, Math.min(1.3, Math.cbrt(v.sampleG / 85))));
      lcd.draw(v.display, "g");
    },
  };
}

// ── Heat, support, small items ─────────────────────────────────────────────

export function hotPlate(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.2, 0.09, 0.3, 0.015), m.plasticWhite, 0, 0.045, 0));
  const top = mesh(rbox(0.18, 0.008, 0.18, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xf1f2f2, roughness: 0.25, clearcoat: 0.6, emissive: 0x000000 }), 0, 0.094, -0.04);
  top.material.userData.fixedEmissive = true;
  g.add(top);
  for (const x of [-0.05, 0.05]) {
    const k = mesh(cyl(0.017, 0.017, 0.02, 24), m.plasticDark, x, 0.045, 0.15, false);
    k.rotation.x = Math.PI / 2;
    g.add(k);
  }
  const led = mesh(new THREE.SphereGeometry(0.004, 10, 8), new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0x000000 }), 0, 0.07, 0.151, false);
  (led.material as THREE.MeshStandardMaterial).userData.fixedEmissive = true;
  g.add(led);
  const lcd = lcdTexture(256, 96, "#1a1f26", "#ffb37a");
  g.add(mesh(box(0.06, 0.022, 0.002), new THREE.MeshBasicMaterial({ map: lcd.texture }), 0, 0.045, 0.151, false));
  return {
    group: g,
    set(v: { heating: boolean; setpoint: number }) {
      (led.material as THREE.MeshStandardMaterial).emissive.setHex(v.heating ? 0xff2200 : 0x000000);
      (top.material as THREE.MeshPhysicalMaterial).emissive.setHex(v.heating && v.setpoint >= 100 ? 0x2a0800 : 0x000000);
      lcd.draw(v.heating ? `${v.setpoint}°` : "OFF");
    },
  };
}

export function retortStand(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.16, 0.012, 0.26, 0.004), m.darkMetal, 0, 0.006, 0));
  g.add(mesh(cyl(0.0065, 0.0065, 0.75, 16), m.chrome, 0, 0.38, -0.08));
  // boss + double burette clamp at the height that holds the burette
  const clamp = new THREE.Group();
  clamp.add(mesh(box(0.03, 0.03, 0.03), m.darkMetal, 0, 0, 0));
  clamp.add(mesh(box(0.012, 0.012, 0.08), m.chrome, 0, 0, 0.045));
  clamp.add(mesh(rbox(0.05, 0.02, 0.02, 0.004), m.accentBlue, 0, 0, 0.085));
  clamp.position.set(0, 0.62, -0.08);
  g.add(clamp);
  return g;
}

export function whiteTile(m: MaterialLib) {
  return mesh(rbox(0.15, 0.008, 0.15, 0.003), m.tileWhite, 0, 0.004, 0);
}

export function spiritLamp(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(0.035, 24, 16, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.8), m.glass, 0, 0.03, 0));
  g.add(mesh(cyl(0.01, 0.012, 0.02, 16), m.brushed, 0, 0.065, 0));
  g.add(mesh(cyl(0.004, 0.004, 0.012, 8), m.paper, 0, 0.08, 0));
  return g;
}

export function micropipette(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.011, 0.009, 0.14, 20), m.plasticWhite, 0, 0.12, 0));
  g.add(mesh(cyl(0.007, 0.007, 0.03, 16), m.accentBlue, 0, 0.205, 0));
  g.add(mesh(cyl(0.004, 0.0015, 0.06, 12), new THREE.MeshPhysicalMaterial({ color: 0xffe9a6, transparent: true, opacity: 0.6 }), 0, 0.02, 0));
  g.add(mesh(box(0.012, 0.025, 0.006), m.screen, 0, 0.15, 0.01, false));
  g.rotation.z = 0.25;
  return g;
}

/** Microscope slide with a mount drawn as it is prepared (0 clean → 3 coverslipped). */
export function slide(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(box(0.076, 0.001, 0.026), m.glass, 0, 0.0005, 0, false));
  g.add(mesh(box(0.02, 0.0012, 0.024), new THREE.MeshStandardMaterial({ color: 0xe9e3d0, roughness: 0.9 }), -0.027, 0.0006, 0, false));
  const powder = mesh(cyl(0.004, 0.005, 0.001, 16), m.powderBrown, 0, 0.0012, 0, false);
  const drop = mesh(new THREE.SphereGeometry(0.007, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xc8a46a, transparent: true, opacity: 0.55, roughness: 0.05 }), 0, 0.001, 0, false);
  drop.scale.y = 0.25;
  const cover = mesh(box(0.022, 0.0003, 0.022), m.glass, 0, 0.0025, 0, false);
  g.add(powder, drop, cover);
  return {
    group: g,
    set(stage: number) {
      powder.visible = stage >= 1;
      drop.visible = stage >= 2;
      cover.visible = stage >= 3;
      drop.scale.set(stage >= 3 ? 1.5 : 1, stage >= 3 ? 0.08 : 0.25, stage >= 3 ? 1.5 : 1);
    },
  };
}

// ── Compound microscope ───────────────────────────────────────────────────

export function compoundMicroscope(m: MaterialLib) {
  const g = new THREE.Group();
  const body = new THREE.MeshPhysicalMaterial({ color: 0xf4f6f8, roughness: 0.32, clearcoat: 0.5 });
  // base with illuminator
  g.add(mesh(rbox(0.18, 0.045, 0.24, 0.02), body, 0, 0.0225, 0));
  const lamp = mesh(cyl(0.022, 0.022, 0.006, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, roughness: 0.2 }), 0, 0.048, 0.02, false);
  (lamp.material as THREE.MeshStandardMaterial).userData.fixedEmissive = true;
  g.add(lamp);
  const beam = new THREE.PointLight(0xfff3d8, 0, 0.6, 2);
  beam.position.set(0, 0.1, 0.02);
  g.add(beam);
  // pillar + arm (curved)
  const armCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.04, -0.09), new THREE.Vector3(0, 0.2, -0.1), new THREE.Vector3(0, 0.31, -0.06), new THREE.Vector3(0, 0.34, 0.0)]);
  g.add(mesh(new THREE.TubeGeometry(armCurve, 40, 0.025, 20, false), body, 0, 0, 0));
  // focus knobs (coarse large, fine small), both sides
  for (const s of [-1, 1]) {
    const coarse = mesh(cyl(0.028, 0.028, 0.016, 32), m.plasticDark, s * 0.035, 0.13, -0.09);
    coarse.rotation.z = Math.PI / 2;
    const fine = mesh(cyl(0.016, 0.016, 0.014, 28), m.plasticGrey, s * 0.05, 0.13, -0.09);
    fine.rotation.z = Math.PI / 2;
    g.add(coarse, fine);
  }
  // stage with clips and mechanical-stage knob
  g.add(mesh(rbox(0.14, 0.01, 0.13, 0.004), m.plasticDark, 0, 0.13, 0.02));
  g.add(mesh(cyl(0.01, 0.01, 0.011, 16), m.darkMetal, 0, 0.125, 0.02, false));
  for (const x of [-0.035, 0.035]) g.add(mesh(box(0.008, 0.003, 0.05), m.chrome, x, 0.137, 0.04, false));
  const stageKnob = mesh(cyl(0.01, 0.01, 0.04, 16), m.plasticDark, 0.075, 0.11, 0.05);
  g.add(stageKnob);
  // condenser below the stage
  g.add(mesh(cyl(0.02, 0.016, 0.03, 24), m.darkMetal, 0, 0.105, 0.02));
  // revolving nosepiece with three objectives
  const nose = new THREE.Group();
  nose.add(mesh(cyl(0.03, 0.035, 0.02, 32), m.chrome, 0, 0, 0));
  const objectives: [number, number, number][] = [[4, 0.028, 0xd02020], [10, 0.034, 0xf0c000], [40, 0.042, 0x2a7ad8]];
  objectives.forEach(([, len, colour], i) => {
    const o = new THREE.Group();
    o.add(mesh(cyl(0.009, 0.007, len, 20), m.chrome, 0, -len / 2 - 0.01, 0));
    o.add(mesh(cyl(0.0092, 0.0092, 0.003, 20), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.4 }), 0, -0.016, 0, false));
    o.rotation.x = 0.35;
    o.rotation.y = (i * Math.PI * 2) / 3;
    o.position.set(Math.sin((i * Math.PI * 2) / 3) * 0.018, 0, Math.cos((i * Math.PI * 2) / 3) * 0.018);
    nose.add(o);
  });
  nose.position.set(0, 0.215, 0.02);
  g.add(nose);
  // head and binocular eyepieces
  g.add(mesh(rbox(0.07, 0.05, 0.09, 0.015), body, 0, 0.32, 0.0));
  for (const x of [-0.022, 0.022]) {
    const tube = mesh(cyl(0.011, 0.011, 0.08, 20), m.plasticDark, x, 0.37, 0.04);
    tube.rotation.x = -0.6;
    g.add(tube);
  }
  const slideHolder = new THREE.Group();
  slideHolder.position.set(0, 0.136, 0.02);
  g.add(slideHolder);
  return {
    group: g,
    slideHolder,
    set(v: { mag: 4 | 10 | 40; light: boolean }) {
      const i = v.mag === 4 ? 0 : v.mag === 10 ? 1 : 2;
      // bring the selected objective to the front (toward +z, over the stage)
      nose.rotation.y = -(i * Math.PI * 2) / 3;
      (lamp.material as THREE.MeshStandardMaterial).emissive.setHex(v.light ? 0xfff0c8 : 0x000000);
      (lamp.material as THREE.MeshStandardMaterial).emissiveIntensity = v.light ? 2.2 : 0;
      beam.intensity = v.light ? 0.25 : 0;
    },
  };
}

// ── Pharmacology: organ bath rig, recorder ─────────────────────────────────

export function organBathRig(m: MaterialLib) {
  const g = new THREE.Group();
  // heavy base and stand rod
  g.add(mesh(rbox(0.28, 0.02, 0.3, 0.006), m.darkMetal, 0, 0.01, 0));
  g.add(mesh(cyl(0.008, 0.008, 0.8, 16), m.chrome, -0.09, 0.41, -0.08));
  // water-jacketed bath: outer jacket, inner chamber
  const bath = new THREE.Group();
  g.add(bath);
  const jacketWater = mesh(cyl(0.034, 0.034, 0.2, 40), new THREE.MeshPhysicalMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false }), 0, 0.27, 0, false);
  bath.add(jacketWater);
  const outer = mesh(cyl(0.036, 0.036, 0.21, 40), m.glass, 0, 0.27, 0, false);
  outer.renderOrder = 2;
  bath.add(outer);
  const inner = mesh(cyl(0.017, 0.015, 0.2, 32), m.glass, 0, 0.275, 0, false);
  bath.add(inner);
  const pss = mesh(cyl(0.0155, 0.0145, 0.17, 28), new THREE.MeshPhysicalMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.45, roughness: 0.05, depthWrite: false }), 0, 0.26, 0, false);
  bath.add(pss);
  // clamps to the rod
  for (const y of [0.2, 0.34]) g.add(mesh(box(0.1, 0.012, 0.012), m.brushed, -0.045, y, -0.04, false));
  // jacket inlet/outlet tubes to the circulator
  const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.6, roughness: 0.2 });
  for (const [y, z] of [[0.19, 0.04], [0.35, 0.06]] as [number, number][]) {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0.036, y, 0), new THREE.Vector3(0.12, y, 0.02), new THREE.Vector3(0.22, 0.1, z), new THREE.Vector3(0.32, 0.12, z)]);
    g.add(mesh(new THREE.TubeGeometry(c, 30, 0.005, 10, false), tubeMat, 0, 0, 0, false));
  }
  // aeration line into the chamber
  const air = new THREE.CatmullRomCurve3([new THREE.Vector3(0.01, 0.2, 0.0), new THREE.Vector3(0.012, 0.4, 0.01), new THREE.Vector3(0.1, 0.5, 0.06), new THREE.Vector3(0.2, 0.5, 0.12)]);
  const airLine = mesh(new THREE.TubeGeometry(air, 30, 0.0035, 8, false), tubeMat.clone(), 0, 0, 0, false);
  g.add(airLine);
  // tissue strip (simulated) and thread to the transducer lever
  const tissue = mesh(new THREE.CapsuleGeometry(0.0028, 0.05, 6, 12), new THREE.MeshPhysicalMaterial({ color: 0xd98b86, roughness: 0.55, sheen: 0.5 }), 0, 0.26, 0, false);
  g.add(tissue);
  const thread = mesh(cyl(0.0005, 0.0005, 1, 6), m.plasticWhite, 0, 0, 0, false);
  g.add(thread);
  const transducer = new THREE.Group();
  transducer.add(mesh(rbox(0.05, 0.035, 0.07, 0.006), m.plasticDark, 0, 0, 0));
  const lever = mesh(box(0.002, 0.002, 0.07), m.chrome, 0, -0.02, 0.04, false);
  transducer.add(lever);
  transducer.position.set(0, 0.47, -0.035);
  g.add(transducer);
  g.add(mesh(box(0.12, 0.012, 0.012), m.brushed, -0.045, 0.47, -0.06, false));
  // bubbles: one instanced mesh, animated only while aeration is on
  const N = 14;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0016, 8, 6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 0 }), N);
  g.add(bubbles);
  const mtx = new THREE.Matrix4();
  // circulator
  const circ = new THREE.Group();
  circ.add(mesh(rbox(0.22, 0.2, 0.26, 0.015), m.plasticWhite, 0, 0.1, 0));
  const lcd = lcdTexture(256, 96, "#10202c", "#7fd3ff");
  circ.add(mesh(box(0.08, 0.03, 0.002), new THREE.MeshBasicMaterial({ map: lcd.texture }), 0, 0.15, 0.131, false));
  circ.add(mesh(cyl(0.012, 0.012, 0.012, 16), m.accentBlue, 0.06, 0.15, 0.135, false).rotateX(Math.PI / 2));
  circ.position.set(0.42, 0, 0.05);
  g.add(circ);
  let aeration = false;
  return {
    group: g,
    parts: { bath, tissue, transducer, circulator: circ, air: airLine },
    set(v: { bathFilled: boolean; tempC: number; aeration: boolean; thermostat: boolean; tissue: boolean; tension: boolean; contraction: number }) {
      pss.visible = v.bathFilled;
      jacketWater.visible = v.thermostat || v.bathFilled;
      tissue.visible = v.tissue;
      const shorten = 1 - Math.min(0.35, v.contraction / 46 * 0.35);
      tissue.scale.y = shorten;
      const topY = 0.26 + 0.03 * shorten;
      thread.visible = v.tissue;
      thread.scale.y = 0.47 - 0.02 - topY;
      thread.position.y = (0.45 + topY) / 2;
      lever.rotation.x = -v.contraction / 46 * 0.25;
      lcd.draw(v.thermostat ? `${v.tempC.toFixed(1)}°` : "OFF");
      aeration = v.aeration && v.bathFilled;
      bubbles.visible = aeration;
      return aeration;
    },
    tick(t: number) {
      if (!aeration) return;
      for (let i = 0; i < N; i++) {
        const p = (t * 0.6 + i / N) % 1;
        mtx.makeTranslation(0.006 + Math.sin(i * 7.3 + t * 3) * 0.002, 0.2 + p * 0.14, Math.cos(i * 3.1) * 0.003);
        bubbles.setMatrixAt(i, mtx);
      }
      bubbles.instanceMatrix.needsUpdate = true;
    },
  };
}

/** Recorder: a monitor whose screen is the experiment's own trace. */
export function recorder(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.5, 0.32, 0.03, 0.01), m.plasticDark, 0, 0.23, 0));
  g.add(mesh(box(0.06, 0.08, 0.04), m.plasticDark, 0, 0.04, -0.01));
  g.add(mesh(rbox(0.2, 0.012, 0.14, 0.004), m.plasticDark, 0, 0.006, -0.01));
  const W = 1024;
  const H = 600;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const screen = mesh(box(0.47, 0.29, 0.002), new THREE.MeshBasicMaterial({ map: t }), 0, 0.23, 0.016, false);
  g.add(screen);
  let last = "";
  return {
    group: g,
    canvas: c,
    set(trace: number[], pending: boolean) {
      const key = trace.join(",") + pending;
      if (key === last) return;
      last = key;
      ctx.fillStyle = "#0e1a24";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(127,211,255,0.12)";
      ctx.lineWidth = 1;
      for (let y = 60; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(W - 20, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#7fd3ff";
      ctx.font = "600 26px Outfit, Arial";
      ctx.fillText("Isotonic transducer — contraction (mm)   SIMULATED", 40, 40);
      const base = H - 70;
      const scale = 9; // px per mm
      ctx.strokeStyle = "#9df2b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, base);
      const shown = trace.slice(-12);
      const step = (W - 80) / 12;
      shown.forEach((mm, i) => {
        const x0 = 40 + i * step;
        ctx.lineTo(x0 + step * 0.2, base);
        ctx.lineTo(x0 + step * 0.32, base - mm * scale);
        ctx.lineTo(x0 + step * 0.45, base - mm * scale * 0.97);
        ctx.lineTo(x0 + step * 0.62, base);
        ctx.lineTo(x0 + step, base);
      });
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 20px Outfit, Arial";
      ctx.fillText(pending ? "Peak waiting to be read" : "", 40, H - 24);
      t.needsUpdate = true;
    },
  };
}

/** A large labelled jar (sucrose, crude drugs). */
export function storageJar(m: MaterialLib, title: string, lines: string[], fill: THREE.Material) {
  const g = new THREE.Group();
  const glassBody = mesh(cyl(0.05, 0.05, 0.14, 36), m.glass, 0, 0.07, 0);
  glassBody.renderOrder = 2;
  g.add(glassBody);
  g.add(mesh(cyl(0.047, 0.047, 0.1, 30), fill, 0, 0.052, 0, false));
  g.add(mesh(cyl(0.052, 0.052, 0.025, 36), m.plasticWhite, 0, 0.152, 0));
  const label = mesh(new THREE.CylinderGeometry(0.0505, 0.0505, 0.06, 36, 1, true, -1, 2), new THREE.MeshStandardMaterial({ map: labelTexture(title, lines, { w: 512, h: 300 }), roughness: 0.7 }), 0, 0.075, 0, false);
  g.add(label);
  return g;
}

/**
 * The lab notebook (2026-10-21): a hardboard clipboard with a ruled results sheet and a
 * pen. It is real equipment in every room — calculations and conclusions are entered by
 * selecting it, not from a panel — so the bench has a place where the paperwork happens.
 */
export function labNotebook(m: MaterialLib, title = "Results sheet") {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.24, 0.006, 0.32, 0.008), m.wood, 0, 0.003, 0));
  const sheet = labelTexture(title, ["Name · Date · Batch", "Readings", "Calculation", "Result · Conclusion"], { w: 512, h: 680, accent: "#21B67A" });
  const paper = mesh(box(0.215, 0.002, 0.29), new THREE.MeshStandardMaterial({ map: sheet, roughness: 0.9 }), 0, 0.0075, 0.008, false);
  g.add(paper);
  g.add(mesh(rbox(0.09, 0.012, 0.035, 0.004), m.chrome, 0, 0.012, -0.145));
  const pen = mesh(cyl(0.0045, 0.0045, 0.14, 12), m.accentBlue, 0.135, 0.006, 0.02);
  pen.rotation.x = Math.PI / 2;
  pen.rotation.z = 0.15;
  g.add(pen);
  return g;
}
