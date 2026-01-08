import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit") || 10);
    const page = Number(searchParams.get("page") || "1");
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

    // Create search query - search only by name and synonyms
    const searchQuery = {
      $or: [
        // Exact name match (highest priority)
        { name: { $regex: `^${escaped}$`, $options: "i" } },
        // Name starts with query (second priority)
        { name: { $regex: `^${escaped}`, $options: "i" } },
        // Name contains query (third priority)
        { name: { $regex: escaped, $options: "i" } },
        // Search in synonyms
        { 'synonyms.name': { $regex: escaped, $options: "i" } }
      ]
    };

    // Add relevance scoring for better sorting
    const pipeline = [
      { $match: searchQuery },
      {
        $addFields: {
          relevance: {
            $switch: {
              branches: [
                // Exact name match gets highest score
                {
                  case: { $regexMatch: { input: "$name", regex: `^${escaped}$`, options: "i" } },
                  then: 100
                },
                // Name starts with query gets high score
                {
                  case: { $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } },
                  then: 80
                },
                // Name contains query gets medium score
                {
                  case: { $regexMatch: { input: "$name", regex: escaped, options: "i" } },
                  then: 60
                },
                // Synonym match gets lower score
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$synonyms",
                            as: "syn",
                            cond: {
                              $regexMatch: {
                                input: "$$syn.name",
                                regex: `^${escaped}$`,
                                options: "i"
                              }
                            }
                          }
                        }
                      },
                      0
                    ]
                  },
                  then: 50
                },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$synonyms",
                            as: "syn",
                            cond: {
                              $regexMatch: {
                                input: "$$syn.name",
                                regex: `^${escaped}`,
                                options: "i"
                              }
                            }
                          }
                        }
                      },
                      0
                    ]
                  },
                  then: 40
                },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$synonyms",
                            as: "syn",
                            cond: {
                              $regexMatch: {
                                input: "$$syn.name",
                                regex: escaped,
                                options: "i"
                              }
                            }
                          }
                        }
                      },
                      0
                    ]
                  },
                  then: 30
                }
              ],
              default: 10
            }
          }
        }
      },
      { $sort: { relevance: -1, name: 1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    // Search across all collections with pipeline
    const results = await Promise.all(
      collections.map((collection) =>
        collection.aggregate(pipeline).toArray()
      )
    );

    // Flatten and deduplicate results
    const flattenedResults = results.flat();
    const uniqueResults = flattenedResults.filter(
      (drug, index, self) =>
        index === self.findIndex(d =>
          d.drugbank_ids?.[0]?.id === drug.drugbank_ids?.[0]?.id
        )
    );

    // Get total count from first collection
    const totalCount = await collections[0].countDocuments(searchQuery);

    return NextResponse.json({
      success: true,
      data: uniqueResults.slice(0, limit),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      searchQuery: q
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}