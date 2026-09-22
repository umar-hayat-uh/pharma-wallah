#!/usr/bin/env node
/**
 * Generates the Windows desktop app's icon set from the PharmaWallah mark.
 *
 * Source: public/icons/icon-512x512.png — the same mark the website, the PWA
 * icons and the Android launcher use. Nothing here is a Tauri placeholder.
 *
 * Tauri wants a fixed set of names (see `bundle.icon` in tauri.conf.json).
 * The .ico is what Windows shows in Explorer, on the taskbar, in the Start
 * menu and in the installer, so it carries every size Windows asks for.
 *
 * `sharp` cannot write .ico, and pulling in an icon library for one file would
 * be a dependency with nothing else to do, so the ICO container is assembled
 * here. It is a simple format: a 6-byte header, a 16-byte directory entry per
 * image, then the images. Windows Vista and later accept PNG payloads
 * directly, which is what every modern toolchain emits.
 *
 * Run with `npm run desktop:icons`. Idempotent.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(repoRoot, "public/icons/icon-512x512.png");
const outDir = join(repoRoot, "src-tauri/icons");

/** The names tauri.conf.json's `bundle.icon` lists, and their pixel sizes. */
const PNG_TARGETS = [
  ["32x32.png", 32],
  ["128x128.png", 128],
  ["128x128@2x.png", 256],
  ["icon.png", 512],
  // Not referenced by the bundle config, but Windows and the NSIS installer
  // both look better with these available, and they cost a few kilobytes.
  ["Square150x150Logo.png", 150],
  ["Square44x44Logo.png", 44],
  ["StoreLogo.png", 50],
];

/** Sizes Windows asks an .ico for, smallest first. */
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

/**
 * Packs PNG buffers into an ICO container.
 *
 * ICONDIR  : reserved(2) type(2)=1 count(2)
 * ICONDIRENTRY x count : w(1) h(1) colours(1) reserved(1) planes(2) bpp(2)
 *                        bytes(4) offset(4)
 * A dimension of 256 is written as 0 — the field is one byte.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach((image, index) => {
    const at = index * 16;
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, at + 0);
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, at + 1);
    directory.writeUInt8(0, at + 2); // palette size: 0 for true colour
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel (RGBA)
    directory.writeUInt32LE(image.data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += image.data.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const meta = await sharp(source).metadata();
  if (!meta.width || meta.width < 256) {
    throw new Error(
      `[desktop] ${source} is ${meta.width}px wide — too small for a 256px icon. ` +
        `Point this script at a larger copy of the mark rather than upscaling one.`,
    );
  }

  for (const [name, size] of PNG_TARGETS) {
    const buffer = await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(join(outDir, name), buffer);
  }

  const icoImages = [];
  for (const size of ICO_SIZES) {
    const data = await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    icoImages.push({ size, data });
  }
  writeFileSync(join(outDir, "icon.ico"), buildIco(icoImages));

  console.log(
    `[desktop] Wrote ${PNG_TARGETS.length} PNG icons and icon.ico ` +
      `(${ICO_SIZES.join(", ")}px) to src-tauri/icons/.`,
  );
}

main().catch((error) => {
  console.error("[desktop] Icon generation failed:", error.message);
  process.exit(1);
});
