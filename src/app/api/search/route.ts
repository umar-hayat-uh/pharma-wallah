import { NextRequest, NextResponse } from "next/server";
import type { Document } from "mongodb";
import clientPromise from "../../../../lib/mongodb";
import { checkLimit, drugSearchLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic"; // 👈 REQUIRED
export const runtime = "nodejs";        // ✅ REQUIRED

/*
 * Drug search over the `pharmacopedia` database. Consumed by `/encyclopedia`
 * (EncyclopediaClient) and `/clinical/encyclopedia` (DrugSearch) — the response
 * shape `{ success, data, pagination, searchQuery }` is shared by both.
 *
 * The drugs are split across three collections with NO overlap (measured
 * 2026-09-13: 4,681 + 5,033 + 2,959 = 12,673 unique DrugBank IDs). The previous
 * version ran one aggregate per collection, applied skip/limit to each, then
 * concatenated — so results were not ordered by relevance across collections,
 * page 2 skipped rows, and `total` counted only the first collection ("aspirin"
 * reported 0 results while returning 2). It also sorted full documents
 * (~15 KB each), so a two-letter query spent seconds in a memory-heavy sort.
 *
 * Now: one aggregate that unions the three collections, projects each match
 * down to a few small fields, ranks, sorts and paginates that, and counts the
 * same set — then hydrates only the page's documents by _id.
 */

const COLLECTIONS = ["drugsdata", "drugsdata_0", "drugsdata_1"] as const;

const MAX_LIMIT = 20;
const MAX_PAGE = 500;
const MAX_QUERY_LENGTH = 80;

/*
 * DrugBank uses US adopted names. Most British/INN names are already synonyms
 * in the data (salbutamol → Albuterol, frusemide → Furosemide, pethidine →
 * Meperidine were all checked); these three were measured to find nothing, and
 * they are among the first names a student in Pakistan types.
 */
const NAME_ALIASES: Record<string, string> = {
  aspirin: "Acetylsalicylic acid",
  paracetamol: "Acetaminophen",
  lignocaine: "Lidocaine",
};

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  // Number(null) and Number("") are 0, not NaN — an omitted param must mean the default.
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const limit = clampInt(searchParams.get("limit"), 10, 1, MAX_LIMIT);
  const page = clampInt(searchParams.get("page"), 1, 1, MAX_PAGE);

  // Always return a pagination object: the client reads `pagination.total`,
  // and a one-letter query used to crash it into "Failed to fetch results".
  if (q.length < 2) {
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
      searchQuery: q,
    });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const rl = await checkLimit(drugSearchLimiter, ip);
  if (!rl.success) return errorResponse("Too many searches. Wait a few seconds and try again.", 429);

  try {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const alias = NAME_ALIASES[q.toLowerCase()];
    const upper = q.toUpperCase();

    // Identifiers are exact matches — DrugBank ID (DB00331), CAS (657-24-9),
    // UNII (9100L32L2N). The old placeholder promised CAS/UNII search but only
    // names and synonyms were ever queried.
    // A two-character query ("me", "in") matches thousands of names mid-word
    // and every synonym array — measured 1.5 s for noise. Two characters mean
    // "names starting with", which is also what a reader typing expects.
    const nameClauses: Document[] =
      q.length === 2
        ? [{ name: { $regex: `^${escaped}`, $options: "i" } }]
        : [
            { name: { $regex: escaped, $options: "i" } },
            { "synonyms.name": { $regex: escaped, $options: "i" } },
          ];

    const match: Document = {
      $or: [
        ...nameClauses,
        { "drugbank_ids.id": upper },
        { cas_number: q },
        { unii: upper },
        ...(alias ? [{ name: alias }] : []),
      ],
    };

    const slim = (coll: string): Document[] => [
      { $match: match },
      { $project: { name: 1, syn: "$synonyms.name", ids: "$drugbank_ids.id", cas_number: 1, unii: 1, coll: { $literal: coll } } },
    ];

    const [head, ...rest] = COLLECTIONS;
    const client = await clientPromise;
    const db = client.db("pharmacopedia");

    const [facet] = await db
      .collection(head)
      .aggregate([
        ...slim(head),
        ...rest.map((coll) => ({ $unionWith: { coll, pipeline: slim(coll) } })),
        {
          $addFields: {
            relevance: {
              $switch: {
                branches: [
                  {
                    case: {
                      $or: [
                        { $in: [upper, { $ifNull: ["$ids", []] }] },
                        { $eq: ["$cas_number", q] },
                        { $eq: ["$unii", upper] },
                        ...(alias ? [{ $eq: ["$name", alias] }] : []),
                        { $regexMatch: { input: "$name", regex: `^${escaped}$`, options: "i" } },
                      ],
                    },
                    then: 100,
                  },
                  { case: { $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } }, then: 80 },
                  { case: { $regexMatch: { input: "$name", regex: escaped, options: "i" } }, then: 60 },
                ],
                default: 40, // matched through a synonym
              },
            },
          },
        },
        { $sort: { relevance: -1, name: 1, _id: 1 } },
        {
          $facet: {
            total: [{ $count: "n" }],
            rows: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $project: { _id: 1, coll: 1 } }],
          },
        },
      ], {
        // Case-insensitive name order: with the default binary collation every
        // upper-case IUPAC name ("METHYL (2Z)-…") sorted ahead of "Mebendazole".
        collation: { locale: "en", strength: 2 },
      })
      .toArray();

    const total: number = facet?.total?.[0]?.n ?? 0;
    const rows: { _id: unknown; coll: string }[] = facet?.rows ?? [];

    // Hydrate the page's documents, one query per collection that has any.
    const byColl = new Map<string, unknown[]>();
    rows.forEach((r) => byColl.set(r.coll, [...(byColl.get(r.coll) ?? []), r._id]));
    const hydrated = await Promise.all(
      Array.from(byColl.entries()).map(([coll, ids]) =>
        db.collection(coll).find({ _id: { $in: ids as never[] } }).toArray(),
      ),
    );
    const docs = new Map(hydrated.flat().map((d) => [String(d._id), d]));
    const data = rows.map((r) => docs.get(String(r._id))).filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        searchQuery: q,
      },
      {
        // The dataset is a static DrugBank import, so identical searches can be
        // served from the CDN instead of re-running the aggregate.
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
      },
    );
  } catch (error) {
    console.error("Search error:", error);
    return errorResponse("Search failed", 500);
  }
}
