import { InteractionCategory, CategorizedInteraction } from "@/types/drug-food";

// Common clinical substances for extraction badges
const COMMON_SUBSTANCES = [
    "grapefruit",
    "alcohol",
    "ethanol",
    "caffeine",
    "coffee",
    "tea",
    "milk",
    "dairy",
    "calcium",
    "potassium",
    "sodium",
    "tyramine",
    "cheese",
    "st. john's wort",
    "iron",
    "antacid",
    "antacids",
    "vitamin c",
    "vitamin k",
    "vitamin d",
    "vitamin e",
    "magnesium",
    "zinc",
    "folic acid",
    "high-fat meal",
    "fatty meal",
    "fiber",
    "citrus",
    "garlic",
    "ginkgo",
    "ginseng",
    "licorice",
    "salt substitute",
    "tobacco",
    "smoking",
    "food",
    "meals",
];

export const CATEGORY_META: Record<
    InteractionCategory,
    { label: string; bg: string; text: string; border: string; icon: string }
> = {
    all: { label: "All Considerations", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "Layers" },
    avoid: { label: "Avoid", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "AlertOctagon" },
    caution: { label: "Exercise Caution", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "AlertTriangle" },
    take_with_food: { label: "Take with Food", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "Utensils" },
    take_without_food: { label: "Take on Empty Stomach", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "Clock" },
    separate: { label: "Separate Timing", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "Hourglass" },
    limit: { label: "Limit / Moderate", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "MinusCircle" },
    supplement: { label: "Herbs & Supplements", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "Pill" },
    hydration: { label: "Hydration Advice", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "Droplets" },
    consistency: { label: "Dietary Consistency", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "RefreshCw" },
    other: { label: "Clinical Note", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "FileText" },
};

/**
 * Deterministic local UI categorization based strictly on exact wording.
 * DOES NOT invent clinical severity or alter original text.
 */
export function categorizeInteraction(text: string): CategorizedInteraction {
    const lower = text.toLowerCase().trim();
    const isNeutral =
        lower.includes("no food interaction") ||
        lower.includes("no food interactions are expected") ||
        lower.includes("no interactions are expected") ||
        lower.includes("no significant interaction");

    let category: InteractionCategory = "other";

    if (isNeutral) {
        category = "other";
    } else if (
        lower.includes("avoid") ||
        lower.includes("do not consume") ||
        lower.includes("do not drink") ||
        lower.includes("do not take with") ||
        lower.includes("refrain from") ||
        lower.includes("contraindicated with")
    ) {
        category = "avoid";
    } else if (
        lower.includes("empty stomach") ||
        lower.includes("without food") ||
        lower.includes("1 hour before") ||
        lower.includes("2 hours after") ||
        lower.includes("prior to meals") ||
        lower.includes("before meals")
    ) {
        category = "take_without_food";
    } else if (
        lower.includes("with food") ||
        lower.includes("with meals") ||
        lower.includes("with a meal") ||
        lower.includes("after meals") ||
        lower.includes("take with milk") ||
        lower.includes("co-administered with food") ||
        lower.includes("following a meal")
    ) {
        category = "take_with_food";
    } else if (
        lower.includes("separate") ||
        lower.includes("space") ||
        lower.includes("hours apart") ||
        lower.includes("stagger") ||
        lower.includes("do not take simultaneously") ||
        lower.includes("interval")
    ) {
        category = "separate";
    } else if (
        lower.includes("limit") ||
        lower.includes("restrict") ||
        lower.includes("reduce intake") ||
        lower.includes("moderate") ||
        lower.includes("minimize")
    ) {
        category = "limit";
    } else if (
        lower.includes("caution") ||
        lower.includes("exercise caution") ||
        lower.includes("monitor") ||
        lower.includes("use caution") ||
        lower.includes("may increase toxicity")
    ) {
        category = "caution";
    } else if (
        lower.includes("fluid") ||
        lower.includes("water") ||
        lower.includes("hydration") ||
        lower.includes("drink plenty") ||
        lower.includes("adequate intake of water")
    ) {
        category = "hydration";
    } else if (
        lower.includes("supplement") ||
        lower.includes("vitamin") ||
        lower.includes("mineral") ||
        lower.includes("herb") ||
        lower.includes("st. john") ||
        lower.includes("iron")
    ) {
        category = "supplement";
    } else if (
        lower.includes("consistent") ||
        lower.includes("consistency") ||
        lower.includes("regular schedule")
    ) {
        category = "consistency";
    }

    // Extract detected food/substance tags
    const extractedSubstances: string[] = [];
    for (const substance of COMMON_SUBSTANCES) {
        if (lower.includes(substance) && !extractedSubstances.includes(substance)) {
            extractedSubstances.push(substance);
        }
    }

    return {
        originalText: text,
        category,
        categoryLabel: CATEGORY_META[category].label,
        extractedSubstances,
        isNeutral,
    };
}

export function processDrugInteractions(interactions: string[]) {
    const categorized = interactions.map(categorizeInteraction);
    const categoriesSet = new Set<InteractionCategory>();
    categoriesSet.add("all");

    categorized.forEach((item) => {
        if (!item.isNeutral) {
            categoriesSet.add(item.category);
        }
    });

    return {
        categorizedInteractions: categorized,
        availableCategories: Array.from(categoriesSet),
    };
}