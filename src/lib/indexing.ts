/**
 * Which routes search engines may index — ONE place (2026-10-13, AdSense
 * remediation phase 2).
 *
 * Every entry is a switch: set `index: true` (or delete the entry) when the
 * page's content is ready, and the `noindex, follow` tag and the sitemap
 * exclusion both go away together. Read by:
 *  - src/lib/seo.ts (`metaForPath`, `pageMeta`) → `<meta name="robots">`;
 *  - src/app/sitemap.ts → an entry here keeps the URL out of sitemap.xml.
 *
 * `noindex, follow`, never robots.txt: the pages stay reachable and their links
 * are still followed; they are only kept out of the index (MEMORY gotcha 162).
 * A reason is required so the next person knows what "ready" means.
 */

type Rule = {
  /** `prefix` also covers every path below it. */
  match: "exact" | "prefix";
  index: boolean;
  reason: string;
};

export const INDEXING: Record<string, Rule> = {
  // ── Private, account or admin ──────────────────────────────────────────
  "/dashboard": { match: "prefix", index: false, reason: "signed-in only" },
  "/admin": { match: "prefix", index: false, reason: "admin only" },
  "/battle-royale/admin": { match: "prefix", index: false, reason: "admin only" },
  "/pw": { match: "prefix", index: false, reason: "internal" },
  "/community/submit": { match: "exact", index: false, reason: "a form, sign-in required" },
  "/community/saved": { match: "exact", index: false, reason: "signed-in only" },

  // ── Ended or closed events ─────────────────────────────────────────────
  "/tournament": { match: "prefix", index: false, reason: "Science Fair 2026 ended" },
  "/leaderboard": { match: "prefix", index: false, reason: "old tournament board" },
  "/battle-royale": { match: "prefix", index: false, reason: "event closed; the board is a list of names and scores, not content" },

  // ── Interactive tools with little text of their own (< 300 unique words, AUDIT.md) ──
  "/encyclopedia": { match: "prefix", index: false, reason: "280 unique words; records are DrugBank text (licence unverified, Known Issue 16)" },
  "/community": { match: "prefix", index: false, reason: "user posts; 63 unique words on the hub" },
  "/adr-detective": { match: "exact", index: false, reason: "39 unique words — a game" },
  "/ai-guide": { match: "exact", index: false, reason: "237 unique words — a chat tool" },
  "/prescription-reader": { match: "exact", index: false, reason: "37 unique words — an upload tool" },
  "/drug-finder": { match: "exact", index: false, reason: "68 unique words — a search box" },
  "/antibiogram-simulator": { match: "exact", index: false, reason: "143 unique words" },
  "/molecular-lab": { match: "exact", index: false, reason: "195 unique words — an editor" },
  "/compounding-lab": { match: "exact", index: false, reason: "160 unique words" },
  "/simulations/titration": { match: "exact", index: false, reason: "38 unique words before the simulation loads" },
  "/simulations/dilution-lab": { match: "exact", index: false, reason: "29 unique words" },
  "/simulations/staining-lab": { match: "exact", index: false, reason: "26 unique words" },
  "/simulations/uv-lab": { match: "exact", index: false, reason: "44 unique words" },
  "/simulations/buffer-lab": { match: "exact", index: false, reason: "46 unique words" },
  "/simulations/organic-id-lab": { match: "exact", index: false, reason: "62 unique words" },
  "/spotting/histology/test": { match: "exact", index: false, reason: "a timed test, 90 unique words" },
  "/spotting/pathology/test": { match: "exact", index: false, reason: "a timed test, 51 unique words" },
  "/spotting/powder-microscopy/test": { match: "exact", index: false, reason: "being rebuilt (no images)" },

  // ── Duplicates ─────────────────────────────────────────────────────────
  "/mcqs-bank/semester-4/physical-pharmacy": { match: "exact", index: false, reason: "same bank as Semester 1 (canonicalises there)" },

  // ── Clinical sub-brand: search shells and tool lists ───────────────────
  "/clinical/encyclopedia": { match: "prefix", index: false, reason: "DrugBank text (Known Issue 16)" },
  "/clinical/calculators": { match: "exact", index: false, reason: "110 unique words — a list" },
  "/clinical/dose-calculators": { match: "exact", index: false, reason: "122 unique words; links tools with known dosing errors (docs/CALCULATOR_INVENTORY_AND_ACCURACY.md §3)" },
  "/clinical/drug-drug-interaction": { match: "exact", index: false, reason: "100 unique words — a search tool" },
  "/clinical/drug-food-interaction": { match: "exact", index: false, reason: "129 unique words — a search tool" },
  "/clinical/adr": { match: "exact", index: false, reason: "74 unique words — a search tool" },
  "/clinical/amr": { match: "exact", index: false, reason: "93 unique words — a data explorer" },
  "/clinical/resources": { match: "prefix", index: false, reason: "198 unique words; search shells below it" },
};

function ruleFor(path: string): Rule | undefined {
  const p = path !== "/" ? path.replace(/\/+$/, "") : path;
  if (INDEXING[p]?.match === "exact" || INDEXING[p]?.match === "prefix") return INDEXING[p];
  // Longest matching prefix wins, so a specific `index: true` can override a parent.
  let best: { len: number; rule: Rule } | undefined;
  for (const [key, rule] of Object.entries(INDEXING)) {
    if (rule.match === "prefix" && p.startsWith(`${key}/`) && (!best || key.length > best.len)) {
      best = { len: key.length, rule };
    }
  }
  return best?.rule;
}

/** True when the route must carry `noindex, follow` and stay out of the sitemap. */
export function isNoindex(path: string): boolean {
  const rule = ruleFor(path);
  return rule ? !rule.index : false;
}
