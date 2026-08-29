export type DDISeverity = "low" | "moderate" | "high";

export interface DrugDrugInteraction {
    id: string;
    drugA: string;
    drugB: string;
    severity: DDISeverity;
    mechanism: string;
    clinicalEffect: string;
    management: string;
    category: string;
    source: string;
}

export interface PairCheckResult {
    found: boolean;
    interaction?: DrugDrugInteraction;
    drugA: string;
    drugB: string;
    isSameDrug?: boolean;
    message?: string;
}

export interface MultiDrugSummary {
    drugsChecked: string[];
    totalPairsEvaluated: number;
    interactionsFound: DrugDrugInteraction[];
    highCount: number;
    moderateCount: number;
    lowCount: number;
    unmatchedPairCount: number;
}