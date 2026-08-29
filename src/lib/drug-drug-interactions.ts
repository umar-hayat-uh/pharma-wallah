import rawInteractions from "@/data/drug-drug-interactions.json";
import {
    DrugDrugInteraction,
    DDISeverity,
    PairCheckResult,
    MultiDrugSummary,
} from "@/types/drug-drug";

// Normalized typed dataset
const DATASET: DrugDrugInteraction[] = rawInteractions as DrugDrugInteraction[];

/**
 * Standardize drug name for case-insensitive and whitespace-invariant comparison
 */
export function normalizeDrugName(name: string): string {
    return (name || "").trim().toLowerCase();
}

/**
 * Creates a deterministic unique key for a pair regardless of argument order.
 * e.g. "Warfarin" + "Aspirin" => "aspirin||warfarin"
 */
export function createInteractionKey(drugA: string, drugB: string): string {
    const normA = normalizeDrugName(drugA);
    const normB = normalizeDrugName(drugB);
    return [normA, normB].sort().join("||");
}

// In-memory indexed lookup map for instant O(1) pair queries
const INTERACTION_MAP = new Map<string, DrugDrugInteraction>();

// Unique list of all distinct drug names present in the dataset
const ALL_DRUGS_SET = new Set<string>();

// Precompute index on module load
DATASET.forEach((item) => {
    const key = createInteractionKey(item.drugA, item.drugB);
    INTERACTION_MAP.set(key, item);
    ALL_DRUGS_SET.add(item.drugA);
    ALL_DRUGS_SET.add(item.drugB);
});

export const ALL_DRUGS_LIST: string[] = Array.from(ALL_DRUGS_SET).sort((a, b) =>
    a.localeCompare(b)
);

/**
 * Returns all 300 interactions
 */
export function getAllDDIs(): DrugDrugInteraction[] {
    return DATASET;
}

/**
 * Returns all distinct drug names in the dataset
 */
export function getAllDrugs(): string[] {
    return ALL_DRUGS_LIST;
}

/**
 * Fast prefix and partial search across all drug names
 */
export function searchDrugs(query: string, limit = 8): string[] {
    const q = normalizeDrugName(query);
    if (!q) return ALL_DRUGS_LIST.slice(0, limit);

    // Exact starts-with first, then general substring
    const startsWithMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const drug of ALL_DRUGS_LIST) {
        const lower = drug.toLowerCase();
        if (lower.startsWith(q)) {
            startsWithMatches.push(drug);
        } else if (lower.includes(q)) {
            containsMatches.push(drug);
        }
    }

    return [...startsWithMatches, ...containsMatches].slice(0, limit);
}

/**
 * Finds interaction between two drugs regardless of order
 */
export function findInteraction(drugA: string, drugB: string): PairCheckResult {
    const normA = normalizeDrugName(drugA);
    const normB = normalizeDrugName(drugB);

    if (!normA || !normB) {
        return {
            found: false,
            drugA,
            drugB,
            message: "Please select two valid medications to check.",
        };
    }

    if (normA === normB) {
        return {
            found: false,
            drugA,
            drugB,
            isSameDrug: true,
            message: "Please select two different medications.",
        };
    }

    const key = createInteractionKey(drugA, drugB);
    const match = INTERACTION_MAP.get(key);

    if (match) {
        return {
            found: true,
            interaction: match,
            drugA,
            drugB,
        };
    }

    return {
        found: false,
        drugA,
        drugB,
        message:
            "No interaction was found in the PharmaWallah Clinical prototype database. Absence from this prototype database does not establish that no interaction exists.",
    };
}

/**
 * Finds all recorded interactions for a single drug
 */
export function findInteractionsForDrug(drugName: string): DrugDrugInteraction[] {
    const norm = normalizeDrugName(drugName);
    return DATASET.filter(
        (item) =>
            normalizeDrugName(item.drugA) === norm || normalizeDrugName(item.drugB) === norm
    );
}

/**
 * Multi-drug matrix checker for N medications.
 * Computes all N*(N-1)/2 combinations and sorts by severity (High > Moderate > Low).
 */
export function checkMultipleDrugs(drugs: string[]): MultiDrugSummary {
    // Deduplicate input list
    const uniqueDrugs = Array.from(
        new Set(drugs.map((d) => d.trim()).filter(Boolean))
    );

    const foundInteractions: DrugDrugInteraction[] = [];
    const foundKeys = new Set<string>();
    let totalPairsEvaluated = 0;

    for (let i = 0; i < uniqueDrugs.length; i++) {
        for (let j = i + 1; j < uniqueDrugs.length; j++) {
            totalPairsEvaluated++;
            const res = findInteraction(uniqueDrugs[i], uniqueDrugs[j]);
            if (res.found && res.interaction) {
                const key = createInteractionKey(res.interaction.drugA, res.interaction.drugB);
                if (!foundKeys.has(key)) {
                    foundKeys.add(key);
                    foundInteractions.push(res.interaction);
                }
            }
        }
    }

    // Sort severity: High -> Moderate -> Low
    const severityRank: Record<DDISeverity, number> = {
        high: 3,
        moderate: 2,
        low: 1,
    };

    foundInteractions.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

    const highCount = foundInteractions.filter((i) => i.severity === "high").length;
    const moderateCount = foundInteractions.filter((i) => i.severity === "moderate").length;
    const lowCount = foundInteractions.filter((i) => i.severity === "low").length;

    return {
        drugsChecked: uniqueDrugs,
        totalPairsEvaluated,
        interactionsFound: foundInteractions,
        highCount,
        moderateCount,
        lowCount,
        unmatchedPairCount: totalPairsEvaluated - foundInteractions.length,
    };
}

/**
 * Dataset severity statistics
 */
export function getSeverityCounts() {
    let low = 0;
    let moderate = 0;
    let high = 0;

    DATASET.forEach((i) => {
        if (i.severity === "low") low++;
        if (i.severity === "moderate") moderate++;
        if (i.severity === "high") high++;
    });

    return {
        total: DATASET.length,
        low,
        moderate,
        high,
    };
}

/**
 * Returns dynamic sample pairs present in the actual dataset
 */
export function getSamplePairs(): Array<{ drugA: string; drugB: string; severity: DDISeverity }> {
    return [
        { drugA: "Warfarin", drugB: "Trimethoprim/sulfamethoxazole", severity: "high" },
        { drugA: "Simvastatin", drugB: "Clarithromycin", severity: "high" },
        { drugA: "Clopidogrel", drugB: "Omeprazole", severity: "moderate" },
        { drugA: "Lisinopril", drugB: "Ibuprofen", severity: "moderate" },
        { drugA: "Ferrous Sulfate", drugB: "Ascorbic Acid", severity: "low" },
    ];
}