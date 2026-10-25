#!/usr/bin/env node
/*
 * Renders the home page's apparatus stills -> public/images/home/*.webp
 *
 *   node scripts/home/render-apparatus.mjs            # every shot
 *   node scripts/home/render-apparatus.mjs femur      # one shot
 *
 * Bundles apparatus-harness.ts with the repo's esbuild, serves it next to
 * public/ on an ephemeral port, and lets headless Chrome (SwiftShader WebGL,
 * transparent default background) screenshot each `?shot=`. sharp then trims
 * the empty margin and writes an alpha WebP. Needs google-chrome on PATH; not
 * part of any build — the WebPs are committed.
 */
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const ROOT = resolve(import.meta.dirname, "../..");

// esbuild is not a direct dependency (it arrives transitively and pnpm does
// not hoist it), so take whichever copy the store holds rather than adding one.
const esbuildDir = (await readdir(join(ROOT, "node_modules/.pnpm"))).find((d) => /^esbuild@\d/.test(d));
if (!esbuildDir) throw new Error("esbuild not found in node_modules/.pnpm");
const { build } = await import(pathToFileURL(join(ROOT, "node_modules/.pnpm", esbuildDir, "node_modules/esbuild/lib/main.js")).href);
const OUT = join(ROOT, "public/images/home");

/** Window size in CSS px (rendered at DPR 3); `width` caps the published WebP's width. */
const SHOTS = {
  glassware: { w: 700, h: 980, width: 1100 },
  balance: { w: 900, h: 800, width: 1200 },
  microscope: { w: 760, h: 900, width: 1100 },
  femur: { w: 600, h: 1000, width: 800 },
};

const only = process.argv.slice(2);
const shots = Object.entries(SHOTS).filter(([name]) => !only.length || only.includes(name));

const work = await mkdtemp(join(tmpdir(), "pw-home-shots-"));
await build({
  entryPoints: [join(import.meta.dirname, "apparatus-harness.ts")],
  bundle: true,
  format: "esm",
  outfile: join(work, "harness.js"),
  logLevel: "warning",
});
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}</style><script type="module" src="/harness.js"></script>`;

const TYPES = { ".js": "text/javascript", ".glb": "model/gltf-binary", ".html": "text/html" };
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  const file = path === "/" ? null : path === "/harness.js" ? join(work, "harness.js") : join(ROOT, "public", path);
  try {
    const body = file ? await readFile(file) : html;
    res.writeHead(200, { "content-type": file ? TYPES[extname(file)] ?? "application/octet-stream" : "text/html" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

try {
  for (const [name, s] of shots) {
    const png = join(work, `${name}.png`);
    await run("google-chrome", [
      "--headless=new",
      "--no-first-run",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--hide-scrollbars",
      "--force-device-scale-factor=3",
      "--default-background-color=00000000",
      "--virtual-time-budget=20000",
      `--window-size=${s.w},${s.h}`,
      `--user-data-dir=${join(work, "profile")}`,
      `--screenshot=${png}`,
      `http://127.0.0.1:${port}/?shot=${name}`,
    ]);
    const out = join(OUT, `apparatus-${name}.webp`);
    const info = await sharp(png).trim({ threshold: 1 }).resize({ width: s.width, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(out);
    console.log(`${name.padEnd(11)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB  -> ${out.replace(ROOT + "/", "")}`);
  }
} finally {
  server.close();
  await rm(work, { recursive: true, force: true });
}
