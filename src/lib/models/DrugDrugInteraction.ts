import mongoose, { Schema, Document, Model } from "mongoose";
import { DDISeverity } from "@/types/drug-drug";

export interface DrugDrugInteractionDocument extends Document {
    id: string;
    drugA: string;
    drugB: string;
    normalizedDrugA: string;
    normalizedDrugB: string;
    pairKey: string;
    severity: DDISeverity;
    mechanism: string;
    clinicalEffect: string;
    management: string;
    category: string;
    source: string;
}

const DrugDrugInteractionSchema = new Schema<DrugDrugInteractionDocument>(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        drugA: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        drugB: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        normalizedDrugA: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        normalizedDrugB: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        pairKey: {
            type: String,
            required: true,
            unique: true,
            index: true, // Deterministic sorted key e.g. "ibuprofen||methotrexate"
        },
        severity: {
            type: String,
            enum: ["low", "moderate", "high"],
            required: true,
            index: true,
        },
        mechanism: {
            type: String,
            required: true,
        },
        clinicalEffect: {
            type: String,
            required: true,
        },
        management: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        source: {
            type: String,
            default: "Prototype curated clinical reference",
        },
    },
    {
        timestamps: true,
    }
);

// Compound text index for search
DrugDrugInteractionSchema.index({
    drugA: "text",
    drugB: "text",
    category: "text",
});

const DrugDrugInteractionModel: Model<DrugDrugInteractionDocument> =
    mongoose.models.DrugDrugInteraction ||
    mongoose.model<DrugDrugInteractionDocument>(
        "DrugDrugInteraction",
        DrugDrugInteractionSchema,
        "drug_drug_interactions"
    );

export default DrugDrugInteractionModel;