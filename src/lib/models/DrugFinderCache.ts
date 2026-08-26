import mongoose, { Schema, models, model } from "mongoose";

/**
 * Cache for the Drug Finder tool. RxNorm data ONLY — no safety/adverse data
 * belongs here. Keep this model independent from AdverseEffectCache so the
 * two tools stay fully decoupled end to end (route -> lib -> model).
 */
const DrugFinderCacheSchema = new Schema(
    {
        queryKey: { type: String, required: true, unique: true, index: true },
        rxcui: { type: String, index: true },
        matchedName: { type: String },
        termType: { type: String },
        ingredientNames: [{ type: String }],
        relatedBrands: [{ type: String }],
        relatedGenerics: [{ type: String }],
        doseForms: [{ type: String }],
        source: { type: String, default: "rxnorm" },
        fetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

DrugFinderCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export type DrugFinderCacheDoc = mongoose.InferSchemaType<typeof DrugFinderCacheSchema>;

export default models.DrugFinderCache || model("DrugFinderCache", DrugFinderCacheSchema);