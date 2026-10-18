#!/usr/bin/env node
/**
 * Publish the spotting renders under content-hash names.
 *
 *   node scripts/osteology/hash-images.mjs
 *
 * Run after render-spotting.py. A render is written as <id>.webp, and an id names its
 * answer ("bone-femur-left-posterior"), so serving it under that name would put the
 * answer in the page's image URL. This renames each to <sha256 of the bytes, 16 hex>.webp,
 * records that as `file` in src/lib/osteology/generated/spotting-images.json, and deletes
 * any .webp in the folder the manifest no longer references. Idempotent.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIR = path.join(ROOT, "public/images/osteology/spotting");
const MANIFEST = path.join(ROOT, "src/lib/osteology/generated/spotting-images.json");

const data = JSON.parse(readFileSync(MANIFEST, "utf8"));
const keep = new Set();
for (const img of data.images) {
  const raw = path.join(DIR, `${img.id}.webp`);
  if (existsSync(raw)) {
    const bytes = readFileSync(raw);
    const file = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.webp`;
    renameSync(raw, path.join(DIR, file));
    img.file = file;
  } else if (!img.file || !existsSync(path.join(DIR, img.file))) {
    throw new Error(`No image for ${img.id} — re-run render-spotting.py`);
  }
  keep.add(img.file);
}
let removed = 0;
for (const f of readdirSync(DIR)) {
  if (f.endsWith(".webp") && !keep.has(f)) {
    unlinkSync(path.join(DIR, f));
    removed++;
  }
}
writeFileSync(MANIFEST, `${JSON.stringify(data, null, 1)}\n`);
console.log(`${data.images.length} images published, ${removed} stale file(s) removed`);
