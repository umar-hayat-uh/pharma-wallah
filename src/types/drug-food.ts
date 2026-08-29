export interface IDrugFoodInteraction {
    _id?: string;
    name: string;
    reference: string;
    food_interactions: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type InteractionCategory =
    | "all"
    | "avoid"
    | "caution"
    | "take_with_food"
    | "take_without_food"
    | "separate"
    | "limit"
    | "supplement"
    | "hydration"
    | "consistency"
    | "other";

export interface CategorizedInteraction {
    originalText: string;
    category: InteractionCategory;
    categoryLabel: string;
    extractedSubstances: string[];
    isNeutral: boolean;
}

export interface DrugDetailResponse {
    drug: IDrugFoodInteraction;
    categorizedInteractions: CategorizedInteraction[];
    availableCategories: InteractionCategory[];
    totalInteractions: number;
}

export interface FoodSearchMatch {
    drugName: string;
    matchingInteractions: CategorizedInteraction[];
    reference: string;
}