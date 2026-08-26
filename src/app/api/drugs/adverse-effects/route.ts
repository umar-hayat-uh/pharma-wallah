import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdverseEffectCache from "@/lib/models/AdverseEffectCache";
import {
    searchAdverseEffectsByName,
    getReportedAdverseEvents,
} from "@/lib/api/openfda";

/**
 * ADVERSE EFFECT DETECTOR — openFDA only, deliberately independent from
 * the Drug Finder tool. Takes a raw drug name (brand or generic) directly
 * to openFDA — no RxNorm normalization step. Two data angles combined:
 *   1. Label-derived: official adverse_reactions / warnings / boxed_warning text
 *   2. Report-derived: FAERS reported reaction counts (real-world reports,
 *      NOT causation-confirmed — flagged clearly to the user)
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

    const queryKey = `adverse:${query.toLowerCase()}`;

    await connectDB();

    // Check cache
    const cached = await AdverseEffectCache.findOne({ queryKey });
    if (cached) {
        return NextResponse.json({ source: "cache", found: true, result: cached });
    }

    // Fetch label and event data in parallel, but don't fail if one fails
    const [labelResult, eventResult] = await Promise.allSettled([
        searchAdverseEffectsByName(query),
        getReportedAdverseEvents(query),
    ]);

    // Extract label data (fallback to empty array)
    let labels: any[] = [];
    let reportedReactions: any[] = [];
    let labelError = false;
    let eventError = false;

    if (labelResult.status === "fulfilled") {
        labels = labelResult.value || [];
    } else {
        labelError = true;
        console.error("Label API failed:", labelResult.reason);
    }

    if (eventResult.status === "fulfilled") {
        reportedReactions = eventResult.value || [];
    } else {
        eventError = true;
        console.error("Event API failed:", eventResult.reason);
    }

    // If both failed, return an error
    if (labels.length === 0 && reportedReactions.length === 0) {
        // If only event failed but we have label data, we proceed
        // If both are empty, it's truly not found
        return NextResponse.json({
            source: "openfda",
            found: false,
            message: `No FDA label or adverse event report data found for "${query}". Try the generic/active-ingredient name instead of a brand name.`,
            // Include partial data if any
            result: labels.length > 0 ? { matchedGenericName: labels[0]?.genericName ?? [] } : undefined,
        });
    }

    const primaryLabel = labels[0] || {};

    const result = {
        queryKey,
        matchedGenericName: primaryLabel?.genericName ?? [],
        matchedBrandName: primaryLabel?.brandName ?? [],
        boxedWarning: primaryLabel?.boxedWarning ?? [],
        warnings: primaryLabel?.warnings ?? [],
        adverseReactions: primaryLabel?.adverseReactions ?? [],
        reportedReactions, // [{ reactionTerm, reportCount }]
        source: "openfda",
    };

    // Save to cache (even if one source failed, we cache what we have)
    await AdverseEffectCache.create(result);

    return NextResponse.json({
        source: "live",
        found: true,
        result,
        warnings: eventError
            ? { event_api: "Adverse event reports could not be loaded; only label data is shown." }
            : undefined,
        disclaimer:
            "Adverse effect data has two sources shown separately: (1) 'Labeled adverse reactions' come from FDA-approved clinical trial data in official US drug labeling. (2) 'Reported reactions' come from FAERS, the FDA's post-market reporting system — these are voluntarily submitted reports where a causal link to the drug has NOT been confirmed, only a temporal association was reported. Higher report counts do not necessarily mean higher risk. This data is US-market based and may not reflect Pakistan-specific formulations. Not a substitute for pharmacist or physician judgment.",
    });
}