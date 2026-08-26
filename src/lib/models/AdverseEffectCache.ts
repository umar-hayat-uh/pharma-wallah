import mongoose, { Schema, models, model } from "mongoose";

/**
 * Cache for the Adverse Effect Detector tool. openFDA data ONLY — no
 * RxNorm identity data belongs here. Kept independent from
 * DrugFinderCache so the two tools stay fully decoupled end to end.
 */
const ReportedReactionSchema = new Schema(
    {
        reactionTerm: { type: String, required: true },
        reportCount: { type: Number, required: true },
    },
    { _id: false }
);

const AdverseEffectCacheSchema = new Schema(
    {
        queryKey: { type: String, required: true, unique: true, index: true },
        matchedGenericName: [{ type: String }],
        matchedBrandName: [{ type: String }],
        boxedWarning: [{ type: String }],
        warnings: [{ type: String }],
        adverseReactions: [{ type: String }],
        reportedReactions: [ReportedReactionSchema],
        source: { type: String, default: "openfda" },
        fetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

AdverseEffectCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export type AdverseEffectCacheDoc = mongoose.InferSchemaType<typeof AdverseEffectCacheSchema>;

export default models.AdverseEffectCache || model("AdverseEffectCache", AdverseEffectCacheSchema);