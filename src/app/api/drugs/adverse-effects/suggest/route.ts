import { NextRequest, NextResponse } from "next/server";
import { suggestDrugNames } from "@/lib/api/openfda";

/**
 * Lightweight autocomplete for the Adverse Effect Detector search box.
 * GET /api/drugs/adverse-effects/suggest?q=ibu -> [{name, type}, ...]
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const suggestions = await suggestDrugNames(q);
        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error("openFDA suggest failed:", err);
        return NextResponse.json({ suggestions: [] });
    }
}