#!/usr/bin/env node
/*
 * Captures the Android app's real screens for the home page's app section:
 *   npm run mobile:build                      # if mobile/out is stale
 *   node scripts/home/capture-app-screens.mjs
 *   -> public/images/home/app-home.webp, app-dilution.webp
 *
 * Serves mobile/out (the exact bundle Capacitor wraps into the APK) on an
 * ephemeral port and screenshots it in headless Chrome at a 390×844 phone, 3×.
 * Re-run after an APK release so the page never shows an older app.
 */
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const ROOT = resolve(import.meta.dirname, "../..");
const APP = join(ROOT, "mobile/out");
const OUT = join(ROOT, "public/images/home");

const SCREENS = {
  home: "/",
  dilution: "/calculation-tools/dilution-calculator/",
};

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join(APP, path);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    file = join(APP, "404.html");
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const work = await mkdtemp(join(tmpdir(), "pw-app-shots-"));

try {
  for (const [name, path] of Object.entries(SCREENS)) {
    const png = join(work, `${name}.png`);
    await run("google-chrome", [
      "--headless=new",
      "--no-first-run",
      "--hide-scrollbars",
      "--force-device-scale-factor=3",
      "--virtual-time-budget=8000",
      "--window-size=390,844",
      `--user-data-dir=${join(work, "profile")}`,
      `--screenshot=${png}`,
      `http://127.0.0.1:${port}${path}`,
    ]);
    const out = join(OUT, `app-${name}.webp`);
    const info = await sharp(png).resize({ width: 780 }).webp({ quality: 86, effort: 6 }).toFile(out);
    console.log(`${name.padEnd(9)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB  -> ${out.replace(ROOT + "/", "")}`);
  }
} finally {
  server.close();
  await rm(work, { recursive: true, force: true });
}
