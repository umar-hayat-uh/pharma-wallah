import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DrugFoodInteractionModel from "@/lib/models/DrugFoodInteraction";
import { processDrugInteractions, categorizeInteraction } from "@/lib/drug-food-interactions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode") || "drug"; // "drug" | "food" | "autocomplete" | "examples"
        const query = (searchParams.get("q") || "").trim();
        const drugName = searchParams.get("drug") || "";

        await connectDB();

        // 1. Return popular curated examples for zero-state
        if (mode === "examples") {
            const examples = await DrugFoodInteractionModel.find({
                name: { $in: ["Metformin", "Phenytoin", "Cyclosporine", "Doxycycline", "Lovastatin", "Warfarin", "Levothyroxine", "Ciprofloxacin"] }
            })
                .select("name -_id")
                .lean();

            return NextResponse.json({
                success: true,
                examples: examples.map((e) => e.name),
            });
        }

        // 2. Autocomplete suggestions for Drug Search Input
        if (mode === "autocomplete") {
            if (!query) {
                return NextResponse.json({ success: true, suggestions: [] });
            }

            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");
            const startsWithRegex = new RegExp(`^${escaped}`, "i");

            // Prioritize startsWith, then contains
            const results = await DrugFoodInteractionModel.find({
                $or: [{ name: startsWithRegex }, { name: regex }],
            })
                .select("name -_id")
                .limit(10)
                .lean();

            return NextResponse.json({
                success: true,
                suggestions: results.map((r) => r.name),
            });
        }

        // 3. Exact Drug Detail Lookup
        if (drugName) {
            const escaped = drugName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const drugDoc = await DrugFoodInteractionModel.findOne({
                name: { $regex: new RegExp(`^${escaped}$`, "i") },
            }).lean();

            if (!drugDoc) {
                return NextResponse.json(
                    { success: false, message: `Medication "${drugName}" not found in dataset.` },
                    { status: 404 }
                );
            }

            const { categorizedInteractions, availableCategories } = processDrugInteractions(
                drugDoc.food_interactions || []
            );

            return NextResponse.json({
                success: true,
                data: {
                    drug: {
                        name: drugDoc.name,
                        reference: drugDoc.reference,
                        food_interactions: drugDoc.food_interactions,
                    },
                    categorizedInteractions,
                    availableCategories,
                    totalInteractions: drugDoc.food_interactions.length,
                },
            });
        }

        // 4. Food / Substance Search Mode
        if (mode === "food" && query) {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");

            const matchingDrugs = await DrugFoodInteractionModel.find({
                food_interactions: { $elemMatch: { $regex: regex } },
            })
                .select("name reference food_interactions")
                .limit(60)
                .lean();

            const results = matchingDrugs.map((drug) => {
                const matchingStatements = drug.food_interactions
                    .filter((text: string) => regex.test(text))
                    .map(categorizeInteraction);

                return {
                    drugName: drug.name,
                    reference: drug.reference,
                    matchingInteractions: matchingStatements,
                };
            });

            return NextResponse.json({
                success: true,
                query,
                count: results.length,
                results,
            });
        }

        // 5. Default Drug Name Search Query
        if (query) {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const startsWithRegex = new RegExp(`^${escaped}`, "i");
            const containsRegex = new RegExp(escaped, "i");

            const drugs = await DrugFoodInteractionModel.find({
                $or: [
                    { name: startsWithRegex },
                    { name: containsRegex },
                    { food_interactions: { $elemMatch: { $regex: containsRegex } } },
                ],
            })
                .select("name reference food_interactions")
                .limit(20)
                .lean();

            return NextResponse.json({
                success: true,
                results: drugs,
            });
        }

        return NextResponse.json({ success: true, message: "Ready" });
    } catch (error: any) {
        console.error("API error in drug-food-interactions:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}