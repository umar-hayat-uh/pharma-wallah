// src/app/api/clinical/dailymed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchDailyMed, getDailyMedByExactName } from "@/lib/api/dailymed";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const exact = searchParams.get("exact"); // set when user picked a dropdown suggestion
        const query = searchParams.get("q");

        if (!exact && !query) {
            return NextResponse.json(
                { success: false, error: "Missing search query." },
                { status: 400, headers: { "Cache-Control": "no-store" } }
            );
        }

        const result = exact
            ? await getDailyMedByExactName(exact)
            : await searchDailyMed(query!);

        return NextResponse.json(
            {
                success: true,
                source: "DailyMed",
                query: (exact ?? query!).trim(),
                cached: result.cached,
                stale: result.stale,
                data: result.result.data,
                metadata: result.result.metadata,
            },
            {
                status: 200,
                headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
            }
        );
    } catch (error) {
        console.error("DailyMed route error:", error);
        const message =
            error instanceof Error ? error.message : "Unable to retrieve DailyMed information.";
        const isValidationError = message.includes("required") || message.includes("characters");

        return NextResponse.json(
            { success: false, error: message },
            { status: isValidationError ? 400 : 502, headers: { "Cache-Control": "no-store" } }
        );
    }
}