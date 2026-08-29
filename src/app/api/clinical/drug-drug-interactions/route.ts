import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DrugDrugInteractionModel from "@/lib/models/DrugDrugInteraction";
import { DDISeverity, DrugDrugInteraction } from "@/types/drug-drug";

export const dynamic = "force-dynamic";

function createPairKey(a: string, b: string): string {
    const normA = (a || "").trim().toLowerCase();
    const normB = (b || "").trim().toLowerCase();
    return [normA, normB].sort().join("||");
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode");
        const query = (searchParams.get("q") || "").trim();
        const drugA = (searchParams.get("drugA") || "").trim();
        const drugB = (searchParams.get("drugB") || "").trim();

        await connectDB();

        // 1. Prototype Summary Statistics
        if (mode === "stats") {
            const [total, low, moderate, high] = await Promise.all([
                DrugDrugInteractionModel.countDocuments(),
                DrugDrugInteractionModel.countDocuments({ severity: "low" }),
                DrugDrugInteractionModel.countDocuments({ severity: "moderate" }),
                DrugDrugInteractionModel.countDocuments({ severity: "high" }),
            ]);

            return NextResponse.json({
                success: true,
                stats: { total, low, moderate, high },
            });
        }

        // 2. Curated Sample Pairs
        if (mode === "examples") {
            const examples = await DrugDrugInteractionModel.find({
                id: { $in: ["ddi-001", "ddi-002", "ddi-008", "ddi-009", "ddi-019"] },
            })
                .select("drugA drugB severity -_id")
                .lean();

            return NextResponse.json({ success: true, examples });
        }

        // 3. Autocomplete Drug Names Search
        if (mode === "autocomplete") {
            if (!query) {
                return NextResponse.json({ success: true, suggestions: [] });
            }

            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");

            const [matchesA, matchesB] = await Promise.all([
                DrugDrugInteractionModel.find({ drugA: regex }).select("drugA -_id").limit(10).lean(),
                DrugDrugInteractionModel.find({ drugB: regex }).select("drugB -_id").limit(10).lean(),
            ]);

            const nameSet = new Set<string>();
            matchesA.forEach((m) => nameSet.add(m.drugA));
            matchesB.forEach((m) => nameSet.add(m.drugB));

            const suggestions = Array.from(nameSet).slice(0, 8);
            return NextResponse.json({ success: true, suggestions });
        }

        // 4. Single Pair Interaction Lookup (drugA + drugB)
        if (drugA && drugB) {
            if (drugA.toLowerCase() === drugB.toLowerCase()) {
                return NextResponse.json({
                    success: true,
                    found: false,
                    isSameDrug: true,
                    message: "Please select two different medications.",
                });
            }

            const key = createPairKey(drugA, drugB);
            const match = await DrugDrugInteractionModel.findOne({ pairKey: key }).lean();

            if (!match) {
                return NextResponse.json({
                    success: true,
                    found: false,
                    drugA,
                    drugB,
                    message:
                        "No interaction was found in the PharmaWallah Clinical prototype database. Absence from this prototype database does not establish that no interaction exists.",
                });
            }

            return NextResponse.json({
                success: true,
                found: true,
                interaction: match,
                drugA,
                drugB,
            });
        }

        return NextResponse.json({ success: true, message: "DDI API Ready" });
    } catch (error: any) {
        console.error("API error in drug-drug-interactions:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// 5. Multi-Drug Regimen Evaluation (POST)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const drugs: string[] = body.drugs || [];

        const uniqueDrugs = Array.from(
            new Set(drugs.map((d: string) => d.trim()).filter(Boolean))
        );

        if (uniqueDrugs.length < 2) {
            return NextResponse.json(
                { success: false, message: "At least 2 unique medications are required." },
                { status: 400 }
            );
        }

        await connectDB();

        // Generate all pairwise keys
        const pairKeys: string[] = [];
        let totalPairsEvaluated = 0;

        for (let i = 0; i < uniqueDrugs.length; i++) {
            for (let j = i + 1; j < uniqueDrugs.length; j++) {
                totalPairsEvaluated++;
                pairKeys.push(createPairKey(uniqueDrugs[i], uniqueDrugs[j]));
            }
        }

        // Query MongoDB for all matching pairKeys in one indexed batch
        const interactions = await DrugDrugInteractionModel.find({
            pairKey: { $in: pairKeys },
        }).lean();

        const severityRank: Record<DDISeverity, number> = {
            high: 3,
            moderate: 2,
            low: 1,
        };

        interactions.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

        const highCount = interactions.filter((i) => i.severity === "high").length;
        const moderateCount = interactions.filter((i) => i.severity === "moderate").length;
        const lowCount = interactions.filter((i) => i.severity === "low").length;

        return NextResponse.json({
            success: true,
            summary: {
                drugsChecked: uniqueDrugs,
                totalPairsEvaluated,
                interactionsFound: interactions,
                highCount,
                moderateCount,
                lowCount,
                unmatchedPairCount: totalPairsEvaluated - interactions.length,
            },
        });
    } catch (error: any) {
        console.error("POST API error in drug-drug-interactions:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}