import { unstable_cache } from "next/cache";
import clientPromise from "../../../lib/mongodb";

/*
 * Server component — the cover's figures, counted from the database rather
 * than typed. The page used to print "17.4k+ drugs, 50k+ interactions, 100k+
 * products, 200+ categories"; measured on 2026-09-13 there are 12,673 drugs,
 * interaction and product lists are stored as capped samples (so no honest
 * total exists for either), and there are 1,171 direct-parent classes.
 *
 * The count scans ~140 MB across three collections (~0.5 s), so it is cached
 * for a day and streamed behind a Suspense boundary: the search is usable
 * before the numbers arrive, and if Mongo is down the figures simply don't
 * render (caches fail open — CLAUDE.md §6 rule 7).
 */

const COLLECTIONS = ["drugsdata", "drugsdata_0", "drugsdata_1"];

type Counts = { total: number; approved: number; smallMolecule: number; biotech: number };

const getCounts = unstable_cache(
  async (): Promise<Counts> => {
    const db = (await clientPromise).db("pharmacopedia");
    const groups = await Promise.all(
      COLLECTIONS.map((c) =>
        db
          .collection(c)
          .aggregate<{ _id: { s?: string; t?: string }; n: number }>([
            { $group: { _id: { s: "$status", t: "$drug_type" }, n: { $sum: 1 } } },
          ])
          .toArray(),
      ),
    );
    const counts: Counts = { total: 0, approved: 0, smallMolecule: 0, biotech: 0 };
    groups.flat().forEach(({ _id, n }) => {
      counts.total += n;
      if (_id.s === "approved") counts.approved += n;
      if (_id.t === "small molecule") counts.smallMolecule += n;
      if (_id.t === "biotech") counts.biotech += n;
    });
    return counts;
  },
  ["encyclopedia-counts-v1"],
  { revalidate: 86_400 },
);

export default async function EncyclopediaFigures() {
  let counts: Counts;
  try {
    counts = await getCounts();
  } catch (err) {
    console.error("[encyclopedia] figure counts unavailable", err);
    return null;
  }
  if (!counts.total) return null;

  const rows = [
    { value: counts.total, label: "drugs on record" },
    { value: counts.approved, label: "approved for use" },
    { value: counts.smallMolecule, label: "small molecules" },
    { value: counts.biotech, label: "biotech products" },
  ];

  return (
    <dl className="pw-enc-figs">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value.toLocaleString("en-US")}</dd>
        </div>
      ))}
      <p className="pw-enc-figs__src">Counted from the DrugBank import · refreshed daily</p>
    </dl>
  );
}

/** Same footprint as the figures, so nothing shifts when they stream in. */
export function EncyclopediaFiguresFallback() {
  return (
    <div className="pw-enc-figs pw-enc-figs--wait" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
