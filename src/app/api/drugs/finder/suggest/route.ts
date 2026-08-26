import { NextRequest, NextResponse } from "next/server";
import { suggestDrugNames } from "@/lib/api/rxnorm";

/**
 * Lightweight autocomplete for the Drug Finder search box.
 * GET /api/drugs/finder/suggest?q=met -> ["metformin", "metoprolol", ...]
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
        console.error("RxNorm suggest failed:", err);
        return NextResponse.json({ suggestions: [] });
    }
}