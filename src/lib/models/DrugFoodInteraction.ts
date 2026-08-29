import mongoose, { Schema, Document, Model } from "mongoose";
import { IDrugFoodInteraction } from "@/types/drug-food";

export interface DrugFoodInteractionDocument extends Document {
    name: string;
    reference: string;
    food_interactions: string[];
    normalizedName: string;
}

const DrugFoodInteractionSchema = new Schema<DrugFoodInteractionDocument>(
    {
        name: {
            type: String,
            required: [true, "Drug name is required"],
            trim: true,
            unique: true,
            index: true,
        },
        normalizedName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        reference: {
            type: String,
            required: true,
            trim: true,
        },
        food_interactions: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Compound text index for high-speed food and drug full-text searching
DrugFoodInteractionSchema.index({
    name: "text",
    food_interactions: "text",
});

DrugFoodInteractionSchema.pre("validate", function () {
    if (this.name) {
        this.normalizedName = this.name.toLowerCase().trim();
    }
});

const DrugFoodInteractionModel: Model<DrugFoodInteractionDocument> =
    mongoose.models.DrugFoodInteraction ||
    mongoose.model<DrugFoodInteractionDocument>("DrugFoodInteraction", DrugFoodInteractionSchema, "drug_food_interactions");

export default DrugFoodInteractionModel;