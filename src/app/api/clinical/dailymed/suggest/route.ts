// src/app/api/clinical/dailymed/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { suggestDrugNames } from "@/lib/api/dailymed";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get("q");

        if (!query) {
            return NextResponse.json(
                { success: false, error: "Missing search query." },
                { status: 400, headers: { "Cache-Control": "no-store" } }
            );
        }

        const suggestions = await suggestDrugNames(query);

        return NextResponse.json(
            { success: true, query: query.trim(), suggestions },
            {
                status: 200,
                headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
            }
        );
    } catch (error) {
        console.error("DailyMed suggest route error:", error);
        const message =
            error instanceof Error ? error.message : "Unable to fetch drug name suggestions.";
        const isValidationError = message.includes("required") || message.includes("characters");

        return NextResponse.json(
            { success: false, error: message },
            { status: isValidationError ? 400 : 502, headers: { "Cache-Control": "no-store" } }
        );
    }
}