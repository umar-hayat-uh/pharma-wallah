import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export const dynamic = "force-dynamic"; // 👈 REQUIRED
export const runtime = "nodejs";        // ✅ REQUIRED


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const q = searchParams.get("q")?.trim() || "";

        if (q.length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Escape regex safely
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const client = await clientPromise;
        const db = client.db("pharmacopedia");
        const collection = db.collection("drugsdata");

        const searchQuery = {
            $or: [
                { name: { $regex: `^${escaped}`, $options: "i" } },
                { name: { $regex: escaped, $options: "i" } },
                { "synonyms.name": { $regex: escaped, $options: "i" } }
            ]
        };

        const pipeline = [
            { $match: searchQuery },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    unii: 1,
                    drug_type: 1,
                    drugbank_id: { $arrayElemAt: ["$drugbank_ids.id", 0] },
                    relevance: {
                        $switch: {
                            branches: [
                                {
                                    case: { $regexMatch: { input: "$name", regex: `^${escaped}$`, options: "i" } },
                                    then: 100
                                },
                                {
                                    case: { $regexMatch: { input: "$name", regex: `^${escaped}`, options: "i" } },
                                    then: 80
                                },
                                {
                                    case: { $regexMatch: { input: "$name", regex: escaped, options: "i" } },
                                    then: 60
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
                                }
                            ],
                            default: 10
                        }
                    }
                }
            },
            { $sort: { relevance: -1, name: 1 } },
            { $limit: 10 },
            { $unset: "relevance" }
        ];

        const results = await collection.aggregate(pipeline).toArray();

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Autocomplete error:", error);
        return NextResponse.json(
            { success: false, message: "Autocomplete failed" },
            { status: 500 }
        );
    }
}
