import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export const dynamic = "force-dynamic"; // 👈 REQUIRED
export const runtime = "nodejs";        // ✅ REQUIRED

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit") || 10);
    const page = Number(searchParams.get("page") || 1);
    const skip = (page - 1) * limit;

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

    const searchQuery = {
      $or: [
        { name: { $regex: `^${escaped}$`, $options: "i" } },
        { name: { $regex: `^${escaped}`, $options: "i" } },
        { name: { $regex: escaped, $options: "i" } },
        { "synonyms.name": { $regex: escaped, $options: "i" } },
      ],
    };

    const pipeline = [
      { $match: searchQuery },
      {
        $addFields: {
          relevance: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: "$name", regex: `^${escaped}$`, options: "i" } }, then: 100 },
                { case: { $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } }, then: 80 },
                { case: { $regexMatch: { input: "$name", regex: escaped, options: "i" } }, then: 60 },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$synonyms",
                            as: "syn",
                            cond: { $regexMatch: { input: "$$syn.name", regex: escaped, options: "i" } },
                          },
                        },
                      },
                      0,
                    ],
                  },
                  then: 40,
                },
              ],
              default: 10,
            },
          },
        },
      },
      { $sort: { relevance: -1, name: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const results = await Promise.all(
      collections.map((collection) => collection.aggregate(pipeline).toArray())
    );

    const flattened = results.flat();

    const unique = flattened.filter(
      (drug, index, self) =>
        index === self.findIndex(
          (d) => d.drugbank_ids?.[0]?.id === drug.drugbank_ids?.[0]?.id
        )
    );

    const totalCount = await collections[0].countDocuments(searchQuery);

    return NextResponse.json({
      success: true,
      data: unique.slice(0, limit),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      searchQuery: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}
