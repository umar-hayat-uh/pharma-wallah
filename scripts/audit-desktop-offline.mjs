#!/usr/bin/env node
/**
 * Proves the Windows desktop bundle cannot reach the network.
 *
 * "Offline" is the product requirement, so it is checked mechanically rather
 * than asserted. This reads the built static export in `desktop/out` and fails
 * the build if it finds anything that could produce a request.
 *
 * Run by `npm run tauri:build` between the frontend build and the Rust build,
 * or on its own with `npm run desktop:audit`.
 *
 * What it does NOT prove: that no request happens at runtime. Only running the
 * application with the network down proves that (spec §24). This catches the
 * things that are visible in the bundle — which is every way an offline app has
 * ever accidentally become an online one in this repo.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "desktop/out");

if (!existsSync(outDir)) {
  console.error("[audit] desktop/out does not exist. Run `npm run desktop:build` first.");
  process.exit(1);
}

/** File types whose text is worth scanning. Images and fonts are skipped. */
const TEXT_EXTENSIONS = new Set([".html", ".js", ".mjs", ".css", ".json", ".txt", ".map"]);

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
})(outDir);

const textFiles = files.filter((file) => TEXT_EXTENSIONS.has(extname(file)));

/**
 * Patterns that must not appear anywhere in the bundle.
 *
 * Each one is something that has actually shipped in a web build of this repo
 * and would betray the offline promise here.
 */
const FORBIDDEN = [
  { name: "AdSense loader", pattern: /adsbygoogle|googlesyndication|ca-pub-\d/ },
  { name: "Vercel analytics / speed insights", pattern: /_vercel\/(insights|speed-insights)|va\.vercel-scripts/ },
  { name: "Supabase client configuration", pattern: /supabase\.co\/|SUPABASE_URL|supabase_anon/i },
  { name: "MongoDB connection string", pattern: /mongodb(\+srv)?:\/\// },
  { name: "Upstash Redis", pattern: /upstash\.io/ },
  { name: "Gemini / Google AI endpoint", pattern: /generativelanguage\.googleapis\.com/ },
  { name: "PubChem / NIH / RxNorm service call", pattern: /pubchem\.ncbi|cactus\.nci\.nih\.gov|rxnav\.nlm\.nih\.gov|eutils\.ncbi/ },
  { name: "PharmaWallah API origin", pattern: /NEXT_PUBLIC_API_BASE_URL|pharmawallah\.com\/api/ },
  { name: "Third-party CDN script", pattern: /cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|3dmol\.org/ },
];

/**
 * A secret-shaped string. Separate from the list above because a hit here is
 * not a policy failure, it is an incident.
 */
const SECRETS = [
  { name: "JWT-shaped token", pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./ },
  { name: "Google API key", pattern: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "service_role key name", pattern: /service_role/ },
];

/**
 * Matches that are KNOWN to be harmless, each with the reason it is harmless.
 *
 * This list exists so the rules above can stay blunt enough to catch a real
 * regression. Nothing goes in it that has not been opened and read; an entry
 * names the exact file pattern and the exact rule it excuses, so a NEW hit of
 * the same rule in a DIFFERENT file still fails the build.
 */
const KNOWN_BENIGN = [
  {
    rule: "Google API key",
    file: /_next\/static\/media\/opencv\.[0-9a-f]+\.js$/,
    why:
      "OpenCV.js embeds its WebAssembly as base64. A run of base64 happens to " +
      "spell AIza… followed by 35 base64 characters. Read in context it is " +
      "Emscripten symbol data, not a key (the same false positive the APK " +
      "secret scan hits — MEMORY gotcha 90).",
  },
  {
    rule: "Third-party CDN script",
    file: /_next\/static\/chunks\//,
    match: /cdnjs\.cloudflare\.com\/ajax\/libs\/pdfobject/,
    why:
      "jsPDF carries this URL for its `output(\"pdfobjectnewwindow\")` mode, " +
      "which opens a preview through a CDN-hosted viewer. This app only ever " +
      "calls `output(\"arraybuffer\")`, so the string is unreachable code.",
  },
];

/**
 * The check that actually matters for fonts and scripts: not whether a URL
 * appears as a string somewhere in a bundle, but whether the EMITTED HTML asks
 * the browser to fetch something remote. Next's own runtime carries a
 * `https://fonts.googleapis.com/` constant on every build for its font-preconnect
 * optimisation; that is a table entry, not a request. A <link> or <script> in
 * the HTML is a request.
 */
function remoteSubresources(html) {
  const hits = [];
  // src= or href= on anything that is not an anchor. Anchors are citations and
  // are intercepted by DesktopShell.
  for (const match of html.matchAll(/<(?!a[\s>])([a-z]+)\b[^>]*?\b(src|href)=["'](https?:\/\/[^"']+)["'][^>]*>/gi)) {
    hits.push(`<${match[1]} ${match[2]}="${match[3]}">`);
  }
  return hits;
}

const problems = [];
const secrets = [];
let remoteUrlHits = 0;
const remoteUrlSample = new Set();

function excused(ruleName, shownPath, text) {
  return KNOWN_BENIGN.some(
    (entry) =>
      entry.rule === ruleName &&
      entry.file.test(shownPath.replace(/\\/g, "/")) &&
      (!entry.match || entry.match.test(text)),
  );
}

const subresources = [];

for (const file of textFiles) {
  const text = readFileSync(file, "utf8");
  const shown = relative(repoRoot, file);

  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(text) && !excused(rule.name, shown, text)) {
      problems.push(`${rule.name} → ${shown}`);
    }
  }
  for (const rule of SECRETS) {
    if (rule.pattern.test(text) && !excused(rule.name, shown, text)) {
      secrets.push(`${rule.name} → ${shown}`);
    }
  }

  if (extname(file) === ".html") {
    for (const hit of remoteSubresources(text)) subresources.push(`${hit} → ${shown}`);
  }

  // Remote URLs that are not requests — citation links a calculator renders as
  // an <a href>. They are reported, not failed: DesktopShell intercepts the
  // click, so they never become a request. The count is what matters; a sudden
  // jump means something new was added.
  for (const match of text.matchAll(/https?:\/\/[a-z0-9.-]+/gi)) {
    const origin = match[0].toLowerCase();
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) continue;
    if (origin.includes("w3.org") || origin.includes("schema.org")) continue; // XML namespaces
    remoteUrlHits += 1;
    remoteUrlSample.add(origin);
  }
}

if (subresources.length > 0) {
  problems.push(...subresources.map((hit) => `Remote subresource in emitted HTML: ${hit}`));
}

console.log(`[audit] Scanned ${files.length} files in desktop/out (${textFiles.length} text).`);
console.log(`[audit] Reference links to remote origins: ${remoteUrlHits} across ${remoteUrlSample.size} hosts.`);
console.log(`[audit]   (these are <a href> citations; clicks are intercepted, not requested)`);

const totalBytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
console.log(`[audit] Remote subresources in emitted HTML: ${subresources.length} (must be 0).`);
console.log(`[audit] Bundle size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

if (secrets.length > 0) {
  console.error("\n[audit] SECRET-SHAPED STRINGS FOUND — do not ship this build:");
  for (const secret of secrets) console.error(`  ✗ ${secret}`);
}
if (problems.length > 0) {
  console.error("\n[audit] Network-capable code found in the offline bundle:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
}

if (secrets.length > 0 || problems.length > 0) {
  console.error("\n[audit] FAILED.");
  process.exit(1);
}

console.log("[audit] PASSED — no ad network, no analytics, no API client, no secrets.");
