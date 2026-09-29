/**
 * Battle Royale e-certificate — drawn on a <canvas>. Browser-only.
 *
 * One drawing serves three outputs: the on-screen preview, the PNG download
 * and the PDF (the PNG placed on an A4 page). Drawing straight to canvas is
 * deliberate: an SVG rasterised through <img> loses web fonts, and the name
 * is set in a script face.
 *
 * Two designs share one layout:
 *   winner       — Top N once results are final: gold title, gold swoosh,
 *                  double gold frame, a gold medal carrying the placing.
 *   participant  — everyone else who completed the battle: the brand
 *                  blue→green accents and a brand medal.
 * Layout after the reference the organisers supplied (navy wave top-left,
 * a ribbon with a medal on the left, name in script, signature lines).
 */
import type { CertificateData } from "@/lib/battle-royale/types";
import { EVENT_TZ, ordinal } from "@/lib/battle-royale/format";

export const CERT_W = 2000;
export const CERT_H = 1414; // A4 landscape, 1 : √2

export type CertFonts = { sans: string; script: string };

const NAVY = "#0b2a4a";
const NAVY_2 = "#123d6b";
const INK = "#16181d";
const BLUE = "#1C7BD9";
const GREEN = "#21B67A";

function gold(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#9a6b12");
  g.addColorStop(0.3, "#f6d77f");
  g.addColorStop(0.55, "#c8961e");
  g.addColorStop(0.8, "#fbe7a6");
  g.addColorStop(1, "#a5741a");
  return g;
}

function brand(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, BLUE);
  g.addColorStop(1, GREEN);
  return g;
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing is Chrome 99+/Safari 17+; older engines simply draw unspaced.
  (ctx as unknown as { letterSpacing?: string }).letterSpacing = `${px}px`;
}

/** Largest size ≤ max at which `text` fits `width`. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, max: number, width: number): number {
  let size = max;
  ctx.font = font(size);
  while (size > 12 && ctx.measureText(text).width > width) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > width && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function certDate(d: CertificateData): string {
  const src = d.eventDate ? new Date(`${d.eventDate}T12:00:00+05:00`) : new Date(d.completedAt);
  if (Number.isNaN(src.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: EVENT_TZ }).format(src);
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function medal(ctx: CanvasRenderingContext2D, d: CertificateData, f: CertFonts, cx: number, cy: number) {
  const win = d.kind === "winner";
  const R = 150;

  // Ribbon tails under the medal.
  ctx.save();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * 30, cy + 40);
    ctx.lineTo(cx + side * 110, cy + 290);
    ctx.lineTo(cx + side * 70, cy + 262);
    ctx.lineTo(cx + side * 40, cy + 310);
    ctx.lineTo(cx - side * 20, cy + 60);
    ctx.closePath();
    ctx.fillStyle = win ? (side < 0 ? "#b3261e" : "#8f1d17") : side < 0 ? BLUE : GREEN;
    ctx.fill();
  }
  ctx.restore();

  // Scalloped rim.
  ctx.save();
  ctx.shadowColor = "rgba(6,18,36,.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  const bumps = 28;
  for (let i = 0; i <= bumps * 2; i++) {
    const a = (i * Math.PI) / bumps;
    const rr = i % 2 === 0 ? R : R - 12;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = win ? gold(ctx, cx - R, cy - R, cx + R, cy + R) : brand(ctx, cx - R, cy - R, cx + R, cy + R);
  ctx.fill();
  ctx.restore();

  // Inner face.
  ctx.beginPath();
  ctx.arc(cx, cy, R - 30, 0, Math.PI * 2);
  ctx.fillStyle = win ? "#1a1204" : NAVY;
  ctx.globalAlpha = win ? 0.12 : 0.28;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.beginPath();
  ctx.arc(cx, cy, R - 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const ink = win ? "#3b2a00" : "#ffffff";
  ctx.fillStyle = ink;
  if (win) {
    spaced(ctx, 4);
    ctx.font = `700 22px ${f.sans}`;
    ctx.fillText("WINNER", cx, cy - 58);
    spaced(ctx, 0);
    const big = d.rank ? ordinal(d.rank) : "TOP";
    ctx.font = `800 ${d.rank ? 84 : 64}px ${f.sans}`;
    ctx.fillText(big, cx, cy + 28);
    spaced(ctx, 4);
    ctx.font = `700 22px ${f.sans}`;
    ctx.fillText(d.rank ? "PLACE" : "FINALIST", cx, cy + 66);
  } else {
    ctx.fillStyle = "#ffffff";
    star(ctx, cx, cy - 34, 30);
    spaced(ctx, 3);
    ctx.font = `700 21px ${f.sans}`;
    ctx.fillText("BATTLE ROYALE", cx, cy + 24);
    ctx.font = `800 22px ${f.sans}`;
    ctx.fillText("PARTICIPANT", cx, cy + 60);
  }
  spaced(ctx, 0);
}

export function drawCertificate(ctx: CanvasRenderingContext2D, d: CertificateData, f: CertFonts, logo: HTMLImageElement | null) {
  const W = CERT_W;
  const H = CERT_H;
  const win = d.kind === "winner";
  const accent = (x0: number, y0: number, x1: number, y1: number) => (win ? gold(ctx, x0, y0, x1, y1) : brand(ctx, x0, y0, x1, y1));

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  // Paper.
  ctx.fillStyle = "#fbfaf6";
  ctx.fillRect(0, 0, W, H);

  // Guilloche — fine engraved lines in the lower right, like security paper.
  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = win ? "rgba(185,140,30,.16)" : "rgba(28,123,217,.13)";
  for (let i = 0; i < 46; i++) {
    ctx.beginPath();
    ctx.moveTo(760, H + 40 - i * 4);
    ctx.bezierCurveTo(1200, H - 360 - i * 9, 1560, H - 60 - i * 6, W + 20, H - 470 - i * 7);
    ctx.stroke();
  }
  ctx.restore();

  // Frame.
  ctx.lineWidth = 3;
  ctx.strokeStyle = win ? gold(ctx, 0, 0, W, H) : "rgba(28,123,217,.45)";
  ctx.strokeRect(34, 34, W - 68, H - 68);
  if (win) {
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, W - 96, H - 96);
  }

  // Navy wave across the top.
  const wave = new Path2D();
  wave.moveTo(0, 0);
  wave.lineTo(W, 0);
  wave.lineTo(W, 150);
  wave.bezierCurveTo(1560, 150, 1330, 340, 880, 340);
  wave.bezierCurveTo(560, 340, 330, 290, 0, 320);
  wave.closePath();
  const navy = ctx.createLinearGradient(0, 0, W, 340);
  navy.addColorStop(0, NAVY);
  navy.addColorStop(0.6, NAVY_2);
  navy.addColorStop(1, win ? "#16497d" : "#135a8a");
  ctx.fillStyle = navy;
  ctx.fill(wave);

  // Accent swoosh along the wave's edge.
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = 16;
  ctx.strokeStyle = accent(0, 0, W, 0);
  ctx.beginPath();
  ctx.moveTo(-10, 348);
  ctx.bezierCurveTo(330, 318, 560, 372, 880, 372);
  ctx.bezierCurveTo(1340, 372, 1560, 178, W + 10, 178);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(-10, 384);
  ctx.bezierCurveTo(330, 356, 560, 404, 880, 404);
  ctx.bezierCurveTo(1340, 404, 1560, 212, W + 10, 212);
  ctx.stroke();
  ctx.restore();

  // Left ribbon.
  ctx.fillStyle = navy;
  ctx.fillRect(150, 300, 90, H - 300);
  ctx.fillStyle = accent(150, 0, 240, 0);
  ctx.fillRect(150, 300, 8, H - 300);
  ctx.fillRect(232, 300, 8, H - 300);

  // Title on the wave.
  ctx.textAlign = "left";
  ctx.fillStyle = win ? gold(ctx, 120, 90, 820, 200) : "#ffffff";
  spaced(ctx, 6);
  ctx.font = `800 128px ${f.sans}`;
  ctx.fillText("CERTIFICATE", 112, 190);
  spaced(ctx, 12);
  ctx.font = `600 40px ${f.sans}`;
  ctx.fillStyle = win ? "#f6d77f" : "#bfe6d4";
  ctx.fillText(win ? "OF ACHIEVEMENT" : "OF PARTICIPATION", 118, 256);
  spaced(ctx, 0);

  // Brand, top right on the wave.
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 40px ${f.sans}`;
  ctx.fillText("PharmaWallah", W - 180, 92);
  spaced(ctx, 4);
  ctx.font = `500 18px ${f.sans}`;
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fillText("BATTLE ROYALE · PHARMA FEST", W - 180, 122);
  spaced(ctx, 0);
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(W - 160, 36, 100, 100, 26);
  else ctx.rect(W - 160, 36, 100, 100);
  ctx.fill();
  if (logo) ctx.drawImage(logo, W - 146, 50, 72, 72);
  ctx.restore();

  // ── Body ──
  const cx = 1180;
  const colW = 1300;
  ctx.textAlign = "center";

  spaced(ctx, 7);
  ctx.fillStyle = "rgba(22,24,29,.62)";
  ctx.font = `600 30px ${f.sans}`;
  ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", cx, 505);
  spaced(ctx, 0);

  const nameSize = fit(ctx, d.name, (s) => `400 ${s}px ${f.script}`, 150, colW);
  ctx.fillStyle = NAVY;
  ctx.font = `400 ${nameSize}px ${f.script}`;
  ctx.fillText(d.name, cx, 650);

  ctx.fillStyle = accent(cx - colW / 2, 0, cx + colW / 2, 0);
  ctx.fillRect(cx - 560, 690, 1120, 4);

  let y = 690;
  if (d.university) {
    ctx.fillStyle = "rgba(22,24,29,.6)";
    ctx.font = `500 30px ${f.sans}`;
    ctx.fillText(d.university, cx, 740);
    y = 740;
  }

  const line =
    win && d.rank
      ? `for finishing ${ordinal(d.rank)} in ${d.eventTitle} — a three-round pharmacy challenge of knowledge, speed and accuracy.`
      : win
        ? `for finishing among the winners of ${d.eventTitle} — a three-round pharmacy challenge of knowledge, speed and accuracy.`
        : `for competing in ${d.eventTitle} and completing all three rounds — Word Search, Column Matching and the Final Pharma Quiz.`;
  ctx.fillStyle = "rgba(22,24,29,.78)";
  ctx.font = `400 33px ${f.sans}`;
  wrap(ctx, line, 1200).forEach((l, i) => ctx.fillText(l, cx, y + 64 + i * 46));

  // Stats: score · accuracy · title.
  const top = 900;
  const cellW = 400;
  const cells: [string, string][] = [
    ["FINAL SCORE", String(d.total)],
    ["ACCURACY", `${d.accuracy}%`],
    ["TITLE EARNED", d.title],
  ];
  cells.forEach(([label, value], i) => {
    const x = cx + (i - 1) * cellW;
    if (i > 0) {
      ctx.fillStyle = "rgba(22,24,29,.12)";
      ctx.fillRect(x - cellW / 2, top, 2, 150);
    }
    spaced(ctx, 5);
    ctx.fillStyle = "rgba(22,24,29,.55)";
    ctx.font = `600 22px ${f.sans}`;
    ctx.fillText(label, x, top + 30);
    spaced(ctx, 0);
    ctx.fillStyle = i === 2 ? (win ? "#9a6b12" : BLUE) : INK;
    const size = i === 2 ? fit(ctx, value, (s) => `800 ${s}px ${f.sans}`, 54, cellW - 40) : 88;
    ctx.font = `800 ${size}px ${f.sans}`;
    ctx.fillText(value, x, top + (i === 2 ? 110 : 122));
  });

  // Sign-off. No forged signatures: the date, and the organisation in script.
  const foot = 1250;
  const blocks: [number, string, string, boolean][] = [
    [cx - 470, certDate(d), "DATE", false],
    [cx + 470, "PharmaWallah", "ORGANISED BY", true],
  ];
  for (const [x, top_, label, script] of blocks) {
    ctx.fillStyle = NAVY;
    ctx.font = script ? `400 64px ${f.script}` : `600 34px ${f.sans}`;
    ctx.fillText(top_, x, foot - 22);
    ctx.fillStyle = "rgba(22,24,29,.35)";
    ctx.fillRect(x - 180, foot, 360, 2);
    spaced(ctx, 5);
    ctx.fillStyle = "rgba(22,24,29,.55)";
    ctx.font = `600 20px ${f.sans}`;
    ctx.fillText(label, x, foot + 36);
    spaced(ctx, 0);
  }
  ctx.fillStyle = "rgba(22,24,29,.5)";
  ctx.font = `500 22px ${f.sans}`;
  ctx.fillText(`Player ID ${d.code}`, cx, foot - 10);
  ctx.fillText("pharmawallah.com/battle-royale", cx, foot + 22);

  medal(ctx, d, f, 195, 860);

  ctx.restore();
}
