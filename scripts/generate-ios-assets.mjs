#!/usr/bin/env node
/**
 * Generates the iOS app icon and launch-screen images from the PharmaWallah
 * brand mark, and writes them into the Xcode asset catalogue.
 *
 *   node scripts/generate-ios-assets.mjs [--fonts <dir>]
 *
 * Outputs (committed — you only need to re-run this when the brand changes):
 *   ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
 *   ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732{,-1,-2}.png
 *
 * Why this exists rather than the throwaway script the Android launcher icon
 * used (see .claude/skills/android-app-capacitor/SKILL.md): the iOS launch
 * screen carries typeset brand copy, so "regenerate it by hand" would mean
 * re-deriving type sizes and safe crops every time. The rules below are the
 * part worth keeping.
 *
 * Type: sharp rasterises SVG through librsvg, which finds fonts via
 * fontconfig, so the real brand face (Outfit) is only used when its .ttf files
 * are on disk. Pass --fonts, or drop Outfit-Regular.ttf / Outfit-Bold.ttf into
 * scripts/.fonts/. Without them librsvg silently falls back to a system sans
 * and the wordmark is off-brand, so the script says which it used.
 * Outfit is Open Font License; the .ttf URLs are in the Google Fonts CSS at
 * https://fonts.googleapis.com/css2?family=Outfit:wght@400;700 (request it with
 * a legacy user agent to be served .ttf rather than .woff2).
 */

import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Flat brandBlue. Must stay equal to `hsl(var(--primary))` in
 *  mobile/app/globals.css: the native launch screen hands straight over to the
 *  web splash (StartupSplash.tsx) and any difference reads as a flash. */
const BRAND_BLUE = "#1C7BD9";

/** The mark, largest copy in the repo (1536x1024, ~536px wide, on flat white). */
const SOURCE_MARK = join(ROOT, "public/icons/icon-1.png");

const ICON_PX = 1024; // The single universal size modern Xcode asks for.
/** The system squircle-masks the icon, so the mark is inset well clear of it. */
const ICON_MARK_PX = 700;

const SPLASH_PX = 2732;
/**
 * LaunchScreen.storyboard scales this square image with `scaleAspectFill`. On
 * the tallest iPhone (19.5:9) that leaves only the middle ~46% of the width on
 * screen, and the same fraction of the height in landscape — so every pixel of
 * artwork has to sit inside this centred box or it can be cropped away.
 */
const SPLASH_SAFE_PX = Math.round(SPLASH_PX * 0.46);

const args = process.argv.slice(2);
const fontsArg = args.indexOf("--fonts");
const FONT_DIR = fontsArg !== -1 ? resolve(args[fontsArg + 1]) : join(ROOT, "scripts/.fonts");

/**
 * Point librsvg at a font directory of our own. fontconfig is process-wide and
 * read at first use, so this has to happen before any sharp render.
 */
function useBrandFonts() {
  const hasOutfit =
    existsSync(join(FONT_DIR, "Outfit-Bold.ttf")) && existsSync(join(FONT_DIR, "Outfit-Regular.ttf"));
  if (!hasOutfit) return false;
  const dir = mkdtempSync(join(tmpdir(), "pw-fonts-"));
  const cache = join(dir, "cache");
  mkdirSync(cache);
  writeFileSync(
    join(dir, "fonts.conf"),
    `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>` +
      `<dir>${FONT_DIR}</dir><dir>/usr/share/fonts</dir><cachedir>${cache}</cachedir></fontconfig>`,
  );
  process.env.FONTCONFIG_FILE = join(dir, "fonts.conf");
  return true;
}

/**
 * The brand mark ships composited onto flat white with no alpha channel, so it
 * cannot simply be placed on a coloured ground. Recover the alpha from how far
 * each pixel departs from white, then un-premultiply to get the original ink
 * back. Same derivation as the Android launcher icon.
 */
async function markWithAlpha() {
  const { data, info } = await sharp(SOURCE_MARK).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const d = Math.max(255 - r, 255 - g, 255 - b);
    // A 10/60 ramp: below 10 is scanner noise in the white ground, 60 and above
    // is solid ink. Anything between is an antialiased edge.
    const a = Math.min(1, Math.max(0, (d - 10) / 60));
    out[i + 3] = Math.round(a * 255);
    if (a === 0) continue;
    for (let c = 0; c < 3; c += 1) {
      out[i + c] = Math.round(Math.min(255, Math.max(0, 255 - (255 - data[i + c]) / a)));
    }
  }
  // Trim the white margin: `trim` works on the alpha channel once there is one.
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
    .then((png) => sharp(png).trim().png().toBuffer());
}

async function buildIcon(mark) {
  const fitted = await sharp(mark)
    .resize({ width: ICON_MARK_PX, height: ICON_MARK_PX, fit: "inside", kernel: "lanczos3" })
    .toBuffer();
  const target = join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
  await sharp({
    create: { width: ICON_PX, height: ICON_PX, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: fitted, gravity: "centre" }])
    // App Store icons must be fully opaque — an alpha channel is rejected at
    // upload, and the white ground is deliberate (it matches the mark's own
    // ground on /download and in the header CTA).
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(target);
  return target;
}

async function buildSplash(mark, haveOutfit) {
  const family = haveOutfit ? "Outfit" : "sans-serif";

  const PLATE = 560;
  const PLATE_MARK = 400;
  const GAP_AFTER_PLATE = 96;
  const NAME_SIZE = 150;
  const GAP_AFTER_NAME = 30;
  const TAGLINE_SIZE = 54;

  const stackHeight = PLATE + GAP_AFTER_PLATE + NAME_SIZE + GAP_AFTER_NAME + TAGLINE_SIZE;
  if (stackHeight > SPLASH_SAFE_PX) throw new Error(`splash stack ${stackHeight}px exceeds the safe box`);

  const top = Math.round((SPLASH_PX - stackHeight) / 2);
  const plateX = Math.round((SPLASH_PX - PLATE) / 2);
  const centre = SPLASH_PX / 2;
  // Baselines: the name sits a cap-height below the top of its slot.
  const nameBaseline = top + PLATE + GAP_AFTER_PLATE + Math.round(NAME_SIZE * 0.78);
  const taglineBaseline = nameBaseline + GAP_AFTER_NAME + TAGLINE_SIZE;

  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PLATE}" height="${PLATE}">` +
      `<rect width="${PLATE}" height="${PLATE}" rx="132" ry="132" fill="#ffffff"/></svg>`,
  );

  const type = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH_PX}" height="${SPLASH_PX}">` +
      `<text x="${centre}" y="${nameBaseline}" text-anchor="middle" font-family="${family}" ` +
      `font-size="${NAME_SIZE}" font-weight="700" letter-spacing="-2" fill="#ffffff">PharmaWallah</text>` +
      // White at 90% — the same value the web splash's tagline uses, where 75%
      // was measured below 4.5:1 on brandBlue.
      `<text x="${centre}" y="${taglineBaseline}" text-anchor="middle" font-family="${family}" ` +
      `font-size="${TAGLINE_SIZE}" font-weight="400" fill="#ffffff" fill-opacity="0.9">` +
      `Offline Pharmaceutical Calculator Suite</text></svg>`,
  );

  const fittedMark = await sharp(mark)
    .resize({ width: PLATE_MARK, height: PLATE_MARK, fit: "inside", kernel: "lanczos3" })
    .toBuffer();
  const markMeta = await sharp(fittedMark).metadata();

  const png = await sharp({
    create: { width: SPLASH_PX, height: SPLASH_PX, channels: 4, background: BRAND_BLUE },
  })
    .composite([
      { input: plate, left: plateX, top },
      {
        input: fittedMark,
        left: plateX + Math.round((PLATE - (markMeta.width ?? 0)) / 2),
        top: top + Math.round((PLATE - (markMeta.height ?? 0)) / 2),
      },
      { input: type, left: 0, top: 0 },
    ])
    .flatten({ background: BRAND_BLUE })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Splash.imageset lists the same square at 1x/2x/3x, which is how the
  // Capacitor template ships it: one artwork, scaled by the storyboard.
  const dir = join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset");
  const names = ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"];
  for (const name of names) writeFileSync(join(dir, name), png);
  return names.map((n) => join(dir, n));
}

const haveOutfit = useBrandFonts();
const mark = await markWithAlpha();
const icon = await buildIcon(mark);
const splash = await buildSplash(mark, haveOutfit);

console.log(`Type face: ${haveOutfit ? "Outfit (brand)" : "SYSTEM FALLBACK — pass --fonts <dir> with Outfit .ttf"}`);
console.log(`Icon:   ${icon}`);
for (const f of splash) console.log(`Splash: ${f}`);
