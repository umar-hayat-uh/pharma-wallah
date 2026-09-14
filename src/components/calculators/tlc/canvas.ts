import { computeHomography, rectifiedSize, rotatedBounds } from "./geometry";
import { formatPx, formatRf } from "./rf";
import type { PixelBuffer, PlateAnalysis, Quad, Rect, TLCSpot } from "./types";

/**
 * Browser-side image work for the TLC analyzer: decode, resize, rotate, crop,
 * perspective-correct, and draw the annotated plate. Canvas only — nothing here
 * makes a network request, and the image never leaves the device.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTRIBUTE = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

/** A phone photo is 2–12 MB; past this a WebView risks running out of memory while decoding. */
export const MAX_FILE_BYTES = 40 * 1024 * 1024;

/**
 * The working image's longest side. A 12 MP photo is scaled to 2400 px: a spot
 * on a 10 cm plate is still ~70 px across, and the canvas stays well inside
 * Android WebView's texture limits. Rf is a ratio, so a uniform scale does not
 * change it.
 */
export const WORKING_MAX_DIMENSION = 2400;

export class TLCImageError extends Error {}

export type LoadedImage = {
  canvas: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
  /** working pixels ÷ original pixels. */
  scale: number;
};

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function context2d(canvas: HTMLCanvasElement, willReadFrequently = false): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently });
  if (!ctx) throw new TLCImageError("This device could not create an image canvas.");
  return ctx;
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Camera captures and some file managers report an empty type.
  return file.type === "" && /\.(jpe?g|png|webp)$/i.test(file.name);
}

/**
 * Decodes an image file into a working canvas no larger than
 * WORKING_MAX_DIMENSION. EXIF orientation is applied, so a portrait phone photo
 * is upright.
 */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (!isAcceptedFile(file)) {
    throw new TLCImageError("Choose a JPG, PNG or WEBP image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new TLCImageError("This image is larger than 40 MB. Take the photo at a lower resolution, or crop it first.");
  }
  if (file.size === 0) throw new TLCImageError("This file is empty.");
  return loadImageBlob(file);
}

export async function loadImageBlob(blob: Blob): Promise<LoadedImage> {
  let source: CanvasImageSource;
  let width: number;
  let height: number;
  let release = () => {};

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      source = bitmap;
      width = bitmap.width;
      height = bitmap.height;
      release = () => bitmap.close();
    } else {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      try {
        await img.decode();
      } finally {
        URL.revokeObjectURL(url);
      }
      source = img;
      width = img.naturalWidth;
      height = img.naturalHeight;
    }
  } catch {
    throw new TLCImageError("This image could not be opened. It may be damaged, or too large for this device — try a JPG or PNG.");
  }

  try {
    if (!width || !height) throw new TLCImageError("This image has no pixels.");
    const scale = Math.min(1, WORKING_MAX_DIMENSION / Math.max(width, height));
    const canvas = createCanvas(width * scale, height * scale);
    const ctx = context2d(canvas);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return { canvas, originalWidth: width, originalHeight: height, scale: canvas.width / width };
  } finally {
    release();
  }
}

/** Wraps an already-decoded pixel buffer (the sample plate) as a canvas. */
export function canvasFromPixels(buffer: PixelBuffer): HTMLCanvasElement {
  const canvas = createCanvas(buffer.width, buffer.height);
  const data = new Uint8ClampedArray(buffer.data.length);
  data.set(buffer.data);
  context2d(canvas).putImageData(new ImageData(data, buffer.width, buffer.height), 0, 0);
  return canvas;
}

/**
 * RGBA pixels of `canvas`, scaled down so the copy holds at most `maxPixels`.
 * Returns the scale (copy ÷ canvas) so results can be mapped back.
 */
export function readPixels(canvas: HTMLCanvasElement, maxPixels: number): { buffer: PixelBuffer; scale: number } {
  const scale = Math.min(1, Math.sqrt(maxPixels / (canvas.width * canvas.height)));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  let target = canvas;
  if (scale < 1) {
    target = createCanvas(width, height);
    const ctx = context2d(target);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, width, height);
  }
  const image = context2d(target, true).getImageData(0, 0, width, height);
  return { buffer: { data: image.data, width, height }, scale: width / canvas.width };
}

/** Rotates about the centre onto a canvas large enough to hold every corner. New corners are transparent. */
export function rotateCanvas(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const normalised = ((degrees % 360) + 360) % 360;
  if (normalised === 0) return source;
  const { width, height } = rotatedBounds(source.width, source.height, normalised);
  const canvas = createCanvas(width, height);
  const ctx = context2d(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(width / 2, height / 2);
  ctx.rotate((normalised * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

export function cropCanvas(source: HTMLCanvasElement, rect: Rect): HTMLCanvasElement {
  const x = Math.max(0, Math.floor(rect.x));
  const y = Math.max(0, Math.floor(rect.y));
  const width = Math.min(source.width - x, Math.ceil(rect.width));
  const height = Math.min(source.height - y, Math.ceil(rect.height));
  if (width < 8 || height < 8) throw new TLCImageError("The crop is too small. Drag the corners further apart.");
  const canvas = createCanvas(width, height);
  context2d(canvas).drawImage(source, x, y, width, height, 0, 0, width, height);
  return canvas;
}

/**
 * Maps the quadrilateral `quad` of `source` onto an upright rectangle —
 * perspective correction. Inverse mapping with bilinear sampling: for every
 * output pixel, the homography gives the source position to sample, so the
 * output has no holes.
 */
export function warpPerspective(source: HTMLCanvasElement, quad: Quad): HTMLCanvasElement {
  const { width, height } = rectifiedSize(quad, WORKING_MAX_DIMENSION);
  if (width < 8 || height < 8) throw new TLCImageError("The corners are too close together.");
  const target: Quad = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const h = computeHomography(target, quad);
  if (!h) throw new TLCImageError("These corners do not form a plate outline. Spread them to the four corners of the plate.");

  const src = context2d(source, true).getImageData(0, 0, source.width, source.height);
  const sw = src.width;
  const sh = src.height;
  const sd = src.data;
  const canvas = createCanvas(width, height);
  const ctx = context2d(canvas);
  const out = ctx.createImageData(width, height);
  const od = out.data;

  for (let y = 0; y < height; y++) {
    // Sample at pixel centres.
    const v = y + 0.5;
    for (let x = 0; x < width; x++) {
      const u = x + 0.5;
      const w = h[6] * u + h[7] * v + h[8];
      const fx = (h[0] * u + h[1] * v + h[2]) / w - 0.5;
      const fy = (h[3] * u + h[4] * v + h[5]) / w - 0.5;
      const o = (y * width + x) * 4;
      if (fx < -0.5 || fy < -0.5 || fx > sw - 0.5 || fy > sh - 0.5) continue; // transparent
      const x0 = Math.max(0, Math.min(sw - 1, Math.floor(fx)));
      const y0 = Math.max(0, Math.min(sh - 1, Math.floor(fy)));
      const x1 = Math.min(sw - 1, x0 + 1);
      const y1 = Math.min(sh - 1, y0 + 1);
      const ax = Math.max(0, Math.min(1, fx - x0));
      const ay = Math.max(0, Math.min(1, fy - y0));
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      for (let c = 0; c < 4; c++) {
        const top = sd[i00 + c] + (sd[i10 + c] - sd[i00 + c]) * ax;
        const bottom = sd[i01 + c] + (sd[i11 + c] - sd[i01 + c]) * ax;
        od[o + c] = top + (bottom - top) * ay;
      }
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new TLCImageError("The image could not be encoded."))), type, quality);
  });
}

export function thumbnailDataUrl(canvas: HTMLCanvasElement, maxDimension = 160): string {
  const scale = Math.min(1, maxDimension / Math.max(canvas.width, canvas.height));
  const thumb = createCanvas(canvas.width * scale, canvas.height * scale);
  const ctx = context2d(thumb);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, thumb.width, thumb.height);
  ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL("image/jpeg", 0.72);
}

const BASELINE_COLOUR = "#1c7ad9";
const FRONT_COLOUR = "#16a34a";
const SPOT_COLOUR = "#b45309";

/**
 * The plate with its measurements drawn on — the figure for the PNG download
 * and the lab record. Line widths and labels scale with the image, so they read
 * the same on a 600 px and a 2400 px plate.
 */
export function drawAnnotatedPlate(
  source: HTMLCanvasElement,
  {
    baselineY,
    solventFrontY,
    spots,
    analysis,
    decimals,
    maxDimension = 1600,
  }: {
    baselineY: number | null;
    solventFrontY: number | null;
    spots: TLCSpot[];
    analysis: PlateAnalysis;
    decimals: 2 | 3;
    maxDimension?: number;
  },
): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const canvas = createCanvas(source.width * scale, source.height * scale);
  const ctx = context2d(canvas);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const unit = Math.max(1, Math.min(canvas.width, canvas.height) / 360);
  const font = (size: number, weight = 600) => `${weight} ${Math.round(size * unit)}px Outfit, system-ui, sans-serif`;

  const label = (text: string, x: number, y: number, colour: string, align: CanvasTextAlign = "left") => {
    ctx.font = font(11);
    const padX = 5 * unit;
    const w = ctx.measureText(text).width + padX * 2;
    const h = 17 * unit;
    const left = align === "left" ? x : align === "right" ? x - w : x - w / 2;
    ctx.fillStyle = colour;
    ctx.beginPath();
    // roundRect is Chrome 99+; an older Android System WebView gets square corners.
    if (typeof ctx.roundRect === "function") ctx.roundRect(left, y - h / 2, w, h, 4 * unit);
    else ctx.rect(left, y - h / 2, w, h);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, left + padX, y + 0.5 * unit);
  };

  const hline = (y: number, colour: string, dashed: boolean) => {
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2 * unit;
    if (dashed) ctx.setLineDash([8 * unit, 5 * unit]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.restore();
  };

  const by = baselineY !== null ? baselineY * scale : null;
  const fy = solventFrontY !== null ? solventFrontY * scale : null;
  if (fy !== null) hline(fy, FRONT_COLOUR, true);
  if (by !== null) hline(by, BASELINE_COLOUR, false);

  // Solvent run on the left edge.
  if (by !== null && fy !== null && analysis.solventDistancePx !== null) {
    const x = 14 * unit;
    ctx.strokeStyle = FRONT_COLOUR;
    ctx.lineWidth = 1.5 * unit;
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.lineTo(x, fy);
    ctx.stroke();
    label(formatPx(analysis.solventDistancePx), x + 4 * unit, (by + fy) / 2, FRONT_COLOUR);
  }
  if (fy !== null) label("Solvent front", canvas.width - 8 * unit, fy - 13 * unit, FRONT_COLOUR, "right");
  if (by !== null) label("Baseline / Origin", canvas.width - 8 * unit, by + 13 * unit, BASELINE_COLOUR, "right");

  spots.forEach((spot, index) => {
    if (!spot.accepted) return;
    const x = spot.x * scale;
    const y = spot.y * scale;
    const row = analysis.rows.find((r) => r.index === index);
    if (by !== null) {
      ctx.save();
      ctx.strokeStyle = SPOT_COLOUR;
      ctx.lineWidth = 1.5 * unit;
      ctx.setLineDash([4 * unit, 3 * unit]);
      ctx.beginPath();
      ctx.moveTo(x, by);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
    const r = Math.max(9 * unit, (spot.radius ?? 0) * scale);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4 * unit;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = SPOT_COLOUR;
    ctx.lineWidth = 2 * unit;
    ctx.stroke();

    ctx.fillStyle = SPOT_COLOUR;
    ctx.beginPath();
    ctx.arc(x, y, 2.2 * unit, 0, Math.PI * 2);
    ctx.fill();

    const text =
      row && row.result.rf !== null ? `${index + 1} · Rf ${formatRf(row.result.rf, decimals)}` : `${index + 1}`;
    label(text, x + r + 4 * unit, y, SPOT_COLOUR);
  });

  return canvas;
}

/** Web only — the Android WebView ignores blob downloads (MEMORY gotcha 40). */
export async function downloadCanvas(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
  const blob = await canvasToBlob(canvas, "image/png");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
