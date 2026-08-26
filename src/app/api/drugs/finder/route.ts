import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DrugFinderCache from "@/lib/models/DrugFinderCache";
import {
    searchRxNormByName,
    getIngredientsForRxcui,
    getAllRelatedConcepts,
} from "@/lib/api/rxnorm";

/**
 * DRUG FINDER — identity/normalization lookup only.
 * Source: RxNorm (NLM) exclusively. No openFDA call here by design —
 * this route answers "what is this drug / what's it related to",
 * not "is it safe". See /api/drugs/adverse-effects for safety data.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
        return NextResponse.json(
            { error: "Missing required query param 'q'" },
            { status: 400 }
        );
    }

    const queryKey = `finder:${query.toLowerCase()}`;

    await connectDB();

    // Check cache
    const cached = await DrugFinderCache.findOne({ queryKey });
    if (cached) {
        return NextResponse.json({ source: "cache", found: true, result: cached });
    }

    let rxnormResult;
    try {
        rxnormResult = await searchRxNormByName(query);
    } catch (err) {
        console.error("RxNorm lookup failed:", err);
        return NextResponse.json(
            { error: "RxNorm service unavailable, try again shortly" },
            { status: 502 }
        );
    }

    if (rxnormResult.exactMatches.length === 0) {
        return NextResponse.json({
            source: "rxnorm",
            found: false,
            suggestions: rxnormResult.suggestions,
            message:
                rxnormResult.suggestions.length > 0
                    ? "No exact match. Did you mean one of these?"
                    : "No match found in RxNorm.",
        });
    }

    const primaryMatch =
        rxnormResult.exactMatches.find((m) => m.tty === "IN") ??
        rxnormResult.exactMatches[0];

    let ingredientNames: string[] = [];
    let relatedBrands: string[] = [];
    let relatedGenerics: string[] = [];
    let doseForms: string[] = [];

    try {
        if (primaryMatch.tty === "IN" || primaryMatch.tty === "PIN") {
            ingredientNames = [primaryMatch.name];
        } else {
            const ingredients = await getIngredientsForRxcui(primaryMatch.rxcui);
            ingredientNames = ingredients.map((i) => i.name);
        }
    } catch (err) {
        console.error("RxNorm ingredient lookup failed:", err);
    }

    try {
        const related = await getAllRelatedConcepts(primaryMatch.rxcui);
        relatedBrands = related.brands;
        relatedGenerics = related.generics;
        doseForms = related.doseForms;
    } catch (err) {
        console.error("RxNorm related-concepts lookup failed:", err);
    }

    const result = {
        queryKey,
        rxcui: primaryMatch.rxcui,
        matchedName: primaryMatch.name,
        termType: primaryMatch.tty,
        ingredientNames,
        relatedBrands,
        relatedGenerics,
        doseForms,
        source: "rxnorm",
    };

    // Save to cache
    await DrugFinderCache.create(result);

    return NextResponse.json({
        source: "live",
        found: true,
        result,
        disclaimer:
            "Identity data (names, RxCUI, related brands/generics) is sourced from RxNorm (US National Library of Medicine). It reflects US-registered nomenclature and may not include Pakistan-specific brand names. For safety information (interactions, adverse effects, warnings), use the Adverse Effect Detector.",
    });
}