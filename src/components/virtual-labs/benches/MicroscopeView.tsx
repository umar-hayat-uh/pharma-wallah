"use client";

/**
 * The eyepiece: a SCHEMATIC ILLUSTRATION of the powder mount, drawn to scale from the
 * slide model (calculations/microscopy.ts) — not a photomicrograph, and labelled so.
 * Each element is drawn from the reference description (experiments/clove.ts); nothing is
 * drawn that the reference does not list. Focus error blurs the whole field; an uncleared
 * mount is murky and hides the elements that need clearing.
 */
import { useEffect, useMemo, useRef } from "react";
import { blurPx, fieldOfViewUm, totalMagnification, type SlideElement } from "@/lib/virtual-labs/calculations/microscopy";
import { cleared, slideOf, type CloveState } from "@/lib/virtual-labs/experiments/clove";
import { rand } from "@/lib/virtual-labs/engine/machine";

const SIZE = 480;

export function MicroscopeView({ s, large }: { s: CloveState; large?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // the slide is deterministic from (seed, amount): generate it once, not on every render
  const els = useMemo(() => (s.slideOnStage ? slideOf(s) : []), [s.seed, s.powder, s.slideOnStage]); // eslint-disable-line react-hooks/exhaustive-deps
  const fov = fieldOfViewUm(s.mag);
  const blur = s.slideOnStage ? blurPx({ mag: s.mag, stageX: s.stageX, stageY: s.stageY, focusErrUm: s.focusErrUm, light: s.light, slideOn: true }) : 0;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, SIZE, SIZE);
    g.save();
    g.beginPath();
    g.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    g.clip();
    if (!s.light) {
      g.fillStyle = "#1e2730";
      g.fillRect(0, 0, SIZE, SIZE);
      g.restore();
      return;
    }
    const bg = g.createRadialGradient(SIZE / 2, SIZE / 2, 20, SIZE / 2, SIZE / 2, SIZE / 2);
    bg.addColorStop(0, "#fbf7ec");
    bg.addColorStop(1, "#e9e0c9");
    g.fillStyle = bg;
    g.fillRect(0, 0, SIZE, SIZE);
    if (!s.slideOnStage) {
      g.restore();
      return;
    }
    const k = SIZE / fov; // px per µm
    const isCleared = cleared(s);
    // background debris and fine particles (part of any powder mount)
    for (let i = 0; i < 160; i++) {
      const x = ((rand(s.seed, 900, i) * 2 - 1) * 2400 - s.stageX) * k + SIZE / 2;
      const y = ((rand(s.seed, 901, i) * 2 - 1) * 1800 - s.stageY) * k + SIZE / 2;
      if (x < -20 || y < -20 || x > SIZE + 20 || y > SIZE + 20) continue;
      g.fillStyle = `rgba(110,72,40,${0.25 + rand(s.seed, 902, i) * 0.3})`;
      const r = Math.max(0.8, (2 + rand(s.seed, 903, i) * 6) * k * 2);
      g.beginPath();
      g.ellipse(x, y, r, r * 0.6, rand(s.seed, 904, i) * 3, 0, Math.PI * 2);
      g.fill();
    }
    const sorted = [...els].sort((a, b) => b.size - a.size);
    for (const e of sorted) {
      const x = (e.x - s.stageX) * k + SIZE / 2;
      const y = (e.y - s.stageY) * k + SIZE / 2;
      const reach = e.size * k * 3;
      if (x < -reach || y < -reach || x > SIZE + reach || y > SIZE + reach) continue;
      if (!isCleared && (e.type === "cluster-crystal" || e.type === "epidermis")) {
        // cell contents still in place: a murky brown fragment, details hidden
        g.fillStyle = "rgba(120,80,45,0.45)";
        g.beginPath();
        g.ellipse(x, y, e.size * k * 1.4, e.size * k, e.rot, 0, Math.PI * 2);
        g.fill();
        continue;
      }
      draw(g, e, x, y, k);
    }
    if (!isCleared) {
      g.fillStyle = "rgba(140,100,60,0.18)";
      g.fillRect(0, 0, SIZE, SIZE);
    }
    if (s.coverslip === "dropped") {
      // air bubbles: thick dark rims, bright centres
      for (let i = 0; i < 4; i++) {
        const bx = ((rand(s.seed, 950, i) * 2 - 1) * 2000 - s.stageX) * k + SIZE / 2;
        const by = ((rand(s.seed, 951, i) * 2 - 1) * 1500 - s.stageY) * k + SIZE / 2;
        const br = (120 + rand(s.seed, 952, i) * 200) * k;
        g.lineWidth = Math.max(2, br * 0.12);
        g.strokeStyle = "rgba(30,25,20,0.85)";
        g.beginPath();
        g.arc(bx, by, br, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.restore();
  }, [els, fov, s]);

  return (
    <figure className="space-y-1.5">
      <div className="relative mx-auto aspect-square w-full" style={{ maxWidth: large ? 520 : 300 }}>
        <div className="absolute inset-0 rounded-full bg-[#2b3440] p-[3%] shadow-inner">
          <canvas ref={ref} width={SIZE} height={SIZE} className="h-full w-full rounded-full" style={{ filter: `blur(${blur.toFixed(1)}px)` }} role="img" aria-label={`Eyepiece view at ${totalMagnification(s.mag)}×, field of view ${(fov / 1000).toFixed(2)} mm. ${!s.slideOnStage ? "No slide on the stage." : !s.light ? "The lamp is off." : blur > 4 ? "The image is out of focus." : "In focus — examine the elements in the field."}`} />
        </div>
        <span className="absolute bottom-[6%] right-[8%] rounded-md bg-white/85 px-1.5 py-0.5 font-mono text-[10px] text-[#16181d]">{totalMagnification(s.mag)}×</span>
        {s.slideOnStage && s.light && <ScaleBar fov={fov} />}
      </div>
      <figcaption className="text-center text-[11px] leading-snug text-[#4a4f57]">
        Schematic illustration drawn to scale from the reference description — not a photomicrograph.
      </figcaption>
    </figure>
  );
}

function ScaleBar({ fov }: { fov: number }) {
  const um = fov > 2000 ? 500 : fov > 1000 ? 200 : 50;
  const pct = (um / fov) * 100 * 0.94;
  return (
    <div className="absolute bottom-[12%] left-[14%] text-[10px] font-semibold text-[#16181d]">
      <div className="h-1 rounded bg-[#16181d]" style={{ width: `${pct}%`, minWidth: 18 }} />
      <span>{um} µm</span>
    </div>
  );
}

function draw(g: CanvasRenderingContext2D, e: SlideElement, x: number, y: number, k: number) {
  const r = (e.size * k) / 2;
  g.save();
  g.translate(x, y);
  g.rotate(e.rot);
  switch (e.type) {
    case "oil-gland": {
      // parenchyma fragment with large oval schizogenous oil cavities
      const w = r * 2.6;
      const h = r * 1.9;
      g.fillStyle = "rgba(160,112,62,0.55)";
      g.strokeStyle = "rgba(95,60,30,0.75)";
      g.lineWidth = Math.max(0.6, k * 1.4);
      g.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const rr = 1 + (Math.sin(i * 2.7 + e.variant * 9) * 0.18);
        g.lineTo(Math.cos(a) * w * rr, Math.sin(a) * h * rr);
      }
      g.closePath();
      g.fill();
      g.stroke();
      // small parenchyma cells
      g.strokeStyle = "rgba(95,60,30,0.35)";
      for (let i = 0; i < 14; i++) {
        g.beginPath();
        g.ellipse(Math.cos(i * 2.39) * w * 0.6, Math.sin(i * 2.39) * h * 0.6, r * 0.22, r * 0.16, i, 0, Math.PI * 2);
        g.stroke();
      }
      // the oil glands (cavities): pale, ringed by small epithelial cells
      const n = 2 + Math.floor(e.variant * 2);
      for (let i = 0; i < n; i++) {
        const gx = (i - (n - 1) / 2) * r * 1.05;
        g.fillStyle = "rgba(250,236,200,0.95)";
        g.strokeStyle = "rgba(110,70,35,0.9)";
        g.lineWidth = Math.max(0.8, k * 2.2);
        g.beginPath();
        g.ellipse(gx, 0, r * 0.5, r * 0.36, 0.2, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = "rgba(230,190,90,0.35)"; // oil droplet
        g.beginPath();
        g.arc(gx + r * 0.1, -r * 0.05, r * 0.14, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case "pollen": {
      // tetrahedral grain: rounded triangle in outline, a pore at each angle
      g.fillStyle = "rgba(238,214,140,0.9)";
      g.strokeStyle = "rgba(140,110,40,0.95)";
      g.lineWidth = Math.max(0.6, k * 1.2);
      g.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const b = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
        g.quadraticCurveTo(Math.cos((a + b) / 2) * r * 0.75, Math.sin((a + b) / 2) * r * 0.75, Math.cos(b) * r, Math.sin(b) * r);
      }
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = "rgba(120,90,30,0.9)";
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        g.beginPath();
        g.arc(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, Math.max(0.6, r * 0.12), 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case "cluster-crystal": {
      // rosette of calcium oxalate: a spiky aggregate
      g.fillStyle = "rgba(235,238,240,0.95)";
      g.strokeStyle = "rgba(70,75,80,0.9)";
      g.lineWidth = Math.max(0.5, k * 0.8);
      g.beginPath();
      const spikes = 11;
      for (let i = 0; i < spikes * 2; i++) {
        const a = (i / (spikes * 2)) * Math.PI * 2;
        const rr = i % 2 ? r * 0.55 : r;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = "rgba(90,95,100,0.5)";
      g.beginPath();
      g.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case "spiral-vessel": {
      const len = r * 8;
      const wid = r * 0.7;
      g.strokeStyle = "rgba(110,80,50,0.85)";
      g.lineWidth = Math.max(0.6, k * 1.2);
      g.strokeRect(-len / 2, -wid / 2, len, wid);
      g.beginPath();
      for (let t = -len / 2; t < len / 2; t += Math.max(2, wid * 0.55)) {
        g.moveTo(t, -wid / 2);
        g.lineTo(t + wid * 0.5, wid / 2);
      }
      g.stroke();
      break;
    }
    case "epidermis": {
      // polygonal cells with a thick cuticle; anomocytic stoma (no subsidiary cells)
      const cell = r * 1.1;
      g.strokeStyle = "rgba(100,80,55,0.8)";
      g.lineWidth = Math.max(0.7, k * 1.6);
      for (let i = -2; i <= 2; i++)
        for (let j = -1; j <= 1; j++) {
          const cx = i * cell * 1.1 + (j % 2) * cell * 0.5;
          const cy = j * cell * 0.95;
          g.beginPath();
          for (let p = 0; p < 6; p++) g.lineTo(cx + Math.cos((p / 6) * Math.PI * 2) * cell * 0.62, cy + Math.sin((p / 6) * Math.PI * 2) * cell * 0.55);
          g.closePath();
          g.stroke();
        }
      g.fillStyle = "rgba(170,150,110,0.6)";
      g.strokeStyle = "rgba(80,60,35,0.95)";
      for (const s of [-1, 1]) {
        g.beginPath();
        g.ellipse(s * r * 0.22, 0, r * 0.22, r * 0.5, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      g.strokeStyle = "rgba(60,40,20,0.9)";
      g.beginPath();
      g.moveTo(0, -r * 0.35);
      g.lineTo(0, r * 0.35);
      g.stroke();
      break;
    }
    case "fibre": {
      const len = r * 2;
      const wid = Math.max(3, 14 * k);
      g.fillStyle = "rgba(205,180,130,0.85)";
      g.strokeStyle = "rgba(110,80,40,0.9)";
      g.lineWidth = Math.max(0.6, k * 1.2);
      g.beginPath();
      g.moveTo(-len / 2, 0);
      g.quadraticCurveTo(0, -wid, len / 2, 0);
      g.quadraticCurveTo(0, wid, -len / 2, 0);
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(-len * 0.4, 0);
      g.lineTo(len * 0.4, 0);
      g.stroke();
      break;
    }
    case "sclereid": {
      g.fillStyle = "rgba(220,200,150,0.9)";
      g.strokeStyle = "rgba(110,80,40,0.95)";
      g.lineWidth = Math.max(1, k * 3);
      g.beginPath();
      g.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.lineWidth = Math.max(0.5, k * 0.8);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        g.beginPath();
        g.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.25);
        g.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.72);
        g.stroke();
      }
      break;
    }
  }
  g.restore();
}
