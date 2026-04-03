import mongoose, { Schema, model, models } from 'mongoose';

export interface IReview {
  id: number;
  name: string;
  university: string;
  year: string;
  specialty: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  university: { type: String, required: true },
  year: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Review || model<IReview>('Review', ReviewSchema);