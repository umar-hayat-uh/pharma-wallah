export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit") || 10);

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Escape regex safely
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const client = await clientPromise;
    const db = client.db("pharmacopedia");

    const collections = [
      db.collection("drugsdata"),
      db.collection("drugsdata_0"),
      db.collection("drugsdata_1"),
    ];

    const pipeline = [
      {
        // 🔍 NAME ONLY SEARCH
        $match: {
          name: { $regex: escaped, $options: "i" },
        },
      },
      {
        // ⭐ RELEVANCE SCORING
        $addFields: {
          relevance: {
            $cond: [
              { $regexMatch: { input: "$name", regex: `^${escaped}$`, options: "i" } },
              100,
              {
                $cond: [
                  { $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } },
                  50,
                  10,
                ],
              },
            ],
          },
        },
      },
      { $sort: { relevance: -1, name: 1 } },
      { $limit: limit },
      { $unset: "relevance" },
    ];

    const results = await Promise.all(
      collections.map((collection) =>
        collection.aggregate(pipeline).toArray()
      )
    );

    // 🔁 Deduplicate across collections
    const merged = Object.values(
      results.flat().reduce<Record<string, any>>((acc, drug) => {
        const key = drug.drugbank_ids?.[0]?.id || drug.name;
        acc[key] ||= drug;
        return acc;
      }, {})
    );

    return NextResponse.json({
      success: true,
      data: merged.slice(0, limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}
